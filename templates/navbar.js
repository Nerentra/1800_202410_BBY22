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

function replaceTextAtIndices(text, indices, newWord) {
  return text.substring(0, indices[0]) + newWord + text.substring(indices[1]);
}

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
        newWord,
      );
      searchbar.focus();
      updateDropdown(searchbar.value.length, tags);
    });
    dropdown.appendChild(div);
  });
}

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
        error,
      );
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
  <div class="container-fluid d-flex align-items-center">
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
    <!-- Responsive, centered search bar next to the hamburger icon -->
    <form
      class="d-flex mx-auto justify-content-center"
      role="search"
      style="max-width: 400px; min-width: 200px; flex: 1"
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
      <button class="btn btn-outline-success" type="submit">Search</button>
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
  <div class="container-fluid d-flex align-items-center">
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
    <!-- Responsive, centered search bar next to the hamburger icon -->
    <form
      class="d-flex mx-auto justify-content-center"
      role="search"
      style="max-width: 400px; min-width: 200px; flex: 1"
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
      <button class="btn btn-outline-success" type="submit">Search</button>
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
        <a href="/features.html" class="nav-link">Features</a>
      </li>
      <li class="nav-item">
        <a href="/faq.html" class="nav-link">FAQs</a>
      </li>
      <li class="nav-item">
        <a href="/about.html" class="nav-link">About</a>
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
