import { useDesigner } from 'toy-bricks';
import {
  Switch,
  Flex,
  Button as MaterialButton,
  Modal,
  Input,
  notification,
} from 'antd';
import copy from 'copy-to-clipboard';
import lz from 'lzutf8';
import React, { useState } from 'react';

export const Topbar = () => {
  const { actions, query, enabled, canUndo, canRedo } = useDesigner(
    (state, query) => ({
      enabled: state.options.enabled,
      canUndo: state.options.enabled && query.history.canUndo(),
      canRedo: state.options.enabled && query.history.canRedo(),
    })
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [stateToLoad, setStateToLoad] = useState(null);

  const [api, contextHolder] = notification.useNotification({
    duration: 1,
  });
  return (
    <>
      {contextHolder}
      <Flex
        gap="small"
        wrap="wrap"
        style={{ backgroundColor: 'rgb(203, 232, 231)', padding: '10px' }}>
        <Switch
          checked={enabled}
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
          onChange={(value) =>
            actions.setOptions((options) => (options.enabled = value))
          }
        />
        <MaterialButton
          size="small"
          type="primary"
          disabled={!canUndo}
          onClick={() => actions.history.undo()}
          style={{ marginRight: '10px' }}>
          上一步
        </MaterialButton>
        <MaterialButton
          size="small"
          type="primary"
          disabled={!canRedo}
          onClick={() => actions.history.redo()}
          style={{ marginRight: '10px' }}>
          下一步
        </MaterialButton>
        <MaterialButton
          size="small"
          type="primary"
          onClick={() => {
            const json = query.serialize();
            copy(lz.encodeBase64(lz.compress(json)));
            api['success']({
              message: '复制成功',
            });
          }}
          style={{ marginRight: '10px' }}>
          复制当前编辑器数据
        </MaterialButton>
        <MaterialButton
          size="small"
          type="primary"
          onClick={() => setDialogOpen(true)}>
          加载数据
        </MaterialButton>
        <Modal
          open={dialogOpen}
          title="加载数据"
          onOk={() => {
            setDialogOpen(false);
            const json = lz.decompress(lz.decodeBase64(stateToLoad));
            actions.deserialize(json);
          }}
          onCancel={() => setDialogOpen(false)}>
          <Input.TextArea
            placeholder="粘贴从“复制当前编辑器数据”按钮复制的内容"
            value={stateToLoad || ''}
            onChange={(e) => setStateToLoad(e.target.value)}
          />
        </Modal>
      </Flex>
    </>
  );
};
