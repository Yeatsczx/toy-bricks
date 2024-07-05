import { ChainableConnectors, ConnectorsRecord } from './interfaces';

export function wrapHookToRecognizeElement(
  hook: (node: any, ...args: any[]) => void
) {
  return (elementOrNode = null, ...args: any) => {
    if (!elementOrNode) {
      return;
    }
    // 返回 ref 以实现链式调用，例如：
    // ref={(ref) => connect(drag(ref))}
    const node = elementOrNode;
    node && hook(node, ...args);
    return node;
  };
}

export function wrapConnectorHooks<H extends ConnectorsRecord>(
  connectors: H
): ChainableConnectors<H, React.ReactElement | HTMLElement> {
  return Object.keys(connectors).reduce((accum, key) => {
    accum[key] = wrapHookToRecognizeElement((...args) => {
      // @ts-ignore
      return connectors[key](...args);
    });

    return accum;
  }, {}) as any;
}
