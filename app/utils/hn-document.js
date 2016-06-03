/**
 * @module Utils
 */

/**
 * Wraps a DOMElement and knows how to _clean_ it. This includes removal if
 * unsafe and recursive cleaning of child nodes.
 *
 * This is a base interface and suitable for most elements. More spesific
 * elements can have their own version. To facilitate this use the `factory()`
 * method for construction which will return the correct class type based on
 * the element `tagName`.
 *
 * @class HNElement
 * @constructor
 * @private
 */
class HNElement {
  constructor(el) {
    this.el = el;
  }

  /**
   * The DOM element this class wraps.
   * @property {DOMElement} el
   */

  /**
   * Cleans the element's atributes and recursivly clean its children.
   * @method clean
   * @chainable
   */
  clean() {
    this.el.removeAttribute('id');
    this.el.removeAttribute('name');
    this.el.removeAttribute('class');
    this.el.removeAttribute('style');
    this.children.forEach(el => HNElement.factory(el).clean());
    return this;
  }

  /**
   * The children of this element as an Array.
   * @property {Array} children
   */
  get children() {
    return [].slice.call(this.el.children);
  }

  /**
   * Is the element unsafe for consumption?
   * @property {Boolean} isUnsafe
   * @default false
   */
  get isUnsafe() {
    return false;
  }

  /**
   * Remove this element from its parent.
   * @method remove
   * @chainable
   */
  remove() {
    this.el.parentNode.removeChild(this.el);
    return this;
  }

  /**
   * Factory to determine which type of HNElement should wrap the DOMElement.
   * @static
   * @method factory
   * @param {DOMElement} el the DOM element to wrap
   * @return {HNElement} the correct HNElement implementation based on the
   * element type
   */
  static factory(el) {
    const ElementClass = ELEMENT_CLASSES[el.tagName] || ELEMENT_CLASSES._default;
    return new ElementClass(el);
  }
}

/**
 * HNElement for `<a>` tags
 * @class HNLinkElement
 * @extends HNElement
 * @constructor
 * @private
 */
class HNLinkElement extends HNElement {
  clean() {
    if (this.isUnsafe) {
      return this.remove();
    }
    this.el.setAttribute('target', '_blank');
    return super();
  }
  get isUnsafe() {
    /* jshint scripturl: true */
    return this.el.hasAttribute('href') &&
      this.el.getAttribute('href').indexOf('javascript:') >= 0;
    /* jshint scripturl: false */
  }
}

const ELEMENT_CLASSES = {
  A: HNLinkElement,
  _default: HNElement
};

/**
 * Cleans up raw HTML from HN.
 *
 * Readibility Parser returns some really strange HTML from time-to-time (non-
 * matching open/close tags, body tags in random spots, etc), so we need to
 * to "clean" through an iframe.
 *
 * @class HNDocument
 * @constructor
 */
export default class HNDocument {
  constructor() {
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('src', 'about:blank');
    this.iframe.setAttribute('style', 'display:none');
  }

  /**
   * @property {DOMElement} iframe
   * @private
   */

  /**
   * @property {DOMDocument} doc
   * @private
   */

  /**
   * Attach the iframe to the document and assign a contentDocument.
   * @method initDocument
   * @chainable
   * @private
   */
  initDocument() {
    document.body.appendChild(this.iframe);
    this.doc = this.iframe.contentDocument;
    return this;
  }

  /**
   * Write raw HTML to iframe document.
   * @method writeDocument
   * @param {String} html the raw HTML
   * @chainable
   * @private
   */
  writeDocument(html) {
    this.doc.open();
    this.doc.write(`<html><head></head><body>${ html }</body></html>`);
    this.doc.close();
    return this;
  }

  /**
   * Empty the iframe document (helps garbage collection).
   * @method emptyDocument
   * @chainable
   * @private
   */
  emptyDocument() {
    this.doc.open();
    this.doc.close();
    return this;
  }

  /**
   * Remove iframe from main document.
   * @method destroyDocument
   * @chainable
   * @private
   */
  destroyDocument() {
    this.doc = null;
    document.body.removeChild(this.iframe);
    return this;
  }

  /**
   * Recursivly clean all the elements in the iframe document.
   * @method cleanElements
   * @chainable
   * @private
   */
  cleanElements() {
    HNElement.factory(this.doc.body).clean();
    return this;
  }

  /**
   * Clean and sanitize raw html.
   * @method cleanMarkup
   * @param {String} html the raw HTML
   * @return {String} sanitized HTML
   */
  cleanMarkup(html) {
    this.initDocument()
      .writeDocument(html)
      .cleanElements();
    const cleanHtml = this.doc.body.innerHTML;
    this.emptyDocument()
      .destroyDocument();
    return cleanHtml;
  }
}
