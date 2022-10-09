var DPType;
(function (DPType) {
    DPType["DESC"] = "desc";
    DPType["ASC"] = "asc";
    DPType["RESPONSE"] = "response";
    DPType["REQUEST"] = "request";
    DPType["SORT"] = "sort";
    DPType["SIZE"] = "size";
    DPType["TOTAL_COUNT"] = "total_count";
    DPType["PAGE_SIZE"] = "size";
    DPType["PAGE"] = "page";
})(DPType || (DPType = {}));
export default class DataProvider {
    constructor(config) {
        this.DEFAULT_PAGE_SIZE = 10;
        this.config = Object.assign({ request: null, response: null, size: this.DEFAULT_PAGE_SIZE, page: 1 }, config);
        this.sortBy = { id: DPType.DESC };
        this.request = this.config[DPType.REQUEST];
        this.response = this.config[DPType.RESPONSE];
        if (this.config.hasOwnProperty(DPType.SORT)) {
            this.sortBy = this.config[DPType.SORT];
        }
        this.pageOffset = 0;
        this.pageSize = this.config[DPType.SIZE];
        this.getload();
    }
    setModel(model) {
        this.model = model;
        this.queryModel = model.getBuild();
        this.load(Object.assign({}, this.request.query));
        return this;
    }
    load(query, reset) {
        if (reset === true) {
            this.attributes = this.model.filterAttribute(query);
        }
        else {
            this.attributes = Object.assign(Object.assign({}, (this.attributes)), (this.model.filterAttribute(query)));
        }
    }
    getList() {
        // load query
        const queryAttr = Object.assign({}, (this.attributes));
        const attType = this.model.attributeType();
        for (const nam of Object.keys(queryAttr)) {
            if (attType[nam] == "string") {
                this.queryModel.andFilterWhere(['like', this.model.getTable() + '.' + nam, queryAttr[nam]]);
            }
            else {
                this.queryModel.andFilterWhere({ [this.model.getTable() + '.' + nam]: queryAttr[nam] });
            }
        }
        const promish1 = this.model.getDb().query(this.queryModel.build(true));
        promish1.then((result) => {
            this.totalCount = parseInt(result[0][DPType.TOTAL_COUNT], 10);
            return result[0];
        });
        const sortAttr = this.model.filterAttribute(this.sortBy);
        if (Object.keys(sortAttr).length > 0) {
            this.queryModel.orderBy(sortAttr);
        }
        if (this.pageSize > 0) {
            this.queryModel.limit(this.pageSize);
        }
        else {
            this.queryModel.limit(this.DEFAULT_PAGE_SIZE);
        }
        if (this.pageOffset > -1) {
            this.queryModel.offset(this.pageOffset);
        }
        else {
            this.queryModel.offset(0);
        }
        const promish2 = this.model.setBuild(this.queryModel).all();
        return Promise.all([promish1, promish2]).then((val) => {
            this.response.setHeader('x-pagination-per-page', this.pageSize);
            this.response.setHeader('x-pagination-page-count', val[1].size());
            this.response.setHeader('x-pagination-current-page', this.page);
            this.response.setHeader('x-pagination-total-count', this.totalCount);
            return val[1];
        });
    }
    query(callback) {
        this.queryModel = callback(this.queryModel);
        return this;
    }
    getload() {
        if (this.request.query.hasOwnProperty(DPType.SORT)) {
            const scream = this.request.query.sort.toString();
            if (scream.charAt(0) === '-') {
                this.sortBy = { [scream.substring(1)]: DPType.DESC };
            }
            else {
                this.sortBy = { [scream]: DPType.ASC };
            }
        }
        if (this.request.query.hasOwnProperty(DPType.PAGE_SIZE)) {
            this.pageSize = parseInt(this.request.query.size.toString(), 10);
        }
        if (this.request.query.hasOwnProperty(DPType.PAGE)) {
            this.page = parseInt(this.request.query.page.toString(), 10);
        }
        else {
            this.page = this.config[DPType.PAGE];
        }
        this.pageOffset = (this.page - 1) * this.pageSize;
    }
}
