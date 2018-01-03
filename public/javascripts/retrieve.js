class Retriever {

  constructor(ids, urlPrefix) {
    this.ids = ids;
    this.currId = null;
    this.request = new XHR();
    this.urlPrefix = urlPrefix;
  }

  getStyleSuccess(xhr, entryTemplate) {
    entryTemplate.querySelector('.css').textContent = xhr.responseText;

    document.querySelector('#entries .pd-content').appendChild(entryTemplate);

    const pre = document.querySelectorAll('code.css');

    const code = pre[pre.length - 1]

    hljs.highlightBlock(code);
  }

  getTemplateSuccess(xhr, entryTemplate, id) {

    const filler = document.createElement('div');
    filler.innerHTML = xhr.response;

    entryTemplate.querySelector('.example > .bg').innerHTML = xhr.response;

    this.request.getTemplate(
      '/stylesheets/' + this.urlPrefix + '/' + id + '.css',
      (xhr) => this.getStyleSuccess(xhr, entryTemplate)
    );
  }

  retrieve() {
    this.ids.forEach((id) => {
      id = id.trim().replace(/' '/g, '%20');
      if (!id) {
        return;
      }

      const entryTemplate = document.importNode(ENTRY_TEMPLATE.content, true);
      this.request.getTemplate(
        '/templates/' + this.urlPrefix + '/' + id + '.html',
        (xhr) => this.getTemplateSuccess(xhr, entryTemplate, id)
      );
    });
  }
}