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

  let metadataContainer = document.createElement("div");
  metadataContainer.classList.add("cf");
  metadataContainer.classList.add("answerMetadata");

  let username = document.createElement("span");
  username.classList.add("answerName");
  username.innerText = authorData.name;
  metadataContainer.appendChild(username);

  let postTime = document.createElement("span");
  postTime.classList.add("answerTime");
  let durationSincePost = Date.now() - answerData.timestamp;
  postTime.innerText = formatDuration(durationSincePost);
  metadataContainer.appendChild(postTime);

  card.appendChild(metadataContainer);

  let replyContent = document.createElement("div");
  replyContent.classList.add("answerContent");
  replyContent.innerText = answerData.content;
  card.appendChild(replyContent);

  //let userPfp = document.createElement("img");
  //userPfp.classList.add("answerPfp");
  //card.appendChild(userPfp);

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

document.addEventListener("DOMContentLoaded", () => {
  let isFormOpen = false;
  let giveAnswerContainer = document.getElementById("giveAnswerContainer");
  let answerButtonContainer = document.getElementById(
    "giveAnswerButtonContainer",
  );
  let formContainer = document.getElementById("giveAnswerFormContainer");
  let giveAnswerContainerResizeObserver = new ResizeObserver(() => {
    if (isFormOpen) {
      giveAnswerContainer.style.height = `${formContainer.offsetHeight}px`;
    } else {
      giveAnswerContainer.style.height = `${answerButtonContainer.offsetHeight}px`;
    }
  });
  giveAnswerContainerResizeObserver.observe(answerButtonContainer);

  function showAnswerForm(formOpen) {
    isFormOpen = formOpen;

    // Make them visible for the transition
    answerButtonContainer.hidden = false;
    formContainer.hidden = false;

    // Make them unclickable while transitioning
    answerButtonContainer.style.pointerEvents = "none";
    formContainer.style.pointerEvents = "none";

    giveAnswerContainer.style.transition = "height 300ms ease-in-out";

    formContainer.addEventListener("animationend", () => {
      formContainer.style.opacity = formOpen ? 1 : 0;
      formContainer.style.pointerEvents = formOpen ? "auto" : "none";
      giveAnswerContainer.style.transition = "";
    });

    answerButtonContainer.addEventListener("animationend", () => {
      answerButtonContainer.style.opacity = formOpen ? 0 : 1;
      answerButtonContainer.style.pointerEvents = formOpen ? "none" : "auto";
      giveAnswerContainer.style.transition = "";
    });

    if (formOpen) {
      answerButtonContainer.style.animationName = "hide";
      formContainer.style.animationName = "show";
    } else {
      answerButtonContainer.style.animationName = "show";
      formContainer.style.animationName = "hide";
    }

    // Kinda hacky solution because the children don't take any actual space
    // due to being position: absolute;
    // Ends up working well for the css height transition anyways
    if (formOpen) {
      giveAnswerContainer.style.height = `${formContainer.offsetHeight}px`;
      giveAnswerContainerResizeObserver.observe(formContainer);
      giveAnswerContainerResizeObserver.unobserve(answerButtonContainer);
    } else {
      giveAnswerContainer.style.height = `${answerButtonContainer.offsetHeight}px`;
      giveAnswerContainerResizeObserver.observe(answerButtonContainer);
      giveAnswerContainerResizeObserver.unobserve(formContainer);
    }
  }

  document.getElementById("giveAnswerContainer").style.height =
    `${document.getElementById("giveAnswerButtonContainer").offsetHeight}px`;

  document
    .getElementById("giveAnswerButton")
    .addEventListener("click", (event) => {
      event.preventDefault();
      showAnswerForm(true);
    });

  document.getElementById("cancelButton").addEventListener("click", (event) => {
    event.preventDefault();
    showAnswerForm(false);
  });
});
