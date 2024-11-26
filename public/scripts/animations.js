function bookmarkClick() {
    e.preventDefault;
    button.classList.add("animate");
    setTimeout(() => {
      button.classList.remove("animate");
    }, 600);
}