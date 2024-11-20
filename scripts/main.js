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
  // anchor.appendChild(descriptionDiv);
  anchor.appendChild(metadataContainer);

  document.querySelector(containerSelector).appendChild(anchor);
}

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
            document.querySelector("#favorites").appendChild(messageDiv);
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
