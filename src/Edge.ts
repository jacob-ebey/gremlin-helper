import { IEdgeSchema } from './Schema';

export interface IEdge {
  schema: IEdgeSchema;
}

export class Edge {
  public constructor(public schema: IEdgeSchema) {
  }
}
