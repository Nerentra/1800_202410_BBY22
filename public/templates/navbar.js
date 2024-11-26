/**
 * Gets the start and end index of the word at the
 * current index in the given text. Words are delimited
 * using spaces.
 *
 * E.g. With text = "Hello to my world." and index = 9,
 * this function would return "my"
 *
 * @param {String} text The text to search within
 * @param {Number} index The index where the word is
 * @returns {[Number, Number]} The starting and ending indices of the word
 */
function getIndicesOfWord(text, index) {
  const delimiter = " ";

  let startIndex, endIndex;
  for (let i = index - 1; i >= 0; i--) {
    if (text[i] == delimiter) {
      startIndex = i + 1;
      break;
    }
  }
  for (let i = index; i < text.length; i++) {
    if (text[i] == delimiter) {
      endIndex = i;
      break;
    }
  }
  startIndex = startIndex ?? 0;
  endIndex = endIndex ?? text.length;

  return [startIndex, endIndex];
}

/**
 * Returns the tags that can be autofilled for a given word.
 *
 * @param {String} word The current word the user is typing
 * @param {[String]} tags A list of tags that can be autofilled
 * @param {[String]} invalidTags A list of tags that are disallowed from autofilling
 * @returns {[String]} A list of tags that can be autofilled
 */
function getRecommendationsForWord(word, tags, invalidTags) {
  word = word.toLowerCase();
  const validTags = [];
  tags.forEach((tag) => {
    // If tag starts with word
    if (tag.toLowerCase().indexOf(word) == 0) {
      // If tag is not in invalidTags
      if (invalidTags.indexOf(tag) == -1) {
        validTags.push(tag);
      }
    }
  });
  validTags.sort((a, b) => a.length - b.length);
  return validTags;
}

/**
 * Replaces a word at some indices in some text with a new word.
 *
 * @param {String} text The text to modify
 * @param {[Number, Number]} indices The starting and ending indices of the word to replace
 * @param {String} newWord The word to replace the original word with
 * @returns {String} The newly modified text
 */
function replaceTextAtIndices(text, indices, newWord) {
  return text.substring(0, indices[0]) + newWord + text.substring(indices[1]);
}

/**
 * Adds a dropdown containing the autofill recommendations.
 *
 * @param {[String]} recommendations A list of tags that can be selected to be autofilled
 * @param {[Number, Number]} wordIndices The starting and ending indices of the word the user is editing
 * @param {[String]} tags All tags that can be autofilled
 */
function addRecommendationsToPage(recommendations, wordIndices, tags) {
  let dropdown = document.getElementById("navDropdown");
  dropdown.innerHTML = "";

  recommendations.forEach((recommendation) => {
    let div = document.createElement("div");
    div.innerText = recommendation;
    div.addEventListener("mouseup", (event) => {
      event.preventDefault();
      let searchbar = document.getElementById("navSearchbar");
      let newWord;
      if (searchbar.value[wordIndices[1]] == " ") {
        newWord = recommendation;
      } else {
        newWord = recommendation + " ";
      }
      searchbar.value = replaceTextAtIndices(
        searchbar.value,
        wordIndices,
        newWord
      );
      searchbar.focus();
      updateDropdown(searchbar.value.length, tags);
    });
    dropdown.appendChild(div);
  });
}

/**
 * Updates the autofill recommendations dropdown using the current
 * text in the search bar.
 *
 * @param {Number} cursorIndex The index of the cursor in the text
 * @param {[String]} tags The tags that can be autofilled
 */
function updateDropdown(cursorIndex, tags) {
  if (tags == undefined) {
    return;
  }

  let text = document.getElementById("navSearchbar").value;
  let wordIndices = getIndicesOfWord(text, cursorIndex);
  let word = text.substring(wordIndices[0], wordIndices[1]);

  let recommendations = getRecommendationsForWord(word, tags, text.split(" "));
  addRecommendationsToPage(recommendations, wordIndices, tags);
}

/**
 * Function that is called when the searchbar is loaded in the page.
 * Initializes the interactivity for the autofill dropdown.
 */
function searchbarLoaded() {
  let searchbar = document.getElementById("navSearchbar");
  searchbar.value = new URL(window.location.href).searchParams.get("tags");

  let tags;
  db.collection("tags")
    .get()
    .then((result) => {
      tags = [];
      result.docs.forEach((tag) => {
        tags.push(tag.id);
      });
    })
    .catch((error) => {
      console.error(
        "Error loading tags. Search recommendations will not work.",
        error
      );
    });

  let searchButton = document.getElementById("searchButton");
  searchbar.addEventListener("focus", () => {
    searchButton.innerText = "Search";
  });
  searchbar.addEventListener("blur", () => {
    // This timeout is a hack to not instantly change it
    // if the user is clicking an option in the dropdown
    setTimeout(() => {
      if (searchbar.value.trim() === "") {
        searchButton.innerText = "Browse";
      } else {
        searchButton.innerText = "Search";
      }
    }, 250);
  });
  ["input", "focus"].forEach((eventName) => {
    searchbar.addEventListener(eventName, (event) => {
      let cursorIndex = event.target.selectionStart;
      updateDropdown(cursorIndex, tags);
    });
  });
  let isHovering;
  let dropdown = document.getElementById("navDropdown");
  dropdown.addEventListener("mouseover", () => {
    isHovering = true;
  });
  dropdown.addEventListener("mouseleave", () => {
    isHovering = false;
  });
  searchbar.addEventListener("blur", () => {
    if (!isHovering) {
      dropdown.innerHTML = "";
    }
  });
}

templates.navbarPrelogin = {
  html: `
<nav id="navbar" class="navbar bg-body-tertiary">
  <div id="navItemsContainer" class="container-fluid d-flex align-items-center">
    <!-- Hamburger menu button on the left -->
    <button
      class="btn btn-outline-secondary me-2"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#offcanvasMenu"
      aria-controls="offcanvasMenu"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <a href="/">
      <img
        src="svgs/logoFull.svg"
        alt="A pretty purple logo for Askmii"
        id="navbarLogo"
      />
    </a>

    <!-- Responsive, centered search bar next to the hamburger icon -->
    <form
      class="d-flex mx-auto justify-content-center"
      role="search"
      id="search-form"
      autocomplete="off"
      action="/search.html"
    >
      <div id="navSearchbarContainer">
        <input
          class="form-control"
          type="search"
          placeholder="Search tags"
          aria-label="Search tags"
          name="tags"
          id="navSearchbar"
        />
        <div id="navDropdown"></div>
      </div>
      <button id="searchButton" class="btn btn-outline-success" type="submit">Browse</button>
    </form>
    
  </div>
</nav>
<div
  class="offcanvas offcanvas-start"
  tabindex="-1"
  id="offcanvasMenu"
  aria-labelledby="offcanvasMenuLabel"
>
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasMenuLabel">Menu</h5>
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="offcanvas"
      aria-label="Close"
    ></button>
  </div>
  <div class="offcanvas-body">
    <ul class="nav flex-column">
      <li class="nav-item">
        <a href="/index.html" class="nav-link">Home</a>
      </li>
      <li class="nav-item">
        <a href="/features.html" class="nav-link">Features</a>
      </li>
      <li class="nav-item">
        <a href="/faq.html" class="nav-link">FAQs</a>
      </li>
      <li class="nav-item">
        <a href="/about.html" class="nav-link">About</a>
      </li>
    </ul>
  </div>
</div>
`,
  onload: searchbarLoaded,
};
templates.navbarPostlogin = {
  html: `
<nav class="navbar bg-body-tertiary">
  <div id="navItemsContainer" class="container-fluid d-flex align-items-center">
    <!-- Hamburger menu button on the left -->
    <button
      class="btn btn-outline-secondary me-2"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#offcanvasMenu"
      aria-controls="offcanvasMenu"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <a href="/main.html">
      <img
        src="svgs/logoFull.svg"
        alt="A pretty purple logo for Askmii"
        id="navbarLogo"
      />
    </a>

    <!-- Responsive, centered search bar next to the hamburger icon -->
    <form
      class="d-flex mx-auto justify-content-center"
      role="search"
      id="search-form"
      autocomplete="off"
      action="/search.html"
    >
      <div id="navSearchbarContainer">
        <input
          class="form-control"
          type="search"
          placeholder="Search tags"
          aria-label="Search tags"
          name="tags"
          id="navSearchbar"
        />
        <div id="navDropdown"></div>
      </div>
      <button id="searchButton" class="btn btn-outline-success" type="submit">Browse</button>
    </form>
  </div>
</nav>
<div
  class="offcanvas offcanvas-start"
  tabindex="-1"
  id="offcanvasMenu"
  aria-labelledby="offcanvasMenuLabel"
>
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasMenuLabel">Menu</h5>
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="offcanvas"
      aria-label="Close"
    ></button>
  </div>
  <div class="offcanvas-body">
    <ul class="nav flex-column">
      <li class="nav-item">
        <a href="/main.html" class="nav-link">Home</a>
      </li>
      <li class="nav-item">
        <a href="/bookmarks.html" class="nav-link">Bookmarks</a>
      </li>
      <li class="nav-item">
        <a href="/profile.html" class="nav-link">Profile</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link" onclick="logout()">Logout</a>
      </li>
    </ul>
  </div>
</div>
`,
  onload: searchbarLoaded,
};