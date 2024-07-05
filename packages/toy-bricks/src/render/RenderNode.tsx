import React from 'react';

import { DefaultRender } from './DefaultRender';

import { useInternalDesigner } from '../designer/useInternalDesigner';
import { useInternalNode } from '../nodes/useInternalNode';

type RenderNodeToElementType = {
  render?: React.ReactElement;
};
export const RenderNodeToElement: React.FC<
  React.PropsWithChildren<RenderNodeToElementType>
> = ({ render }) => {
  const { hidden } = useInternalNode((node) => ({
    hidden: node.data.hidden,
  }));

  const { onRender } = useInternalDesigner((state) => ({
    onRender: state.options.onRender,
  }));

  // 不要显示节点，因为它是隐藏的
  if (hidden) {
    return null;
  }

  return React.createElement(onRender, { render: render || <DefaultRender /> });
};
