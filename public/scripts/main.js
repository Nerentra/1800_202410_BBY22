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
            let messageP = document.createElement("p");
            messageP.innerText =
              "You have no bookmarks yet. Browse questions to select some!";
            messageP.classList.add("noBookmarksMessage");
            messageDiv.classList.add("noBookmarksMessage");
            document
              .querySelector("#bookmarked-questions")
              .appendChild(messageP);
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

/**
 * Returns a Promise that resolves once the auth state changes for the first time.
 * @returns {Promise} Resolves to a reference to the logged-in-user's document or undefined if not logged in.
 */
function authOnce() {
  return new Promise((resolve, _) => {
    let triggered = false;
    firebase.auth().onAuthStateChanged((user) => {
      if (!triggered) {
        triggered = true;
        if (user) {
          resolve(db.collection("users").doc(user.uid));
        } else {
          resolve(undefined);
        }
      }
    });
  });
}

const params = new URL(window.location.href).searchParams;
const paramsId = params.get("id");

/**
 * A function that checks what needs to be displayed on the profile.html page.
 * @returns {Object} An object with the fields
 *   userRef A reference to the user's firestore document
 *   isCurUser A boolean denoting if the profile is showing the logged in user's document
 */
async function getProfileUserRef() {
  if (paramsId && paramsId.trim() !== "") {
    return {
      userRef: db.collection("users").doc(paramsId),
      isCurUser: false,
    };
  } else {
    let user = await authOnce();
    if (user) {
      return {
        userRef: user,
        isCurUser: true,
      };
    } else {
      window.location.replace("/");
    }
  }
}

/**
 * A function that checks what needs to be displayed on the profile.html page.
 * @returns {Object} An object with the fields
 *   userRef A reference to the user's firestore document
 *   isCurUser A boolean denoting if the profile is showing the logged in user's document
 */
getProfileUserRef().then(async ({ userRef, isCurUser }) => {
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data();
  const userPoints = userData.points || 0;
  const userPointsElem = document.getElementById("userPoints");
  userPointsElem.innerText = `${userPoints >= 0 ? "+" : "-"}${userPoints}`;
  if (userPoints !== undefined) {
    const strongestColorValue = 100;
    const strongestColorStrength = 0.8; // Must be between 0 and 1
    const colorFactor =
      Math.max(Math.min(Math.abs(userPoints) / strongestColorValue, 1), 0) *
      strongestColorStrength;
    let colorComponent = (colorFactor * 255).toString(16);
    if (colorComponent.length === 1) {
      colorComponent = "0" + colorComponent;
    }
    let displayColor;
    if (userPoints > 0) {
      displayColor = `#00${colorComponent}00`;
    } else {
      displayColor = `#${colorComponent}0000`;
    }
    if (userPoints == 1 || userPoints == -1) {
      document.getElementById("pointsWord").innerText = " point!";
    } else {
      document.getElementById("pointsWord").innerText = " points!";
    }
    userPointsElem.style.color = displayColor;
  }
});
