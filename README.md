A wrapper around the gremlin client to introduce model validation and other useful functionality to use within a web api.

## Features

- Full TypeScript definitions
- Model schemas
- Retrieve models in a workable format
- Mockable for testing

## Example

The best way to use gremlin-helper is with TypeScript: https://github.com/jacob-ebey/gremlin-helper-example

```typescript
import { createClient } from 'gremlin';
import { Client, QueryBuilder } from 'gremlin-helper';

import { config } from './config';
import { LocationVertex, UserVertex, VisitedEdge } from './models';

const client: Client = new Client(createClient, config);

async function run() {
  console.log('\nCreating elements...');
  const user1 = await client.addVAsync(UserVertex, { name: 'user1', password: 'pass1' });
  const user2 = await client.addVAsync(UserVertex, { name: 'user2', password: 'pass2' });
  const park = await client.addVAsync(LocationVertex, { name: 'Central Park', latitude: 40.781921, longitude: -73.965542 });
  const museum = await client.addVAsync(LocationVertex, { name: 'The Metropolitan Museum of Art', latitude: 40.779385, longitude: -73.963192 });

  console.log('\nCreating edges...');
  await client.addEAsync(VisitedEdge, user1.id, park.id);
  await client.addEAsync(VisitedEdge, user1.id, museum.id);
  await client.addEAsync(VisitedEdge, user2.id, park.id);

  console.log('\nGetting data...');

  const parkVisitorsQuery = new QueryBuilder().getAllV(UserVertex).hasOutE(VisitedEdge).to(LocationVertex, park.id);
  const parkVisitors = await client.executeAsync(UserVertex, parkVisitorsQuery);
  console.log('\nPark Visitors:');
  console.log(JSON.stringify(parkVisitors, null, 2));

  const museumVisitorsQuery = new QueryBuilder().getAllV(UserVertex).hasOutE(VisitedEdge).to(LocationVertex, museum.id);
  const museumVisitors = await client.executeAsync(UserVertex, museumVisitorsQuery);
  console.log('\nMuseum Visitors');
  console.log(JSON.stringify(museumVisitors, null, 2));

  console.log('\nCleaning up database...');
  await client.deleteVAsync(UserVertex, user1.id);
  await client.deleteVAsync(UserVertex, user2.id);
  await client.deleteVAsync(LocationVertex, park.id);
  await client.deleteVAsync(LocationVertex, museum.id);

  console.log('\nDone...');
}

run().catch(err => console.log(err));

```