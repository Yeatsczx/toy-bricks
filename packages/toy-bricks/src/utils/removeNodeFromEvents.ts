import { DesignerState, NodeId } from '../types';

// 从 state.events 中删除其中的一个节点
export const removeNodeFromEvents = (state: DesignerState, nodeId: NodeId) =>
  Object.keys(state.events).forEach((key) => {
    const eventSet = state.events[key];
    if (eventSet && eventSet.has && eventSet.has(nodeId)) {
      state.events[key] = new Set(
        Array.from(eventSet).filter((id) => nodeId !== id)
      );
    }
  });
