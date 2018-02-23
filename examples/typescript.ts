// Import the createClient function from the gremlin library
import { createClient } from 'gremlin';
// Import gremlin-helper classes and interfaces
import { Client, QueryBuilder, Result, Node, Edge, Ops, IClientConfig, INodeSchema, IEdgeSchema } from 'gremlin-helper';

// Define your connection configuration
const config: IClientConfig = {
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
const userSchema: INodeSchema<User> = {
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
      type: 'string',
      required: true
    },
    // Or as just a type if they are not required
    phone: 'string'
  }
}

// Create a model from our schema
const userNode = new Node(userSchema);

// Add some ops that will execute before commiting to the database.
userNode.ops = {
  // Some builtin ops such as trim are provided
  username: Ops.trim,
  // Ops can also be merged
  phone: Ops.merge(Ops.validatePhone, Ops.formatPhone)
}

const friendSchema: IEdgeSchema = {
  label: 'friend'
};

const friendEdge = new Edge(friendSchema);

// Create a client from our config using the default gremlin constructor
const client = new Client(createClient, config);

const getAllUsers = new QueryBuilder().getAll(userNode);

const getUserFriends = new QueryBuilder().getAll(userNode).hasE(friendEdge).toOrFrom(userNode, '2');

client.executeAsync(userNode, getAllUsers)
  .then((results: Result<User>[]) => {
    console.log(JSON.stringify(results, null, 2));

    client.executeAsync(userNode, getUserFriends)
      .then((results: Result<User>[]) => {
        console.log(JSON.stringify(results, null, 2));
      })
      .catch((err: Error) => {
        console.log(err);
      });
  })
  .catch((err: Error) => {
    console.log(err);
  });