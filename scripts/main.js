function getNameFromAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let userName = user.displayName;
      document.querySelector("#name-goes-here").innerText = userName;
    } else {
      window.location.assign("/");
    }
  });
}
getNameFromAuth();
