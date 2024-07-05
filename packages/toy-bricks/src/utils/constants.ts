export const ROOT_NODE = 'ROOT';
export const DEPRECATED_ROOT_NODE = 'canvas-ROOT';

export const ERROR_NOPARENT = '不能省略父ID';
export const ERROR_DUPLICATE_NODEID = '尝试添加具有重复 id 的节点';
export const ERROR_INVALID_NODEID = '节点不存在，它可能已被删除';
export const ERROR_TOP_LEVEL_ELEMENT_NO_ID =
  "在用户组件中使用的 <Element /> 必须指定一个 'id' 属性，例如： <Element id=“text_element”>...</Element>";
export const ERROR_MISSING_PLACEHOLDER_PLACEMENT =
  '缺少占位符所需的放置信息（父级、索引或位置）';
export const ERROR_MOVE_CANNOT_DROP = '无法将节点放入目标父节点';
export const ERROR_MOVE_INCOMING_PARENT = '目标父节点拒绝传入节点';
export const ERROR_MOVE_OUTGOING_PARENT = '当前父节点拒绝传出节点';
export const ERROR_MOVE_NONCANVAS_CHILD =
  '无法移动不是 Canvas 节点的直接子节点的节点';
export const ERROR_MOVE_TO_NONCANVAS_PARENT =
  '无法将节点移动到非 Canvas 父节点';
export const ERROR_MOVE_TOP_LEVEL_NODE = '无法移动顶级节点';
export const ERROR_MOVE_ROOT_NODE = '无法移动根节点';

export const ERROR_MOVE_TO_DESCENDANT = '无法将节点移动到后代中';
export const ERROR_NOT_IN_RESOLVER =
  '为此节点指定的组件类型 （%node_type%） 在解析程序中不存在';
export const ERROR_INFINITE_CANVAS =
  '<Canvas> 在“is”属性中指定的组件在其渲染模板中指定了额外的 Canvas。';
export const ERROR_INVALID_NODE_ID = '参数 Node ID 指定无效';
export const ERROR_DELETE_TOP_LEVEL_NODE = '尝试删除顶级节点';

export const ERROR_RESOLVER_NOT_AN_OBJECT = `<Designer /> 中的解析器必须是一个对象。对于（反）序列化，toy-bricks 需要所有用户组件的列表 `;

export const ERROR_USE_EDITOR_OUTSIDE_OF_EDITOR_CONTEXT = `只能在 <Designer /> 的上下文中使用 useDesigner。请仅在属于 <Designer /> 组件的子组件中使用 useDesigner。`;

export const ERROR_USE_NODE_OUTSIDE_OF_EDITOR_CONTEXT = `只能在 <Designer /> 的上下文中使用 useNode。
请仅在属于 <Designer /> 组件的子组件中使用 useNode。`;
