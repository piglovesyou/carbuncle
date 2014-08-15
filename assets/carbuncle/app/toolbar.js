
goog.provide('app.Toolbar');

goog.require('app.soy.toolbar');
goog.require('goog.Delay');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @extends {goog.ui.Component}
 */
app.Toolbar = function(opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(app.Toolbar, goog.ui.Component);

/** @inheritDoc */
app.Toolbar.prototype.createDom = function() {
  this.setElementInternal(/** @type {Element} */
      (goog.soy.renderAsFragment(app.soy.toolbar.createDom)));
};

/** @inheritDoc */
app.Toolbar.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var that = this;
  var clearTimer = new goog.Delay(function clearMessage() {
    goog.soy.renderElement(that.getElement(), app.soy.toolbar.content);
  }, 3000, this);

  app.socket().then(function(socket) {
    socket.on('before', function(data) {
      goog.mixin(data, { situation: 'before' });
      goog.soy.renderElement(that.getElement(),
          app.soy.toolbar.content, /** @type {ObjectInterface.Json.Progress} */(data));
    });
    socket.on('pass', function(data) {
      goog.mixin(data, { situation: 'pass' });
      goog.soy.renderElement(that.getElement(),
          app.soy.toolbar.content, /** @type {ObjectInterface.Json.Progress} */(data));
      clearTimer.start();
    });
    socket.on('fail', function(data) {
      goog.mixin(data, { situation: 'fail' });
      goog.soy.renderElement(that.getElement(),
          app.soy.toolbar.content, /** @type {ObjectInterface.Json.Progress} */(data));
      clearTimer.start();
    });
  });
};

/** @inheritDoc */
app.Toolbar.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
};