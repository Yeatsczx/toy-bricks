export const createShadow = (
  e: DragEvent,
  shadowsToCreate: HTMLElement[],
  forceSingleShadow: boolean = false
) => {
  if (shadowsToCreate.length === 1 || forceSingleShadow) {
    const { width, height } = shadowsToCreate[0].getBoundingClientRect();
    const shadow = shadowsToCreate[0].cloneNode(true) as HTMLElement;

    shadow.style.position = `fixed`;
    shadow.style.left = `-100%`;
    shadow.style.top = `-100%`;
    shadow.style.width = `${width}px`;
    shadow.style.height = `${height}px`;
    shadow.style.pointerEvents = 'none';

    document.body.appendChild(shadow);
    e.dataTransfer.setDragImage(shadow, 0, 0);

    return shadow;
  }

  /**
   * 如果应该有多个拖动阴影，我们将创建一个容器 div 来存储它们
   * 该容器将用作当前拖动事件的拖动阴影
   */
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-100%';
  container.style.top = `-100%`;
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';

  shadowsToCreate.forEach((dom) => {
    const { width, height, top, left } = dom.getBoundingClientRect();
    const shadow = dom.cloneNode(true) as HTMLElement;

    shadow.style.position = `absolute`;
    shadow.style.left = `${left}px`;
    shadow.style.top = `${top}px`;
    shadow.style.width = `${width}px`;
    shadow.style.height = `${height}px`;

    container.appendChild(shadow);
  });

  document.body.appendChild(container);
  e.dataTransfer.setDragImage(container, e.clientX, e.clientY);

  return container;
};
