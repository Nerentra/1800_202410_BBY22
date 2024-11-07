/**
 * Gets the tags from the database.
 * @returns {Document[]} The tags
 */
function getTags() {
  try {
    return db.collection("tags").get();
  } catch (error) {
    console.error("Error fetching tags: ", error);
  }
}

let selectedTags = [];
let allTags = getTags();

document.addEventListener("DOMContentLoaded", async () => {
  const selectedTagsContainer = document.getElementById("selected-tags");
  const tagsDropdown = document.getElementById("tagsDropdown");

  let tags = await allTags;
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag.id;
    option.textContent = tag.id;
    tagsDropdown.appendChild(option);
  });

  tagsDropdown.addEventListener("change", function () {
    const selectedTag = tagsDropdown.value;
    if (selectedTag && !selectedTags.includes(selectedTag)) {
      selectedTags.push(selectedTag);
      updateSelectedTagsDisplay();
      const option = tagsDropdown.querySelector(
        `option[value="${selectedTag}"]`,
      );
      if (option) option.remove();
      tagsDropdown.selectedIndex = 0;
    }
  });

  /**
   * This function will update the tags display area,
   * meaning that every clicked tag will be displayed
   *  and every removed tag will not be shown.
   */
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

  /**
   * Removes a selected tag from the selected tags list,
   * reinserts it into the dropdown menu, and resets the
   * dropdown menu to its placeholder option.
   * @param {String} tag The Firestore id for the tag.
   */
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
      const questionDescription =
        document.getElementById("descriptionInput").value;
      const user = firebase.auth().currentUser;

      if (user && questionTitle.trim() && questionDescription.trim()) {
        db.collection("questions")
          .add({
            title: questionTitle,
            description: questionDescription,
            author: db.collection("users").doc(user.uid),
            timestamp: Date.now(),
            tags: selectedTags,
          })
          .then((newQuestion) => {
            window.location.href = `/question.html?docID=${newQuestion.id}`;
          })
          .catch((error) => {
            console.error("Error submitting question: ", error);
            alert("Error submitting question. Please try again.");
          });
      } else {
        alert("You must be logged in to submit a question.");
      }
    });
});
