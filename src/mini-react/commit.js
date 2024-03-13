// 从根节点开始 commit
// 从根节点开始 commit

export function commitRoot(rootFiber) {
  commitWork(rootFiber.child);
}

// 递归执行 commit，此过程不中断
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  // 深度优先遍历，先遍历 child，后遍历 sibling
  //   先挂载子节点，最后在挂载父节点，这样可以减少页面的重排和重绘，节省性能。
  commitWork(fiber.child);
  let parentDom = fiber.return.stateNode;
  //   console.log("---------", fiber);
  //注意渲染false节点的时候会返回为null，会报错，这里做个判断
  if (fiber.stateNode) {
    parentDom.appendChild(fiber.stateNode);
  }
  commitWork(fiber.sibling);
}
