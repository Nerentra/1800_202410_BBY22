let lastVisibleQuestion = undefined; // Tracks the last visible question for pagination
const QUESTIONS_PER_PAGE = 20;

/**
 * Loads questions from Firestore and displays them, in pages
 */
async function loadQuestions() {
  let questionsContainer = document.getElementById("questions-list");
  let questionTemplate = document.getElementById(
    "questionCardTemplate"
  ).content;

  try {
    let query = db
      .collection("questions")
      .orderBy("timestamp", "desc")
      .limit(QUESTIONS_PER_PAGE);

    if (lastVisibleQuestion !== undefined) {
      query = query.startAfter(lastVisibleQuestion);
    }

    let querySnapshot = await query.get();
    lastVisibleQuestion = querySnapshot.docs[querySnapshot.docs.length - 1];

    // Process questions in order
    let questionCards = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        let questionData = doc.data();
        let questionID = doc.id;

        let timestamp = questionData.timestamp;
        let timeElapsed = Date.now() - timestamp;
        let readableTime = formatDuration(timeElapsed);
        let description = questionData.description;
        if (description.length > 180) {
          description = description.slice(0, 120) + "...";
        }

        // Clone the template
        const questionCard = questionTemplate.cloneNode(true);

        // Fill in the question details
        questionCard.querySelector("#questionTitle").innerText =
          questionData.title;
        questionCard.querySelector("#questionDescription").innerText =
          description;
        questionCard.querySelector("#questionTimestamp").innerText =
          readableTime + " ago";
        questionCard.querySelector(
          "#questionLink"
        ).href = `/question.html?docID=${questionID}`;

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
        questionCard.querySelector("#questionAuthor").innerText =
          "Posted by: " + authorName;

        // Add tags to the question card
        if (questionData.tags) {
          let tagsContainer = questionCard.querySelector("#questionTags");
          for (const tag in questionData.tags) {
            let tagElement = document.createElement("span");
            tagElement.classList.add("tag");
            tagElement.innerText = tag;
            tagsContainer.appendChild(tagElement);
          }
        }

        return questionCard;
      })
    );

    // Append all question cards to the container in order
    questionCards.forEach((card) => questionsContainer.appendChild(card));

    // Show the "Load More" button if there are more questions
    const loadMoreButton = document.getElementById("load-more");
    if (querySnapshot.docs.length < QUESTIONS_PER_PAGE) {
      loadMoreButton.style.display = "none";
    } else {
      loadMoreButton.style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching questions: ", error);
  }
}

// Load questions when the page loads
document.addEventListener("DOMContentLoaded", () => loadQuestions());

// Add event listener for "Load More" button
document
  .getElementById("load-more")
  .addEventListener("click", () => loadQuestions());
