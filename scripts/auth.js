// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      // Return value determines whether we continue the redirect automatically

      var user = authResult.user; // Firebase auth user
      if (authResult.additionalUserInfo.isNewUser) {
        db.collection("users")
          .doc(user.uid)
          .set({
            name: user.displayName,
            email: user.email,
            favorites: [],
          })
          .then(() => {
            window.location.href = "/main.html";
          })
          .catch((error) => {
            console.log("Error adding new user", error);
          });
      } else {
        return true;
      }
      return false;
    },
    uiShown: () => {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById("loader").style.display = "none";
    },
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  signInSuccessUrl: "main.html",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
  ],
  // Terms of service url.
  tosUrl: "/tos",
  // Privacy policy url.
  privacyPolicyUrl: "/privacy_policy",
};

ui.start("#firebaseui-auth-container", uiConfig);
