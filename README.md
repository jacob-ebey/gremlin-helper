A wrapper around the gremlin client to introduce model validation and other useful functionality to use within a web api.

## Features

- Model schemas
- Retrieve models in a workable format
- Mockable for testing

## Getting Started

Install from NPM: https://www.npmjs.com/package/gremlin-helper

```
> npm install --save gremlin gremlin-helper
```

Create a vertex model

```typescript
import { Vertex } from 'gremlin-helper';

interface IPerson {
  name: string;
  phone?: string;
}

const PersonVertex = new Vertex<IPerson>({
  label: 'user',
  props: {
    name: {
      type: 'string',
      required: true
    },
    phone: 'string'
  }
});
```

Add some pre-commit operations

```typescript
import { Ops } from 'gremlin-helper';

PersonVertex.ops = {
  phone: Ops.merge(
    Ops.validatePhone,
    Ops.formatPhone
  )
}
```

Create an edge model

```typescript
import { Edge } from 'gremlin-helper';

const FriendEdge = new Edge({ label: 'friend' })
```

Create a client

```typescript
import { createClient } from 'gremlin';
import { Client } from 'gremlin-helper';

const client = new Client(createClient, config);
```

Create some people

```typescript
const person1 = await client.addVAsync(PersonVertex, {
  name: 'Person 1',
  phone: '800273 8255'
});

const person2 = await client.addVAsync(PersonVertex, {
  name: 'Person 2'
});

const person3 = await client.addVAsync(PersonVertex, {
  name: 'Person 3'
});
```

Create some friend edges

```typescript
// Person 1 friends person 2
await client.addEAsync(FriendEdge, person1.id, person2.id);
// Person 3 friends person 1
await client.addEAsync(FriendEdge, person3.id, person1.id);
```

Get all of person1 friends
```typescript
import { QueryBuilder } from 'gremlin-helper';

// Build a query to get all people that have friended, or have been
// friended by person1
const query = new QueryBuilder()
  .getAllV(PersonVertex)
  .hasE(FriendEdge)
  .toOrFrom(PersonVertex, person1.id);

const friends = await client.executeAsync(PersonVertex, query);
```
