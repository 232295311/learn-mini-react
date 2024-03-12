/**
 * 接收 element 和 container 两个参数，并将 element 渲染为真实 dom 挂载到 container 上。
 * @param {React.JSX.Element} element
 * @param {HTMLElement} container
 */
function render(element, container) {
  const dom = renderDom(element);
  container.appendChild(dom);
}

/**
 * jsx语法创建React.Element的规则：
 * type: 如'div','span',也可以是React组件名、React fragment等
 * config：写在标签上的属性的集合，不为 null 时，说明标签上有属性，
 * jsx元素标签上 除了key、ref、__source 和 __self之外的属性 都会在 props 中
 * children： 从第三个参数开始后的参数为当前创建的React元素的子节点。也在props中
 */

// 将 React.Element 渲染为真实 dom
function renderDom(element) {
  let dom = null; // 要返回的 dom

  if (!element && element !== 0) {
    // 条件渲染为假，返回 null
    return null;
  }

  if (typeof element === "string") {
    // 如果 element 本身为 string，返回文本节点
    dom = document.createTextNode(element);
    return dom;
  }

  if (typeof element === "number") {
    // 如果 element 本身为 number, 将其转换为 string 类型，然后返回文本节点
    dom = document.createTextNode(String(element));
    return dom;
  }

  if (Array.isArray(element)) {
    //如果 element 是一个数组 把他们都放在一个<fragment>下
    dom = document.createDocumentFragment();
    for (let item of element) {
      const child = renderDom(item); //递归调用
      if (child) {
        //dom.appendChild(null)会报错。
        dom.appendChild(child);
      }
    }
    return dom;
  }

  /**当 typeof element 为 function 类型时，表示类组件或者函数组件，需要针对处理 */

  const {
    type,
    props: { children, ...attributes },
  } = element;

  if (typeof type === "string") {
    // 常规 dom 节点的渲染 如<div> <span> <a>
    dom = document.createElement(type);
  } else if (typeof type === "function") {
    // React组件的渲染
    if (type.prototype.isReactComponent) {
      // 如果是类组件
      const { props, type: Comp } = element;
      const component = new Comp(props); //使用new 创建类
      const jsx = component.render(); //执行它的render函数
      dom = renderDom(jsx);
    } else {
      // 如果是函数组件
      const { props, type: Fn } = element;
      const jsx = Fn(props); //直接执行函数组件，return里面就是jsx
      dom = renderDom(jsx);
    }
  } else {
    // 其他情况暂不考虑
    return null;
  }

  if (children) {
    // children 存在，对子节点递归渲染
    const childrenDom = renderDom(children);
    if (childrenDom) {
      dom.appendChild(childrenDom);
    }
  }

  //生成好dom了，给它添属性
  updateAttributes(dom, attributes);

  return dom;
}

/**
 * 接收 dom 和 attributes 两个参数，给dom添加如类名、style、事件等属性
 * @param {HTMLElement} dom
 * @param {Object} attributes
 */
function updateAttributes(dom, attributes) {
  Object.keys(attributes).forEach((key) => {
    if (key.startsWith("on")) {
      //如果要添加事件 'onClick' 'onChange'
      const eventName = key.slice(2).toLocaleLowerCase();
      dom.addEventListener(eventName, attributes[key]);
    } else if (key === "className") {
      //如果要添加类名 'deep1-box'
      const classes = attributes[key].split(" ");
      classes.forEach((classKey) => {
        dom.classList.add(classKey);
      });
    } else if (key === "style") {
      //如果要添加行内样式
      const style = attributes[key];
      Object.keys(style).forEach((styleName) => {
        dom.style[styleName] = style[styleName];
      });
    } else {
      //如果要添加其他属性 如'href'
      dom[key] = attributes[key];
    }
  });
}

const ReactDOM = {
  render,
};

export default ReactDOM;
