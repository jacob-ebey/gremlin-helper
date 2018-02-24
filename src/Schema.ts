export type SchemaType = 'string' | 'number' | string;

export interface IPropDef {
  type: SchemaType;
  required?: boolean;
}

export type PropDef = SchemaType | IPropDef;

export interface IVertexSchema<T> {
  label: string;
  props: {
    [P in keyof T]: PropDef;
  }
}

export interface IEdgeSchema {
  label: string;
}
