// 存储和 fiber 相关的实现代码
import { renderDom } from "./react-dom";

// 每个 fiber 上都需要挂载 stateNode 和 element 属性，stateNode 指向根据此 fiber 创建的真实 dom 节点，用于渲染，element 指向 fiber 所对应的 React.element。

let nextUnitOfWork = null; //指向下一个要处理的单元
let rootFiber = null;

// 首先，我们需要根据 ReactDOM.render 接收的 element 和 container 参数，创建一个 rootFiber，指向 root fiber。
/**
 * 创建 rootFiber 作为首个 nextUnitOfWork (注意不是创建FiberRoot FiberRoot才是唯一的那个)
 */
export function createRoot(element, container) {
  rootFiber = {
    stateNode: container, // 记录对应的真实 dom 节点
    element: {
      // 挂载 element
      props: { children: [element] },
    },
  };
  nextUnitOfWork = rootFiber;
}

// 执行当前工作单元并设置下一个要执行的工作单元
function performUnitOfWork(workInProgress) {
  console.log(workInProgress);
  if (!workInProgress.stateNode) {
    // 若当前 fiber 没有 stateNode，则根据 fiber 挂载的 element 的属性创建
    workInProgress.stateNode = renderDom(workInProgress.element);
  }

  if (workInProgress.return && workInProgress.stateNode) {
    // 如果 fiber 有父 fiber且有 dom
    // 向上寻找能挂载 dom 的节点进行 dom 挂载
    let parentFiber = workInProgress.return;
    while (!parentFiber.stateNode) {
      //迭代，如果能一直return上去就一直return上去
      parentFiber = parentFiber.return;
    }
    parentFiber.stateNode.appendChild(workInProgress.stateNode);
  }

  /**
   * 构造fiber树，每个fiber通过 child、 sibling 和 return 相连。
   * 当 React.element 的 type 属性是 function 时，表示 react 组件，我们将其渲染后所得到的 jsx 作为 children 处理。
   * 如果 React.element 的 type 属性是 Array，表示列表渲染，此时 array 这个节点时没有意义的，不需要形成 fiber，所以我们直接将 array 中的子节点打平放到与 array 同级的 children 数组中进行处理，生成对应 fiber
   * 当前 fiber 的 element 属性的 children 不为空时，根据 children 去迭代构建 fiber 树
   */
  let children = workInProgress.element?.props?.children;
  let type = workInProgress.element?.type;

  if (typeof type === "function") {
    // 当前 fiber 对应 React 组件时（类组件或者函数组件），对其 return 迭代
    if (type.prototype.isReactComponent) {
      // 类组件，通过生成的类实例的 render 方法返回 jsx
      const { props, type: Comp } = workInProgress.element;
      const component = new Comp(props);
      const jsx = component.render();
      children = [jsx]; //统一放在children数组里，后面共用渲染逻辑
    } else {
      // 函数组件，直接调用函数返回 jsx
      const { props, type: Fn } = workInProgress.element;
      const jsx = Fn(props);
      children = [jsx];
    }
  }

  // children 存在时，对 children 迭代
  if (children || children === 0) {
    let elements = Array.isArray(children) ? children : [children];
    // 打平列表渲染时二维数组的情况（暂不考虑三维及以上数组的情形）
    elements = elements.flat();

    let index = 0; // 当前遍历的子元素在父节点下的下标
    let prevSibling = null; // 记录上一个兄弟节点

    while (index < elements.length) {
      // 遍历子元素
      const element = elements[index];
      // 创建新的 fiber
      const newFiber = {
        element,
        return: workInProgress,
        stateNode: null,
      };
      if (index === 0) {
        // 如果下标为 0，则将当前 fiber 设置为父 fiber 的 child
        workInProgress.child = newFiber;
      } else {
        // 否则通过 sibling 作为兄弟 fiber 连接
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
      index++;
    }
  }

  // 遍历完children了 该设置下一个工作单元
  if (workInProgress.child) {
    // 如果有子 fiber，则下一个工作单元是子 fiber
    nextUnitOfWork = workInProgress.child;
  } else {
    let nextFiber = workInProgress;
    while (nextFiber) {
      console.log(nextFiber);
      if (nextFiber.sibling) {
        // 没有子 fiber 有兄弟 fiber，则下一个工作单元是兄弟 fiber
        nextUnitOfWork = nextFiber.sibling;
        return;
      } else {
        // 子 fiber 和兄弟 fiber 都没有，深度优先遍历返回上一层
        nextFiber = nextFiber.return;
      }
    }
    if (!nextFiber) {
      // 若返回最顶层，表示迭代结束，将 nextUnitOfWork 置空
      nextUnitOfWork = null;
    }
  }
}

// 处理循环和中断逻辑  函数会接收到一个名为 IdleDeadline 的参数，这个参数可以获取当前空闲时间以及回调是否在超时时间前已经执行的状态。
function workLoop(deadline) {
  console.log("====", nextUnitOfWork);
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // 循环执行工作单元任务 如果剩余空闲时间小于1ms,就不会触发工作单元任务
    performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // requestIdleCallback(workLoop); //进行下一轮的注册 不然只会运行一轮workLoop
}

requestIdleCallback(workLoop); //为window注册一个workLoop函数，这个函数将在浏览器每帧的空闲时期被调用。
