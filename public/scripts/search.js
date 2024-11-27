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
  let description = questionData.description;
  if (description.length > 120) {
    description = description.slice(0, 120) + "...";
  }
  descriptionDiv.innerText = description;
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
  let questionsRef = db.collection("questions");

  tags.forEach((tag) => {
    questionsRef = questionsRef.where("tags." + tag, "==", true);
  });

  questionsRef = questionsRef.orderBy("timestamp", "desc");

  return (await questionsRef.get()).docs;
}

/**
 * Gets all questions from the database and puts them in the page.
 * @param {String} tags The search tags.
 */
async function search(tags) {
  const questionSnapshots = await getQuestionsFromTags(tags);

  const questions = await Promise.all(
    questionSnapshots.map(async (questionSnapshot) => {
      const authorSnapshot = await questionSnapshot.data().author.get();
      return { questionSnapshot, authorSnapshot };
    })
  );

  questions.forEach(({ questionSnapshot, authorSnapshot }) => {
    addQuestionToDOM(questionSnapshot, authorSnapshot);
  });

  document.getElementById("questions").hidden = false;
  document.getElementById("questionsPlaceholders").hidden = true;
}

const params = new URL(window.location.href).searchParams;
const tagsText = params.get("tags") || "";
const tags = tagsText.split(" ").filter((tag) => {
  // Filter out all whitespace-only strings
  return tag.trim() != "";
});

search(tags);
