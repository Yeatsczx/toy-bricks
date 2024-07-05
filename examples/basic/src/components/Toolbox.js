import { useDesigner, Element } from 'toy-bricks';
import React from 'react';

import { Button } from './user/Button';
import { Card } from './user/Card';
import { Container } from './user/Container';
import { Text } from './user/Text';
import './ToolBoxStyle.css';

export const Toolbox = () => {
  const { connectors } = useDesigner();
  const componentList = [
    [
      '按钮',
      'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      <Button
        text="Click me"
        size="small"
      />,
    ],
    [
      '文字',
      'https://img.alicdn.com/imgextra/i3/O1CN01n5wpxc1bi862KuXFz_!!6000000003498-55-tps-50-50.svg',
      <Text text="Hi world" />,
    ],
    [
      '容器',
      'https://img.alicdn.com/imgextra/i2/O1CN01B1NMW926IFrFxjqQT_!!6000000007638-55-tps-56-56.svg',
      <Element
        canvas
        is={Container}
        padding={20}
      />,
    ],
    [
      '卡片',
      '	https://img.alicdn.com/imgextra/i4/O1CN01NkB89W1dav8vtrAoc_!!6000000003753-55-tps-56-56.svg',
      <Card />,
    ],
  ];
  return (
    <div>
      <div style={{ borderBottom: '1px solid #dfdfdf' }}>
        <h3>组件列表</h3>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}>
        {componentList.map(([componentName, imgSrc, component]) => (
          <div
            key={componentName}
            className="Component--card"
            ref={(ref) => connectors.create(ref, component)}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 1px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxSizing: 'border-box',
              }}>
              <img
                src={imgSrc}
                width={56}
                height={56}
                style={{
                  borderStyle: 'none',
                }}
                alt=""
              />
            </div>
            <div
              style={{
                width: '100%',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                color: '#000',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}>
              {componentName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
