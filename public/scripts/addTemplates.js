addTemplate("navbarTemplate", "navbarPrelogin");
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    addTemplate("navbarTemplate", "navbarPostlogin");
  }
});

addTemplate("footerTemplate", "footer");
