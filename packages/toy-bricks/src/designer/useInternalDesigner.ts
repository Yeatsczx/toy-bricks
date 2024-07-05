import {
  useCollector,
  useCollectorReturnType,
  QueryCallbacksFor,
  wrapConnectorHooks,
  EventHandlerConnectors,
  ERROR_USE_EDITOR_OUTSIDE_OF_EDITOR_CONTEXT,
} from '../utils';
import { useContext, useEffect, useMemo } from 'react';
import invariant from 'tiny-invariant';

import { DesignerContext } from './DesignerContext';
import { QueryMethods } from './query';
import { DesignerStore } from './store';

import { CoreEventHandlers } from '../events/CoreEventHandlers';
import { useEventHandler } from '../events/EventContext';
import { DesignerState } from '../types';

export type DesignerCollector<C> = (
  state: DesignerState,
  query: QueryCallbacksFor<typeof QueryMethods>
) => C;

export type useInternalDesignerReturnType<C = null> = useCollectorReturnType<
  DesignerStore,
  C
> & {
  inContext: boolean;
  store: DesignerStore;
  connectors: EventHandlerConnectors<CoreEventHandlers, React.ReactElement>;
};

export function useInternalDesigner<C>(
  collector?: DesignerCollector<C>
): useInternalDesignerReturnType<C> {
  const handler = useEventHandler();
  const store = useContext(DesignerContext);
  invariant(store, ERROR_USE_EDITOR_OUTSIDE_OF_EDITOR_CONTEXT);

  const collected = useCollector(store, collector);

  const connectorsUsage = useMemo(
    () => handler && handler.createConnectorsUsage(),
    [handler]
  );

  useEffect(() => {
    connectorsUsage.register();

    return () => {
      connectorsUsage.cleanup();
    };
  }, [connectorsUsage]);

  const connectors = useMemo(
    () => connectorsUsage && wrapConnectorHooks(connectorsUsage.connectors),
    [connectorsUsage]
  );

  return {
    ...collected,
    connectors,
    inContext: !!store,
    store,
  };
}
