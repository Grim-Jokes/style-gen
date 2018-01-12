function editCss(a) {
  a = a || this;
  const preParent = a.parentElement.parentElement;
  const pre = preParent.querySelector('pre');
  const textArea = preParent.querySelector('textarea');

  const editMode = a.getAttribute('data-edit')  == 'true'

  if (!editMode) {
    a.textContent = "Save";
    var text = a.textContent;

    pre.classList.add("d-none");
    textArea.classList.remove('d-none');
    textArea.value = pre.textContent;

  } else {
    a.textContent = "Edit"
    var text = a.textContent;
    pre.classList.remove("d-none");
    textArea.classList.add('d-none');

    const code = pre.querySelector('code');
    code.textContent = textArea.value.trim();

    hljs.highlightBlock(code);
  }

  a.setAttribute("data-edit", !editMode);
}