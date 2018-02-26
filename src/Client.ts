import { GremlinClient, GremlinCreateClient, GremlinResult } from 'gremlin';

import { IEdge } from './Edge';
import { QueryBuilder } from './QueryBuilder';
import { IVertexSchema, IEdgeSchema } from './Schema';
import { IVertex } from './Vertex';

export type Result<T> = {
  id: string;
  _label: string;
  _type: string;
} & T;

export interface IClient {
  addEAsync(edge: IEdge, from: string, to: string): Promise<void>;
  addVAsync<T>(vertex: IVertex<T>, obj: T): Promise<Result<T>>;
  updateVAsync<T>(vertex: IVertex<T>, id: string, obj: T): Promise<Result<T>>;
  deleteVAsync<T>(vertex: IVertex<T>, id: string): Promise<void>;
  getVAsync<T>(vertex: IVertex<T>, id: string): Promise<Result<T>>;

  executeAsync<T>(model: IVertex<T> | IEdge<T>, queryBuilder: QueryBuilder<T>): Promise<Result<T>[]>;
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

  public async addEAsync<T>(edge: IEdge<T>, from: string, to: string): Promise<Result<T>> {
    const query = new QueryBuilder<T>().addE(edge, from, to);

    const results = await this.executeAsync(edge, query);

    if (results && results.length > 0) return results[0];

    throw new Error('No model returned');
  }

  public async addVAsync<T>(vertex: IVertex<T>, obj: T): Promise<Result<T>> {
    const { errors, hasErrors, model } = await vertex.processAsync(obj);

    if (hasErrors) throw {
      ...(errors as any),
      message: 'Error processing model'
    };

    const query = new QueryBuilder<T>().addV(vertex).properties(model);

    const results = await this.executeAsync(vertex, query);

    if (results && results.length > 0) return results[0];

    throw new Error('No model returned');
  }

  public async updateVAsync<T>(vertex: IVertex<T>, id: string, obj: T): Promise<Result<T>> {
    const { errors, hasErrors, model } = await vertex.processAsync(obj);

    if (hasErrors) throw {
      ...(errors as any),
      message: 'Error processing model'
    };

    const query = new QueryBuilder<T>().getV(vertex, id).properties(model);

    const results = await this.executeAsync(vertex, query);

    if (results && results.length > 0) return results[0];

    throw new Error('No model returned');
  }

  public async deleteVAsync<T>(vertex: IVertex<T>, id: string): Promise<void> {
    const query = new QueryBuilder<T>().deleteV(vertex, id);

    await this.executeAsync(vertex, query);
  }

  public async getVAsync<T>(vertex: IVertex<T>, id: string): Promise<Result<T>> {
    const query = new QueryBuilder<T>().getV(vertex, id);

    const results = await this.executeAsync(vertex, query);

    if (results && results.length > 0) return results[0];

    throw new Error('No model returned');
  }

  public executeAsync<T>(model: IVertex<T> | IEdge<T>, queryBuilder: QueryBuilder<T>): Promise<Result<T>[]> {
    return new Promise<Result<T>[]>((resolve, reject) => {
      this.client.execute(queryBuilder.query + queryBuilder.postfix, queryBuilder.props, (error: Error, results: GremlinResult<T>[]) => {
        if (error) return reject(error);

        return resolve(results.map((result: GremlinResult<T>) => transformResult(model.schema, result)));
      })
    })
  }
}

function transformResult<T>(schema: IVertexSchema<T> | IEdgeSchema<T>, value: GremlinResult<T>): Result<T> | null {
  if (!value || schema.label !== value.label) return null;

  const result: Result<T> | { [key: string]: any } = {
    id: value.id,
    _type: value.type,
    _label: value.label
  };

  if (schema.props) {
    for (const prop in schema.props) {
      if (prop in value.properties) {
        result[prop] = (value.properties as any)[prop][0].value
      }
    }
  }

  return result as Result<T>;
}
