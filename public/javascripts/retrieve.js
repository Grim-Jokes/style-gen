class Retriever {

  constructor(ids, urlPrefix) {
    this.ids = ids;
    this.currId = null;
    this.request = new XHR();
    this.urlPrefix = urlPrefix;
  }

  getStyleSuccess(xhr, entryTemplate) {
    entryTemplate.querySelector('.css').textContent = xhr.responseText;

    const code = entryTemplate.querySelector('code.css');

    hljs.highlightBlock(code);
  }

  getTemplateSuccess(xhr, entryTemplate, id) {

    const filler = document.createElement('div');
    filler.innerHTML = xhr.response;

    entryTemplate.querySelector('.example > .bg').innerHTML = xhr.response;
    const code = entryTemplate.querySelector('code.html');
    const codeText = xhr.response;
    code.textContent = codeText;

    this.request.getTemplate(
      '/stylesheets/' + this.urlPrefix + '/' + id + '.css',
      (xhr) => {
        this.getStyleSuccess(xhr, entryTemplate);
        document.querySelector('#entries .pd-content').appendChild(entryTemplate);
        updateModal();
        hljs.highlightBlock(code);
      }
    );
  }

  createNav(id) {
    const a = document.createElement('a');

    const li = document.createElement('li');
    li.classList.add('nav-item');
    li.appendChild(a);

    a.href = '#' + id;
    a.className = 'btn btn-sm btn-link';
    a.textContent = id.replace(/-/g, ' ');

    return li;
  }

  retrieve() {
    this.ids.forEach((id, index) => {
      id = id.trim().replace(/' '/g, '%20');
      if (!id) {
        return;
      }

      const last = index == this.ids.length - 1;

      const entryTemplate = document.importNode(ENTRY_TEMPLATE.content, true);
      this.request.getTemplate(
        '/templates/' + this.urlPrefix + '/' + id + '.html',
        (xhr) => {
          this.getTemplateSuccess(xhr, entryTemplate, id);
          const h3 = entryTemplate.querySelector('h3');

          h3.id = id;
          h3.textContent = id;
          h3.classList.add('example-header')

          const sideNav = document.querySelector('.side-nav');

          sideNav.appendChild(this.createNav(id));

          if (last) {
            sideNav.appendChild(this.createNav('top'));
          }
        }
      );
    });
  }
}