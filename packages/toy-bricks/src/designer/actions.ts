import {
  deprecationWarning,
  ERROR_INVALID_NODEID,
  ROOT_NODE,
  DEPRECATED_ROOT_NODE,
  QueryCallbacksFor,
  ERROR_NOPARENT,
  ERROR_DELETE_TOP_LEVEL_NODE,
  CallbacksFor,
  Delete,
  ERROR_NOT_IN_RESOLVER,
} from '../utils';
import invariant from 'tiny-invariant';

import { QueryMethods } from './query';

import {
  DesignerState,
  Indicator,
  NodeId,
  Node,
  Nodes,
  Options,
  NodeEventTypes,
  NodeTree,
  SerializedNodes,
  NodeSelector,
  NodeSelectorType,
} from '../types';
import { fromEntries } from '../utils/fromEntries';
import { getNodesFromSelector } from '../utils/getNodesFromSelector';
import { removeNodeFromEvents } from '../utils/removeNodeFromEvents';

export const Methods = (
  state: DesignerState,
  query: QueryCallbacksFor<typeof QueryMethods>
) => {
  const addNodeTreeToParent = (
    tree: NodeTree,
    parentId?: NodeId,
    addNodeType?:
      | {
          type: 'child';
          index: number;
        }
      | {
          type: 'linked';
          id: string;
        }
  ) => {
    // 递归遍历新增的 tree，将给每个节点放入 state 并增加 parent 属性
    const iterateChildren = (id: NodeId, parentId?: NodeId) => {
      const node = tree.nodes[id];

      if (typeof node.data.type !== 'string') {
        invariant(
          state.options.resolver[node.data.name],
          ERROR_NOT_IN_RESOLVER.replace(
            '%node_type%',
            `${(node.data.type as any).name}`
          )
        );
      }
      // 给新增的 nodeTree添加 parent
      state.nodes[id] = {
        ...node,
        data: {
          ...node.data,
          parent: parentId,
        },
      };
      // 递归遍历
      if (node.data.nodes.length > 0) {
        delete state.nodes[id].data.props.children;
        node.data.nodes.forEach((childNodeId) =>
          iterateChildren(childNodeId, node.id)
        );
      }

      Object.values(node.data.linkedNodes).forEach((linkedNodeId) =>
        iterateChildren(linkedNodeId, node.id)
      );
    };

    iterateChildren(tree.rootNodeId, parentId);

    if (!parentId) {
      invariant(
        tree.rootNodeId === ROOT_NODE,
        '无法在没有父节点的情况下添加非根节点'
      );

      return;
    }
    // 从 state 中获取 parentId 对应的 node节点
    const parent = getParentAndValidate(parentId);
    // 将新增 tree 根结点加入到 state 的 parent 节点中
    if (addNodeType.type === 'child') {
      const index = addNodeType.index;

      if (index != null) {
        parent.data.nodes.splice(index, 0, tree.rootNodeId);
      } else {
        parent.data.nodes.push(tree.rootNodeId);
      }

      return;
    }

    parent.data.linkedNodes[addNodeType.id] = tree.rootNodeId;
  };
  // 从 state 中获取 parentId 对应的 node节点
  const getParentAndValidate = (parentId: NodeId): Node => {
    invariant(parentId, ERROR_NOPARENT);
    const parent = state.nodes[parentId];
    invariant(parent, ERROR_INVALID_NODEID);
    return parent;
  };

  // 删除节点
  const deleteNode = (id: NodeId) => {
    const targetNode = state.nodes[id],
      parentNode = state.nodes[targetNode.data.parent];

    if (targetNode.data.nodes) {
      // 我们在这里深度克隆，否则 immer 会变异节点对象，因为我们删除节点
      [...targetNode.data.nodes].forEach((childId) => deleteNode(childId));
    }

    if (targetNode.data.linkedNodes) {
      Object.values(targetNode.data.linkedNodes).map((linkedNodeId) =>
        deleteNode(linkedNodeId)
      );
    }

    const isChildNode = parentNode.data.nodes.includes(id);

    if (isChildNode) {
      const parentChildren = parentNode.data.nodes;
      parentChildren.splice(parentChildren.indexOf(id), 1);
    } else {
      const linkedId = Object.keys(parentNode.data.linkedNodes).find(
        (id) => parentNode.data.linkedNodes[id] === id
      );
      if (linkedId) {
        delete parentNode.data.linkedNodes[linkedId];
      }
    }
    // 从 state 中删除这个节点的相关 events
    removeNodeFromEvents(state, id);
    delete state.nodes[id];
  };

  return {
    /**
     * 将新的链接节点(linked Node)添加到编辑器。
     * 仅由 <Element /> 组件内部使用
     */
    addLinkedNodeFromTree(tree: NodeTree, parentId: NodeId, id: string) {
      const parent = getParentAndValidate(parentId);

      const existingLinkedNode = parent.data.linkedNodes[id];

      if (existingLinkedNode) {
        deleteNode(existingLinkedNode);
      }

      addNodeTreeToParent(tree, parentId, { type: 'linked', id });
    },

    /**
     * 添加新节点到编辑器.
     */
    add(nodeToAdd: Node | Node[], parentId: NodeId, index?: number) {
      let nodes = [nodeToAdd];
      if (Array.isArray(nodeToAdd)) {
        deprecationWarning('actions.add(node: Node[])', {
          suggest: 'actions.add(node: Node)',
        });
        nodes = nodeToAdd;
      }
      nodes.forEach((node: Node) => {
        addNodeTreeToParent(
          {
            nodes: {
              [node.id]: node,
            },
            rootNodeId: node.id,
          },
          parentId,
          { type: 'child', index }
        );
      });
    },

    /**
     * 添加NodeTree到编辑器
     */
    addNodeTree(tree: NodeTree, parentId?: NodeId, index?: number) {
      addNodeTreeToParent(tree, parentId, { type: 'child', index });
    },

    /**
     * 删除一个节点
     */
    delete(selector: NodeSelector<NodeSelectorType.Id>) {
      const targets = getNodesFromSelector(state.nodes, selector, {
        existOnly: true,
        idOnly: true,
      });

      targets.forEach(({ node }) => {
        invariant(
          !query.node(node.id).isTopLevelNode(),
          ERROR_DELETE_TOP_LEVEL_NODE
        );
        deleteNode(node.id);
      });
    },
    // 解析 json 数据，将其转换保存在内部state.nodes中
    deserialize(input: SerializedNodes | string) {
      const dehydratedNodes =
        typeof input == 'string' ? JSON.parse(input) : input;

      const nodePairs = Object.keys(dehydratedNodes).map((id) => {
        let nodeId = id;

        if (id === DEPRECATED_ROOT_NODE) {
          nodeId = ROOT_NODE;
        }

        return [
          nodeId,
          query
            .parseSerializedNode(dehydratedNodes[id])
            .toNode((node) => (node.id = nodeId)),
        ];
      });

      this.replaceNodes(fromEntries(nodePairs));
    },

    /**
     * 将目标节点移动到给定索引处的新父节点
     */
    move(selector: NodeSelector, newParentId: NodeId, index: number) {
      const targets = getNodesFromSelector(state.nodes, selector, {
        existOnly: true,
      });

      const newParent = state.nodes[newParentId];

      const nodesArrToCleanup = new Set<string[]>();

      targets.forEach(({ node: targetNode }, i) => {
        const targetId = targetNode.id;
        const currentParentId = targetNode.data.parent;

        query.node(newParentId).isDroppable([targetId], (err) => {
          throw new Error(err);
        });

        const currentParent = state.nodes[currentParentId];
        const currentParentNodes = currentParent.data.nodes;

        nodesArrToCleanup.add(currentParentNodes);

        const oldIndex = currentParentNodes.indexOf(targetId);
        currentParentNodes[oldIndex] = '$$'; // 删除标记

        newParent.data.nodes.splice(index + i, 0, targetId);

        state.nodes[targetId].data.parent = newParentId;
      });

      nodesArrToCleanup.forEach((nodes) => {
        const length = nodes.length;

        [...nodes].reverse().forEach((value, index) => {
          if (value !== '$$') {
            return;
          }

          nodes.splice(length - 1 - index, 1);
        });
      });
    },

    replaceNodes(nodes: Nodes) {
      this.clearEvents();
      state.nodes = nodes;
    },

    clearEvents() {
      this.setNodeEvent('selected', null);
      this.setNodeEvent('hovered', null);
      this.setNodeEvent('dragged', null);
      this.setIndicator(null);
    },

    /**
     * 重置所有编辑器状态。
     */
    reset() {
      this.clearEvents();
      this.replaceNodes({});
    },

    /**
     * 通过回调函数设置编辑器选项
     *
     * @param cb: 用于设置选项的函数。
     */
    setOptions(cb: (options: Partial<Options>) => void) {
      cb(state.options);
    },
    // 给每个传入节点的 events 属性中的 eventType 设置为true，设置 state.events[eventType] 为传入的节点
    setNodeEvent(
      eventType: NodeEventTypes,
      nodeIdSelector: NodeSelector<NodeSelectorType.Id>
    ) {
      state.events[eventType].forEach((id) => {
        if (state.nodes[id]) {
          state.nodes[id].events[eventType] = false;
        }
      });

      state.events[eventType] = new Set();

      if (!nodeIdSelector) {
        return;
      }

      const targets = getNodesFromSelector(state.nodes, nodeIdSelector, {
        idOnly: true,
        existOnly: true,
      });

      const nodeIds: Set<NodeId> = new Set(targets.map(({ node }) => node.id));
      nodeIds.forEach((id) => {
        state.nodes[id].events[eventType] = true;
      });
      state.events[eventType] = nodeIds;
    },

    /**
     * 给定一个 'id'，它将设置该节点的 'dom' 属性。
     *
     * @param id
     * @param dom
     */
    setDOM(id: NodeId, dom: HTMLElement) {
      if (!state.nodes[id]) {
        return;
      }

      state.nodes[id].dom = dom;
    },

    setIndicator(indicator: Indicator | null) {
      if (
        indicator &&
        (!indicator.placement.parent.dom ||
          (indicator.placement.currentNode &&
            !indicator.placement.currentNode.dom))
      )
        return;
      state.indicator = indicator;
    },

    /**
     * 隐藏一个节点
     */
    setHidden(id: NodeId, bool: boolean) {
      state.nodes[id].data.hidden = bool;
    },

    /**
     * 更新节点的props
     */
    setProp(
      selector: NodeSelector<NodeSelectorType.Id>,
      cb: (props: any) => void
    ) {
      const targets = getNodesFromSelector(state.nodes, selector, {
        idOnly: true,
        existOnly: true,
      });

      targets.forEach(({ node }) => cb(state.nodes[node.id].data.props));
    },

    selectNode(nodeIdSelector?: NodeSelector<NodeSelectorType.Id>) {
      if (nodeIdSelector) {
        const targets = getNodesFromSelector(state.nodes, nodeIdSelector, {
          idOnly: true,
          existOnly: true,
        });

        this.setNodeEvent(
          'selected',
          targets.map(({ node }) => node.id)
        );
      } else {
        this.setNodeEvent('selected', null);
      }

      this.setNodeEvent('hovered', null);
    },
  };
};
