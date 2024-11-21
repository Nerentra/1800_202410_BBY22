/**
 * Takes in the data for a question and adds it to the DOM.
 * @param {Object} questionSnapshot A firestore snapshot of the question.
 * @param {Object} authorSnapshot A firestore snapshot of the question author.
 */
function addQuestionToDOM(questionSnapshot, authorSnapshot) {
  const questionData = questionSnapshot.data();
  const authorData = authorSnapshot.data();

  const anchor = document.createElement("a");
  anchor.href = "/question.html?docID=" + questionSnapshot.id;
  anchor.classList.add("hideLink");

  const titleDiv = document.createElement("div");
  titleDiv.innerText = questionData.title;
  titleDiv.classList.add("questionTitle");
  const descriptionDiv = document.createElement("div");
  descriptionDiv.innerText = questionData.description;
  descriptionDiv.classList.add("questionDescription");

  const metadataContainer = document.createElement("div");
  metadataContainer.classList.add("questionMetadata");
  const authorAnchor = document.createElement("a");
  authorAnchor.innerText = authorData.name;
  authorAnchor.classList.add("hideLink");
  authorAnchor.href = "/profile.html?id=" + authorSnapshot.id;
  const timeSpan = document.createElement("span");
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
  // If there are no tags then don't filter anything out
  if (tags.length == 0) {
    const questionSnapshots = (await db.collection("questions").get()).docs;
    const questionIDs = questionSnapshots.map((snapshot) => {
      return snapshot.id;
    });

    return questionIDs;
  }

  let validTagCount = 0;
  const questionCounts = {};
  await Promise.all(
    tags.map(async (tag) => {
      const tagSnapshot = await db.collection("tags").doc(tag).get();
      if (tagSnapshot.exists) {
        // Tag exists
        validTagCount++;

        const tagData = tagSnapshot.data();
        const questionIDs = tagData.questions;
        questionIDs.forEach((id) => {
          if (questionCounts[id]) {
            questionCounts[id]++;
          } else {
            questionCounts[id] = 1;
          }
        });
      }
    })
  );

  const finalQuestions = [];
  for (const id in questionCounts) {
    if (questionCounts[id] >= validTagCount) {
      // Question is in all tags
      finalQuestions.push(id);
    }
  }

  console.log(finalQuestions)
  return finalQuestions;
}

/**
 * Gets all questions from the database and puts them in the page.
 * @param {String} tags The search tags.
 */
async function search(tags) {
  const questionIDs = await getQuestionsFromTags(tags);
  const questionsCollection = db.collection("questions");

  const questions = [];
  await Promise.all(
    questionIDs.map(async (questionID) => {
      const questionSnapshot = await questionsCollection.doc(questionID).get();
      const authorSnapshot = await questionSnapshot.data().author.get();
      questions.push({ questionSnapshot, authorSnapshot });
    })
  );

  questions.sort(
    (a, b) =>
      b.questionSnapshot.data().timestamp - a.questionSnapshot.data().timestamp
  );

  questions.forEach(({ questionSnapshot, authorSnapshot }) => {
    addQuestionToDOM(questionSnapshot, authorSnapshot);
  });
}

const params = new URL(window.location.href).searchParams;
const tags = params
  .get("tags")
  .split(" ")
  .filter((tag) => {
    // Filter out all whitespace-only strings
    return tag.trim() != "";
  });
search(tags);
