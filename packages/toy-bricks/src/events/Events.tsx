import React, { useContext, useMemo } from 'react';

import { EventHandlerContext } from './EventContext';
import { RenderDesignerIndicator } from './RenderDesignerIndicator';

import { DesignerContext } from '../designer/DesignerContext';

type EventsProps = {
  children?: React.ReactNode;
};

export const Events: React.FC<EventsProps> = ({ children }) => {
  const store = useContext(DesignerContext);

  // 生成事件类，并传入store参数，使得可以调用 store中的 action 和 query 方法
  // handlers方法在 store文件中有声明，就是用来 new DefaultEventHandlers
  const handler = useMemo(
    () => store.query.getOptions().handlers(store),
    [store]
  );

  if (!handler) {
    return null;
  }

  // 移动组件时显示放置的位置指示 <RenderDesignerIndicator />
  return (
    <EventHandlerContext.Provider value={handler}>
      <RenderDesignerIndicator />
      {children}
    </EventHandlerContext.Provider>
  );
};
