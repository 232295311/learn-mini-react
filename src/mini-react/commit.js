import { updateAttributes } from "./react-dom";
import { getDeletions } from "./fiber";

// 从根节点开始 commit
export function commitRoot(rootFiber) {
  //如果有需要删除的，要去删除
  const deletions = getDeletions();
  deletions.forEach(commitWork);

  commitWork(rootFiber.child);
}

// 递归执行 commit，此过程不中断
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let parentDom = fiber.return.stateNode;
  // 如果fiber是要删除
  console.log("~~~~~commitWork", fiber);
  if (fiber.flag === "Deletion") {
    if (typeof fiber.element?.type !== "function") {
      parentDom.removeChild(fiber.stateNode);
    }
    return;
  }

  // 深度优先遍历，先遍历 child，后遍历 sibling
  // 先挂载子节点，最后在挂载父节点，这样可以减少页面的重排和重绘，节省性能。
  commitWork(fiber.child);

  if (fiber.flag === "Placement") {
    // 表示添加元素
    const targetPositionDom = parentDom.childNodes[fiber.index]; // 要插入到那个 dom 之前
    if (targetPositionDom) {
      // targetPositionDom 存在，则插入
      fiber.stateNode &&
        parentDom.insertBefore(fiber.stateNode, targetPositionDom);
    } else {
      // targetPositionDom 不存在，插入到最后
      // 注意渲染false节点的时候会返回为null，会报错，这里做个判断
      fiber.stateNode && parentDom.appendChild(fiber.stateNode);
    }
  } else if (fiber.flag === "Update") {
    // 表示元素要更新
    const { children, ...newAttributes } = fiber.element.props;
    const oldAttributes = Object.assign({}, fiber.alternate.element.props);
    delete oldAttributes.children;
    updateAttributes(fiber.stateNode, newAttributes, oldAttributes);
  }
  commitWork(fiber.sibling);
}
