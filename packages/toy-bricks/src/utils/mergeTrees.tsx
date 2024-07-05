import { Node, NodeTree } from '../types';

// 始终保持如下结构只有两层，nodes中保存所有的子孙节点，孙节点需要向外提出来，所有子孙节点在同一层
// {
//     rootNodeId: rootNode.id,
//     nodes: 此处是各个子node的详细数据，其中的data.nodes只是一个保存子节点id的字符串数组
//   }
const mergeNodes = (rootNode: Node, childrenNodes: NodeTree[]) => {
  if (childrenNodes.length < 1) {
    return { [rootNode.id]: rootNode };
  }
  const nodes = childrenNodes.map(({ rootNodeId }) => rootNodeId);
  const nodeWithChildren = { ...rootNode, data: { ...rootNode.data, nodes } };
  const rootNodes = { [rootNode.id]: nodeWithChildren };
  return childrenNodes.reduce((accum, tree) => {
    const currentNode = tree.nodes[tree.rootNodeId];

    return {
      ...accum,
      ...tree.nodes,
      // 设置当前节点的父 ID
      [currentNode.id]: {
        ...currentNode,
        data: {
          ...currentNode.data,
          parent: rootNode.id,
        },
      },
    };
  }, rootNodes);
};

export const mergeTrees = (
  rootNode: Node,
  childrenNodes: NodeTree[]
): NodeTree => ({
  rootNodeId: rootNode.id,
  nodes: mergeNodes(rootNode, childrenNodes),
});
