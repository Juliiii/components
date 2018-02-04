(function(window) {
  function searchComponent() {
    this.init();
    this.bindListener();
  }

  function bindListener(dom = document, event, cb) {
    if (dom.addEventListener) {
      dom.addEventListener(event, cb);
    } else if (dom.attachEvent) {
      dom.attachEvent(`on${event}`, cb);
    }
  }


  searchComponent.prototype.init = function() {
    this.input = document.getElementById('search_input');
    this.button = document.getElementById('search_button');
    this.list = document.getElementById('list');
    this.listChild = list.children;
    this.timeId = null;
  }

  searchComponent.prototype.bindListener = function() {
    bindListener(this.input, 'input',  (e) => {
      if (this.timeId) {
        clearTimeout(this.timeId);
      }
      this.timeId = setTimeout(() => {
        let value = e.target.value;
        const url = `https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=${value}&cb=jsonpCb`;
        const script = document.createElement('script');
        script.src = url;
        document.documentElement.appendChild(script);
      }, 100);
    });

    bindListener(this.button, 'click', () => this.search());

    bindListener(document, 'keyup', e => e.keyCode === 13 && this.search());

    bindListener(this.list, 'click', (e) => {
      let tagName = e.target.tagName;
      if (tagName === 'LI') {
        let text = e.target.innerText
        let id = Number(e.target.id.slice(e.target.id.lastIndexOf('t') + 1));
        this.input.value = text;
        this.clearList();
      }
    });
  }

  searchComponent.prototype.search = function() {
    window.open(`http://www.baidu.com/s?wd=${this.input.value}`);
  }

  searchComponent.prototype.changeList = function(list) {
    const length = list.length;
    let i;
    for (i = 0; i < length; i++) {
      if (i >= 10) return;
      this.listChild[i].innerText = list[i];
    }
    if (i < 10) {
      for (; i < 10; i++) {
        this.listChild[i].innerText = '';
      }
    }
  }

  searchComponent.prototype.clearList = function() {
    for (let i = 0; i < this.listChild.length; i++) {
      this.listChild[i].innerText = '';
    }
  }

  window.SearchComponent = searchComponent;
})(window);

let searchComponent = new SearchComponent();

function jsonpCb(json) {
  searchComponent.changeList(json.s);
}