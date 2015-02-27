import DS from 'ember-data';

// Readibility Parser returns some really strange HTML from time-to-time (non-
// matching open/close tags, body tags in random spots, etc), so we need to
// to "clean" through an iframe.

var iframe = document.createElement('iframe');

iframe.setAttribute('src', 'about:blank');
iframe.setAttribute('style', 'display:none');

function removeElement(el) {
  el.parentNode.removeChild(el);
}

function cleanElement(el) {
  switch (el.tagName) {
    case 'A':
      /* jshint scripturl: true */
      if (el.hasAttribute('src') && el.getAttribute('src').indexOf('javascript:')) {
      /* jshint scripturl: false */
        removeElement(el);
        return;
      } else {
        el.setAttribute('target', '_blank');
        break;
      }
  }

  el.removeAttribute('id');
  el.removeAttribute('name');
  el.removeAttribute('class');
  el.removeAttribute('style');

  var children = [].slice.call( el.children );

  for (let i=0; i < children.length; i++) {
    cleanElement(children[i]);
  }
}

function cleanMarkup(html) {
  document.body.appendChild(iframe);

  var doc = iframe.contentDocument;

  doc.open();
  doc.write(`<html><head></head><body>${ html }</body></html>`);
  doc.close();

  cleanElement(doc.body);

  html = doc.body.innerHTML;

  doc.open();
  doc.close();

  document.body.removeChild(iframe);

  return html;
}

export default DS.RESTSerializer.extend({

  extractSingle(store, type, payload, id) {
    var article = {
      id: id,

      // Sucessful
      title: payload.title || null,
      author: payload.author || null,
      body: cleanMarkup(payload.content) || null,

      // Error
      error: payload.error || false,
      message: payload.messages || null
    };

    return this._super(store, type, { article }, id);
  }

});
