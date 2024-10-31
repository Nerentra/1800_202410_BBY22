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
