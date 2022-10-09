declare class JoinTable {
    private resultSet;
    private model;
    private promish;
    setModel(model: any): this;
    setResult(resultSet: any): this;
    join(): this;
    process(values: any, nam: any, tableInst: any, [fkCon, idCon]: [any, any]): Promise<Array<any>>;
    getResult(): Promise<Array<any>>;
}
export default JoinTable;
