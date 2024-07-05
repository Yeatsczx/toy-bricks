import {
  QueryCallbacksFor,
  ERROR_NOT_IN_RESOLVER,
  getDOMInfo,
  deprecationWarning,
  DEPRECATED_ROOT_NODE,
  ROOT_NODE,
} from '../utils';
import React from 'react';
import invariant from 'tiny-invariant';

import { EventHelpers } from './EventHelpers';
import { NodeMethods } from './NodeMethods';

import findPosition from '../events/findPosition';
import {
  NodeId,
  DesignerState,
  Indicator,
  Node,
  Options,
  NodeEventTypes,
  NodeInfo,
  NodeSelector,
  NodeTree,
  SerializedNodes,
  SerializedNode,
  FreshNode,
} from '../types';
import { createNode } from '../utils/createNode';
import { deserializeNode } from '../utils/deserializeNode';
import { fromEntries } from '../utils/fromEntries';
import { getNodesFromSelector } from '../utils/getNodesFromSelector';
import { mergeTrees } from '../utils/mergeTrees';
import { parseNodeFromJSX } from '../utils/parseNodeFromJSX';
import { resolveComponent } from '../utils/resolveComponent';

export function QueryMethods(state: DesignerState) {
  const options = state && state.options;

  const _: () => QueryCallbacksFor<typeof QueryMethods> = () =>
    QueryMethods(state) as any;

  return {
    /**
     * 确定相对于目标节点放置源节点的最佳位置
     */
    getDropPlaceholder: (
      source: NodeSelector,
      target: NodeId,
      pos: { x: number; y: number },
      nodesToDOM: (node: Node) => HTMLElement = (node) =>
        state.nodes[node.id].dom
    ) => {
      const targetNode = state.nodes[target],
        isTargetCanvas = _().node(targetNode.id).isCanvas();

      const targetParent = isTargetCanvas
        ? targetNode
        : state.nodes[targetNode.data.parent];

      if (!targetParent) return;

      const targetParentNodes = targetParent.data.nodes || [];

      const dimensionsInContainer = targetParentNodes
        ? targetParentNodes.reduce((result, id: NodeId) => {
            const dom = nodesToDOM(state.nodes[id]);
            if (dom) {
              const info: NodeInfo = {
                id,
                ...getDOMInfo(dom),
              };

              result.push(info);
            }
            return result;
          }, [] as NodeInfo[])
        : [];

      const dropAction = findPosition(
        targetParent,
        dimensionsInContainer,
        pos.x,
        pos.y
      );
      const currentNode =
        targetParentNodes.length &&
        state.nodes[targetParentNodes[dropAction.index]];

      const output: Indicator = {
        placement: {
          ...dropAction,
          currentNode,
        },
        error: null,
      };

      const sourceNodes = getNodesFromSelector(state.nodes, source);

      sourceNodes.forEach(({ node, exists }) => {
        // 如果源节点已在编辑器中，检查它是否可拖动
        if (exists) {
          _()
            .node(node.id)
            .isDraggable((err) => (output.error = err));
        }
      });

      // 检查源节点是否可丢弃在目标中
      _()
        .node(targetParent.id)
        .isDroppable(source, (err) => (output.error = err));

      return output;
    },

    /**
     * 获取当前的 Designer 选项
     */
    getOptions(): Options {
      return options;
    },

    getNodes() {
      return state.nodes;
    },

    /**
     * 用于描述指定节点的帮助程序方法
     * @param id
     */
    node(id: NodeId) {
      return NodeMethods(state, id);
    },

    /**
     * 以序列化格式返回所有节点
     */
    // 获取当前编辑器所有 state.nodes 的 JSON 数据
    getSerializedNodes(): SerializedNodes {
      const nodePairs = Object.keys(state.nodes).map((id: NodeId) => [
        id,
        this.node(id).toSerializedNode(),
      ]);

      return fromEntries(nodePairs);
    },

    getEvent(eventType: NodeEventTypes) {
      return EventHelpers(state, eventType);
    },

    /**
     * 检索编辑器节点的 JSON 表示形式
     */
    // 获取当前编辑器的 JSON 数据,注意返回的数据中 resolver属性只是一个名字，而不是一个组件的完整数据
    serialize(): string {
      return JSON.stringify(this.getSerializedNodes());
    },
    // 将ReactElement 转化为内部保存的node形式，包括ReactElement本身及递归处理 其children
    parseReactElement: (reactElement: React.ReactElement) => ({
      toNodeTree(
        normalize?: (node: Node, jsx: React.ReactElement) => void
      ): NodeTree {
        let node = parseNodeFromJSX(reactElement, (node, jsx) => {
          const name = resolveComponent(state.options.resolver, node.data.type);

          node.data.name = name;

          if (normalize) {
            normalize(node, jsx);
          }
        });

        let childrenNodes: NodeTree[] = [];
        if (reactElement.props && reactElement.props.children) {
          childrenNodes = React.Children.toArray(
            reactElement.props.children
          ).reduce<NodeTree[]>((accum, child: any) => {
            if (React.isValidElement(child)) {
              accum.push(_().parseReactElement(child).toNodeTree(normalize));
            }
            return accum;
          }, []);
        }

        return mergeTrees(node, childrenNodes);
      },
    }),
    // 解析data数据，将其转换为state中的数据
    parseSerializedNode: (serializedNode: SerializedNode) => ({
      toNode(normalize?: (node: Node) => void): Node {
        // 利用 resolver 中的组件，创建元素数据
        const data = deserializeNode(serializedNode, state.options.resolver);

        invariant(data.type, ERROR_NOT_IN_RESOLVER);

        const id = typeof normalize === 'string' && normalize;

        if (id) {
          deprecationWarning(`query.parseSerializedNode(...).toNode(id)`, {
            suggest: `query.parseSerializedNode(...).toNode(node => node.id = id)`,
          });
        }

        return _()
          .parseFreshNode({
            ...(id ? { id } : {}),
            data,
          })
          .toNode(!id && normalize);
      },
    }),

    parseFreshNode: (node: FreshNode) => ({
      toNode(normalize?: (node: Node) => void): Node {
        return createNode(node, (node) => {
          if (node.data.parent === DEPRECATED_ROOT_NODE) {
            node.data.parent = ROOT_NODE;
          }

          const name = resolveComponent(state.options.resolver, node.data.type);
          invariant(name !== null, ERROR_NOT_IN_RESOLVER);
          node.data.name = name;

          if (normalize) {
            normalize(node);
          }
        });
      },
    }),

    createNode(reactElement: React.ReactElement, extras?: any) {
      deprecationWarning(`query.createNode(${reactElement})`, {
        suggest: `query.parseReactElement(${reactElement}).toNodeTree()`,
      });

      const tree = this.parseReactElement(reactElement).toNodeTree();

      const node = tree.nodes[tree.rootNodeId];

      if (!extras) {
        return node;
      }

      if (extras.id) {
        node.id = extras.id;
      }

      if (extras.data) {
        node.data = {
          ...node.data,
          ...extras.data,
        };
      }

      return node;
    },

    getState() {
      return state;
    },
  };
}
