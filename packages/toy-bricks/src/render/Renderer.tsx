import { deprecationWarning, ROOT_NODE } from '../utils';
import React, { useEffect, useRef } from 'react';

import { useInternalDesigner } from '../designer/useInternalDesigner';
import { SerializedNodes } from '../types';
import { NodeElement } from '../nodes/NodeElement';

export type RendererProps = {
  json?: string;
  data?: string | SerializedNodes;
};

// Renderer（可编辑区域）中内容的渲染
const RenderRootNode = () => {
  const { timestamp } = useInternalDesigner((state) => ({
    timestamp:
      state.nodes[ROOT_NODE] && state.nodes[ROOT_NODE]._hydrationTimestamp,
  }));

  if (!timestamp) {
    return null;
  }

  return (
    <NodeElement
      id={ROOT_NODE}
      key={timestamp}
    />
  );
};

// 可编辑区域
export const Renderer: React.FC<React.PropsWithChildren<RendererProps>> = ({
  children,
  json,
  data,
}) => {
  const { actions, query } = useInternalDesigner();
  // 提醒使用者使用 <Renderer data={...} /> 代替 <Renderer json={...} />
  if (!!json) {
    deprecationWarning('<Renderer json={...} />', {
      suggest: '<Renderer data={...} />',
    });
  }

  const initialState = useRef({
    initialChildren: children,
    initialData: data || json,
  });

  useEffect(() => {
    const { initialChildren, initialData } = initialState.current;
    // 如果有data数据，则直接解析data数据，并渲染
    // 如果没有，则渲染Renderer内的内容
    if (initialData) {
      actions.history.ignore().deserialize(initialData);
    } else if (initialChildren) {
      const rootNode = React.Children.only(
        initialChildren
      ) as React.ReactElement;

      const node = query.parseReactElement(rootNode).toNodeTree((node, jsx) => {
        if (jsx === rootNode) {
          node.id = ROOT_NODE;
        }
        return node;
      });

      actions.history.ignore().addNodeTree(node);
    }
  }, [actions, query]);

  return <RenderRootNode />;
};
