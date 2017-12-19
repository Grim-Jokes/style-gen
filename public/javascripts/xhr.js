class XHR {

  getTemplate(url, callback) {
    this._request({
      method: 'GET',
      url,
      callback
    });
  }

  _request(options) {
    const xhr = new XMLHttpRequest();

    xhr.open(options.method, options.url)

    xhr.responseType = options.type || 'text';

    xhr.onload = (response) => {
      if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
       options.callback(xhr);
      }
    }

    xhr.send(options.data);
  }
}