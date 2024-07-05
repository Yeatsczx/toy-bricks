import { ConnectorRegistry } from './ConnectorRegistry';
import {
  EventHandlerUpdates,
  CraftEventListener,
  EventHandlerConnectors,
  Connector,
  ConnectorsUsage,
  RegisteredConnector,
} from './interfaces';

export abstract class EventHandlers<O extends Record<string, any> = {}> {
  options: O;

  private registry: ConnectorRegistry = new ConnectorRegistry();
  private subscribers: Set<(msg: EventHandlerUpdates) => void> = new Set();

  onEnable?(): void;
  onDisable?(): void;

  constructor(options?: O) {
    this.options = options;
  }

  listen(cb: (msg: EventHandlerUpdates) => void) {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  disable() {
    if (this.onDisable) {
      this.onDisable();
    }

    this.registry.disable();

    this.subscribers.forEach((listener) => {
      listener(EventHandlerUpdates.HandlerDisabled);
    });
  }

  enable() {
    if (this.onEnable) {
      this.onEnable();
    }

    this.registry.enable();

    this.subscribers.forEach((listener) => {
      listener(EventHandlerUpdates.HandlerEnabled);
    });
  }

  cleanup() {
    this.disable();
    this.subscribers.clear();
    this.registry.clear();
  }

  // 对监听事件进行封装
  addCraftEventListener<K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    eventName: K,
    listener: CraftEventListener<K>,
    options?: boolean | AddEventListenerOptions
  ) {
    el.addEventListener(eventName, listener, options);
    return () => el.removeEventListener(eventName, listener, options);
  }

  abstract handlers(): Record<string, (el: HTMLElement, ...args: any[]) => any>;

  /**
   * 创建可链接连接器的记录并跟踪其使用情况
   */
  // 主要用来对事件增加禁止操作，禁止操作会执行 removeEventListener
  createConnectorsUsage(): ConnectorsUsage<this> {
    const handlers = this.handlers();

    // 在此处跟踪所有活动连接器 ID,这样我们就可以返回下面的清理方法，以便被调用方可以编程方式清理所有连接器
    const activeConnectorIds: Set<string> = new Set();

    let canRegisterConnectors = false;
    const connectorsToRegister: Map<string, () => RegisteredConnector> =
      new Map();

    const connectors = Object.entries(handlers).reduce<
      Record<string, Connector>
    >(
      (accum, [name, handler]) => ({
        ...accum,
        [name]: (el, required, options) => {
          const registerConnector = () => {
            const connector = this.registry.register(el, {
              required,
              name,
              options,
              connector: handler,
            });

            activeConnectorIds.add(connector.id);
            return connector;
          };

          connectorsToRegister.set(
            this.registry.getConnectorId(el, name),
            registerConnector
          );

          /**
           * 如果 register（） 已被调用，
           * 立即注册连接器。
           *
           * 否则，注册将推迟到调用 register（） 之后
           */
          if (canRegisterConnectors) {
            registerConnector();
          }

          return el;
        },
      }),
      {}
    ) as any;

    return {
      connectors,
      register: () => {
        canRegisterConnectors = true;

        connectorsToRegister.forEach((registerConnector) => {
          registerConnector();
        });
      },
      cleanup: () => {
        canRegisterConnectors = false;

        activeConnectorIds.forEach((connectorId) =>
          this.registry.remove(connectorId)
        );
      },
    };
  }

  derive<C extends EventHandlers>(
    type: {
      new (...args: any[]): C;
    },
    opts: C['options']
  ) {
    return new type(this, opts);
  }

  // 此方法允许我们执行多个连接器，并为所有连接器返回单个清理方法
  protected createProxyHandlers<H extends EventHandlers>(
    instance: H,
    cb: (connectors: EventHandlerConnectors<H>) => void
  ) {
    const connectorsToCleanup = [];
    const handlers = instance.handlers();

    const proxiedHandlers = new Proxy(handlers, {
      get: (target, key: any, receiver) => {
        if (key in handlers === false) {
          return Reflect.get(target, key, receiver);
        }

        return (el, ...args) => {
          // 执行函数 并 返回清除函数
          const cleanup = handlers[key](el, ...args);
          if (!cleanup) {
            return;
          }

          connectorsToCleanup.push(cleanup);
        };
      },
    });

    cb(proxiedHandlers as any);

    return () => {
      connectorsToCleanup.forEach((cleanup) => {
        cleanup();
      });
    };
  }

  // 这使我们能够执行和清理同级连接器
  reflect(cb: (connectors: EventHandlerConnectors<this>) => void) {
    return this.createProxyHandlers(this, cb);
  }
}
