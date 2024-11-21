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
        document.querySelector("#name-goes-here").innerText = userName;
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
 * @param {string} [containerSelector="#questions"] - The CSS selector of the container to append the question to.
 */
function addQuestionToDOM(
  questionID,
  questionData,
  authorData,
  containerSelector = "#questions"
) {
  let anchor = document.createElement("a");
  anchor.href = `/question.html?docID=${questionID}`;
  anchor.classList.add("hideLink");

  let titleDiv = document.createElement("div");
  titleDiv.innerText = questionData.title;
  titleDiv.classList.add("questionTitle");

  // Commented out to remove description from favorites, saving space
  // let descriptionDiv = document.createElement("div");
  // descriptionDiv.innerText = questionData.description;
  // descriptionDiv.classList.add("questionDescription");

  let metadataContainer = document.createElement("div");
  metadataContainer.classList.add("questionMetadata");

  let authorSpan = document.createElement("span");
  authorSpan.innerText = authorData.name;

  let timeSpan = document.createElement("span");
  timeSpan.innerText = formatDuration(Date.now() - questionData.timestamp);

  let seeAllFavorites = document.createElement("p");
  seeAllFavorites.innerText = "To see all favorites, ";
  let favoritesRedirect = document.createElement("a");
  favoritesRedirect.href = "favorites.html";
  favoritesRedirect.innerText = "click here.";
  seeAllFavorites.appendChild(favoritesRedirect);

  metadataContainer.appendChild(authorSpan);
  metadataContainer.appendChild(document.createElement("span"));
  metadataContainer.appendChild(timeSpan);

  anchor.appendChild(titleDiv);
  // anchor.appendChild(descriptionDiv); // removed decription to save space
  anchor.appendChild(metadataContainer);

  document.querySelector(containerSelector).appendChild(anchor);
  document
    .querySelector(containerSelector)
    .insertAdjacentElement("afterend", seeAllFavorites);
}

/**
 * Displays the user's favorite questions on the page.
 * Fetches the user's favorites from Firestore and adds them to the DOM.
 * If the user has no favorites, displays a message indicating so.
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
            // Show newest favorites first
            let favoritesToDisplay = userFavorites.slice(-3).reverse();
            favoritesToDisplay.forEach((questionID) => {
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
          } else {
            let messageDiv = document.createElement("div");
            messageDiv.innerText =
              "You have no favorites yet. Browse questions to select some!";
            messageDiv.classList.add("noFavoritesMessage");
            document.querySelector("#questions").appendChild(messageDiv);
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
displayFavorites();
