import { useNode } from 'toy-bricks';
import { InputNumber } from 'antd';
import React, { useState, useEffect } from 'react';
import ContentEditable from 'react-contenteditable';

export const Text = ({ text, fontSize, textAlign, ...props }) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
    dragged: state.events.dragged,
  }));

  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (selected) {
      return;
    }

    setEditable(false);
  }, [selected]);

  return (
    <div
      {...props}
      ref={(ref) => connect(drag(ref))}
      onClick={() => selected && setEditable(true)}>
      <ContentEditable
        html={text}
        disabled={!editable}
        onChange={(e) =>
          setProp(
            (props) =>
              (props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, '')),
            500
          )
        }
        tagName="p"
        style={{ fontSize: `${fontSize}px`, textAlign }}
      />
    </div>
  );
};

const TextSettings = () => {
  const {
    actions: { setProp },
    fontSize,
  } = useNode((node) => ({
    text: node.data.props.text,
    fontSize: node.data.props.fontSize,
  }));

  return (
    <>
      <div style={{ marginBottom: '10px' }}>Font size:</div>
      <InputNumber
        addonAfter={'px'}
        value={fontSize}
        min={1}
        max={50}
        onChange={(value) => {
          setProp((props) => (props.fontSize = value));
        }}
      />
    </>
  );
};

export const TextDefaultProps = {
  text: 'Hi',
  fontSize: 20,
};

Text.craft = {
  props: TextDefaultProps,
  related: {
    settings: TextSettings,
  },
};
