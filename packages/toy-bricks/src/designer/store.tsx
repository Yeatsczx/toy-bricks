import { useMethods, SubscriberAndCallbacksFor } from '../utils';

import { Methods as ActionMethods } from './actions';
import { QueryMethods } from './query';

import { DefaultEventHandlers } from '../events';
import { DesignerState, Options, NodeEventTypes, NodeId } from '../types';

export const designerInitialState: DesignerState = {
  nodes: {},
  events: {
    dragged: new Set<NodeId>(),
    selected: new Set<NodeId>(),
    hovered: new Set<NodeId>(),
  },
  indicator: null,
  options: {
    onRender: ({ render }) => render,
    resolver: {},
    enabled: true,
    indicator: {
      error: 'red',
      success: 'rgb(98, 196, 98)',
    },
    // 生成事件类，并传入store参数，使得可以调用 store中的 action 和 query 方法
    handlers: (store) =>
      new DefaultEventHandlers({
        store,
      }),
  },
};

export const ActionMethodsWithConfig = {
  methods: ActionMethods,
  ignoreHistoryForActions: [
    'setDOM',
    'setNodeEvent',
    'selectNode',
    'clearEvents',
    'setOptions',
    'setIndicator',
  ] as const,
  normalizeHistory: (state: DesignerState) => {
    /**
     * 在每次进行历史记录的上一步和下一步时，都需要删除 events 中已经删除节点的事件
     */
    Object.keys(state.events).forEach((eventName: NodeEventTypes) => {
      const nodeIds = Array.from(state.events[eventName] || []);

      nodeIds.forEach((id) => {
        if (!state.nodes[id]) {
          state.events[eventName].delete(id);
        }
      });
    });

    // 删除任何无效的 node[nodeId].events
    // TODO（prev）：必须确保 state.events 和 state.nodes[nodeId].events 同步真的很麻烦
    // 找到一种方法，以便一旦设置了 state.events，state.nodes[nodeId] 就会自动反映出来（也许使用代理？
    // 把每一个节点的 events 中的事件设置为false
    Object.keys(state.nodes).forEach((id) => {
      const node = state.nodes[id];

      Object.keys(node.events).forEach((eventName: NodeEventTypes) => {
        const isEventActive = !!node.events[eventName];

        if (
          isEventActive &&
          state.events[eventName] &&
          !state.events[eventName].has(node.id)
        ) {
          node.events[eventName] = false;
        }
      });
    });
  },
};

export type DesignerStore = SubscriberAndCallbacksFor<
  typeof ActionMethodsWithConfig,
  typeof QueryMethods
>;

export const useDesignerStore = (options: Partial<Options>): DesignerStore => {
  return useMethods(
    ActionMethodsWithConfig,
    {
      ...designerInitialState,
      options: {
        ...designerInitialState.options,
        ...options,
      },
    },
    QueryMethods
  ) as DesignerStore;
};
