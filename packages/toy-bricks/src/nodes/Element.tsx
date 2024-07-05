import { ERROR_TOP_LEVEL_ELEMENT_NO_ID, useEffectOnce } from '../utils';
import React, { useState } from 'react';
import invariant from 'tiny-invariant';

import { NodeElement } from './NodeElement';
import { useInternalNode } from './useInternalNode';

import { useInternalDesigner } from '../designer/useInternalDesigner';
import { NodeId } from '../types';

export const defaultElementProps = {
  is: 'div',
  canvas: false,
  hidden: false,
};

export const elementPropToNodeData = {
  is: 'type',
  canvas: 'isCanvas',
};

export type ElementProps<T extends React.ElementType> = {
  id?: NodeId;
  is?: T;
  children?: React.ReactNode;
  canvas?: boolean;
} & React.ComponentProps<T>;

export function Element<T extends React.ElementType>({
  id,
  children,
  ...elementProps
}: ElementProps<T>) {
  const { is } = {
    ...defaultElementProps,
    ...elementProps,
  };

  const { query, actions } = useInternalDesigner();
  const { node, inNodeContext } = useInternalNode((node) => ({
    node: {
      id: node.id,
      data: node.data,
    },
  }));

  const [linkedNodeId, setLinkedNodeId] = useState<NodeId | null>(null);
  // linkedNodes用来性能优化，不需要重复create and render a new linked Node
  useEffectOnce(() => {
    invariant(!!id, ERROR_TOP_LEVEL_ELEMENT_NO_ID);
    const { id: nodeId, data } = node;

    if (inNodeContext) {
      let linkedNodeId;

      const existingNode =
        data.linkedNodes &&
        data.linkedNodes[id] &&
        query.node(data.linkedNodes[id]).get();

      // 渲染现有的链接节点（如果该节点已存在）（并且与 JSX 类型相同）
      if (existingNode && existingNode.data.type === is) {
        linkedNodeId = existingNode.id;
      } else {
        // 否则，创建并呈现新的链接节点
        const linkedElement = React.createElement(
          Element,
          elementProps,
          children
        );

        const tree = query.parseReactElement(linkedElement).toNodeTree();

        linkedNodeId = tree.rootNodeId;
        actions.history.ignore().addLinkedNodeFromTree(tree, nodeId, id);
      }

      setLinkedNodeId(linkedNodeId);
    }
  });

  return linkedNodeId ? <NodeElement id={linkedNodeId} /> : null;
}
