

const BaseApi = require('../base_api');

class ApiDeleteCheck extends BaseApi {

    async handleRequest(req) {
        try {
            return this.deleteCheckFile(req.body.filename).then((response) => {
                return this.restartContainer();
            }).then((response) => {
                return Promise.resolve({ "message": "Dominio eliminado" });
            }).catch((e) => {
                console.log(e);
                return Promise.reject(e);
            });
        } catch (e) {
            console.log(e);
            return Promise.reject(e);
        }

    }

    getMethod() {
        return 'post';
    }

    getIsProxied() {
        return false;
    }

    getRoute() {
        return "/api/checks/delete";
    }
}

module.exports = ApiDeleteCheck;