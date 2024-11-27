/**
 * Logs the user out of their firebase account.
 */
function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.assign("/");
    })
    .catch((_) => {
      console.error("Error logging out");
    });
}
