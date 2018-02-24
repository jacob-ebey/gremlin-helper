import { IVertex } from './Vertex';
import { IVertexSchema } from './Schema';
import { GremlinClient, GremlinCreateClient, GremlinResult } from 'gremlin';
import { QueryBuilder } from './QueryBuilder';

export type Result<T> = {
  id: string;
} & T;

// TODO: Add select options:
//   - Add property == value
//   - InEdge from Model
//   - InEdge of type
//   - OutEdge to Model
//   - OutEdge of type

export interface IClient {
  addAsync<T>(model: IVertex<T>, obj: T): Promise<Result<T>>;
  getAsync<T>(model: IVertex<T>, id: string): Promise<Result<T>>;

  executeAsync<T>(model: IVertex<T>, queryBuilder: QueryBuilder<T>): Promise<Result<T>[]>;
}

export interface IClientConfig {
  endpoint: string;
  port: number;
  database: string;
  collection: string;
  primaryKey: string;
}

export class Client implements IClient {
  private client: GremlinClient;

  public constructor(createClient: GremlinCreateClient, config: IClientConfig) {
    this.client = createClient(
      config.port, 
      config.endpoint,
      { 
        "session": false, 
        "ssl": true, 
        "user": `/dbs/${config.database}/colls/${config.collection}`,
        "password": config.primaryKey
      }
    );
  }

  public async addAsync<T>(node: IVertex<T>, obj: T): Promise<Result<T>> {
    return new Promise<Result<T>>(async (resolve, reject) => {
      const { errors, hasErrors, model } = node.process(obj);

      if (hasErrors) return reject(errors);

      const query = new QueryBuilder<T>().addV(node).properties(model);

      try {
        const results = await this.executeAsync(node, query);

        if (results && results.length > 0) return resolve(results[0]);

        return reject('No model returned');
      } catch (error) {
        return reject(error);
      }
    })
  }

  public async getAsync<T>(node: IVertex<T>, id: string): Promise<Result<T>> {
    return new Promise<Result<T>>(async (resolve, reject) => {
      const query = new QueryBuilder<T>().get(id);

      try {
        const results = await this.executeAsync(node, query);

        if (results && results.length > 0) return resolve(results[0]);

        return reject('No model returned');
      } catch (error) {
        return reject(error);
      }
    })
  }

  public executeAsync<T>(node: IVertex<T>, queryBuilder: QueryBuilder<T>): Promise<Result<T>[]> {
    return new Promise<Result<T>[]>((resolve, reject) => {
      console.log(queryBuilder.query + queryBuilder.postfix);

      this.client.execute(queryBuilder.query + queryBuilder.postfix, queryBuilder.props, (error: Error, results: GremlinResult<T>[]) => {
        if (error) return reject(error);

        return resolve(results.map((result: GremlinResult<T>) => transformResult(node.schema, result)));
      })
    })
  }
}

function transformResult<T>(schema: IVertexSchema<T>, value: GremlinResult<T>): Result<T> | null {
  if (!value || schema.label !== value.label) return null;

  const result: any = {
    id: value.id
  };

  for (const prop in schema.props) {
    if (prop in value.properties) {
      result[prop] = value.properties[prop][0].value
    }
  }

  return result as Result<T>;
}
