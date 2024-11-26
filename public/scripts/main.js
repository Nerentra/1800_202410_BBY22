/**
 * Inserts the user's name into the page by fetching it from Firestore.
 * If the user is not authenticated, redirects to the home page.
 */
function insertNameFromFirestore() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let userData = db.collection("users").doc(user.uid);
      userData.get().then((userDoc) => {
        let userName = userDoc.data().name;
        document.querySelector("#name-goes-here").innerText =
          "Hey, " + userName + "!";
      });
    } else {
      window.location.assign("/");
    }
  });
}
insertNameFromFirestore();

/**
 * Adds a question card to the DOM in the specified container.
 *
 * @param {string} questionID - The ID of the question document.
 * @param {Object} questionData - The Firestore data of the question.
 * @param {Object} authorData - The Firestore data of the author.
 * @param {string} [containerSelector="#bookmarked-questions"] - The CSS selector of the container to append the question to.
 */
function addQuestionToDOM(
  questionID,
  questionData,
  authorData,
  containerSelector = "#bookmarked-questions"
) {
  let anchor = document.createElement("a");
  anchor.href = `/question.html?docID=${questionID}`;
  anchor.classList.add("hideLink");

  let titleDiv = document.createElement("div");
  titleDiv.innerText = questionData.title;
  titleDiv.classList.add("questionTitle");

  // Commented out to remove description from bookmarks, saving space
  // let descriptionDiv = document.createElement("div");
  // descriptionDiv.innerText = questionData.description;
  // descriptionDiv.classList.add("questionDescription");

  let metadataContainer = document.createElement("div");
  metadataContainer.classList.add("questionMetadata");

  let authorSpan = document.createElement("span");
  authorSpan.innerText = authorData.name;

  let timeSpan = document.createElement("span");
  timeSpan.innerText = formatDuration(Date.now() - questionData.timestamp);

  metadataContainer.appendChild(authorSpan);
  metadataContainer.appendChild(document.createElement("span"));
  metadataContainer.appendChild(timeSpan);

  anchor.appendChild(titleDiv);
  // anchor.appendChild(descriptionDiv); // removed decription to save space
  anchor.appendChild(metadataContainer);

  document.querySelector(containerSelector).appendChild(anchor);
}

/**
 * Displays the user's bookmark questions on the page.
 * Fetches the user's bookmarks from Firestore and adds them to the DOM.
 * If the user has no bookmarks, displays a message indicating so.
 */
function displayBookmarks() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let userData = db.collection("users").doc(user.uid);
      userData
        .get()
        .then((userDoc) => {
          let userBookmarks = userDoc.data().bookmarks || [];
          if (userBookmarks.length > 0) {
            // Show newest bookmarks first
            let bookmarksToDisplay = userBookmarks.slice(-3).reverse();
            bookmarksToDisplay.forEach((questionID) => {
              // Get question data
              db.collection("questions")
                .doc(questionID)
                .get()
                .then((questionDoc) => {
                  if (questionDoc.exists) {
                    let questionData = questionDoc.data();
                    questionData.author
                      .get()
                      .then((authorDoc) => {
                        if (authorDoc.exists) {
                          let authorData = authorDoc.data();
                          // Display the question card
                          addQuestionToDOM(
                            questionID,
                            questionData,
                            authorData
                          );
                        } else {
                          console.error("Author document does not exist");
                        }
                      })
                      .catch((error) => {
                        console.error("Error getting author data:", error);
                      });
                  } else {
                    console.error("Question document does not exist");
                  }
                })
                .catch((error) => {
                  console.error("Error getting question data:", error);
                });
            });
            let seeAllBookmarks = document.createElement("p");
            seeAllBookmarks.innerText = "To see all bookmarks, ";
            let bookmarksRedirect = document.createElement("a");
            bookmarksRedirect.href = "bookmarks.html";
            bookmarksRedirect.innerText = "click here.";
            seeAllBookmarks.appendChild(bookmarksRedirect);
            document
              .querySelector("#bookmarked-questions")
              .insertAdjacentElement("afterend", seeAllBookmarks);
          } else {
            let messageDiv = document.createElement("div");
            messageDiv.innerText =
              "You have no bookmarks yet. Browse questions to select some!";
            messageDiv.classList.add("noBookmarksMessage");
            document
              .querySelector("#bookmarked-questions")
              .appendChild(messageDiv);
          }
        })
        .catch((error) => {
          console.error("Error getting user data:", error);
        });
    } else {
      window.location.assign("/");
    }
  });
}
displayBookmarks();
