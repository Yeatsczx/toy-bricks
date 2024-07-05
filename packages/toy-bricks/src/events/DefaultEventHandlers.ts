import { isChromium, isLinux } from '../utils';
import { isFunction } from 'lodash-es';
import React from 'react';

import { CoreEventHandlers, CreateHandlerOptions } from './CoreEventHandlers';
import { Positioner } from './Positioner';
import { createShadow } from './createShadow';

import { Indicator, NodeId, DragTarget, NodeTree } from '../types';

/**
 * 指定编辑器范围的事件处理程序和连接器
 */
export class DefaultEventHandlers<O = {}> extends CoreEventHandlers<O> {
  static forceSingleDragShadow = isChromium() && isLinux();

  draggedElementShadow: HTMLElement;
  dragTarget: DragTarget;
  positioner: Positioner | null = null;
  currentSelectedElementIds = [];

  onDisable() {
    this.options.store.actions.clearEvents();
  }

  handlers() {
    const store = this.options.store;

    return {
      connect: (el: HTMLElement, id: NodeId) => {
        store.actions.setDOM(id, el);
        // 用 reflect 的意义在于将 select、hover、drop 三个事件的清楚函数放在一起执行
        return this.reflect((connectors) => {
          // select、hover 这两个事件只是增加状态，表表明元素被 选中（selected） 和 移动（hovered）
          connectors.select(el, id);
          connectors.hover(el, id);
          connectors.drop(el, id);
        });
      },
      select: (el: HTMLElement, id: NodeId) => {
        const unbindOnMouseDown = this.addCraftEventListener(
          el,
          'mousedown',
          (e) => {
            e.stopPropagation();

            let newSelectedElementIds = [];

            if (id) {
              if (!newSelectedElementIds.includes(id)) {
                newSelectedElementIds.push(id);
              }
            }

            store.actions.setNodeEvent('selected', newSelectedElementIds);
          }
        );

        return () => {
          unbindOnMouseDown();
        };
      },
      hover: (el: HTMLElement, id: NodeId) => {
        const unbindMouseover = this.addCraftEventListener(
          el,
          'mouseover',
          (e) => {
            e.stopPropagation();
            store.actions.setNodeEvent('hovered', id);
          }
        );

        return () => {
          unbindMouseover();
        };
      },
      drop: (el: HTMLElement, targetId: NodeId) => {
        // dragenter和dragover事件的默认行为是拒绝接受任何被拖放的元素。因此，我们必须阻止浏览器这种默认行为。e.preventDefault();
        // 针对目的地元素
        const unbindDragOver = this.addCraftEventListener(
          el,
          'dragover',
          (e) => {
            e.stopPropagation();
            e.preventDefault();

            if (!this.positioner) {
              return;
            }

            const indicator = this.positioner.computeIndicator(
              targetId, // 目的地元素
              e.clientX,
              e.clientY
            );

            if (!indicator) {
              return;
            }

            store.actions.setIndicator(indicator);
          }
        );

        const unbindDragEnter = this.addCraftEventListener(
          el,
          'dragenter',
          (e) => {
            e.stopPropagation();
            e.preventDefault();
          }
        );

        return () => {
          unbindDragEnter();
          unbindDragOver();
        };
      },
      drag: (el: HTMLElement, id: NodeId) => {
        if (!store.query.node(id).isDraggable()) {
          return () => {};
        }

        el.setAttribute('draggable', 'true');

        const unbindDragStart = this.addCraftEventListener(
          el,
          'dragstart',
          (e) => {
            e.stopPropagation();

            const { query, actions } = store;

            let selectedElementIds = query.getEvent('selected').all();

            const isNodeAlreadySelected =
              this.currentSelectedElementIds.includes(id);

            if (!isNodeAlreadySelected) {
              selectedElementIds = [id];
              store.actions.setNodeEvent('selected', selectedElementIds);
            }

            actions.setNodeEvent('dragged', selectedElementIds);

            const selectedDOMs = selectedElementIds.map(
              (id) => query.node(id).get().dom
            );

            // this.draggedElementShadow = createShadow(
            //   e,
            //   selectedDOMs,
            //   DefaultEventHandlers.forceSingleDragShadow
            // );

            this.dragTarget = {
              type: 'existing',
              nodes: selectedElementIds,
            };

            this.positioner = new Positioner(
              this.options.store,
              this.dragTarget
            );
          }
        );

        const unbindDragEnd = this.addCraftEventListener(el, 'dragend', (e) => {
          e.stopPropagation();

          this.dropElement((dragTarget, indicator) => {
            if (dragTarget.type === 'new') {
              return;
            }

            const index =
              indicator.placement.index +
              (indicator.placement.where === 'after' ? 1 : 0);

            store.actions.move(
              dragTarget.nodes,
              indicator.placement.parent.id,
              index
            );
          });
        });

        return () => {
          el.setAttribute('draggable', 'false');
          unbindDragStart();
          unbindDragEnd();
        };
      },
      // 拖动创建新的组件
      create: (
        el: HTMLElement,
        userElement: React.ReactElement | (() => NodeTree | React.ReactElement),
        options?: Partial<CreateHandlerOptions>
      ) => {
        el.setAttribute('draggable', 'true');

        const unbindDragStart = this.addCraftEventListener(
          el,
          'dragstart',
          (e) => {
            e.stopPropagation();
            let tree;
            if (typeof userElement === 'function') {
              const result = userElement();
              if (React.isValidElement(result)) {
                tree = store.query.parseReactElement(result).toNodeTree();
              } else {
                tree = result;
              }
            } else {
              tree = store.query.parseReactElement(userElement).toNodeTree();
            }

            const dom = e.currentTarget as HTMLElement;
            // this.draggedElementShadow = createShadow(
            //   e,
            //   [dom],
            //   DefaultEventHandlers.forceSingleDragShadow
            // );
            this.dragTarget = {
              type: 'new',
              tree,
            };

            this.positioner = new Positioner(
              this.options.store,
              this.dragTarget
            );
          }
        );

        const unbindDragEnd = this.addCraftEventListener(el, 'dragend', (e) => {
          e.stopPropagation();
          this.dropElement((dragTarget, indicator) => {
            if (dragTarget.type === 'existing') {
              return;
            }

            const index =
              indicator.placement.index +
              (indicator.placement.where === 'after' ? 1 : 0);
            store.actions.addNodeTree(
              dragTarget.tree,
              indicator.placement.parent.id,
              index
            );

            if (options && isFunction(options.onCreate)) {
              options.onCreate(dragTarget.tree);
            }
          });
        });

        return () => {
          el.removeAttribute('draggable');
          unbindDragStart();
          unbindDragEnd();
        };
      },
    };
  }

  private dropElement(
    onDropNode: (dragTarget: DragTarget, placement: Indicator) => void
  ) {
    const store = this.options.store;

    if (!this.positioner) {
      return;
    }

    const draggedElementShadow = this.draggedElementShadow;

    const indicator = this.positioner.getIndicator();

    if (this.dragTarget && indicator && !indicator.error) {
      onDropNode(this.dragTarget, indicator);
    }

    if (draggedElementShadow) {
      draggedElementShadow.parentNode.removeChild(draggedElementShadow);
      this.draggedElementShadow = null;
    }

    this.dragTarget = null;

    store.actions.setIndicator(null);
    store.actions.setNodeEvent('dragged', null);
    this.positioner.cleanup();

    this.positioner = null;
  }
}
