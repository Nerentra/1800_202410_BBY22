let userRef = undefined;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    userRef = db.collection("users").doc(user.uid);
    populateUserInfo(userRef);
  } else {
    userRef = undefined;
  }
});

async function populateUserInfo(userRef) {
  // Clear form first
  document.getElementById("nameInput").value = "";

  if (userRef) {
    let userSnapshot = await userRef.get();
    let userData = userSnapshot.data();
    // Fill in form
    if (userData.name != undefined) {
      document.getElementById("nameInput").value = userData.name;
    }
  }
}

document.getElementById("saveButton").addEventListener("click", async () => {
  if (userRef) {
    let userName = document.getElementById("nameInput").value;

    userRef.update({
      name: userName,
    });

    document.getElementById("personalInfoFields").disabled = true;
  }
});

document.getElementById("editButton").addEventListener("click", () => {
  document.getElementById("personalInfoFields").disabled = false;
});
