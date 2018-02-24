import { IEdge } from './Edge';
import { IVertex } from './Vertex';

export class QueryBuilder<T = {}> {
  private prop: number = 0;
  public props: any = {};
  public query: string;
  public postfix: string = '';

  public addV(node: IVertex<T>): QueryBuilder<T> {
    if (this.query) {
      throw new Error('addV must be used as the first call.');
    }

    const label = this.getProp();
    this.query = `g.addV(${label})`;
    this.props[label] = node.schema.label;

    return this;
  }

  public properties(obj: T): QueryBuilder<T> {
    if (!this.query) {
      throw new Error('props can not be used as the first call.');
    }

    for (const key in obj) {
      const keyProp = this.getProp();
      const valueProp = this.getProp();
      this.query = `${this.query}.property(${keyProp}, ${valueProp})`;
      this.props[keyProp] = key;
      this.props[valueProp] = obj[key];
    }

    return this;
  }

  public get(id: string): QueryBuilder<T> {
    if (this.query) {
      throw new Error('getAll must be used as the first call.');
    }

    const idProp = this.getProp();
    this.query = `g.V(${idProp}).as('x')`
    this.postfix = `.select('x')`;
    this.props[idProp] = id;

    return this;
  }

  public getAll(node: IVertex<T>): QueryBuilder<T> {
    if (this.query) {
      throw new Error('getAll must be used as the first call.');
    }

    const label = this.getProp();
    this.query = `g.V().as('x').has('label', ${label})`;
    this.postfix = `.select('x')`;
    this.props[label] = node.schema.label;

    return this;
  }

  public hasE(edge: IEdge): QueryBuilder<T> {
    if (!this.query) {
      throw new Error('hasE can not be used as the first call.');
    }

    const label = this.getProp();
    this.query = `${this.query}.bothE().has('label', ${label})`
    this.props[label] = edge.schema.label;

    return this;
  }

  public toOrFrom<T2>(node: IVertex<T2>, id?: string): QueryBuilder<T> {
    if (!this.query) {
      throw new Error('to can not be used as the first call.');
    }

    const label = this.getProp();
    this.query = `${this.query}.bothV().has('label', ${label})`;
    this.props[label] = node.schema.label;

    if (id) {
      const idProp = this.getProp();
      this.query = `${this.query}.has('id', ${idProp})`
      this.props[idProp] = id;
    }

    return this;
  }

  public hasOutE(edge: IEdge): QueryBuilder<T> {
    if (!this.query) {
      throw new Error('hasOutE can not be used as the first call.');
    }

    const label = this.getProp();
    this.query = `${this.query}.outE().has('label', ${label})`
    this.props[label] = edge.schema.label;

    return this;
  }

  public to<T2>(node: IVertex<T2>, id?: string): QueryBuilder<T> {
    if (!this.query) {
      throw new Error('to can not be used as the first call.');
    }

    const label = this.getProp();
    this.query = `${this.query}.inV().has('label', ${label})`;
    this.props[label] = node.schema.label;

    if (id) {
      const idProp = this.getProp();
      this.query = `${this.query}.has('id', ${idProp})`
      this.props[idProp] = id;
    }

    return this;
  }

  public hasInE(edge: IEdge): QueryBuilder<T> {
    if (!this.query) {
      throw new Error('hasInE can not be used as the first call.');
    }

    const label = this.getProp();
    this.query = `${this.query}.inE().has('label', ${label})`
    this.props[label] = edge.schema.label;

    return this;
  }

  public from<T2>(node: IVertex<T2>, id?: string): QueryBuilder<T> {
    if (!this.query) {
      throw new Error('from can not be used as the first call.');
    }

    const label = this.getProp();
    this.query = `${this.query}.outV().has('label', ${label})`;
    this.props[label] = node.schema.label;

    if (id) {
      const idProp = this.getProp();
      this.query = `${this.query}.has('id', ${idProp})`
      this.props[idProp] = id;
    }

    return this;
  }

  private getProp() {
    return `prop${ this.prop++ }`;
  }
}
