export type SchemaType = 'string' | 'number' | string;

export interface IPropDef {
  type: SchemaType;
  required?: boolean;
}

// type Required<T> = {
//   [P in Purify<keyof T>]: NonNullable<T[P]>;
// };
export type NonNullable<T> = T & {};
export type Purify<T extends string> = {[P in T]: T; }[T];

export type PropDef = SchemaType | IPropDef;

export interface IVertexSchema<T = void> {
  label: string;
  props?: {
    [P in Purify<keyof T>]: NonNullable<PropDef>;
  }
}

export interface IEdgeSchema<T = void> {
  label: string;
  props?: {
    [P in Purify<keyof T>]: NonNullable<PropDef>;
  }
}
