let params = new URL(window.location.href); // Get URL of search bar
let questionId = params.searchParams.get("docID"); // Get value for key "id"

/**
 * Get data from firebase and display it on the page
 */
function displayQuestion() {
  // Getting info from the firebase collection
  db.collection("questions")
    .doc(questionId)
    .get()
    .then((doc) => {
      let docData = doc.data();
      let question = docData;
      let title = docData.title;
      let description = docData.description;
      let author = docData.author;
      let timestamp = docData.timestamp;

      let timeElapsed = Date.now() - timestamp;
      let readableTime = formatDuration(timeElapsed);

      // Only populate title, and image
      document.getElementById("questionTitle").innerText = title;
      document.getElementById("question-description").innerText = description;
      document.getElementById("questionAuthor").innerText = author;
      document.getElementById("questionTimestamp").innerText = readableTime;
      // let imgEvent = document.querySelector( ".hike-img" );
      // imgEvent.src = "../images/" + hikeCode + ".jpg";

      question.author
        .get()
        .then((authorDoc) => {
          let authorName = authorDoc.data().name || "Unknown Author";
          document.getElementById("questionAuthor").innerText = authorName;
        })
        .catch((error) => {
          console.error("Error fetching author:", error);
          document.getElementById("questionAuthor").innerText =
            "Author not found";
        });
    });
}
displayQuestion();

/**
 * Adds and answer to the DOM
 * @param answerData {Object} The firestore data for the answer
 * @param authorData {Object} The firestore data for the author
 */
function addAnswerToDOM(answerData, authorData) {
  let replies = document.querySelector("#replies");

  let card = document.createElement("div");
  card.classList.add("answer");

  let username = document.createElement("p");
  username.classList.add("answerName");
  username.innerText = authorData.name;
  card.appendChild(username);

  let replyContent = document.createElement("p");
  replyContent.classList.add("answerContent");
  replyContent.innerText = answerData.content;
  card.appendChild(replyContent);

  let userPfp = document.createElement("img");
  userPfp.classList.add("answerPfp");
  card.appendChild(userPfp);

  replies.appendChild(card);
}

/**
 * Displays the answers of the current question
 * @param id {String} The id of the question
 */
function displayAnswers(id) {
  db.collection("questions")
    .doc(id)
    .collection("answers")
    .get()
    .then(async (answerRefs) => {
      const answers = [];
      for await (const [i, answerRef] of answerRefs.docs.entries()) {
        let answer = await answerRef.data();
        let author = (await answer.author.get()).data();
        answers[i] = {
          answer,
          author,
        };
      }

      answers.forEach((answer) => {
        addAnswerToDOM(answer.answer, answer.author);
      });
    });
}
displayAnswers(questionId);
