// Function to load questions from Firestore and display them
function loadQuestions() {
    const questionsContainer = document.getElementById("questions-list");
    const questionTemplate = document.getElementById("questionCardTemplate").content;

    // Get all questions from Firestore collection "questions"
    db.collection("questions")
    .orderBy("timestamp", "desc")
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const questionData = doc.data();
            const questionID = doc.id;

            let timestamp = questionData.timestamp;
      
            let timeElapsed = Date.now() - timestamp;
            let readableTime = formatDuration(timeElapsed);

            // Clone the template
            const questionCard = questionTemplate.cloneNode(true);

            // Fill in the question details
            questionCard.querySelector("#questionTitle").innerText = questionData.title;
            questionCard.querySelector("#questionDescription").innerText = questionData.description;
            // questionCard.querySelector("#questionAuthor").innerText = "Posted by: " + questionData.author || "Unknown";
            questionCard.querySelector("#questionTimestamp").innerText = readableTime + " ago";
            questionCard.querySelector("#questionLink").href = `/question.html?docID=${questionID}`;

            questionData.author
            .get()
            .then((authorDoc) => {
              let authorName = authorDoc.data().name || "Unknown Author";
              document.getElementById("questionAuthor").innerText = authorName;
            })
            .catch((error) => {
              console.error("Error fetching author:", error);
              document.getElementById("questionAuthor").innerText =
                "Unknown Author";
            });

        

            // Append the question card to the container
            questionsContainer.appendChild(questionCard);
        });
    }).catch((error) => {
        console.error("Error fetching questions: ", error);
    });
}

// Load questions when the page loads
document.addEventListener("DOMContentLoaded", loadQuestions);
