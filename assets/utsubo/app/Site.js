
goog.provide('app.Site');

goog.require('app.soy.site');
goog.require('goog.soy');
goog.require('goog.ui.Component');




/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.Site = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.pixel = new app.Site.Pixel;
};
goog.inherits(app.Site, goog.ui.Component);

/**
 * @enum {string}
 */
app.Site.EventType = {
  ELEMENT_SELECT: 'elementselect'
};

/** @inheritDoc */
app.Site.prototype.createDom = function() {
  this.setElementInternal(
      /** @type {Element} */(goog.soy.renderAsFragment(app.soy.site.createDom)));
};

app.Site.prototype.enable = function(enable) {
  var eh = this.getHandler();
  if (enable) {
    eh.listen(this.getDocument(), 'click', this.handleClick, true);
    eh.listen(this.getDocument(), 'mouseover', this.handleMouseover, true);
  } else {
    eh.unlisten(this.getDocument(), 'click', this.handleClick, true);
    eh.unlisten(this.getDocument(), 'mouseover', this.handleMouseover, true);
  }
};

app.Site.prototype.getDocument = function() {
  return goog.dom.getFrameContentDocument(this.getElement());
};

app.Site.prototype.handleMouseover = function(e) {
  var et = /** @type {Node} */(e.target);
  this.redrawPixel(et);
};

app.Site.prototype.redrawPixel = function(el) {
  var iframePos = this.getPosision();
  var pos = goog.style.getPageOffset(el);
  this.pixel.draw(
      new goog.math.Coordinate(iframePos.x + pos.x, iframePos.y + pos.y),
      goog.style.getBorderBoxSize(el),
      this.buildSelector(el));
};

/**
 * @param {Element} targetNode .
 * @return {?string} .
 */
app.Site.prototype.buildSelector = function(targetNode) {
  var rv = [];
  var node = targetNode;
  do {
    var builder = [];
    builder.push(node.tagName.toLowerCase());
    // TODO: It depends on each application to use DOM id because it can be a unique id.
    // builder.push(node.id ? '#' + node.id : '');
    builder.push(node.className ? '.' + node.className.split(' ').join('.') : '');
    var tmpIndex = this.getChildIndex(node);
    if (tmpIndex > 0) {
      builder.push(':nth-child(' + (tmpIndex + 1) + ')');
    }
    rv.push(builder.join(''));
  } while ((node = node.parentNode) && node && node.tagName && node.tagName.toLowerCase() != 'html');
  rv.reverse();
  if (this.getDocument().querySelector(rv.join(' ')) !== targetNode) {
    return null;
  }
  return rv.join(' ');
};

app.Site.prototype.getChildIndex = function(node) {
    var children = goog.dom.getChildren(node.parentNode);
    if (node.parentNode && children.length > 1) {
      for (var i = 0, item = children[i]; i < children.length; item = children[++i]) {
        if (node === item) {
          return i;
        }
      }
    }
    return -1;
  };


// app.Site.prototype.redrawPixel_ = function(pos, size, description) {
//   this.pixel.show(true);
//   var pixelEl = this.pixel.element;
//   goog.style.setPosition(pixelEl, pos);
//
//   goog.style.setWidth(pixelTopEl, size.width);
//   goog.style.setWidth(pixelBottomEl, size.width);
//   goog.style.setHeight(pixelLeftEl, size.height);
//   goog.style.setHeight(pixelRightEl, size.height);
//
//   goog.style.setPosition(pixelRightEl, size.width, 0);
//   goog.style.setPosition(pixelBottomEl, 0, size.height);
// };

app.Site.prototype.getPosision = function() {
  var pos = goog.style.getPageOffset(this.getElement());
  pos.x += parseInt(goog.style.getComputedStyle(this.getElement(), 'borderLeftWidth'), 10);
  pos.y += parseInt(goog.style.getComputedStyle(this.getElement(), 'borderTopWidth'), 10);
  return pos;
};

app.Site.prototype.handleClick = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.dispatchEvent({
    type: app.Site.EventType.ELEMENT_SELECT,
    element: e.target,
    selectorText: this.buildSelector(e.target),
    roughTitle: goog.dom.getTextContent(e.target)
  });
  // TODO:
  // goog.dom.forms.setValue(selectorTextareaEl, buildSelector(e.target));
  // goog.dom.forms.setValue(editorTitleInputEl, goog.dom.getTextContent(e.target));
  // enableSelectMode(false);
};

// /** @inheritDoc */
// app.Site.prototype.decorateInternal = function(element) {
//   goog.base(this, 'decorateInternal', element);
// };
//
// /** @inheritDoc */
// app.Site.prototype.canDecorate = function(element) {
//   if (element) {
//     return true;
//   }
//   return false;
// };

/** @inheritDoc */
app.Site.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.pixel.render(); // Append to document.body

  this.enable(false);
};

/** @inheritDoc */
app.Site.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};






/**
 * @constructor
 * @extends goog.ui.Component
 */
app.Site.Pixel = function() {
  goog.base(this);
};
goog.inherits(app.Site.Pixel, goog.ui.Component);

app.Site.Pixel.prototype.createDom = function() {
  var dh = this.getDomHelper();
  this.setElementInternal(dh.createDom('div', {className: 'worm-pixel', style: 'display:none'},
      this.topEl = dh.createDom('div', 'worm-pixel-border worm-pixel-border-top'),
      this.rightEl = dh.createDom('div', 'worm-pixel-border worm-pixel-border-right'),
      this.bottomEl = dh.createDom('div', 'worm-pixel-border worm-pixel-border-bottom'),
      this.leftEl = dh.createDom('div', 'worm-pixel-border worm-pixel-border-left')))
};

app.Site.Pixel.prototype.show = function(show) {
  if (show) {
    goog.dom.setProperties(this.getElement(), {
      title: null
    });
  }
  goog.style.setElementShown(this.getElement(), show);
};

app.Site.Pixel.prototype.draw = function(pos, size, description) {
  goog.asserts.assert(this.isInDocument());
  
  this.show(true);
  goog.dom.setProperties(this.getElement(), {
    title: description
  });

  goog.style.setPosition(this.getElement(), pos);

  goog.style.setWidth(this.topEl, size.width);
  goog.style.setWidth(this.bottomEl, size.width);
  goog.style.setHeight(this.leftEl, size.height);
  goog.style.setHeight(this.rightEl, size.height);

  goog.style.setPosition(this.rightEl, size.width, 0);
  goog.style.setPosition(this.bottomEl, 0, size.height);
};
