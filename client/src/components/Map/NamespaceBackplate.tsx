import React from 'react';
import { XYWH } from '~/domain/geometry';
import { sizes } from '~/ui/vars';
import css from './styles.scss';

export interface Props {
  namespace: string | null;
  xywh: XYWH;
}

export const Component = (props: Props) => {
  if (props.namespace == null) return null;

  return (
    <g
      className={css.namespaceBackplate}
      transform={`translate(${props.xywh.x}, ${props.xywh.y})`}
    >
      <rect width={props.xywh.w} height={props.xywh.h} rx={10} ry={10} />
      <text
        x={sizes.endpointHPadding / 2 + sizes.endpointShadowSize}
        y={sizes.endpointHPadding / 3}
      >
        {props.namespace}
      </text>
    </g>
  );
};

export const NamespaceBackplate = React.memo(Component);