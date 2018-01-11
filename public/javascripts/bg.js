function changeBg(elem) {
  var val = elem.getAttribute('data-value');
  var d = document.querySelectorAll('.root')

  d.forEach((elem) => {
    if (elem.classList.contains('bg') ) {
      elem.classList.remove('bg');
      elem.classList.add('bg-match-' + val);
    } else {
      elem.className = elem.className.replace(/bg-match-(\w+)-dark/g, 'bg-match-' + val)
    }

    
  });
}