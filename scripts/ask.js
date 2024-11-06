const selectedTagsContainer = document.getElementById("selected-tags");
const tagsDropdown = document.getElementById("tagsDropdown");
let selectedTags = [];
let allTags = [];

function loadTags() {
  db.collection("tags")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        allTags.push(doc.id);
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.id;
        tagsDropdown.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error fetching tags: ", error);
    });
}

tagsDropdown.addEventListener("change", function () {
  const selectedTag = tagsDropdown.value;
  if (selectedTag && !selectedTags.includes(selectedTag)) {
    selectedTags.push(selectedTag);
    updateSelectedTagsDisplay();
    const option = tagsDropdown.querySelector(`option[value="${selectedTag}"]`);
    if (option) option.remove();
    tagsDropdown.selectedIndex = 0;
  }
});

function updateSelectedTagsDisplay() {
  selectedTagsContainer.innerHTML = "";
  selectedTags.forEach((tag) => {
    const tagElement = document.createElement("div");
    tagElement.className = "tag-item";
    tagElement.textContent = tag;

    const removeButton = document.createElement("button");
    removeButton.textContent = "×";
    removeButton.onclick = () => removeTag(tag);

    tagElement.appendChild(removeButton);
    selectedTagsContainer.appendChild(tagElement);
  });
}

function removeTag(tag) {
  selectedTags = selectedTags.filter((t) => t !== tag);

  const existingOption = tagsDropdown.querySelector(`option[value="${tag}"]`);
  if (existingOption) existingOption.remove();

  const originalIndex = allTags.indexOf(tag);
  const option = document.createElement("option");
  option.value = tag;
  option.textContent = tag;

  if (originalIndex >= 0) {
    const referenceNode = tagsDropdown.options[originalIndex + 1];
    tagsDropdown.insertBefore(option, referenceNode);
  } else {
    tagsDropdown.appendChild(option);
  }

  tagsDropdown.selectedIndex = 0;

  updateSelectedTagsDisplay();
}

document
  .getElementById("question-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const questionTitle = document.getElementById("titleInput").value;
    const questionText = document.getElementById("questionInput").value;
    const user = firebase.auth().currentUser;

    if (user && questionTitle.trim() && questionText.trim()) {
      db.collection("questions")
        .add({
          title: questionTitle,
          description: questionText,
          author: db.collection("users").doc(user.uid),
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          tags: selectedTags,
        })
        .then(() => {
          alert("Question submitted successfully!");
          document.getElementById("question-form").reset();
          selectedTags = [];
          updateSelectedTagsDisplay();
        })
        .catch((error) => {
          console.error("Error submitting question: ", error);
          alert("Error submitting question. Please try again.");
        });
    } else {
      alert("You must be logged in to submit a question.");
    }
  });

document.addEventListener("DOMContentLoaded", loadTags);
