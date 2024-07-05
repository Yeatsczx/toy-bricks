import {
  wrapConnectorHooks,
  ERROR_USE_NODE_OUTSIDE_OF_EDITOR_CONTEXT,
} from '../utils';
import { useMemo, useContext } from 'react';
import invariant from 'tiny-invariant';

import { NodeContext } from './NodeContext';

import { useInternalDesigner } from '../designer/useInternalDesigner';
import { Node } from '../types';

export function useInternalNode<S = null>(collect?: (node: Node) => S) {
  const context = useContext(NodeContext);
  invariant(context, ERROR_USE_NODE_OUTSIDE_OF_EDITOR_CONTEXT);

  // 利用 id 识别是哪个 node，通过此实现在使用时调用useNode() 中 修改当前node的数据
  const { id, related } = context;

  const {
    actions: DesignerActions,
    query,
    connectors: designerConnectors,
    ...collected
  } = useInternalDesigner(
    (state) => id && state.nodes[id] && collect && collect(state.nodes[id])
  );

  const connectors = useMemo(
    () =>
      wrapConnectorHooks({
        connect: (dom: HTMLElement) => designerConnectors.connect(dom, id),
        drag: (dom: HTMLElement) => designerConnectors.drag(dom, id),
      }),
    [designerConnectors, id]
  );

  const actions = useMemo(() => {
    return {
      setProp: (cb: any, throttleRate?: number) => {
        if (throttleRate) {
          DesignerActions.history.throttle(throttleRate).setProp(id, cb);
        } else {
          DesignerActions.setProp(id, cb);
        }
      },
      setHidden: (bool: boolean) => DesignerActions.setHidden(id, bool),
    };
  }, [DesignerActions, id]);

  return {
    ...collected,
    id,
    related,
    inNodeContext: !!context,
    actions,
    connectors,
  };
}
