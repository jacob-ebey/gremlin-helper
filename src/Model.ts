import { ISchema, IPropDef } from './Schema';

export interface IOpResult<T> {
  error: string | null;
  value: T | null;
}

export type Op<T> = (prop: IPropDef, value: T) => IOpResult<T>;

export type ModelOps<T> = {
  [P in keyof T]?: Op<T[P]>;
}

export interface ProcessResult<T> {
  hasErrors: boolean;
  errors: {
    [P in keyof T]: string | null;
  };
  model: T | null;
}

export interface IModel<T> {
  schema: ISchema<T>;
  ops: ModelOps<T>;
  process(obj: any): ProcessResult<T>
}

export class Model<T> implements IModel<T> {
  public constructor(public schema: ISchema<T>) {
  }

  public ops: ModelOps<T>;

  public process(obj: any): ProcessResult<T> {
    const result: any = {
      hasErrors: false,
      errors: {},
      model: {}
    };

    if (!obj) {
      result.hasErrors = true;
      result.model = null;

      return result;
    }

    for (const key in this.schema.props) {
      const prop: IPropDef = typeof this.schema.props[key] === 'object'
        ? this.schema.props[key] as IPropDef
        : { type: this.schema.props[key] } as IPropDef;

      let value = key in obj ? obj[key] : undefined;

      if (this.ops && key in this.ops && typeof this.ops[key] === 'function') {
        const opResult = this.ops[key](prop, value);

        if (opResult.error) {
          result.hasErrors = true;
          result.errors[key] = opResult.error;

          continue;
        }

        value = opResult.value;
      }

      if (prop.required && !value) {
        result.hasErrors = true;
        result.errors[key] = 'Required';
        continue;
      }

      if (value !== undefined) {
        result.model[key] = value;
      }
    }

    if (result.hasErrors) {
      result.model = null;
    } else {
      result.errors = null;
    }

    return result as ProcessResult<T>;
  }
}