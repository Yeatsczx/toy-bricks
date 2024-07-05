import { Node, NodeInfo, DropPosition } from '../types';

export default function findPosition(
  parent: Node,
  dims: NodeInfo[],
  posX: number,
  posY: number
) {
  let result: DropPosition = {
    parent,
    index: 0,
    where: 'before',
  };

  let leftLimit = 0,
    xLimit = 0,
    dimRight = 0,
    yLimit = 0,
    xCenter = 0,
    yCenter = 0,
    dimDown = 0;

  for (let i = 0, len = dims.length; i < len; i++) {
    const dim = dims[i];

    // 元素的右侧位置：左 + 宽度
    dimRight = dim.left + dim.outerWidth;
    // 元素的右侧位置：顶部 + 高度
    dimDown = dim.top + dim.outerHeight;
    // 元素的 X 中心位置：左 + （宽度 / 2）
    xCenter = dim.left + dim.outerWidth / 2;
    // 元素的 Y 中心位置：顶部 + （高度 / 2）
    yCenter = dim.top + dim.outerHeight / 2;
    // 如果超过限制，跳过
    if (
      (xLimit && dim.left > xLimit) ||
      (yLimit && yCenter >= yLimit) || // >= 避免 Clearfix 出现问题
      (leftLimit && dimRight < leftLimit)
    )
      continue;

    result.index = i;

    // 如果它不在文档流中（如“float”元素）
    if (!dim.inFlow) {
      if (posY < dimDown) yLimit = dimDown;
      //x lefter than center
      if (posX < xCenter) {
        xLimit = xCenter;
        result.where = 'before';
      } else {
        leftLimit = xCenter;
        result.where = 'after';
      }
    } else {
      // y upper than center
      if (posY < yCenter) {
        result.where = 'before';
        break;
      } else result.where = 'after'; // 在最后一个元素之后
    }
  }

  return result;
}
