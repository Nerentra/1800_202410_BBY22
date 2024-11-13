// Get URL of search bar
let params = new URL(window.location.href);
let questionId = params.searchParams.get("docID");

// Reference to the current user’s document in Firestore
const userId = firebase.auth().currentUser
  ? firebase.auth().currentUser.uid
  : null;
const userDocRef = userId ? db.collection("users").doc(userId) : null;

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
        const userFavorites = userDoc.data().favorites;
        favoriteIcon.src = userFavorites.includes(questionId)
          ? "../images/star-solid.svg"
          : "../images/star-frame.svg";

        // Add click event to toggle favorite status
        favoriteIcon.addEventListener("click", () =>
          toggleFavorite(favoriteIcon, userFavorites)
        );
      } else {
        console.log("No user document found.");
      }
    })
    .catch((error) => {
      console.error("Error retrieving user favorites:", error);
    });
}

/**
 * Toggles the favorite status of a question
 * @param {HTMLElement} favoriteIcon - The favorite icon element
 * @param {Array} userFavorites - Array of question IDs favorited by the user
 */
function toggleFavorite(favoriteIcon, userFavorites) {
  const isFavorite = userFavorites.includes(questionId);

  if (isFavorite) {
    // Remove from favorites
    userDocRef
      .update({
        favorites: firebase.firestore.FieldValue.arrayRemove(questionId),
      })
      .then(() => {
        favoriteIcon.src = "../images/star-frame.svg"; // Update icon to unfilled
        console.log("Removed from favorites.");
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
        console.log("Added to favorites.");
      })
      .catch((error) => {
        console.error("Error adding to favorites:", error);
      });
  }
}
