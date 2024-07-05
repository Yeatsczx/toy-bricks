import React from 'react';
import ReactDOM from 'react-dom';

// 将移动组件时显示的放置位置指示 放到parentDom中并渲染
export const RenderIndicator: React.FC<any> = ({ style, parentDom }) => {
  const indicator = (
    <div
      style={{
        position: 'fixed',
        display: 'block',
        opacity: 1,
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'transparent',
        zIndex: 99999,
        ...style,
      }}></div>
  );

  if (parentDom && parentDom.ownerDocument !== document) {
    return ReactDOM.createPortal(indicator, parentDom.ownerDocument.body);
  }

  return indicator;
};
