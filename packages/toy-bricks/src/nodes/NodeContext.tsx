import React from 'react';

import { NodeId } from '../types';

export type NodeContextType = {
  id: NodeId;
  related?: boolean;
};

export const NodeContext = React.createContext<NodeContextType>(null);

export type NodeProviderProps = Omit<NodeContextType, 'connectors'>;

export const NodeProvider: React.FC<
  React.PropsWithChildren<NodeProviderProps>
> = ({ id, related = false, children }) => {
  return (
    // 在 useInternalNode 中使用useContext 获取id 和 related
    <NodeContext.Provider value={{ id, related }}>
      {children}
    </NodeContext.Provider>
  );
};
