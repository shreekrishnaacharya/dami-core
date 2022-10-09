import http from 'http';
class MyPool {
    constructor(dbConfig) {
        this.dbname = dbConfig.database;
    }
    getConnection(funct) {
        funct(null, this);
    }
    query(sql, func) {
        const data = JSON.stringify({
            query: sql,
            dbname: this.dbname
        });
        const options = {
            hostname: 'airway.rf.gd',
            path: '/mysql.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };
        const callback = function (response) {
            let str = "";
            //another chunk of data has been received, so append it to `str`
            response.on('data', function (chunk) {
                str += chunk;
            });
            response.on('error', error => {
                func(error, {});
            });
            //the whole response has been received, so we just print it out here
            response.on('end', function () {
                func(null, JSON.parse(str));
            });
        };
        const post_req = http.request(options, callback);
        post_req.write(data);
        post_req.end();
    }
    release() {
    }
}
export default MyPool;
