import { useDesigner } from 'toy-bricks';
import { Button as MaterialButton } from 'antd';
import React from 'react';

export const SettingsPanel = () => {
  const { actions, selected, isEnabled } = useDesigner((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings:
          state.nodes[currentNodeId].related &&
          state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });
  console.log(selected);
  return isEnabled && selected ? (
    <div style={{ paddingLeft: '10px' }}>
      <div>{selected.settings && React.createElement(selected.settings)}</div>
      {selected.isDeletable ? (
        <MaterialButton
          type="default"
          danger
          style={{ marginTop: '10px' }}
          onClick={() => {
            actions.delete(selected.id);
          }}>
          Delete
        </MaterialButton>
      ) : null}
    </div>
  ) : null;
};
