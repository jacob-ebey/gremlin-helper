A wrapper around the gremlin client to introduce model validation and other useful functionality to use within a web api.

## Features

- Full TypeScript definitions
- Model schemas
- Retrieve models in a workable format
- Mockable for testing

## Usage

The best way to use gremlin-helper is with TypeScript:

```typescript
// Import the createClient function from the gremlin library
import { createClient } from 'gremlin';
// Import gremlin-helper classes and interfaces
import { Client, Result, Model, Ops, IConfig, ISchema } from 'gremlin-helper';

// Define your connection configuration
const config: IConfig = {
  endpoint: 'your.endpoint.without.prefix.com',
  port: 443,
  database: 'your-db',
  collection: 'your-collection',
  primaryKey: 'YourPrimaryKeyGoesHere=='
};

// Define our user model interface
interface User {
  username: string;
  password: string;
  phone?: string;
}

// Define our database schema
const userSchema: ISchema<User> = {
  // This is the label (type) of the node in the graph
  label: 'user',
  // Custom properties the node has
  props: {
    // They can be defined as objects to mark as required
    username: {
      type: 'string',
      required: true
    },
    password: {
      type: 'stirng',
      required: true
    },
    // Or as just a type if they are not required
    phone: 'string'
  }
}

// Create a model from our schema
const userModel = new Model(userSchema);

// Add some ops that will execute before commiting to the database.
userModel.ops = {
  // Some builtin ops such as trim are provided
  username: Ops.trim,
  // Ops can also be merged
  phone: Ops.merge(Ops.validatePhone, Ops.formatPhone)
}

// Create a client from our config using the default gremlin constructor
const client = new Client(createClient, config);

// Get all users from the graph
client.getAllAsync(userModel)
  .then((results: Result<User>[]) => {
    // Format and print
    console.log(JSON.stringify(results, null, 2));
  })
  .catch((err: Error) => {
    console.log(err);
  });
```