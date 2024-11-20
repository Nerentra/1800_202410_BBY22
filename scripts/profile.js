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
    return db.collection("users").doc(paramsId);
  } else {
    let user = await authOnce();
    if (user) {
      return user;
    } else {
      window.location.replace("/");
    }
  }
}

const userRef = getProfileUserRef();

async function loadUserData() {
  let userSnapshot = await (await userRef).get();
  let userData = userSnapshot.data();
  document.getElementById("userName").innerText = userData.name;
}
loadUserData();
