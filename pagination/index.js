(function(window) {

  // 发布订阅者模式
  const listeners = {
    //事件类型以及对应的队列
    cbs: {
      onPageChange: [],
      onPageSizeChange: []
    },
    /**
     * 订阅某事件
     * 
     * @param {any} type 事件类型
     * @param {any} cb 回调函数
     * @returns 返回一个取消订阅的函数
     */
    add(type, cb) {
      if (!this.cbs[type]) {
        this.cbs[type] = [];
      }

      const cbs = this.cbs[type];
      if (cbs.indexOf(cb) !== -1) return;
      cbs.push(cb);

      return function() {
        cbs.splice(cbs.indexOf(cb), 1);
      };
    },

    /**
     * 根据事件类型，依次执行事件队列里的函数
     * 
     * @param {any} type 事件类型
     * @param {any} params 要传入事件队列里函数的参数
     * @returns
     */
    emit(type, ...params) {
      const cbs = this.cbs[type];
      if (!cbs) return;

      cbs.forEach(cb => cb(...params));
    }
  }

  /**
   * 
   * 构造函数
   * @param {any} el 挂载的dom
   * @param {any} option 配置
   */
  function Pagination(
    el,
    option
  ) {

    /**
     * 私有变量和函数
     * 
     */  
    const _ = {
      $el: null,
      $child: null,
      $option: null,
      items: [],
      length: null,
      /**
       * 初始化
       * 
       * @param {any} el 挂载的dom
       * @param {any} option 配置 
       */
      init(el, option) {
        this.initData(el, option);
        this.render();
      },
      /**
       * 初始化数据
       * 
       * @param {any} el 挂载的dom
       * @param {any} option 配置
       * 
       */
      initData(el, option) {
        this.$el = el;
        this.$option = option;
        if (!option.current) {
          this.$option.current = option.defaultCurrent;
        }
        if (!option.pageSize) {
          this.$option.pageSize = option.defaultPageSize;
        }
        if (!option.total) {
          this.$option.total = option.defaultTotal;
        }

        const { pageSize, total, simple, current } = this.$option;
        const length =  this.length = Math.ceil(total / pageSize);

        if (current > length) {
          this.$option.current = length;
        }

        if (!simple) {
          if(this.length <= 6) {
            for (let i = 1; i <= this.length; i++) {
              this.items.push(i);
            }
          } else {
            for (let i = 1; i <= 6; i++) {
              if (i === 5) {
                this.items.push('...');
              } else if (i === 6) {
                this.items.push(this.length);
              } else {
                this.items.push(i);
              }
            }
          }
        }
      },

      changeData() {
        let {
          current
        } = this.$option;
        if (this.length > 6) {
          if (current > 4 && current < this.length - 3) {
            this.items = [];
            current--;
            for (let i = 1; i <= 7; i++) {
              if (i === 1) this.items.push(i);
              else if (i === 2 || i === 6) this.items.push('...');
              else if (i === 7) this.items.push(this.length);
              else {
                this.items.push(current++);
              }
            }
          } else if (current <= 4) {
            this.items = [];
            for (let i = 1; i <= 6; i++) {
              if (i === 5) this.items.push('...');
              else if (i === 6) this.items.push(this.length);
              else this.items.push(i);
            }
          } else {
            this.items = [];
            for (let i = 1; i <= 6; i++) {
              if (i === 5) this.items.push('...');
              else if (i === 6) this.items.push(1);
              else this.items.push(this.length - i + 1);              
            }
            this.items.reverse();
          }
        }
      },

      /**
       * 渲染
       * 
       */
      render() {
        const documentFragment = document.createDocumentFragment();
        if (this.$child) {
          this.$el.removeChild(this.$child);
        }
        const {
          current,
          total,
          simple
        } = this.$option;

        function onMouseOver() {
          if (this.getAttribute('disabled') === 'true') return;
          this.style.color = '#1890ff';
        }

        function onMouseLeave() {
          this.style.color = 'black';
        }

        const previous = document.createElement(simple ? 'a' : 'li');
        const next = document.createElement(simple ? 'a' : 'li');
        previous.innerText = '<';
        next.innerText = '>';
        previous.style.cursor = current === 1 ? 'not-allowed' : 'pointer';
        next.style.cursor = current === this.length ? 'not-allowed' : 'pointer';
        previous.setAttribute('disabled', current === 1);
        next.setAttribute('disabled', current === this.length);

        if (simple) {
          const wrapper = document.createElement('div');
          const textNode = document.createTextNode(` ${current} / ${this.length} `);

          this.bindEvent(previous, 'mouseover', onMouseOver);
          this.bindEvent(previous, 'mouseleave', onMouseLeave);
          this.bindEvent(previous, 'click', () => {
            if (current > 1) {
              this.$option.current--;
              this.render();
              listeners.emit('onPageChange', this.$option.current);
            }
          });
          this.bindEvent(next, 'mouseover', onMouseOver);
          this.bindEvent(next, 'mouseleave', onMouseLeave);
          this.bindEvent(next, 'click', () => {
            if (current < this.length) {
              this.$option.current++;
              this.render();
              listeners.emit('onPageChange', this.$option.current);
            }
          });


          wrapper.appendChild(previous);
          wrapper.appendChild(textNode);
          wrapper.appendChild(next);
          this.$child = wrapper;
          documentFragment.appendChild(wrapper);
          
        } else {
          const ul = document.createElement('ul');

          const lis = this.items.map(item => {
            const li = document.createElement('li');
            if (item === '...') {
              li.innerText = '···';
            } else {
              li.innerText = item;
              li.id = `li${item}`;
            }

            return li;
          });

          ul.appendChild(previous);
          lis.forEach(li => ul.appendChild(li));
          ul.appendChild(next);

          const childNodes = ul.childNodes;

          ul.style.listStyle = 'none';
          childNodes.forEach(node => {
            const innerText = node.innerText;

            node.style.display = 'inline-block';
            node.style.margin = '0 5px';
            if (innerText === '···') return;
            node.style.height = '25px';
            node.style.minWidth = '25px';
            node.style.textAlign = 'center';
            node.style.lineHeight = '25px';
            node.style.border = Number(innerText) === current ? '1px solid #1890ff' : '1px solid black';
            node.style.borderRadius = '3px';
          });

          childNodes.forEach(node => {
            const innerText = node.innerText;
            if (innerText === '···') return;

            function onClick(innerText) {
              if (innerText === '<') {
                if (current > 1) {
                  this.$option.current--;
                  this.changeData();
                  this.render();
                }
              } else if (innerText === '>') {
                if (current < this.length) {
                  this.$option.current++;
                  this.changeData();
                  this.render();
                }
              } else {
                this.$option.current = Number(innerText);
                this.changeData();
                this.render();
              }
              listeners.emit('onPageChange', this.$option.current);
            }

            this.bindEvent(node, 'click', onClick.bind(this, innerText));
            this.bindEvent(node, 'mouseover', onMouseOver);
            this.bindEvent(node, 'mouseleave', onMouseLeave);
          })

          this.$child = ul;
          documentFragment.appendChild(ul);
        }


        this.$el.appendChild(documentFragment);
      },


      bindEvent(dom, type, cb) {
        if (dom.attachEvent) {
          dom.addtachEvent(`on${type}`, cb);
        } else if (dom.addEventListener) {
          dom.addEventListener(type, cb, false);
        } else {
          dom[`on${type}`] = cb;
        }
      }
    }

    const defaultOption = {
      current: undefined,
      pageSize: undefined,
      total: undefined,
      defaultCurrent: 1,
      defaultPageSize: 10,
      defaultTotal: 100,
      showQuickJumper: false,
      showSizeChanger: false,
      showTotal: false,
      simple: false,
      pageSizeOptions: [10, 20, 30, 40]    
    }


      _.init(el, {...defaultOption, ...option});
    }

  /**
   * 
   * 绑定监听事件
   * 
   * @param {any} type 只有onPageChange和onPageSizeChange两种
   * @param {any} cb 监听事件的回调函数
   */
  Pagination.prototype.on = function(type, cb) {
    listeners.add(type, cb);
  }


  /**
   * 
   * 传入新的配置，更新整个组件
   * 
   * @param {any} option 配置
   */  
  Pagination.prototype.updateByOption = function(option) {
    _.clean
  }

  window.Pagination = Pagination;



})(window);