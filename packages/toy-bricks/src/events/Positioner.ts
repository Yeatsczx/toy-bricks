import { getDOMInfo, ROOT_NODE } from '../utils';

import findPosition from './findPosition';

import { DesignerStore } from '../designer/store';
import {
  DragTarget,
  DropPosition,
  Indicator,
  Node,
  NodeId,
  NodeInfo,
  NodeSelectorWrapper,
} from '../types';
import { getNodesFromSelector } from '../utils/getNodesFromSelector';

/**
 * Positioner 定位器负责在一系列拖放事件中计算跌落指示器
 */
export class Positioner {
  static BORDER_OFFSET = 10;

  // 当前节点悬停在上面
  private currentDropTargetId: NodeId | null;
  // 当前最接近的画布节点相对于 currentDropTarget
  private currentDropTargetCanvasAncestorId: NodeId | null;

  private currentIndicator: Indicator | null = null;

  private currentTargetId: NodeId | null;
  private currentTargetChildDimensions: NodeInfo[] | null;

  private dragError: string | null;
  private draggedNodes: NodeSelectorWrapper[];

  private onScrollListener: (e: Event) => void;

  constructor(readonly store: DesignerStore, readonly dragTarget: DragTarget) {
    this.currentDropTargetId = null;
    this.currentDropTargetCanvasAncestorId = null;

    this.currentTargetId = null;
    this.currentTargetChildDimensions = null;

    this.currentIndicator = null;

    this.dragError = null;
    this.draggedNodes = this.getDraggedNodes();

    this.validateDraggedNodes();

    this.onScrollListener = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScrollListener, true);
  }

  cleanup() {
    window.removeEventListener('scroll', this.onScrollListener, true);
  }

  private onScroll(e: Event) {
    const scrollBody = e.target;
    const rootNode = this.store.query.node(ROOT_NODE).get();

    // 如果用户已滚动，清除 currentTargetChildDimensions,因为需要重新计算相对于新滚动位置的新维度
    const shouldClearChildDimensionsCache =
      scrollBody instanceof Element &&
      rootNode &&
      rootNode.dom &&
      scrollBody.contains(rootNode.dom);

    if (!shouldClearChildDimensionsCache) {
      return;
    }

    this.currentTargetChildDimensions = null;
  }

  private getDraggedNodes() {
    if (this.dragTarget.type === 'new') {
      return getNodesFromSelector(
        this.store.query.getNodes(),
        this.dragTarget.tree.nodes[this.dragTarget.tree.rootNodeId]
      );
    }

    return getNodesFromSelector(
      this.store.query.getNodes(),
      this.dragTarget.nodes
    );
  }

  // 检查是否允许拖动被拖动的元素
  private validateDraggedNodes() {
    // 我们不需要检查 dragTarget.type = “new”，因为这些节点尚未处于状态（即：通过 .create（） 连接器）
    if (this.dragTarget.type === 'new') {
      return;
    }

    this.draggedNodes.forEach(({ node, exists }) => {
      if (!exists) {
        return;
      }

      this.store.query.node(node.id).isDraggable((err) => {
        this.dragError = err;
      });
    });
  }

  private isNearBorders(
    domInfo: ReturnType<typeof getDOMInfo>,
    x: number,
    y: number
  ) {
    const { top, bottom, left, right } = domInfo;

    if (
      top + Positioner.BORDER_OFFSET > y ||
      bottom - Positioner.BORDER_OFFSET < y ||
      left + Positioner.BORDER_OFFSET > x ||
      right - Positioner.BORDER_OFFSET < x
    ) {
      return true;
    }

    return false;
  }

  private isDiff(newPosition: DropPosition) {
    if (
      this.currentIndicator &&
      this.currentIndicator.placement.parent.id === newPosition.parent.id &&
      this.currentIndicator.placement.index === newPosition.index &&
      this.currentIndicator.placement.where === newPosition.where
    ) {
      return false;
    }

    return true;
  }

  /**
   * 获取指定父节点中每个子节点的维度
   */
  private getChildDimensions(newParentNode: Node) {
    // 如果 newParentNode 与前一个子维度相同，则使用以前计算的子维度
    const existingTargetChildDimensions = this.currentTargetChildDimensions;
    if (
      this.currentTargetId === newParentNode.id &&
      existingTargetChildDimensions
    ) {
      return existingTargetChildDimensions;
    }

    return newParentNode.data.nodes.reduce((result, id: NodeId) => {
      const dom = this.store.query.node(id).get().dom;

      if (dom) {
        result.push({
          id,
          ...getDOMInfo(dom),
        });
      }

      return result;
    }, [] as NodeInfo[]);
  }

  /**
   * 获取相对于 dropTargetId 最近的 Canvas 节点
   * 如果 dropTargetId 本身是 Canvas 节点，则返回 dropTargetId
   *
   * 在大多数情况下，它将是 dropTarget 本身或其直接父级。
   * 如果 dropTarget 是链接节点，我们通常只需要遍历 2 个或更多级别
   *
   */
  private getCanvasAncestor(dropTargetId: NodeId) {
    // 如果 dropTargetId 与前一个相同,返回我们之前找到的 canvas 祖先节点
    if (
      dropTargetId === this.currentDropTargetId &&
      this.currentDropTargetCanvasAncestorId
    ) {
      const node = this.store.query
        .node(this.currentDropTargetCanvasAncestorId)
        .get();

      if (node) {
        return node;
      }
    }

    const getCanvas = (nodeId: NodeId): Node => {
      const node = this.store.query.node(nodeId).get();

      if (node && node.data.isCanvas) {
        return node;
      }

      if (!node.data.parent) {
        return null;
      }

      return getCanvas(node.data.parent);
    };

    return getCanvas(dropTargetId);
  }

  /**
   * 根据 dropTarget 和 x，y 坐标计算新的 Indicator 对象
   * 如果与上一个指标相比没有变化，则返回 null
   */
  computeIndicator(dropTargetId: NodeId, x: number, y: number): Indicator {
    let newParentNode = this.getCanvasAncestor(dropTargetId);

    if (!newParentNode) {
      return;
    }

    this.currentDropTargetId = dropTargetId;
    this.currentDropTargetCanvasAncestorId = newParentNode.id;

    // 如果我们悬停在当前节点的边界，则获取父节点
    if (
      newParentNode.data.parent &&
      this.isNearBorders(getDOMInfo(newParentNode.dom), x, y) &&
      // 如果链接节点，请忽略，因为无论如何都不会有相邻的同级节点
      !this.store.query.node(newParentNode.id).isLinkedNode()
    ) {
      newParentNode = this.store.query.node(newParentNode.data.parent).get();
    }

    if (!newParentNode) {
      return;
    }

    this.currentTargetChildDimensions = this.getChildDimensions(newParentNode);
    this.currentTargetId = newParentNode.id;

    const position = findPosition(
      newParentNode,
      this.currentTargetChildDimensions,
      x,
      y
    );

    // 如果位置与前一个位置相似，则忽略
    if (!this.isDiff(position)) {
      return;
    }

    let error = this.dragError;

    // 最后要检查的是拖动的节点是否可以放置在目标区域中
    if (!error) {
      this.store.query.node(newParentNode.id).isDroppable(
        this.draggedNodes.map((sourceNode) => sourceNode.node),
        (dropError) => {
          error = dropError;
        }
      );
    }

    const currentNodeId = newParentNode.data.nodes[position.index];
    const currentNode =
      currentNodeId && this.store.query.node(currentNodeId).get();

    this.currentIndicator = {
      placement: {
        ...position,
        currentNode,
      },
      error,
    };

    return this.currentIndicator;
  }

  getIndicator() {
    return this.currentIndicator;
  }
}
