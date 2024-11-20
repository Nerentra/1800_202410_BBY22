/**
 * Function to load questions from Firestore and display them
 */
async function loadQuestions() {
    let questionsContainer = document.getElementById("questions-list");
    let questionTemplate = document.getElementById("questionCardTemplate").content;

    // Get all questions from Firestore collection "questions"
    try {
        let querySnapshot = await db.collection("questions").orderBy("timestamp", "desc").get();

        // Process questions in order
        let questionCards = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
                let questionData = doc.data();
                let questionID = doc.id;

                let timestamp = questionData.timestamp;
                let timeElapsed = Date.now() - timestamp;
                let readableTime = formatDuration(timeElapsed);

                // Clone the template
                const questionCard = questionTemplate.cloneNode(true);

                // Fill in the question details
                questionCard.querySelector("#questionTitle").innerText = questionData.title;
                questionCard.querySelector("#questionDescription").innerText = questionData.description;
                questionCard.querySelector("#questionTimestamp").innerText = readableTime + " ago";
                questionCard.querySelector("#questionLink").href = `/question.html?docID=${questionID}`;

                // Fetch author details
                let authorName = await questionData.author
                    .get()
                    .then((authorDoc) => {
                        return authorDoc.exists ? authorDoc.data().name : "Unknown Author";
                    })
                    .catch((error) => {
                        console.error("Error fetching author:", error);
                        return "Unknown Author";
                    });
                questionCard.querySelector("#questionAuthor").innerText = "Posted by: " + authorName;

                return questionCard;
            })
        );

        // Append all question cards to the container in order
        questionCards.forEach((card) => questionsContainer.appendChild(card));
    } catch (error) {
        console.error("Error fetching questions: ", error);
    }
}

// Load questions when the page loads
document.addEventListener("DOMContentLoaded", loadQuestions);
