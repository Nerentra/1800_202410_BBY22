function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      window.location = "/";
    })
    .catch((_) => {
      // An error happened.
    });
}
