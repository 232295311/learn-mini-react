import { commitRender, getCurrentFunctionFiber, getHookIndex } from "./fiber";

/**
 * Component 类接受 props 参数，并挂载到 this 对象上
 */
export class Component {
  constructor(props) {
    this.props = props;
  }
}
// 在原型链上添加 isReactComponent 属性，用于 react 识别是类组件还是函数组件
Component.prototype.isReactComponent = true;

/**
 * 原型链上添加 setState 方法，其接受一个 object 或者是 function 类型的参数，
 * 如果是 function 类型，该函数接受 this.state 和 this.props 回参，返回更新后的 state 值，将其合并至 this.state 中；
 * 如果是 object 类型，直接将其合并至 this.state 中。然后调用 commitRender 函数去触发更新
 * @param {Function | Object} param
 */
Component.prototype.setState = function (param) {
  if (typeof param === "function") {
    const result = param(this.state, this.props);
    this.state = {
      ...this.state,
      ...result,
    };
  } else {
    console.log(this.state, param);
    this.state = {
      ...this.state,
      ...param,
    };
  }

  commitRender();
};

//原型链上添加 _UpdateProps 方法，用于更新类组件的props
Component.prototype._UpdateProps = function (props) {
  this.props = props;
};

export function useState(initial) {
  const currentFunctionFiber = getCurrentFunctionFiber();
  const hookIndex = getHookIndex();
  // 取当前执行的函数组件之前的 hook
  const oldHook = currentFunctionFiber?.alternate?.hooks?.[hookIndex];

  // oldHook存在，取之前的值，否则取现在的值
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [], // 一次函数执行过程中可能调用多次 setState，将其放进队列一并执行
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    if (typeof action === "function") {
      hook.queue.push(action);
    } else {
      hook.queue.push(() => {
        return action;
      });
    }
    commitRender();
  };
  currentFunctionFiber.hooks.push(hook);
  return [hook.state, setState];
}
