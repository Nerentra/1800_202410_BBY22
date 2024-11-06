templates.navbarPrelogin = `
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
      class="d-flex mx-auto"
      role="search"
      style="max-width: 400px; min-width: 200px; flex: 1"
      action="/search.html"
    >
      <input
        class="form-control me-2"
        type="search"
        placeholder="Search"
        aria-label="Search"
        name="search"
      />
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
`;
templates.navbarPostlogin = `
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
      class="d-flex mx-auto"
      role="search"
      style="max-width: 400px; min-width: 200px; flex: 1"
      action="/search.html"
    >
      <input
        class="form-control me-2"
        type="search"
        placeholder="Search"
        aria-label="Search"
        name="query"
      />
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
`;
