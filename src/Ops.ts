import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

import { Op, IOpResult } from './Model';
import { IPropDef } from './Schema';

const phoneUtil = PhoneNumberUtil.getInstance();

export class Ops {
  public static merge = <T>(...ops: Op<T>[]): Op<T> => {
    return (prop: IPropDef, value: T) => {
      let result: IOpResult<T> = {
        error: null,
        value
      };

      for (const op of ops) {
        result = op(prop, result.value);

        if (result.error) break;
      }

      return result;
    };
  }

  public static trim: Op<string> = (_: IPropDef, value: string) => ({
    error: null,
    value: value ? value.trim() : value
  });

  public static formatPhone: Op<string> = (_: IPropDef, value: string) => ({
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

    return result;
  };
}
