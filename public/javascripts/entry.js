function getIds() {
  const ids = document.querySelector('#ids');

  if (!ids) {
    return [];
  }

  return ids.value.split(',');
}

function getFileName() {
  const name = window.location.pathname;
  let slashIndex = name.indexOf('/');

  if (slashIndex < 0) {
    slashIndex = 0;
  } else {
    slashIndex += 1;
  }

  let extensionIndex = name.indexOf('.');

  if (extensionIndex < 0) {
    extensionIndex = name.length;
  }


  return name.substring(slashIndex, extensionIndex)
}

function callback() {
  const ids = getIds();
  const urlPrefix = getFileName();
  new Retriever(ids, urlPrefix).retrieve();
}


window.addEventListener('load', () => {
  hljs.configure({
    tabReplace: ' ',
  })
})