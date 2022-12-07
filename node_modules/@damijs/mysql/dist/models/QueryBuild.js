import * as mysql from 'mysql';
import { isEmpty } from '@damijs/hp';
class QueryBuild {
    constructor() {
        /**
         * select column
         * eg : select("id, name, address as ads")
         * eg : select(["id","name","address as ads"])
         * eg : select("id, name, address as ads",true).select(["phone"],true) : the second arg will reset previously select column
         * @param select : column to be selected
         * @param reset
         * @returns
         */
        this.select = (select, reset) => {
            if (reset === true) {
                this.selectQuery = [];
            }
            if (typeof select === 'string') {
                this.selectQuery.push(select.split(','));
            }
            else {
                this.selectQuery.push(select);
            }
            return this;
        };
        /**
         * set table to query
         * @param tableName : table name
         * @returns : current model
         */
        this.from = (tableName) => {
            this.fromQuery = tableName;
            return this;
        };
        /**
         * initial where condition in query
         * all object condition are subject to `AND` condition
         * eg : where({id:5,phone:9812345678})
         * eg : where("id=5 AND phone='9812345678'")
         * @param condition
         * @returns : current model
         */
        this.where = (condition) => {
            if (typeof condition === 'string') {
                this.conditionQuery.push({ type: '', format: 'string', condition });
            }
            else {
                this.conditionQuery.push({ type: '', format: 'object', condition });
            }
            return this;
        };
        /**
       * attached where condition with AND, can also be used as initial
       * all object condition are subject to `AND` condition
       * eg : andWhere({id:5,phone:9812345678})
       * eg : andWhere("id=5 AND phone='9812345678'")
       * @param condition
       * @returns : current model
       */
        this.andWhere = (condition) => {
            if (typeof condition === 'string') {
                this.conditionQuery.push({ type: 'AND', format: 'string', condition });
            }
            else {
                this.conditionQuery.push({ type: 'AND', format: 'object', condition });
            }
            return this;
        };
        /**
       * attached where condition with OR, can also be used as initial
       * all object condition are subject to `AND` condition
       * eg : orWhere({id:5,phone:9812345678})
       * eg : orWhere("id=5 AND phone='9812345678'")
       * @param condition
       * @returns : current model
       */
        this.orWhere = (condition) => {
            if (typeof condition === 'string') {
                this.conditionQuery.push({ type: 'OR', format: 'string', condition });
            }
            else {
                this.conditionQuery.push({ type: 'OR', format: 'object', condition });
            }
            return this;
        };
        /**
       * attached where condition with AND and null value are ignored, can also be used as initial
       * all object condition are subject to `AND` condition
       * eg : andFilterWhere({id:5,phone:9812345678})
       * eg : andFilterWhere("id=5 AND phone='9812345678'")
       * eg : andFilterWhere({id:null}) - this will be ignored
       * @param condition
       * @returns : current model
       */
        this.andFilterWhere = (condition) => {
            if (typeof condition === 'string') {
                this.conditionQuery.push({ type: 'AND', format: 'string', condition });
            }
            else if (Array.isArray(condition)) {
                if (!isEmpty(condition[2])) {
                    this.conditionQuery.push({ type: 'AND', format: 'array', condition });
                }
            }
            else {
                const con = this.removeEmpty(condition);
                if (Object.keys(con).length > 0) {
                    this.conditionQuery.push({ type: 'AND', format: 'object', condition });
                }
            }
            return this;
        };
        /**
       * attached where condition with OR and null value are ignored, can also be used as initial
       * all object condition are subject to `AND` condition
       * eg : andFilterWhere({id:5,phone:9812345678})
       * eg : andFilterWhere("id=5 OR phone='9812345678'")
       * eg : andFilterWhere({id:null}) - this will be ignored
       * @param condition
       * @returns : current model
       */
        this.orFilterWhere = (condition) => {
            if (typeof condition === 'string') {
                this.conditionQuery.push({ type: 'OR', format: 'string', condition });
            }
            else if (Array.isArray(condition)) {
                if (!isEmpty(condition[2])) {
                    this.conditionQuery.push({ type: 'OR', format: 'array', condition });
                }
            }
            else {
                const con = this.removeEmpty(condition);
                if (Object.keys(con).length > 0) {
                    this.conditionQuery.push({ type: 'OR', format: 'object', condition });
                }
            }
            return this;
        };
        /**
         * order by
         * @param orderby : object with key as column value as order type ie ASC or DESC
         * @returns : current model
         */
        this.orderBy = (orderby) => {
            const orderList = [];
            for (const ord of Object.keys(orderby)) {
                orderList.push('`' + this.fromQuery + '`.`' + ord + '` ' + orderby[ord]);
            }
            this.orderByQuery = 'ORDER BY ' + orderList.join(',');
            return this;
        };
        /**
         *
         * @param limit : number of row to display
         * @returns : current model
         */
        this.limit = (limit) => {
            this.limitQuery = 'limit ' + limit;
            return this;
        };
        /**
         * group by
         * @param groupby : name of the column to group or array of column list
         * @returns : current model
         */
        this.groupBy = (groupby) => {
            if (typeof groupby === 'string') {
                this.groupByQuery = 'GROUP BY ' + groupby;
            }
            else {
                this.groupByQuery = 'GROUP BY ' + groupby.join(',');
            }
            return this;
        };
        this.doLeftJoin = (joinPoint) => {
            this.joinOne = joinPoint;
            return this;
        };
        this.query = (queryString, params) => {
            this.queryString = queryString;
            if (params !== undefined) {
                this.conditionValue = [...params];
            }
            return this;
        };
        this.build = (count) => {
            if (this.queryString.length > 0) {
                return mysql.format(this.queryString, [...this.conditionValue]);
            }
            let saveInputs = [];
            const joinquery = this.doJoin('');
            let query = '';
            if (count === true) {
                query = 'COUNT(*) as total_count';
            }
            else if (this.selectQuery.length === 0) {
                query += '*';
            }
            else {
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
        this.doJoin = (query) => {
            for (const [, modelIns, condition] of this.joinOne) {
                const model = new modelIns();
                this.selectQuery.push(model.getSelectAs());
                query += `LEFT JOIN ${model.tableName} ON `;
                for (const cn of Object.keys(condition)) {
                    if (cn === "custom") {
                        for (const cn1 of condition[cn]) {
                            query += cn1[0] + " " + cn1[2] + cn1[1] + cn1[3];
                        }
                    }
                    else {
                        query += `${model.tableName}.${cn}=${this.fromQuery}.${condition[cn]} `;
                    }
                }
            }
            return query;
        };
        this.doWhere = () => {
            let where = '';
            this.conditionValue = [];
            for (const cond of this.conditionQuery) {
                if (cond.type === 'raw') {
                    where = '';
                    this.conditionValue = [];
                }
                if (cond.format === 'string') {
                    where += `${cond.type} ${cond.condition} `;
                }
                else {
                    where += `${cond.type} (`;
                    if (Array.isArray(cond.condition)) {
                        if (cond.condition[0] === 'like') {
                            where += ` ${cond.condition[1]} LIKE ?`;
                            this.conditionValue.push(`%${cond.condition[2]}%`);
                        }
                        else {
                            where += ` ${cond.condition[1] + cond.condition[0]}=?`;
                            this.conditionValue.push(cond.condition[2]);
                        }
                        where = where + ')';
                    }
                    else {
                        for (const co of Object.keys(cond.condition)) {
                            if (Array.isArray(cond.condition[co])) {
                                where += ` ${co} IN (?) AND`;
                            }
                            else {
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
                }
                else if (where.substring(0, 2) === 'OR') {
                    where = where.slice(2, where.length);
                }
                return ' WHERE ' + where;
            }
            return '';
        };
        this.removeEmpty = (obj) => {
            return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null && v != ''));
        };
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
    /**
     * row number from where the result will start
     * @param offset : offset value
     * @returns : current model
     */
    offset(offset) {
        this.offsetQuery = 'offset ' + offset;
        return this;
    }
}
export default QueryBuild;
