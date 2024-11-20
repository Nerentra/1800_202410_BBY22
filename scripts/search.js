/**
 * Takes in the data for a question and adds it to the DOM.
 * @param {String} questionId The firestore id of the question.
 * @param {String} authorId The firestore id for the question author.
 * @param {Object} questionData The firestore data for the question.
 * @param {Object} authorData The firestore data for the author.
 */
function addQuestionToDOM(questionID, authorId, questionData, authorData) {
  let anchor = document.createElement("a");
  anchor.href = `/question.html?docID=${questionID}`;
  anchor.classList.add("hideLink");

  let titleDiv = document.createElement("div");
  titleDiv.innerText = questionData.title;
  titleDiv.classList.add("questionTitle");
  let descriptionDiv = document.createElement("div");
  descriptionDiv.innerText = questionData.description;
  descriptionDiv.classList.add("questionDescription");

  let metadataContainer = document.createElement("div");
  metadataContainer.classList.add("questionMetadata");
  let authorAnchor = document.createElement("a");
  authorAnchor.innerText = authorData.name;
  authorAnchor.classList.add("hideLink")
  authorAnchor.href = "/profile.html?id=" + authorId;
  let timeSpan = document.createElement("span");
  timeSpan.innerText = formatDuration(Date.now() - questionData.timestamp);

  metadataContainer.appendChild(authorAnchor);
  metadataContainer.appendChild(document.createElement("span"));
  metadataContainer.appendChild(timeSpan);

  anchor.appendChild(titleDiv);
  anchor.appendChild(descriptionDiv);
  anchor.appendChild(metadataContainer);

  document.querySelector("#questions").appendChild(anchor);
}

/**
 * Queries firestore for questions that contain all of the tags
 * @param {String[]} tags The tags to use
 * @returns {String[]} The IDs of the questions
 */
async function getQuestionsFromTags(tags) {
  let tagCount = tags.length;
  // If no tags then return don't filter anything out
  if (tagCount == 0) {
    let questionSnapshots = (await db.collection("questions").get()).docs;
    let questionIDs = questionSnapshots.map((snapshot) => {
      return snapshot.id;
    });

    return questionIDs;
  }
  let questionCounts = {};
  let promises = [];
  tags.forEach((tag) => {
    let promise = db
      .collection("tags")
      .doc(tag)
      .get()
      .then((ref) => {
        let data = ref.data();
        if (data) {
          let questionIDs = data.questions;
          questionIDs.forEach((id) => {
            if (questionCounts[id]) {
              questionCounts[id]++;
            } else {
              questionCounts[id] = 1;
            }
          });
        } else {
          // Tag doesn't exist, ignore it
          tagCount--;
        }
      })
      .catch(() => {
        throw Error(`Error getting questions for tag ${tag}.`);
      });
    promises.push(promise);
  });

  await Promise.all(promises);

  let finalQuestions = [];
  for (let id in questionCounts) {
    if (questionCounts[id] >= tagCount) {
      finalQuestions.push(id);
    }
  }

  return finalQuestions;
}

/**
 * Gets all questions from the database and puts them in the page.
 * @param {String} tags The search tags.
 */
async function search(tags) {
  tags = tags.filter((tag) => {
    // Remove all whitespace only strings
    return tag.trim() != "";
  });
  getQuestionsFromTags(tags)
    .then((questionIDs) => {
      questionIDs.forEach((questionID) => {
        db.collection("questions")
          .doc(questionID)
          .get()
          .then((question) => {
            let questionData = question.data();
            questionData.author
              .get()
              .then((author) => {
                addQuestionToDOM(questionID, author.id, questionData, author.data());
              })
              .catch((error) => {
                console.error("Error getting question author", error);
              });
          })
          .catch((error) => {
            console.error("Error getting question", error);
          });
      });
    })
    .catch((error) => {
      console.error("Error getting question IDs from tags", error);
    });
}

let params = new URL(window.location.href).searchParams;
let tags = params.get("tags").split(" ");
search(tags);
