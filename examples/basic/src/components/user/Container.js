import { useNode } from 'toy-bricks';
import { ColorPicker, InputNumber } from 'antd';
import React from 'react';

export const Container = ({
  background,
  padding,
  height,
  children,
  ...props
}) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <div
      {...props}
      ref={(ref) => connect(drag(ref))}
      style={{ margin: '5px 0', background, padding: `${padding}px`, height }}>
      {children}
    </div>
  );
};

export const ContainerSettings = () => {
  const {
    background,
    padding,
    actions: { setProp },
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
  }));

  return (
    <div>
      <div>
        <div style={{ marginBottom: '10px' }}>Background:</div>
        <ColorPicker
          value={background}
          showText
          onChange={(color) => {
            setProp((props) => (props.background = color.toHexString()), 500);
          }}
        />
      </div>
      <div>
        <div style={{ marginBottom: '10px' }}>Padding:</div>
        <InputNumber
          value={padding}
          addonAfter={'px'}
          onChange={(value) => setProp((props) => (props.padding = value))}
        />
      </div>
    </div>
  );
};

export const ContainerDefaultProps = {
  background: '#ffffff',
  padding: 20,
};

Container.craft = {
  props: ContainerDefaultProps,
  related: {
    settings: ContainerSettings,
  },
};
