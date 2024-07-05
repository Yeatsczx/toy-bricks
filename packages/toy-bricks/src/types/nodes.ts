import { QueryCallbacksFor } from '../utils';
import React from 'react';

import { QueryMethods } from '../designer/query';

export type UserComponentConfig<T> = {
  related: Partial<NodeRelated>;
  props: Partial<T>;
  isCanvas: boolean;

  name: string;
  defaultProps: Partial<T>;
};

export type UserComponent<T = any> = React.ComponentType<T> & {
  craft?: Partial<UserComponentConfig<T>>;
};

export type NodeId = string;
export type NodeEventTypes = 'selected' | 'dragged' | 'hovered';

export type Node = {
  id: NodeId;
  data: NodeData;
  events: Record<NodeEventTypes, boolean>;
  dom: HTMLElement | null;
  related: Record<string, React.ElementType>;
  _hydrationTimestamp: number;
};

export type NodeMethodsType = QueryCallbacksFor<typeof QueryMethods>['node'];
export type NodeRelated = Record<string, React.ElementType>;

export type NodeData = {
  props: Record<string, any>;
  type: string | React.ElementType;
  name: string;
  isCanvas: boolean;
  parent: NodeId | null;
  linkedNodes: Record<string, NodeId>;
  nodes: NodeId[];
  hidden: boolean;
  _childCanvas?: Record<string, NodeId>;
};

export type FreshNode = {
  id?: NodeId;
  data: Partial<NodeData> & Required<Pick<NodeData, 'type'>>;
};

export type ReduceCompType =
  | string
  | {
      resolvedName: string;
    };

export type ReducedComp = {
  type: ReduceCompType;
  isCanvas: boolean;
  props: any;
};

export type SerializedNode = Omit<
  NodeData,
  'type' | 'subtype' | 'name' | 'event'
> &
  ReducedComp;

export type SerializedNodes = Record<NodeId, SerializedNode>;

export type SerializedNodeData = SerializedNode;

export type Nodes = Record<NodeId, Node>;

/**
 * NodeTree 是 CRUD 操作的内部数据结构，涉及
 * 多个节点。
 *
 * 例如，当我们删除一个组件时，我们使用一棵树，因为我们
 * 需要删除多个组件。
 */
export interface NodeTree {
  rootNodeId: NodeId;
  nodes: Nodes;
}

type NodeIdSelector = NodeId | NodeId[];
type NodeObjSelector = Node | Node[];

export enum NodeSelectorType {
  Any,
  Id,
  Obj,
}

export type NodeSelector<T extends NodeSelectorType = NodeSelectorType.Any> =
  T extends NodeSelectorType.Id
    ? NodeIdSelector
    : T extends NodeSelectorType.Obj
    ? NodeObjSelector
    : NodeIdSelector | NodeObjSelector;

export type NodeSelectorWrapper = {
  node: Node;
  exists: boolean;
};
