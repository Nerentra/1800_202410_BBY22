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
 * Gets all questions from the database and puts them in the page.
 * @param {String} query The search query. Currently does nothing.
 */
function search(query) {
  db.collection("questions")
    .get()
    .then((questions) => {
      questions.forEach((question) => {
        let questionData = question.data();
        questionData.author
          .get()
          .then((author) => {
            addQuestionToDOM(questionData, author.data());
          })
          .catch((error) => {
            console.error("Error getting question author", error);
          });
      });
    })
    .catch((error) => {
      console.error("Error getting questions", error);
    });
}

let params = new URL(window.location.href);
let query = params.searchParams.get("query");
search(query);
