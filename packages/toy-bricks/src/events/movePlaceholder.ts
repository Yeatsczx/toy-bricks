import { DropPosition, DOMInfo } from '../types';

export default function movePlaceholder(
  pos: DropPosition,
  canvasDOMInfo: DOMInfo, // 光标位于哪个画布
  bestTargetDomInfo: DOMInfo | null, // Canvas 中的最近的元素（如果 canvas 为空，则为 null）
  thickness: number = 2
) {
  let t = 0,
    l = 0,
    w = 0,
    h = 0,
    where = pos.where;

  const elDim = bestTargetDomInfo;

  if (elDim) {
    // 如果它不在文档流中（如“float”元素）
    if (!elDim.inFlow) {
      w = thickness;
      h = elDim.outerHeight;
      t = elDim.top;
      l = where === 'before' ? elDim.left : elDim.left + elDim.outerWidth;
    } else {
      w = elDim.outerWidth;
      h = thickness;
      t = where === 'before' ? elDim.top : elDim.bottom;
      l = elDim.left;
    }
  } else {
    if (canvasDOMInfo) {
      t = canvasDOMInfo.top + canvasDOMInfo.padding.top;
      l = canvasDOMInfo.left + canvasDOMInfo.padding.left;
      w =
        canvasDOMInfo.outerWidth -
        canvasDOMInfo.padding.right -
        canvasDOMInfo.padding.left -
        canvasDOMInfo.margin.left -
        canvasDOMInfo.margin.right;
      h = thickness;
    }
  }
  return {
    top: `${t}px`,
    left: `${l}px`,
    width: `${w}px`,
    height: `${h}px`,
  };
}
