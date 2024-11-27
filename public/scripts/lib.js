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

const lib = {
  tags: [
    "COMM1116",
    "COMP1100",
    "COMP1113",
    "COMP1510",
    "COMP1537",
    "COMP1712",
    "COMP1800",
    "Final",
  ],
};
