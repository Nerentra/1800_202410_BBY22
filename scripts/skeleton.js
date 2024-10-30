function addTemplate(className, templateName) {
  let elem = document.querySelector("." + className);
  let url = `/templates/${templateName}.html`;
  if (elem && elem.innerHTML.length == 0) {
    let xhr = new XMLHttpRequest();
    xhr.onload = (_) => {
      if (xhr.status === 200) {
        elem.innerHTML = xhr.responseText;
      } else {
        console.error(`Error loading template "${className}"`);
      }
    };
    xhr.open("GET", url);
    xhr.send();
  }
}

function loadSkeleton() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      addTemplate("navbarTemplate", "navbarPostlogin");
    } else {
      // No user is signed in.
      addTemplate("navbarTemplate", "navbarPrelogin");
    }
    addTemplate("footerTemplate", "footer");
  });
}

loadSkeleton();
