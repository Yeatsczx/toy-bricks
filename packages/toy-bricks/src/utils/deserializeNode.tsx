import React from 'react';

import { resolveComponent } from './resolveComponent';

import {
  NodeData,
  SerializedNode,
  ReducedComp,
  ReduceCompType,
} from '../types';
import { Resolver } from '../types';
import { Canvas } from '../nodes/Canvas';

type DeserialisedType = JSX.Element & { name: string };

// 根据type.resolvedName类型返回Canvas或者resolver中对应的组件
const restoreType = (type: ReduceCompType, resolver: Resolver) =>
  typeof type === 'object' && type.resolvedName
    ? type.resolvedName === 'Canvas'
      ? Canvas
      : resolver[type.resolvedName]
    : typeof type === 'string'
    ? type
    : null;

export const deserializeComp = (
  data: ReducedComp,
  resolver: Resolver,
  index?: number
): DeserialisedType | void => {
  let { type, props } = data;

  const main = restoreType(type, resolver);

  if (!main) {
    return;
  }

  props = Object.keys(props).reduce((result: Record<string, any>, key) => {
    const prop = props[key];
    if (prop === null || prop === undefined) {
      result[key] = null;
    } else if (typeof prop === 'object' && prop.resolvedName) {
      result[key] = deserializeComp(prop, resolver);
    } else if (key === 'children' && Array.isArray(prop)) {
      result[key] = prop.map((child) => {
        if (typeof child === 'string') {
          return child;
        }
        return deserializeComp(child, resolver);
      });
    } else {
      result[key] = prop;
    }
    return result;
  }, {});

  if (index) {
    props.key = index;
  }

  const jsx = {
    ...React.createElement(main, {
      ...props,
    }),
  };

  return {
    ...jsx,
    name: resolveComponent(resolver, jsx.type),
  };
};
// 利用 resolver 中的组件，创建元素数据
export const deserializeNode = (
  data: SerializedNode,
  resolver: Resolver
): Omit<NodeData, 'event'> => {
  const { type: Comp, props: Props, ...nodeData } = data;

  const { type, name, props } = deserializeComp(
    data,
    resolver
  ) as unknown as NodeData;

  const { parent, isCanvas, nodes, hidden } = nodeData;

  const linkedNodes = nodeData.linkedNodes || nodeData._childCanvas;

  return {
    type,
    name,
    props,
    isCanvas: !!isCanvas,
    hidden: !!hidden,
    parent,
    linkedNodes: linkedNodes || {},
    nodes: nodes || [],
  };
};
