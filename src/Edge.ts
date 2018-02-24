import { IEdgeSchema } from './Schema';

export interface IEdge<T = void> {
  schema: IEdgeSchema<T>;
}

export class Edge<T = void> {
  public constructor(public schema: IEdgeSchema<T>) {
  }
}
