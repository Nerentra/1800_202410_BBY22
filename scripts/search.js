/**
 * Takes a duration in milliseconds and returns
 * a time with appropriate units.
 * @param {Number} The duration in milliseconds.
 * @returns {String} The formatted time with units.
 */
function makeDurationReadable(duration) {
  const units = ["s", "m", "h", "d", "y"];
  const conversions = [1000, 60, 60, 24, 365];
  for (let i = 0; i < conversions.length - 1; i++) {
    duration /= conversions[i];
    if (duration < conversions[i + 1]) {
      return Math.floor(duration) + units[i];
    }
  }
  return Math.floor(duration) + units[units.length - 1];
}

/**
 * Takes in the data for a question and adds it to the DOM.
 * @param {Object} questionData The firestore data for the question.
 * @param {Object} authorData The firestore data for the author.
 */
function addQuestionToDOM(questionData, authorData) {
  let container = document.createElement("div");

  let titleDiv = document.createElement("div");
  titleDiv.innerText = questionData.title;
  titleDiv.classList.add("questionTitle");
  let descriptionDiv = document.createElement("div");
  descriptionDiv.innerText = questionData.description;
  descriptionDiv.classList.add("questionDescription");

  let metadataContainer = document.createElement("div");
  metadataContainer.classList.add("questionMetadata");
  let authorSpan = document.createElement("span");
  authorSpan.innerText = authorData.name;
  let timeSpan = document.createElement("span");
  timeSpan.innerText = makeDurationReadable(
    Date.now() - questionData.timestamp,
  );

  metadataContainer.appendChild(authorSpan);
  metadataContainer.appendChild(document.createElement("span"));
  metadataContainer.appendChild(timeSpan);

  container.appendChild(titleDiv);
  container.appendChild(descriptionDiv);
  container.appendChild(metadataContainer);

  document.querySelector("#questions").appendChild(container);
}

/**
 * Queries firestore for questions that contain all of the tags
 * @param {String[]} tags The tags to use
 * @returns {String[]} The IDs of the questions
 */
async function getQuestionsFromTags(tags) {
  let tagCount = tags.length;
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
                addQuestionToDOM(questionData, author.data());
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

let params = new URL(window.location.href);
let tags = params.searchParams.get("tags").split(",");
search(tags);
