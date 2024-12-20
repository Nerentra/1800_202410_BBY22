let params = new URL(window.location.href); // Get URL of search bar
let questionId = params.searchParams.get("docID"); // Get value for key "id"
let userBookmarks = []; // Initialize global array to store and update user bookmarks

firebase.auth().onAuthStateChanged((user) => {
  const giveAnswerContainer = document.getElementById("giveAnswerContainer");
  if (user) {
    // I cannot explain why this is needed but I need to move on
    setTimeout(() => {
      giveAnswerContainer.hidden = false;
    }, 0);
  }
  giveAnswerContainer.hidden = true;
});

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
            const questionAuthorElem =
              document.getElementById("questionAuthor");
            questionAuthorElem.innerText = authorName;
            questionAuthorElem.href = "/profile.html?id=" + authorDoc.id;
          })
          .catch((error) => {
            console.error("Error fetching author:", error);
            document.getElementById("questionAuthor").innerText =
              "Unknown Author";
          });

        document.getElementById("question").hidden = false;
        document.getElementById("questionPlaceholder").hidden = true;
        // Display and initialize the bookmark icon
        initializeBookmarkIcon();
      }
    })
    .catch((error) => {
      console.error("Error fetching question data:", error);
    });
}
displayQuestion();

/**
 * Initializes and handles the bookmark icon functionality
 */
function initializeBookmarkIcon() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userDocRef = db.collection("users").doc(user.uid);

      const questionHeader = document.getElementById("questionHeader");
      const bookmarkIcon = document.createElement("input");
      bookmarkIcon.alt = "Bookmark icon";
      bookmarkIcon.id = "bookmarkIcon";
      bookmarkIcon.type = "image";
      questionHeader.appendChild(bookmarkIcon);

      // Get user bookmark and set initial icon state
      userDocRef
        .get()
        .then((userDoc) => {
          if (userDoc.exists) {
            userBookmarks = userDoc.data().bookmarks || [];
            bookmarkIcon.src = userBookmarks.includes(questionId)
              ? "../images/bookmark-filled2.svg"
              : "../images/bookmark-frame.svg";

            // Add click event to toggle bookmark status
            bookmarkIcon.addEventListener("click", () =>
              toggleBookmark(bookmarkIcon, userDocRef)
            );
          } else {
            console.log("No user document found.");
          }
        })
        .catch((error) => {
          console.error("Error retrieving user bookmarks:", error);
        });
    }
  });
}

/**
 * Updates the bookmark status of a question
 * @param {HTMLElement} bookmarkIcon - The bookmark icon element
 * @param {firebase.firestore.DocumentReference} userDocRef - Reference to the user's document
 */
function toggleBookmark(bookmarkIcon, userDocRef) {
  if (!userBookmarks) {
    console.error("User bookmarks not loaded yet.");
    return;
  }

  const isBookmark = userBookmarks.includes(questionId);

  if (isBookmark) {
    // Remove from bookmarks
    userDocRef
      .update({
        bookmarks: firebase.firestore.FieldValue.arrayRemove(questionId),
      })
      .then((userDoc) => {
        bookmarkIcon.src = "../images/bookmark-frame.svg"; // Update icon to unfilled

        userBookmarks = userBookmarks.filter((id) => id !== questionId);
      })
      .catch((error) => {
        console.error("Error removing from bookmarks:", error);
      });
  } else {
    // Add to bookmarks
    userDocRef
      .update({
        bookmarks: firebase.firestore.FieldValue.arrayUnion(questionId),
      })
      .then(() => {
        bookmarkIcon.src = "../images/bookmark-filled2.svg"; // Update icon to filled

        userBookmarks.push(questionId);
      })
      .catch((error) => {
        console.error("Error adding to bookmarks:", error);
      });
  }
}

/**
 * Adds an answer to the DOM.
 * @param {Object} currentUser The current user object from firebase auth
 * @param {Object} questionSnapshot A snapshot of the question
 * @param {Object} answerSnapshot A snapshot of thefor the answer
 * @param {Object} authorSnapshot A snapshot of the the author
 */
function addAnswerToDOM(
  currentUser,
  questionSnapshot,
  answerSnapshot,
  authorSnapshot
) {
  const answerData = answerSnapshot.data();
  const answerId = answerSnapshot.id;
  const authorId = authorSnapshot.id;
  const questionId = questionSnapshot.id;
  const isQuestionAuthor =
    currentUser && questionSnapshot.data().author.id == currentUser.uid;
  const solutionId = questionSnapshot.data().solution;

  let replies = document.querySelector("#replies");

  let card = document.createElement("div");
  card.classList.add("answer");

  let metadataContainer = document.createElement("div");
  metadataContainer.classList.add("cf");
  metadataContainer.classList.add("answerMetadata");

  let existingSolution = solutionId && solutionId.length !== 0;
  let answerIsSolution = solutionId === answerId;
  if (existingSolution && answerIsSolution) {
    let solutionMarker = document.createElement("div");
    solutionMarker.classList.add("solutionMarker");
    solutionMarker.title = "Solution";
    let svg = document.createElement("img");
    svg.src = "/images/checkmark.svg";
    solutionMarker.appendChild(svg);
    metadataContainer.appendChild(solutionMarker);
  }

  let username = document.createElement("a");
  username.href = "/profile.html?id=" + authorId;
  username.classList.add("answerName");
  username.classList.add("hideLink");
  username.innerText = authorSnapshot.data().name;
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

  if (isQuestionAuthor) {
    if (existingSolution && answerIsSolution) {
      let unmarkSolutionButton = document.createElement("button");
      unmarkSolutionButton.classList.add("markSolutionButton");
      unmarkSolutionButton.classList.add("redButton");
      unmarkSolutionButton.innerText = "Unmark as solution";
      unmarkSolutionButton.addEventListener("click", async () => {
        const promise1 = db.collection("questions").doc(questionId).update({
          solution: "",
        });
        db.collection("users")
          .doc(authorId)
          .update({
            points: firebase.firestore.FieldValue.increment(-5),
          });
        await promise1;

        window.location.reload();
      });
      card.appendChild(unmarkSolutionButton);
    } else {
      let markSolutionButton = document.createElement("button");
      markSolutionButton.classList.add("markSolutionButton");
      markSolutionButton.classList.add("greenButton");
      markSolutionButton.innerText = "Mark as solution";
      markSolutionButton.addEventListener("click", async () => {
        const promise1 = db.collection("questions").doc(questionId).update({
          solution: answerId,
        });
        if (!existingSolution) {
          await db
            .collection("users")
            .doc(authorId)
            .update({
              points: firebase.firestore.FieldValue.increment(5),
            });
        }
        await promise1;

        window.location.reload();
      });
      card.appendChild(markSolutionButton);
    }
  }

  replies.appendChild(card);
}

/**
 * Displays the answers of the current question
 * @param {String} questionId The id of the question
 */
async function displayAnswers(questionId) {
  const questionSnapshotPromise = db
    .collection("questions")
    .doc(questionId)
    .get();
  const answersRef = db
    .collection("questions")
    .doc(questionId)
    .collection("answers")
    .orderBy("timestamp");
  const answerSnapshots = (await answersRef.get()).docs;

  const answers = await Promise.all(
    answerSnapshots.map(async (answerSnapshot) => {
      const authorSnapshot = await answerSnapshot.data().author.get();
      return { answerSnapshot, authorSnapshot };
    })
  );

  const questionSnapshot = await questionSnapshotPromise;

  // There is somewhat of a race condition here with whether the user is authenticated yet
  const currentUser = firebase.auth().currentUser;
  answers.forEach((answer) => {
    addAnswerToDOM(
      currentUser,
      questionSnapshot,
      answer.answerSnapshot,
      answer.authorSnapshot
    );
  });
  document.getElementById("replies").hidden = false;
  document.getElementById("repliesPlaceholder").hidden = true;
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

  /**
   * Switches between the form for replying and the "reply" button.
   * @param formOpen Set to true to open the form, false to close the form and
   *   bring back the button
   */
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

  document
    .getElementById("submitButton")
    .addEventListener("click", async (event) => {
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
              db.collection("users")
                .doc(user.uid)
                .update({
                  points: firebase.firestore.FieldValue.increment(1),
                })
                .then(() => {
                  window.location.reload();
                });
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
