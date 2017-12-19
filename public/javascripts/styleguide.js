window.onload = () => {
  const request = new XHR();

  request.getTemplate('/templates/content.html', (xhr) => {
    document.body.innerHTML += xhr.response;

    document.body.querySelector('h1').textContent = getFileName().toLocaleUpperCase();

    request.getTemplate('/templates/entry-template.html', (xhr) => {
      ENTRY_TEMPLATE = document.createElement('template');

      ENTRY_TEMPLATE.innerHTML = xhr.response

      if (callback) {
        callback();
      }
    });
  });
}