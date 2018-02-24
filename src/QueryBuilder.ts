import { IEdge } from './Edge';
import { IVertex } from './Vertex';

export class QueryBuilder<T = {}> {
  private prop: number = 0;

  public constructor(
    public query?: string,
    public props: any = {},
    public postfix: string = ''
  ) { }

  public addV(node: IVertex<T>): QueryBuilder<T> {
    if (this.query) {
      throw new Error('addV must be used as the first call.');
    }

    const label = this.getProp();
    this.query = `g.addV(${label})`;
    this.props[label] = node.schema.label;

    return this;
  }

  public addE(edge: IEdge<T>, from: string, to: string): QueryBuilder<T> {
    if (this.query) {
      throw new Error('addE must be used as the first call.');
    }

    const label = this.getProp();
    const fromProp = this.getProp();
    const toProp = this.getProp();
    this.query = `g.V(${fromProp}).addE(${label}).to(g.V(${toProp}))`;
    this.props[label] = edge.schema.label;
    this.props[fromProp] = from;
    this.props[toProp] = to;

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

  public deleteV(vertex: IVertex<T>,id: string): QueryBuilder<T> {
    if (this.query) {
      throw new Error('deleteV must be used as the first call.');
    }

    const label = this.getProp();
    const idProp = this.getProp();
    this.query = `g.V(${idProp}).has('label', ${label}).drop()`;
    this.props[label] = vertex.schema.label;
    this.props[idProp] = id;

    return this;
  }

  public getV(vertex: IVertex<T>, id: string): QueryBuilder<T> {
    if (this.query) {
      throw new Error('getAll must be used as the first call.');
    }

    const label = this.getProp();
    const idProp = this.getProp();
    this.query = `g.V(${idProp}).as('x').has('label', ${label})`
    this.postfix = `.select('x')`;
    this.props[label] = vertex.schema.label;
    this.props[idProp] = id;

    return this;
  }

  public getAllV(node: IVertex<T>): QueryBuilder<T> {
    if (this.query) {
      throw new Error('getAll must be used as the first call.');
    }

    const label = this.getProp();
    this.query = `g.V().as('x').has('label', ${label})`;
    this.postfix = `.select('x')`;
    this.props[label] = node.schema.label;

    return this;
  }

  public has<T2>(prop: keyof T, value: T2): QueryBuilder<T> {
    if (!this.query) {
      throw new Error('has can not be used as the first call.');
    }

    const label = this.getProp();
    const valueProp = this.getProp();
    this.query = `${this.query}.has(${label}, ${valueProp})`;
    this.props[label] = prop;
    this.props[valueProp] = value;

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
