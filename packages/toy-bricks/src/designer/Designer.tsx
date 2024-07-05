import React, { useEffect, useRef } from 'react';
import invariant from 'tiny-invariant';
import { ERROR_RESOLVER_NOT_AN_OBJECT } from '../utils';
import { DesignerContext } from './DesignerContext';
import { useDesignerStore } from './store';
import { Events } from '../events';
import { Options } from '../types';

export const Designer: React.FC<React.PropsWithChildren<Partial<Options>>> = ({
  children,
  ...options
}) => {
  // 判断options.resolver格式，如果不是对象，则报错提醒开发者
  if (options.resolver !== undefined) {
    invariant(
      typeof options.resolver === 'object' && !Array.isArray(options.resolver),
      ERROR_RESOLVER_NOT_AN_OBJECT
    );
  }

  const optionsRef = useRef(options);

  const context = useDesignerStore(optionsRef.current);

  // 设置 enable 属性
  useEffect(() => {
    if (!context || !options) {
      return;
    }

    if (
      options.enabled === undefined ||
      context.query.getOptions().enabled === options.enabled
    ) {
      return;
    }

    context.actions.setOptions((designerOptions) => {
      designerOptions.enabled = options.enabled;
    });
  }, [context, options.enabled]);

  return context ? (
    <DesignerContext.Provider value={context}>
      <Events>{children}</Events>
    </DesignerContext.Provider>
  ) : null;
};
