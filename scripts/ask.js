// Handle form submission
document
  .getElementById("question-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const questionTitle = document.getElementById("titleInput").value;
    const questionText = document.getElementById("questionInput").value;
    const user = firebase.auth().currentUser;

    if (user && questionTitle.trim() && questionText.trim()) {
      // Add question to Firestore
      db.collection("questions")
        .add({
          title: questionTitle,
          description: questionText,
          author: db.collection("users").doc(user.uid),
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          tags: [],
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
