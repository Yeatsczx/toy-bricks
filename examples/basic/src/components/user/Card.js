import { Element, useNode } from 'toy-bricks';
import React from 'react';

import { Button } from './Button';
import {
  Container,
  ContainerSettings,
  ContainerDefaultProps,
} from './Container';
import { Text } from './Text';

export const CardTop = ({ children, ...props }) => {
  const {
    connectors: { connect },
  } = useNode();
  return (
    <div
      {...props}
      ref={connect}
      className="text-only"
      style={{
        padding: '10px',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
      {children}
    </div>
  );
};

export const CardBottom = ({ children, ...props }) => {
  const {
    connectors: { connect },
  } = useNode();
  return (
    <div
      {...props}
      style={{ padding: '10px 0' }}
      ref={connect}>
      {children}
    </div>
  );
};

export const Card = ({ background, padding = 20, ...props }) => {
  return (
    <Container
      {...props}
      background={background}
      padding={padding}>
      <Element
        canvas
        id="text"
        is={Container}>
        <Text
          text="Only texts"
          fontSize={20}
        />
        <Text
          text="are allowed up here"
          fontSize={15}
        />
      </Element>
      <Element
        canvas
        id="buttons"
        is={Container}>
        <Button
          size="small"
          text="Only buttons down here"
        />
      </Element>
    </Container>
  );
};

Card.craft = {
  props: ContainerDefaultProps,
  related: {
    settings: ContainerSettings,
  },
};
