import { EventHandlers } from './EventHandlers';
import { EventHandlerConnectors, EventHandlerUpdates } from './interfaces';

// 创建依赖于另一个 EventHandlers 实例的 EventHandler
// 这使我们可以轻松地创建由父 EventHandlers 实例组成的新连接器
// 未被使用过
export abstract class DerivedEventHandlers<
  P extends EventHandlers,
  O extends Record<string, any> = {}
> extends EventHandlers<O> {
  derived: P;
  unsubscribeParentHandlerListener: () => void;

  constructor(derived: P, options?: O) {
    super(options);
    this.derived = derived;
    this.options = options;

    // 根据父处理程序自动禁用/启用
    this.unsubscribeParentHandlerListener = this.derived.listen((msg) => {
      switch (msg) {
        case EventHandlerUpdates.HandlerEnabled: {
          return this.enable();
        }
        case EventHandlerUpdates.HandlerDisabled: {
          return this.disable();
        }
        default: {
          return;
        }
      }
    });
  }

  // 一种继承父连接器的方法
  inherit(cb: (connectors: EventHandlerConnectors<P>) => void) {
    return this.createProxyHandlers(this.derived, cb);
  }

  cleanup() {
    super.cleanup();
    this.unsubscribeParentHandlerListener();
  }
}
