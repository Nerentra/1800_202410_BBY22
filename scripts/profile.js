const params = new URL(window.location.href).searchParams;
const paramsId = params.get("id");

function authOnce() {
  return new Promise((resolve, _) => {
    let triggered = false;
    firebase.auth().onAuthStateChanged((user) => {
      if (!triggered) {
        triggered = true;
        if (user) {
          resolve(db.collection("users").doc(user.uid));
        } else {
          resolve(undefined);
        }
      }
    });
  });
}

async function getProfileUserRef() {
  if (paramsId && paramsId.trim() !== "") {
    return {
      userRef: db.collection("users").doc(paramsId),
      isCurUser: false,
    };
  } else {
    let user = await authOnce();
    if (user) {
      return {
        userRef: user,
        isCurUser: true,
      };
    } else {
      window.location.replace("/");
    }
  }
}

getProfileUserRef().then(async ({userRef, isCurUser}) => {
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data();
  document.getElementById("userName").innerText = userData.name;

  if (isCurUser) {
    const editButtonContainer = document.getElementById("editButtonContainer");

    const editAnchor = document.createElement("a")
    editAnchor.classList.add("hideLink")
    editAnchor.href = "/editProfile.html"

    const editButton = document.createElement("button")
    editButton.innerText = "Edit Profile"
    editButton.classList.add("button")

    editAnchor.appendChild(editButton)

    editButtonContainer.appendChild(editAnchor);
  }
})
