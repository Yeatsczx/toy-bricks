import { RenderIndicator, getDOMInfo } from '../utils';
import React, { useEffect } from 'react';

import { useEventHandler } from './EventContext';
import movePlaceholder from './movePlaceholder';

import { useInternalDesigner } from '../designer/useInternalDesigner';

// 移动组件时显示放置的位置指示
export const RenderDesignerIndicator = () => {
  const { indicator, indicatorOptions, enabled } = useInternalDesigner(
    (state) => ({
      indicator: state.indicator,
      indicatorOptions: state.options.indicator,
      enabled: state.options.enabled,
    })
  );

  const handler = useEventHandler();

  useEffect(() => {
    if (!handler) {
      return;
    }

    if (!enabled) {
      handler.disable();
      return;
    }

    handler.enable();
  }, [enabled, handler]);

  if (!indicator) {
    return null;
  }

  return React.createElement(RenderIndicator, {
    style: {
      ...movePlaceholder(
        indicator.placement,
        getDOMInfo(indicator.placement.parent.dom),
        indicator.placement.currentNode &&
          getDOMInfo(indicator.placement.currentNode.dom),
        indicatorOptions.thickness
      ),
      backgroundColor: indicator.error
        ? indicatorOptions.error
        : indicatorOptions.success,
      transition: indicatorOptions.transition || '0.2s ease-in',
    },
    parentDom: indicator.placement.parent.dom,
  });
};
