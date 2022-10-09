class JoinTable {
    constructor() {
        this.resultSet = [];
        this.model = null;
        this.promish = [];
    }
    setModel(model) {
        this.model = model;
        return this;
    }
    setResult(resultSet) {
        //  console.log("hello1");
        this.resultSet = resultSet;
        return this;
    }
    join() {
        this.model.joinMany.forEach(([name, table, [fkCon, _id]]) => {
            const values = [];
            this.resultSet.forEach((r) => {
                values.push(r[_id]);
            });
            this.process(values, name, table, [fkCon, _id]);
        });
        return this;
    }
    process(values, nam, tableInst, [fkCon, idCon]) {
        values = values.filter((e) => (e === null ? false : true));
        if (values.length === 0) {
            return;
        }
        const table = new tableInst();
        const promise = table
            .find((query) => {
            return query.where(`${table.tableName}.${fkCon} IN (${values.join(',')})`);
        })
            .asModel(false)
            .all()
            .then((e) => {
            const re = {};
            e.forEach((es) => {
                if (!re.hasOwnProperty(es[fkCon])) {
                    re[es[fkCon]] = [];
                }
                re[es[fkCon]].push(es);
            });
            this.resultSet.map((r) => {
                if (re.hasOwnProperty(r[idCon])) {
                    r[nam] = re[r[idCon]];
                }
                else {
                    r[nam] = [];
                }
                return r;
            });
        })
            .catch((e) => console.log(e));
        this.promish.push(promise);
        // console.log("hello2");
    }
    getResult() {
        this.join();
        if (this.promish.length === 0) {
            return Promise.resolve(this.resultSet);
        }
        else {
            return Promise.all(this.promish).then((r) => {
                return this.resultSet;
            });
        }
    }
}
export default JoinTable;
