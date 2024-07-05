import { useNode, useDesigner } from 'toy-bricks';
import React, { useEffect } from 'react';
import './RenderNodeStyle.css';

export const RenderNode = ({ render }) => {
  const { id } = useNode();
  const { isActive } = useDesigner((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
  }));

  const { isHover, dom } = useNode((node) => ({
    isHover: node.events.hovered,
    dom: node.dom,
  }));

  useEffect(() => {
    if (dom) {
      if (isActive || isHover) dom.classList.add('component-selected');
      else dom.classList.remove('component-selected');
    }
  }, [dom, isActive, isHover]);

  return <>{render}</>;
};
