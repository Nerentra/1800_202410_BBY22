const params = new URL(window.location.href).searchParams;
const paramsId = params.get("id");

/**
 * Takes in the data for a question and adds it to the DOM.
 * @param {Object} questionSnapshot A firestore snapshot of the question.
 */
function addQuestionToDOM(questionSnapshot) {
  const questionData = questionSnapshot.data();

  const anchor = document.createElement("a");
  anchor.href = `/question.html?docID=${questionSnapshot.id}`;
  anchor.classList.add("hideLink");

  const titleDiv = document.createElement("div");
  titleDiv.innerText = questionData.title;
  titleDiv.classList.add("questionTitle");
  const descriptionDiv = document.createElement("div");
  let description = questionData.description;
  if (description.length > 120) {
    description = description.slice(0, 120) + "...";
  }
  descriptionDiv.innerText = description;
  descriptionDiv.classList.add("questionDescription");

  const metadataContainer = document.createElement("div");
  metadataContainer.classList.add("questionMetadata");
  const timeSpan = document.createElement("span");
  timeSpan.innerText = formatDuration(Date.now() - questionData.timestamp);

  metadataContainer.appendChild(document.createElement("span"));
  metadataContainer.appendChild(timeSpan);

  anchor.appendChild(titleDiv);
  anchor.appendChild(descriptionDiv);
  anchor.appendChild(metadataContainer);

  document.querySelector("#questions").appendChild(anchor);
}

/**
 * Returns a Promise that resolves once the auth state changes for the first time.
 * @returns {Promise} Resolves to a reference to the logged-in-user's document or undefined if not logged in.
 */
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

/**
 * A function that checks what needs to be displayed on the profile.html page.
 * @returns {Object} An object with the fields
 *   userRef A reference to the user's firestore document
 *   isCurUser A boolean denoting if the profile is showing the logged in user's document
 */
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

getProfileUserRef().then(async ({ userRef, isCurUser }) => {
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.data();
  document.getElementById("userName").innerText = userData.name;
  const userPoints = userData.points || 0;
  const userPointsElem = document.getElementById("userPoints");
  userPointsElem.innerText = `${userPoints >= 0 ? "+" : "-"}${userPoints}`;
  if (userPoints) {
    const strongestColorValue = 100;
    const strongestColorStrength = 0.8; // Must be between 0 and 1
    const colorFactor =
      Math.max(Math.min(Math.abs(userPoints) / strongestColorValue, 1), 0) *
      strongestColorStrength;
    let colorComponent = (colorFactor * 255).toString(16);
    if (colorComponent.length === 1) {
      colorComponent = "0" + colorComponent;
    }
    let displayColor;
    if (userPoints > 0) {
      displayColor = `#00${colorComponent}00`;
    } else {
      displayColor = `#${colorComponent}0000`;
    }
    userPointsElem.style.color = displayColor;
  }
  document.getElementById("userNameContainer").hidden = false;
  document.getElementById("userNameContainerPlaceholder").hidden = true;

  if (isCurUser) {
    const editButtonContainer = document.getElementById("editButtonContainer");
    editButtonContainer.hidden = false;

    const editAnchor = document.createElement("a");
    editAnchor.classList.add("hideLink");
    editAnchor.href = "/editProfile.html";

    const editButton = document.createElement("button");
    editButton.innerText = "Edit Profile";
    editButton.classList.add("button");

    editAnchor.appendChild(editButton);

    editButtonContainer.appendChild(editAnchor);
  }

  const questionCollectionSnapshot = await db
    .collection("questions")
    .where("author", "==", userRef)
    .get();

  const questionSnapshots = questionCollectionSnapshot.docs;

  questionSnapshots.sort((a, b) => b.data().timestamp - a.data().timestamp);

  questionSnapshots.forEach(async (questionSnapshot) => {
    addQuestionToDOM(questionSnapshot, userSnapshot);
  });

  document.getElementById("questions").hidden = false;
  document.getElementById("questionsPlaceholders").hidden = true;
});
