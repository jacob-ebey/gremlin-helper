import { Op, IOpResult } from './Model';
import { SchemaType } from './Schema';

export type ModelTypeOps = {
  [P in SchemaType]: Op<any>;
}

export const defaultTypeOps: ModelTypeOps = {
  'string': (_: any, value: any) => {
    const result: IOpResult<string> = {
      error: null,
      value: value
    };

    if (value && typeof value !== 'string') {
      result.error = 'Must be a string';
      result.value = null;
    }
    
    return result;
  },

  'number': (_: any, value: any) => {
    const result: IOpResult<number> = {
      error: null,
      value: value
    };

    if (value && typeof value !== 'number') {
      result.error = 'Must be a number';
      result.value = null;
    }
    
    return result;
  },
}
