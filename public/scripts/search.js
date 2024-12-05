const QUESTIONS_PER_PAGE = 30;

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

  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("questionTags");

  if (questionData.tags) {
    const tags = Object.keys(questionData.tags);
    tags.sort();
    tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.classList.add("tag");
      tagElement.innerText = tag;
      tagsContainer.appendChild(tagElement);
    });
  }

  anchor.appendChild(titleDiv);
  anchor.appendChild(descriptionDiv);
  anchor.appendChild(metadataContainer);
  anchor.appendChild(tagsContainer);

  document.querySelector("#questions").appendChild(anchor);
}

/**
 * Queries firestore for a count number of snapshots after startSnap
 * @param count The amount of snapshots to get
 * @param startSnap The snapshot to start searching after
 * @returns An array of firestore snapshots of the questions
 */
async function getQuestions(startSnap) {
  let questionsRef = db.collection("questions");

  questionsRef = questionsRef.orderBy("timestamp", "desc");

  if (startSnap) {
    questionsRef = questionsRef.startAfter(startSnap);
  }

  questionsRef = questionsRef.limit(QUESTIONS_PER_PAGE);

  return (await questionsRef.get()).docs;
}

/**
 * Queries firestore for all questions that contain all of the tags
 * @param {String[]} tags The tags to use
 * @returns An array of firestore snapshots of the questions
 */
async function getQuestionsFromTags(tags) {
  let questionsRef = db.collection("questions");

  tags.forEach((tag) => {
    questionsRef = questionsRef.where("tags." + tag, "==", true);
  });

  const questions = (await questionsRef.get()).docs;

  questions.sort((a, b) => b.data().timestamp - a.data().timestamp);

  return questions;
}

/**
 * If tags is empty, gets QUESTIONS_PER_PAGE questions from the database and adds them in the page.
 * If tags is not empty, gets all questions that contain all of the tags and adds them in the page.
 * @param {String} tags The search tags
 * @param startSnap The snapshot to start searching after
 */
async function search(tags, startSnap) {
  const loadMore = document.getElementById("loadMoreButton");
  const loadMoreEnabled = tags.length === 0;

  let questionSnapshots;
  if (loadMoreEnabled) {
    loadMore.parentElement.hidden = false;
    questionSnapshots = await getQuestions(startSnap);
  } else {
    questionSnapshots = await getQuestionsFromTags(tags);
  }

  const questions = await Promise.all(
    questionSnapshots.map(async (questionSnapshot) => {
      const authorSnapshot = await questionSnapshot.data().author.get();
      return { questionSnapshot, authorSnapshot };
    })
  );

  questions.forEach(({ questionSnapshot, authorSnapshot }) => {
    addQuestionToDOM(questionSnapshot, authorSnapshot);
  });

  if (loadMoreEnabled) {
    if (questions.length < QUESTIONS_PER_PAGE) {
      loadMore.parentElement.hidden = true;
    } else {
      const lastQuestionSnapshot =
        questions[questions.length - 1].questionSnapshot;
      loadMore.addEventListener(
        "click",
        () => {
          search(tags, lastQuestionSnapshot);
        },
        { once: true }
      );
    }
  }
}

const params = new URL(window.location.href).searchParams;

const tagsText = params.get("tags") || "";
const tags = tagsText.split(" ").filter((tag) => {
  // Filter out all whitespace-only strings
  return tag.trim() != "";
});

search(tags).then(() => {
  document.getElementById("questions").hidden = false;
  document.getElementById("questionsPlaceholders").hidden = true;
});
