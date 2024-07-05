import React from 'react';

import { useDesigner } from '../hooks';
import { Indicator } from '../types';

export type Placeholder = {
  placeholder: Indicator;
  suggestedStyles: any;
};

// 未被使用过
export const RenderPlaceholder: React.FC<
  React.PropsWithChildren<Placeholder>
> = ({ placeholder, suggestedStyles }) => {
  const { indicator } = useDesigner((state) => ({
    indicator: state.options.indicator,
  }));

  return (
    <div
      style={{
        position: 'fixed',
        display: 'block',
        opacity: 1,
        borderColor: placeholder.error ? indicator.error : indicator.success,
        borderStyle: 'solid',
        borderWidth: '1px',
        zIndex: '99999',
        ...suggestedStyles,
      }}></div>
  );
};
