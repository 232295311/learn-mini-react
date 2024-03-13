/**
 * 该文件模拟协调器，首先使用diff 算法分析出两个fiber之间的差异，
 * 对需要改变的fiber节点打上不同的 flag 副作用标签
 *
 */

import { deleteFiber } from "./fiber";

/**
 * 构造 fiber 树
 * @param {*} workInProgress
 * @param {*} elements 铺平了的child节点数组
 */
export function reconcileChildren(workInProgress, elements) {
  let index = 0; // 当前遍历的子元素在父节点下的下标
  let prevSibling = null; // 记录上一个兄弟节点
  let oldFiber = workInProgress?.alternate?.child; // 对应的旧 fiber。第一次渲染时为undefined

  while (index < elements.length || oldFiber) {
    // 遍历 elements 和 oldFiber
    const element = elements[index];
    // 创建新的 fiber
    let newFiber = null;

    const isSameType =
      element?.type &&
      oldFiber?.element?.type &&
      element.type === oldFiber.element.type;

    //添加flag副作用
    if (isSameType) {
      //type相同，表示更新，flag是Update
      newFiber = {
        element: { ...element, props: element.props },
        stateNode: oldFiber.stateNode,
        return: workInProgress,
        alternate: oldFiber,
        flag: "Update",
      };
    } else {
      //type不同，表示添加或者删除
      if (element || element === 0) {
        //如果element存在，表示添加，flag为Placement
        newFiber = {
          element,
          stateNode: null,
          return: workInProgress,
          alternate: null,
          flag: "Placement",
          index, //记录在插入时在父节点下的下标位置
        };
      }
      if (oldFiber) {
        //oldFiber存在，删除oldFiber
        oldFiber.flag = "Deletion";
        deleteFiber(oldFiber);
      }
    }

    if (oldFiber) {
      // oldFiber 存在，则继续遍历其 sibling
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      // 如果下标为 0，则将当前fiber设置为父 fiber 的 child。
      workInProgress.child = newFiber;
      prevSibling = newFiber; //记录当前fiber作为下一轮的上一个兄弟节点
    } else if (newFiber) {
      // newFiber 和 prevSibling 存在，通过 sibling 作为兄弟 fiber 连接
      prevSibling.sibling = newFiber;
      prevSibling = newFiber;
    }
    index++;
  }
}
