export type SchemaType = 'string' | 'number' | string;

export interface IPropDef {
  type: SchemaType;
  required?: boolean;
}

export type PropDef = SchemaType | IPropDef;

export interface ISchema<T> {
  label: string;
  props: {
    [P in keyof T]: PropDef;
  }
}