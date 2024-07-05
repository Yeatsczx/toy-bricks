import { getRandomId as getRandomNodeId } from './index';
import React from 'react';

import { Node, FreshNode, UserComponentConfig } from '../types';
import {
  defaultElementProps,
  Element,
  Canvas,
  elementPropToNodeData,
  deprecateCanvasComponent,
} from '../nodes';
import { NodeProvider } from '../nodes/NodeContext';

const getNodeTypeName = (type: string | { name: string }) =>
  typeof type == 'string' ? type : type.name;

export function createNode(
  newNode: FreshNode,
  normalize?: (node: Node) => void
) {
  let actualType = newNode.data.type as any;
  let id = newNode.id || getRandomNodeId();

  const node: Node = {
    id,
    _hydrationTimestamp: Date.now(),
    data: {
      type: actualType,
      name: getNodeTypeName(actualType),
      props: {},
      parent: null,
      isCanvas: false,
      hidden: false,
      nodes: [],
      linkedNodes: {},
      ...newNode.data,
    },
    related: {},
    events: {
      selected: false,
      dragged: false,
      hovered: false,
    },
    dom: null,
  };

  // @ts-ignore
  if (node.data.type === Element || node.data.type === Canvas) {
    const mergedProps = {
      ...defaultElementProps,
      ...node.data.props,
    };

    node.data.props = Object.keys(node.data.props).reduce((props, key) => {
      if (Object.keys(defaultElementProps).includes(key)) {
        // 如果找到<Element />特定props（即：“is”、“canvas”） 将 node.data 替换为 prop 中指定的值
        node.data[elementPropToNodeData[key] || key] = mergedProps[key];
      } else {
        // 否则，像往常一样将 props 包含在节点中
        props[key] = node.data.props[key];
      }

      return props;
    }, {});

    actualType = node.data.type;
    node.data.name = getNodeTypeName(actualType);

    // 摒弃<Canvas />，提倡<Element canvas />
    const usingDeprecatedCanvas = node.data.type === Canvas;
    if (usingDeprecatedCanvas) {
      node.data.isCanvas = true;
      deprecateCanvasComponent();
    }
  }

  if (normalize) {
    normalize(node);
  }

  // 在新建的 node 中添加如：Button.craft = {
  //   props: ButtonDefaultProps,
  //   related: {
  //     settings: ButtonSettings,
  //   },
  // };
  // 中的数据
  // 使用组件上craft的数据来代替node的初始数据
  const userComponentConfig = actualType.craft as UserComponentConfig<any>;

  if (userComponentConfig) {
    node.data.props = {
      ...(userComponentConfig.props || userComponentConfig.defaultProps || {}),
      ...node.data.props,
    };

    if (
      userComponentConfig.isCanvas !== undefined &&
      userComponentConfig.isCanvas !== null
    ) {
      node.data.isCanvas = userComponentConfig.isCanvas;
    }

    if (userComponentConfig.related) {
      const relatedNodeContext = {
        id: node.id,
        related: true,
      };
      // 创建组件对应的 属性Settings 组件
      Object.keys(userComponentConfig.related).forEach((comp) => {
        node.related[comp] = (props) =>
          React.createElement(
            NodeProvider,
            relatedNodeContext,
            React.createElement(userComponentConfig.related[comp], props)
          );
      });
    }
  }

  return node;
}
