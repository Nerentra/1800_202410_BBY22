// Reference to Firestore
const db = firebase.firestore();

// Handle form submission
document
  .getElementById("question-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page reload on form submission

    const questionText = document.getElementById("questionInput").value;
    const user = firebase.auth().currentUser;

    if (user && questionText.trim()) {
      // Add question to Firestore
      db.collection("questions")
        .add({
          title: questionText.slice(0, 50), // Create a short title from the question
          description: questionText,
          author: db.collection("users").doc(user.uid),
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          alert("Question submitted successfully!");
          document.getElementById("question-form").reset();
        })
        .catch((error) => {
          console.error("Error submitting question: ", error);
          alert("Error submitting question. Please try again.");
        });
    } else {
      alert("You must be logged in to submit a question.");
    }
  });
