import { IModel } from './Model';
import { ISchema } from './Schema';
import { GremlinClient, GremlinCreateClient, GremlinResult } from 'gremlin';

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
  getAllAsync<T>(model: IModel<T>): Promise<Result<T>[]>;
  getByIdAsync<T>(model: IModel<T>, id: string): Promise<Result<T>>;
  executeQueryAsync<T>(model: IModel<T>, query: string): Promise<Result<T>[]>;
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

  public getAllAsync<T>(model: IModel<T>): Promise<Result<T>[]> {
    const query = 'g.V().has("label", label)';
    
    return this.executeQueryAsync(model, query, { label: model.schema.label });
  }

  public async getByIdAsync<T>(model: IModel<T>, id: string): Promise<Result<T>> {
    const results = await this.executeQueryAsync(model, 'g.V(id)', { id });

    return results.length ? results[0] : null;
  }

  public executeQueryAsync<T>(model: IModel<T>, query: string, params: any = {}): Promise<Result<T>[]> {
    return new Promise<Result<T>[]>((resolve, reject) => {
      this.client.execute<T>(query, params, (error: Error, results: GremlinResult<T>[]) => {
        if (error) return reject(error);

        return resolve(results.map((result: GremlinResult<T>) => transformResult(model.schema, result)));
      });
    });
  }
}

function transformResult<T>(schema: ISchema<T>, value: GremlinResult<T>): Result<T> | null {
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
