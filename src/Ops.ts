import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

import { IPropDef } from './Schema';

const phoneUtil = PhoneNumberUtil.getInstance();

export interface IOpResult<T> {
  error: string | null;
  value: T | null;
}

export type Op<T> = (prop: IPropDef, value: T) => Promise<IOpResult<T>>;

export type ModelOps<T> = {
  [P in keyof T]?: Op<T[P]>;
}

export class Ops {
  public static merge = <T>(...ops: Op<T>[]): Op<T> => {
    return async (prop: IPropDef, value: T) => {
      let result: IOpResult<T> = {
        error: null,
        value
      };

      for (const op of ops) {
        result = await op(prop, result.value);

        if (result.error) break;
      }

      return result;
    };
  }

  public static trim: Op<string> = (_: IPropDef, value: string) => Promise.resolve({
    error: null,
    value: value ? value.trim() : value
  });

  public static formatPhone: Op<string> = (_: IPropDef, value: string) => Promise.resolve({
    error: null,
    value: value ? phoneUtil.format(phoneUtil.parseAndKeepRawInput(value, 'US'), PhoneNumberFormat.INTERNATIONAL) : value
  });

  public static validatePhone: Op<string> = (_: IPropDef, value: string) => {
    const result: IOpResult<string> = {
      error: null,
      value: value
    };

    if (value) {
      result.error = !phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(value, 'US')) ? 'Invalid phone number' : null;
      result.value = result.error ? null : value;
    }

    return Promise.resolve(result);
  };
}
