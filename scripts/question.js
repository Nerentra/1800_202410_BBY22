let params = new URL(window.location.href); // Get URL of search bar
let questionId = params.searchParams.get("docID"); // Get value for key "id"
let userFavorites = [];

/**
 * Get data from Firestore and display it on the page
 */
function displayQuestion() {
  // Getting info from the firebase collection
  db.collection("questions")
    .doc(questionId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const docData = doc.data();
        const title = docData.title;
        const description = docData.description;
        const timestamp = docData.timestamp;

        const timeElapsed = Date.now() - timestamp;
        const readableTime = formatDuration(timeElapsed);

        // Only populate title, and image
        document.getElementById("questionTitle").innerText = title;
        document.getElementById("questionDescription").innerText = description;
        document.getElementById("questionTimestamp").innerText = readableTime;

        docData.author
          .get()
          .then((authorDoc) => {
            const authorName = authorDoc.data().name || "Unknown Author";
            document.getElementById("questionAuthor").innerText = authorName;
          })
          .catch((error) => {
            console.error("Error fetching author:", error);
            document.getElementById("questionAuthor").innerText =
              "Unknown Author";
          });

        // Display and initialize the favorite icon
        initializeFavoriteIcon();
      }
    })
    .catch((error) => {
      console.error("Error fetching question data:", error);
    });
}
displayQuestion();

/**
 * Initializes and handles the favorite icon functionality
 */
function initializeFavoriteIcon() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userDocRef = db.collection("users").doc(user.uid);

      const questionHeader = document.getElementById("question-header");
      const favoriteIcon = document.createElement("img");
      favoriteIcon.alt = "favorite icon";
      favoriteIcon.id = "star-icon";
      questionHeader.appendChild(favoriteIcon);

      // Get user favorites and set initial icon state
      userDocRef
        .get()
        .then((userDoc) => {
          if (userDoc.exists) {
            userFavorites = userDoc.data().favorites;
            favoriteIcon.src = userFavorites.includes(questionId)
              ? "../images/star-solid.svg"
              : "../images/star-frame.svg";

            // Add click event to toggle favorite status
            favoriteIcon.addEventListener("click", () =>
              toggleFavorite(favoriteIcon, userDocRef)
            );
          } else {
            console.log("No user document found.");
          }
        })
        .catch((error) => {
          console.error("Error retrieving user favorites:", error);
        });
    } else {
      console.log("User not logged in. Redirecting...");
      window.location.assign("/");
    }
  });
}

/**
 * Updates the favorite status of a question
 * @param {HTMLElement} favoriteIcon - The favorite icon element
 * @param {firebase.firestore.DocumentReference} userDocRef - Reference to the user's document
 */
function toggleFavorite(favoriteIcon, userDocRef) {
  if (!userFavorites) {
    console.error("User favorites not loaded yet.");
    return;
  }

  const isFavorite = userFavorites.includes(questionId);

  if (isFavorite) {
    // Remove from favorites
    userDocRef
      .update({
        favorites: firebase.firestore.FieldValue.arrayRemove(questionId),
      })
      .then((userDoc) => {
        favoriteIcon.src = "../images/star-frame.svg"; // Update icon to unfilled

        userFavorites = userFavorites.filter((id) => id !== questionId);
      })
      .catch((error) => {
        console.error("Error removing from favorites:", error);
      });
  } else {
    // Add to favorites
    userDocRef
      .update({
        favorites: firebase.firestore.FieldValue.arrayUnion(questionId),
      })
      .then(() => {
        favoriteIcon.src = "../images/star-solid.svg"; // Update icon to filled

        userFavorites.push(questionId);
      })
      .catch((error) => {
        console.error("Error adding to favorites:", error);
      });
  }
}

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
        answers.push({
          answer,
          author,
        });
      }

      answers.sort((a, b) => a.answer.timestamp - b.answer.timestamp);

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
    "giveAnswerButtonContainer"
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

  document.getElementById("giveAnswerContainer").style.height = `${
    document.getElementById("giveAnswerButtonContainer").offsetHeight
  }px`;

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

  document.getElementById("submitButton").addEventListener("click", (event) => {
    event.preventDefault();
    const answerContent = document.getElementById("answerContent").value;
    const user = firebase.auth().currentUser;

    if (user) {
      if (answerContent.trim() !== "") {
        db.collection("questions")
          .doc(questionId)
          .collection("answers")
          .add({
            content: answerContent,
            author: db.collection("users").doc(user.uid),
            timestamp: Date.now(),
          })
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            console.error("Error submitting question: ", error);
            alert("Error submitting question. Please try again.");
          });
      } else {
        alert("Please input something for your answer.");
      }
    } else if (user) {
      alert("You must be logged in to submit a question.");
    }
  });
});
