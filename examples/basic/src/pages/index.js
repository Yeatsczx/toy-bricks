import { Designer, Renderer, Canvas } from 'toy-bricks';
import React from 'react';

import { RenderNode } from '../components/RenderNode';
import { SettingsPanel } from '../components/SettingsPanel';
import { Toolbox } from '../components/Toolbox';
import { Topbar } from '../components/Topbar';
import { Button } from '../components/user/Button';
import { Card, CardBottom, CardTop } from '../components/user/Card';
import { Container } from '../components/user/Container';
import { Text } from '../components/user/Text';

export default function App() {
  return (
    <Designer
      onRender={RenderNode}
      resolver={{
        Card,
        Button,
        Text,
        Container,
        CardTop,
        CardBottom,
      }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Toolbox />
        </div>
        <div style={{ flexGrow: 1.25 }}>
          <Topbar />
          <Renderer>
            <Canvas
              canvas
              is={Container}
              padding={5}
              background="#eeeeee"
              height="90vh">
              {/* <Card data-cy="frame-card" />
              <Button
                text="Click me"
                size="small"
              />
              <Text
                fontSize={20}
                text="Hi world!"
              />
              <Element
                canvas
                is={Container}
                padding={6}
                background="#999999">
                <Text
                  size="small"
                  text="It's me again!"
                />
              </Element> */}
            </Canvas>
          </Renderer>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ marginLeft: '10px' }}>属性设置</h1>
          <SettingsPanel />
        </div>
      </div>
    </Designer>
  );
}
