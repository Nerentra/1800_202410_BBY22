function insertNameFromFirestore() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let userData = db.collection("users").doc(user.uid);
      userData.get().then((userDoc) => {
        let userName = userDoc.data().name;
        document.querySelector("#name-goes-here").innerText = userName;
      });
    } else {
      window.location.assign("/");
    }
  });
}
insertNameFromFirestore();

function displayFavorites() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let userData = db.collection("users").doc(user.uid);
      userData.get().then((userDoc) => {
        let userFavorites = userDoc.data().favorites;
      });
    } else {
      window.location.assign("/");
    }
  });
}
displayFavorites();
