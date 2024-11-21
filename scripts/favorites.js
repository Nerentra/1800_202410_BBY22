/**
 * Takes in the data for a question and adds it to the DOM.
 * @param {String} questionId The Firestore ID of the question.
 * @param {String} authorId The Firestore ID for the question author.
 * @param {Object} questionData The Firestore data for the question.
 * @param {Object} authorData The Firestore data for the author.
 */
function addQuestionToDOM(questionID, authorId, questionData, authorData) {
  let anchor = document.createElement("a");
  anchor.href = `/question.html?docID=${questionID}`;
  anchor.classList.add("hideLink");

  let titleDiv = document.createElement("div");
  titleDiv.innerText = questionData.title;
  titleDiv.classList.add("questionTitle");
  let descriptionDiv = document.createElement("div");
  descriptionDiv.innerText = questionData.description;
  descriptionDiv.classList.add("questionDescription");

  let metadataContainer = document.createElement("div");
  metadataContainer.classList.add("questionMetadata");
  let authorAnchor = document.createElement("a");
  authorAnchor.innerText = authorData.name;
  authorAnchor.classList.add("hideLink");
  authorAnchor.href = "/profile.html?id=" + authorId;
  let timeSpan = document.createElement("span");
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
 * Fetches and displays the user's favorite questions.
 * If the user has no favorites, displays a message and a button to access all questions.
 */
function displayFavorites() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let userData = db.collection("users").doc(user.uid);
      userData
        .get()
        .then((userDoc) => {
          let userFavorites = userDoc.data().favorites || [];
          if (userFavorites.length > 0) {
            userFavorites.forEach((questionID) => {
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

                          addQuestionToDOM(
                            questionID,
                            authorDoc.id,
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
                    console.error(
                      `Question with ID ${questionID} does not exist`
                    );
                  }
                })
                .catch((error) => {
                  console.error("Error getting question data:", error);
                });
            });
          } else {
            let messageDiv = document.createElement("div");
            let pMessage = document.createElement("p");
            messageDiv.appendChild(pMessage);
            pMessage.innerText =
              "You have no favorites yet. Browse questions to select some!";
            messageDiv.classList.add("noFavoritesMessage");

            let browseButton = document.createElement("a");
            browseButton.href = "/search.html?tags=";
            browseButton.classList.add("main-page-btn");
            browseButton.innerText = "Browse All Questions";

            messageDiv.appendChild(browseButton);
            document.querySelector("#questions").appendChild(messageDiv);
          }
        })
        .catch((error) => {
          console.error("Error getting user data:", error);
        });
    } else {
      window.location.assign("/login.html");
    }
  });
}
displayFavorites();
