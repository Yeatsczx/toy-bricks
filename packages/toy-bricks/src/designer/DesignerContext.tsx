import { createContext } from 'react';

import { DesignerStore } from './store';

export type DesignerContextType = DesignerStore;
export const DesignerContext = createContext<DesignerContextType>(null);
