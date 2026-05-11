declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '@phosphor-icons/react' {
  import * as React from 'react';
  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    color?: string;
    mirrored?: boolean;
    'aria-label'?: string;
  }
  export type Icon = React.FC<IconProps>;
  export const MagnifyingGlass: Icon;
  export const Plus: Icon;
  export const Trash: Icon;
  export const PencilSimple: Icon;
  export const DotsThreeVertical: Icon;
  export const SquaresFour: Icon;
  export const Rows: Icon;
  export const CheckCircle: Icon;
  export const X: Icon;
  export const CaretUp: Icon;
  export const CaretDown: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const Check: Icon;
  export const Warning: Icon;
  export const Info: Icon;
  export const Spinner: Icon;
  export const FunnelSimple: Icon;
}
