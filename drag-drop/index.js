var DragDemo = (function() {


  function DragDrop($el) {
    var _ = {
      $el: undefined,
      sClientX: undefined,
      sClientY: undefined,
      offsetX: undefined,
      offsetY: undefined,

      ingX: undefined,
      ingY: undefined,
      moving: false,

      _bindEvent: function(dom, type, fn) {
        if (dom.addEventListener) {
          dom.addEventListener(type, fn ,false);
        } else if (dom.attachEvent) {
          dom.attachEvent('on' + type, fn);
        } else {
          dom['on' + type] = fn;
        }
      },

      bindEvent: function() {
        this._bindEvent(this.$el, 'mousedown', this.onMouseDown);
        this._bindEvent(document, 'mouseup', this.onMouseUp);
        this._bindEvent(this.$el, 'mousemove', this.onMouseMove);
      },

      init: function($el) {
        this.$el = $el;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.bindEvent();
      },

      onMouseDown: function(event) {
        var e = event || window.event;
        var target = e.target || e.srcElement;
        this.moving = true;
        this.sClientX = e.clientX;
        this.sClientY = e.clientY;
        this.offsetY = target.offsetTop;
        this.offsetX = target.offsetLeft;
      },

      onMouseUp: function(event) {
        this.moving = false;
      },

      onMouseMove: function(event) {
        if (this.moving) {
          var e = event || window.event;

          var curX = e.clientX;
          var curY = e.clientY;
          this.$el.style.top = this.offsetY + curY  - this.sClientY + 'px';
          this.$el.style.left = this.offsetX + curX - this.sClientX + 'px';
        }
      }
    }

    _.init($el);
  }

  return DragDrop;
}());

new DragDemo(document.getElementById('target'));