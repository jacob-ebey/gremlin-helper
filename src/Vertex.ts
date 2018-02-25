import { ModelOps } from './Ops';
import { IVertexSchema, IPropDef } from './Schema';
import { ModelTypeOps, defaultTypeOps } from './TypeOps';

export interface ProcessResult<T> {
  hasErrors: boolean;
  errors: {
    [P in keyof T]: string | null;
  };
  model: T | null;
}

export interface IVertex<T = void> {
  schema: IVertexSchema<T>;
  ops: ModelOps<T>;
  processAsync(obj: any): Promise<ProcessResult<T>>
}

export class Vertex<T = void> implements IVertex<T> {
  public constructor(public schema: IVertexSchema<T>, public types: ModelTypeOps = defaultTypeOps) {
  }

  public ops: ModelOps<T>;

  public async processAsync(obj: any): Promise<ProcessResult<T>> {
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

      if (this.types && prop.type in this.types) {
        const opResult = await this.types[prop.type](prop, value);

        if (opResult.error) {
          result.hasErrors = true;
          result.errors[key] = opResult.error;

          continue;
        }

        value = opResult.value;
      }

      if (this.ops && key in this.ops && typeof this.ops[key] === 'function') {
        const opResult = await this.ops[key](prop, value);

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