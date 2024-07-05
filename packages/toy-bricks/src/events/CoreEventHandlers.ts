import { EventHandlers } from '../utils';

import { DesignerStore } from '../designer/store';
import { NodeId, NodeTree } from '../types/nodes';

export interface CreateHandlerOptions {
  onCreate: (nodeTree: NodeTree) => void;
}

export class CoreEventHandlers<O = {}> extends EventHandlers<
  { store: DesignerStore } & O
> {
  handlers() {
    return {
      connect: (el: HTMLElement, id: NodeId) => {},
      select: (el: HTMLElement, id: NodeId) => {},
      hover: (el: HTMLElement, id: NodeId) => {},
      drag: (el: HTMLElement, id: NodeId) => {},
      drop: (el: HTMLElement, id: NodeId) => {},
      create: (
        el: HTMLElement,
        UserElement: React.ReactElement | (() => NodeTree | React.ReactElement),
        options?: Partial<CreateHandlerOptions>
      ) => {},
    };
  }
}
