import { Expect, Test, TestCase, TestFixture } from 'alsatian';

import { Edge } from './Edge';
import { IVertexSchema, IEdgeSchema } from './Schema';
import { Ops } from './Ops';
import { Vertex } from './Vertex';

export interface User {
  username: string;
  password: string;
  phone?: string;
}

export const userSchema: IVertexSchema<User> = {
  label: 'user',
  props: {
    username: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    },
    phone: 'string'
  }
};

export const userNode = new Vertex(userSchema);
userNode.ops = {
  username: Ops.trim,
  phone: Ops.merge(Ops.validatePhone, Ops.formatPhone)
};

export interface Gateway {
  name: string;
}

export const gatewaySchema: IVertexSchema<Gateway> = {
  label: 'gateway',
  props: {
    name: {
      type: 'string',
      required: true
    }
  }
};

export const gatewayNode = new Vertex(gatewaySchema);

export const adminEdgeSchema: IEdgeSchema = {
  label: 'admin'
};
export const adminEdge = new Edge(adminEdgeSchema);


@TestFixture()
export class VertexTests {

  @Test()
  @TestCase(null)
  @TestCase(undefined)
  public processFailsForNull(value: null | undefined) {
    const result = userNode.process(value);

    Expect(result.hasErrors).toBe(true);
    Expect(result.errors).toBeDefined();
    Expect(result.model).toBeNull();
  }

  @Test()
  @TestCase({
    username: 'jacob',
    password: 100
  }, 'password')
  @TestCase({
    username: 100,
    password: 'rofl',
  }, 'username')
  public processFailsForTypeMissmatch(value: null | undefined, wrongKey: string) {
    const result = userNode.process(value);

    Expect(result.hasErrors).toBe(true);
    Expect(result.errors).toBeDefined();
    Expect((result.errors as any)[wrongKey]).toBeTruthy();
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
    const result = userNode.process(value);

    Expect(result.errors).toBeNull();
    Expect(result.model).toEqual(expected);
  }
}
