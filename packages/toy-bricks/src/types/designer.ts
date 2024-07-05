import { Placement } from './events';
import { Nodes, NodeEventTypes, NodeId } from './nodes';
import { DesignerStore } from '../designer/store';
import { useInternalDesignerReturnType } from '../designer/useInternalDesigner';
import { CoreEventHandlers } from '../events';

export type Options = {
  onRender: React.ComponentType<{ render: React.ReactElement }>;
  resolver: Resolver;
  enabled: boolean;
  indicator: Partial<{
    success: string;
    error: string;
    transition: string;
    thickness: number;
  }>;
  handlers: (store: DesignerStore) => CoreEventHandlers;
};

export type Resolver = Record<string, string | React.ElementType>;

export interface Indicator {
  placement: Placement;
  error: string | null;
}

export type DesignerEvents = Record<NodeEventTypes, Set<NodeId>>;

export type DesignerState = {
  nodes: Nodes;
  events: DesignerEvents;
  options: Options;
  indicator: Indicator;
};

export type ConnectedDesigner<S = null> = useInternalDesignerReturnType<S>;
