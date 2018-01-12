function changeBg(elem) {
  var val = elem.getAttribute('data-value');

  if (val != 'default-dark') {
    val = 'bg-match-' + val;
  } else {
    val = 'bg-' + val;
  }

  var classess = document.body.classList;
  for(var i = 0; i <  classess.length; i ++) {
    document.body.classList.toggle(classess[i])
  }

  document.body.classList.toggle(val);
}