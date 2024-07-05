import { Overwrite, Delete, OverwriteFnReturnType } from '../utils';
import { useMemo } from 'react';

import {
  useInternalDesigner,
  DesignerCollector,
  useInternalDesignerReturnType,
} from '../designer/useInternalDesigner';

type PrivateActions =
  | 'addLinkedNodeFromTree'
  | 'setNodeEvent'
  | 'setDOM'
  | 'replaceNodes'
  | 'reset';

const getPublicActions = (actions) => {
  const {
    addLinkedNodeFromTree,
    setDOM,
    setNodeEvent,
    replaceNodes,
    reset,
    ...DesignerActions
  } = actions;

  return DesignerActions;
};

export type WithoutPrivateActions<S = null> = Delete<
  useInternalDesignerReturnType<S>['actions'],
  PrivateActions | 'history'
> & {
  history: Overwrite<
    useInternalDesignerReturnType<S>['actions']['history'],
    {
      ignore: OverwriteFnReturnType<
        useInternalDesignerReturnType<S>['actions']['history']['ignore'],
        PrivateActions
      >;
      throttle: OverwriteFnReturnType<
        useInternalDesignerReturnType<S>['actions']['history']['throttle'],
        PrivateActions
      >;
    }
  >;
};

export type useDesignerReturnType<S = null> = Overwrite<
  useInternalDesignerReturnType<S>,
  {
    actions: WithoutPrivateActions;
    query: Delete<useInternalDesignerReturnType<S>['query'], 'deserialize'>;
  }
>;

/**
 * 一个 Hook，它提供与整个编辑器状态相关的方法和信息。
 * @param collector 收集器函数，用于获取编辑器状态中的值
 */
export function useDesigner(): useDesignerReturnType;
export function useDesigner<S>(
  collect: DesignerCollector<S>
): useDesignerReturnType<S>;

export function useDesigner<S>(collect?: any): useDesignerReturnType<S> {
  const {
    connectors,
    actions: internalActions,
    query,
    store,
    ...collected
  } = useInternalDesigner(collect);

  const DesignerActions = getPublicActions(internalActions);

  const actions = useMemo(() => {
    return {
      ...DesignerActions,
      history: {
        ...DesignerActions.history,
        ignore: (...args) =>
          getPublicActions(DesignerActions.history.ignore(...args)),
        throttle: (...args) =>
          getPublicActions(DesignerActions.history.throttle(...args)),
      },
    };
  }, [DesignerActions]);

  return {
    connectors,
    actions,
    query,
    store,
    ...(collected as any),
  };
}
