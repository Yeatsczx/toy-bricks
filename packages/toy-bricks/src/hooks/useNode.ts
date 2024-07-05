import { deprecationWarning } from '../utils';

import { Node } from '../types';
import { useInternalNode } from '../nodes/useInternalNode';

/**
 * 一个 Hook 提供与管理当前组件的相应节点相关的方法和状态信息。
 * @param collect - 收集器函数，用于使用相应节点状态中的值
 */
export function useNode<S = null>(collect?: (node: Node) => S) {
  const { id, related, actions, inNodeContext, connectors, ...collected } =
    useInternalNode(collect);

  return {
    ...collected,
    actions,
    id,
    related,
    setProp: (
      cb: (props: Record<string, any>) => void,
      throttleRate?: number
    ) => {
      deprecationWarning('useNode().setProp()', {
        suggest: 'useNode().actions.setProp()',
      });
      return actions.setProp(cb, throttleRate);
    },
    inNodeContext,
    connectors,
  };
}
