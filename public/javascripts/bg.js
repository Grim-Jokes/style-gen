window.addEventListener('load', () => {
  localStorage.setItem('bodyClass', 'bg-default-dark');
})


function changeBg(elem) {
  var val = elem.getAttribute('data-value');

  if (val != 'default-dark') {
    val = 'bg-match-' + val;
  } else {
    val = 'bg-' + val;
  }

  document.body.className = localStorage.getItem('bodyClass') || '';
  document.body.className = val;

  updateModal();
}