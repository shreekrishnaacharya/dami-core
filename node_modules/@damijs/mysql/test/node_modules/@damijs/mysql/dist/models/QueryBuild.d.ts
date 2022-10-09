declare class QueryBuild {
    private selectQuery;
    private conditionQuery;
    private joinOne;
    private orderByQuery;
    private limitQuery;
    private offsetQuery;
    private groupByQuery;
    private fromQuery;
    private conditionValue;
    private queryString;
    constructor();
    /**
     * select column
     * eg : select("id, name, address as ads")
     * eg : select(["id","name","address as ads"])
     * eg : select("id, name, address as ads",true).select(["phone"],true) : the second arg will reset previously select column
     * @param select : column to be selected
     * @param reset
     * @returns
     */
    select: (select: any[] | string, reset?: boolean) => this;
    /**
     * set table to query
     * @param tableName : table name
     * @returns : current model
     */
    from: (tableName: string) => this;
    /**
     * initial where condition in query
     * all object condition are subject to `AND` condition
     * eg : where({id:5,phone:9812345678})
     * eg : where("id=5 AND phone='9812345678'")
     * @param condition
     * @returns : current model
     */
    where: (condition: object | string) => this;
    /**
   * attached where condition with AND, can also be used as initial
   * all object condition are subject to `AND` condition
   * eg : andWhere({id:5,phone:9812345678})
   * eg : andWhere("id=5 AND phone='9812345678'")
   * @param condition
   * @returns : current model
   */
    andWhere: (condition: object | string) => this;
    /**
   * attached where condition with OR, can also be used as initial
   * all object condition are subject to `AND` condition
   * eg : orWhere({id:5,phone:9812345678})
   * eg : orWhere("id=5 AND phone='9812345678'")
   * @param condition
   * @returns : current model
   */
    orWhere: (condition: string | object) => this;
    /**
   * attached where condition with AND and null value are ignored, can also be used as initial
   * all object condition are subject to `AND` condition
   * eg : andFilterWhere({id:5,phone:9812345678})
   * eg : andFilterWhere("id=5 AND phone='9812345678'")
   * eg : andFilterWhere({id:null}) - this will be ignored
   * @param condition
   * @returns : current model
   */
    andFilterWhere: (condition: object | string | Array<any>) => this;
    /**
   * attached where condition with OR and null value are ignored, can also be used as initial
   * all object condition are subject to `AND` condition
   * eg : andFilterWhere({id:5,phone:9812345678})
   * eg : andFilterWhere("id=5 OR phone='9812345678'")
   * eg : andFilterWhere({id:null}) - this will be ignored
   * @param condition
   * @returns : current model
   */
    orFilterWhere: (condition: object | string | Array<any>) => this;
    /**
     * order by
     * @param orderby : object with key as column value as order type ie ASC or DESC
     * @returns : current model
     */
    orderBy: (orderby: object) => this;
    /**
     *
     * @param limit : number of row to display
     * @returns : current model
     */
    limit: (limit: number) => this;
    /**
     * row number from where the result will start
     * @param offset : offset value
     * @returns : current model
     */
    offset(offset: number): this;
    /**
     * group by
     * @param groupby : name of the column to group or array of column list
     * @returns : current model
     */
    groupBy: (groupby: string | any[]) => this;
    doLeftJoin: (joinPoint: any[]) => this;
    query: (queryString: string, params?: any[]) => this;
    build: (count?: boolean) => string;
    private doJoin;
    private doWhere;
    private removeEmpty;
}
export default QueryBuild;
