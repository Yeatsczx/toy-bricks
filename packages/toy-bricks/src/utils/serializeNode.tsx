import React, { Children } from 'react';

import { resolveComponent } from './resolveComponent';

import { NodeData, ReducedComp, SerializedNode } from '../types';
import { Resolver } from '../types';

const reduceType = (type: React.ElementType | string, resolver: Resolver) => {
  if (typeof type === 'string') {
    return type;
  }
  return { resolvedName: resolveComponent(resolver, type) };
};

// 获取当前 node 的数据
export const serializeComp = (
  data: Pick<NodeData, 'type' | 'isCanvas' | 'props'>,
  resolver: Resolver
): ReducedComp => {
  let { type, isCanvas, props } = data;
  // 递归处理props，处理children
  props = Object.keys(props).reduce((result: Record<string, any>, key) => {
    const prop = props[key];

    if (prop === undefined || prop === null || typeof prop === 'function') {
      return result;
    }

    if (key === 'children' && typeof prop !== 'string') {
      result[key] = Children.map(prop, (child) => {
        if (typeof child === 'string') {
          return child;
        }
        return serializeComp(child, resolver);
      });
    } else if (typeof prop.type === 'function') {
      result[key] = serializeComp(prop, resolver);
    } else {
      result[key] = prop;
    }
    return result;
  }, {});

  return {
    type: reduceType(type, resolver),
    isCanvas: !!isCanvas,
    props,
  };
};

// 获取当前 node 的数据
export const serializeNode = (
  data: Omit<NodeData, 'event'>,
  resolver: Resolver
): SerializedNode => {
  const { type, props, isCanvas, name, ...nodeData } = data;

  const reducedComp = serializeComp({ type, isCanvas, props }, resolver);

  return {
    ...reducedComp,
    ...nodeData,
  };
};
