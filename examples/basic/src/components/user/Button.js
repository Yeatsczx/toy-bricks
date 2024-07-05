import { useNode } from 'toy-bricks';
import { Button as MaterialButton, Radio, Input } from 'antd';
import React from 'react';

export const Button = ({ size, type, text, ...props }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <MaterialButton
      ref={(ref) => connect(drag(ref))}
      style={{ margin: '5px' }}
      size={size}
      type={type}
      {...props}>
      {text}
    </MaterialButton>
  );
};

export const ButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div>
      <div>
        <div style={{ marginBottom: '10px' }}>按钮尺寸:</div>
        <Radio.Group
          onChange={(e) =>
            setProp((props) => {
              props.size = e.target.value;
            })
          }
          value={props.size}
          optionType="button"
          buttonStyle="solid">
          <Radio value={'small'}>small</Radio>
          <Radio value={'medium'}>medium</Radio>
          <Radio value={'large'}>large</Radio>
        </Radio.Group>
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ marginBottom: '10px' }}>按钮类型:</div>
        <Radio.Group
          onChange={(e) =>
            setProp((props) => {
              props.type = e.target.value;
            })
          }
          value={props.type}
          optionType="button"
          buttonStyle="solid">
          <Radio value={'default'}>default</Radio>
          <Radio value={'primary'}>primary</Radio>
          <Radio value={'secondary'}>secondary</Radio>
        </Radio.Group>
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ marginBottom: '10px' }}>按钮内容:</div>
        <Input
          value={props.text}
          onChange={(e) => {
            setProp((props) => {
              props.text = e.target.value;
            });
          }}
        />
      </div>
    </div>
  );
};

export const ButtonDefaultProps = {
  size: 'small',
  type: 'primary',
  text: 'Click me',
};

Button.craft = {
  props: ButtonDefaultProps,
  related: {
    settings: ButtonSettings,
  },
};
