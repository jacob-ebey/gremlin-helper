declare module 'gremlin' {
  export interface GremlinProperty {
    id: string;
    value: any;
  }

  export interface GremlinResult<T> {
    id: string;
    label: string;
    type: string;
    properties: {
      [key in keyof T]: GremlinProperty[];
    }
  }

  export interface GremlinClient {
    execute<T>(query: string, _: {}, callback: (error: Error, results: GremlinResult<T>[]) => void);
  }
  
  export interface GremlinCreateOptions {
    session: boolean;
    ssl: boolean;
    user: string;
    password: string;
  }

  export type GremlinCreateClient = (
    port: number,
    endpoint: string,
    options: GremlinCreateOptions
  ) => GremlinClient;

  export const createClient: GremlinCreateClient;
}
