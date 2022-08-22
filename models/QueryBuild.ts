import * as mysql from 'mysql';
class QueryBuild {
  private selectQuery: any[];
  private conditionQuery: any[];
  private joinOne: any[];
  private orderByQuery: string;
  private limitQuery: string;
  private offsetQuery: string;
  private groupByQuery: string;
  private fromQuery: string;
  private conditionValue: any[];
  private queryString: string;

  constructor() {
    this.selectQuery = [];
    this.conditionQuery = [];
    this.conditionValue = [];
    this.joinOne = [];
    this.orderByQuery = '';
    this.limitQuery = '';
    this.groupByQuery = '';
    this.fromQuery = '';
    this.queryString = '';
    this.offsetQuery = '';
    return this;
  }

  select = (select: any[] | string, reset?: boolean) => {
    if (reset === true) {
      this.selectQuery = [];
    }
    if (typeof select === 'string') {
      this.selectQuery.push(select.split(','));
    } else {
      this.selectQuery.push(select);
    }
    return this;
  };

  from = (tableName: string): this => {
    this.fromQuery = tableName;
    return this;
  };

  where = (condition: object | string): this => {
    if (typeof condition === 'string') {
      this.conditionQuery.push({ type: '', format: 'string', condition });
    } else {
      this.conditionQuery.push({ type: '', format: 'object', condition });
    }
    return this;
  };
  andWhere = (condition: object | string): this => {
    if (typeof condition === 'string') {
      this.conditionQuery.push({ type: 'AND', format: 'string', condition });
    } else {
      this.conditionQuery.push({ type: 'AND', format: 'object', condition });
    }
    return this;
  };

  orWhere = (condition: string | object): this => {
    if (typeof condition === 'string') {
      this.conditionQuery.push({ type: 'OR', format: 'string', condition });
    } else {
      this.conditionQuery.push({ type: 'OR', format: 'object', condition });
    }
    return this;
  };

  andFilterWhere = (condition: object | string): this => {
    if (typeof condition === 'string') {
      this.conditionQuery.push({ type: 'AND', format: 'string', condition });
    } else if (Object.keys(this.removeEmpty(condition)).length > 0) {
      this.conditionQuery.push({ type: 'AND', format: 'object', condition });
    }
    return this;
  };

  orFilterWhere = (condition: object | string): this => {
    if (typeof condition === 'string') {
      this.conditionQuery.push({ type: 'OR', format: 'string', condition });
    } else if (Object.keys(this.removeEmpty(condition)).length > 0) {
      this.conditionQuery.push({ type: 'OR', format: 'object', condition });
    }
    return this;
  };

  orderBy = (orderby: object): this => {
    const orderList = [];
    for (const ord of Object.keys(orderby)) {
      orderList.push('`' + this.fromQuery + '`.`' + ord + '` ' + orderby[ord]);
    }
    this.orderByQuery = 'ORDER BY ' + orderList.join(',');
    return this;
  };

  limit = (limit: number): this => {
    this.limitQuery = 'limit ' + limit;
    return this;
  };

  offset(offset: number): this {
    this.offsetQuery = 'offset ' + offset;
    return this;
  }

  groupBy = (groupby: string | any[]): this => {
    if (typeof groupby === 'string') {
      this.groupByQuery = 'GROUP BY ' + groupby;
    } else {
      this.groupByQuery = 'GROUP BY ' + groupby.join(',');
    }
    return this;
  };

  doLeftJoin = (joinPoint: any[]) => {
    this.joinOne = joinPoint;
    return this;
  };

  query = (queryString: string, params?: any[]): this => {
    this.queryString = queryString;
    if (params !== undefined) {
      this.conditionValue = [...params];
    }
    return this;
  };

  build = (count?: boolean): string => {
    if (this.queryString.length > 0) {
      return mysql.format(this.queryString, [...this.conditionValue]);
    }
    let saveInputs = [];
    const joinquery = this.doJoin('');
    let query = '';
    if (count === true) {
      query = 'COUNT(*) as total_count';
    } else if (this.selectQuery.length === 0) {
      query += '*';
    } else {
      for (const sq of this.selectQuery) {
        query += sq.join(',') + ',';
      }
      query = query.slice(0, query.length - 1);
    }
    query = 'SELECT ' + query + ' FROM `' + this.fromQuery + '` ';
    query += joinquery;
    const wquery = this.doWhere();
    saveInputs = [...saveInputs, ...this.conditionValue];
    query += wquery;
    query += this.groupByQuery + ' ';
    query += this.orderByQuery + ' ';
    query += this.limitQuery + ' ';
    query += this.offsetQuery + ' ';
    query = mysql.format(query.trim(), saveInputs);
    return query;
  };

  private doJoin = (query: string): string => {
    for (const [, modelIns, condition] of this.joinOne) {
      const model = new modelIns()
      this.selectQuery.push(model.getSelectAs());
      query += `LEFT JOIN ${model.tableName} ON `;
      for (const cn of Object.keys(condition)) {
        if (cn === "custom") {
          for (const cn1 of condition[cn]) {
            query += cn1[0] + " " + cn1[2] + cn1[1] + cn1[3];
          }
        } else {
          query += `${model.tableName}.${cn}=${this.fromQuery}.${condition[cn]} `;
        }
      }
    }
    return query;
  };

  private doWhere = (): string => {
    let where = '';
    this.conditionValue = [];
    for (const cond of this.conditionQuery) {
      if (cond.type === 'raw') {
        where = '';
        this.conditionValue = [];
      }
      if (cond.format === 'string') {
        where += `${cond.type} ${cond.condition} `;
      } else {
        where += `${cond.type} (`;
        if (Array.isArray(cond.condition)) {
          if (cond.condition[0] === 'like') {
            where += ` ${cond.condition[1]} LIKE ?`;
            this.conditionValue.push(`%${cond.condition[2]}%`);
          } else {
            where += ` ${cond.condition[1] + cond.condition[0]}=?`;
            this.conditionValue.push(cond.condition[2]);
          }
          where = where + ')';
        } else {
          for (const co of Object.keys(cond.condition)) {
            if (Array.isArray(cond.condition[co])) {
              where += ` ${co} IN (?) AND`;
            } else {
              where += ` ${co}=? AND`;
            }
            this.conditionValue.push(cond.condition[co]);
          }
          where = where.slice(0, where.length - 3) + ')';
        }
      }
    }
    if (where.length > 0) {
      if (where.substring(0, 3) === 'AND') {
        where = where.slice(3, where.length);
      } else if (where.substring(0, 2) === 'OR') {
        where = where.slice(2, where.length);
      }
      return ' WHERE ' + where;
    }
    return '';
  };

  private removeEmpty = (obj: object): object => {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
  };
}

export default QueryBuild;
