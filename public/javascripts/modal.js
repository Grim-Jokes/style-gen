function updateModal() {
  const elements = document.querySelectorAll('.modal-content');

  elements.forEach((elem) => {
    elem.className = "modal-content " + document.body.className;
  });
}