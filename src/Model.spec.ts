import { Expect, Test, TestCase, TestFixture } from 'alsatian';

import { ISchema } from './Schema';
import { Ops } from './Ops';
import { Model } from './Model';

export interface User {
  username: string;
  password: string;
  phone?: string;
}

export const userSchema: ISchema<User> = {
  label: 'user',
  props: {
    username: {
      type: 'string',
      required: true
    },
    password: {
      type: 'stirng',
      required: true
    },
    phone: 'string'
  }
}

export const userModel = new Model(userSchema);
userModel.ops = {
  username: Ops.trim,
  phone: Ops.merge(Ops.validatePhone, Ops.formatPhone)
}


@TestFixture()
export class ModelTests {

  @Test()
  @TestCase(null)
  @TestCase(undefined)
  public processFailsForNull(value: null | undefined) {
    const result = userModel.process(value);

    Expect(result.hasErrors).toBe(true);
    Expect(result.errors).toBeDefined();
    Expect(result.model).toBeNull();
  }

  @Test()
  @TestCase(
    {
      username: ' jacob ',
      password: 'rofl'
    },
    {
      username: 'jacob',
      password: 'rofl'
    }
  )
  @TestCase(
    {
      username: ' jacob ',
      password: 'rofl',
      phone: '2065787230'
    },
    {
      username: 'jacob',
      password: 'rofl',
      phone: '+1 206-578-7230'
    }
  )
  public processSucceeds(value: any, expected: any) {
    const result = userModel.process(value);

    Expect(result.errors).toBeNull();
    Expect(result.model).toEqual(expected);
  }
}
