export const createTestNode = (id, data = {}, config: any = {}) => {
  return {
    ...config,
    id,
    data: {
      props: {},
      hidden: false,
      isCanvas: false,
      nodes: [],
      linkedNodes: {},
      ...data,
    },
    related: {},
    events: {
      selected: false,
      dragged: false,
      hovered: false,
      ...(config.events || {}),
    },
  };
};
