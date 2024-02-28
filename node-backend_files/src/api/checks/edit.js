

const BaseApi = require('../base_api');
const yaml = require('js-yaml');

class ApiEditCheck extends BaseApi {

    async handleRequest(req) {
        try {
            req.body.description = req.body.name;
            var filename = req.body.filename;
            var checkType = req.body.checkType;

            return this.renameFile(filename, filename + '.old')
            .then((response) => {
                return this.generateJson(req.body, checkType);
            }).then((jsondata) => {
                var ymlcontent = yaml.dump(jsondata);
                return this.saveToFile(filename, ymlcontent);
            }).then((response) => {
                return this.restartContainer();
            }).then((response) => {
                return this.deleteCheckFile(req.body.filename + '.old');
            }).then((response) => {
                return Promise.resolve({ "message": "Check editado" });
            }).catch(async (e) => {
                console.log(e);
                if (await this.fileExists(req.body.filename) && await this.fileExists(req.body.filename + '.old')) {
                    await this.deleteCheckFile(req.body.filename);
                    await this.renameFile(req.body.filename + '.old', req.body.filename);
                } else if (await this.fileExists(req.body.filename + '.old')) {
                    await this.renameFile(req.body.filename + '.old', req.body.filename);
                }

                return Promise.reject(e);
            });


            // return this.deleteCheckFile(req.body.filename).then((response) => {
            //     return this.restartContainer();
            // }).then((response) => {
            //     return Promise.resolve({ "message": "Dominio eliminado" });
            // }).catch((e) => {
            //     console.log(e);
            //     return Promise.reject(e);
            // });
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
        return "/api/checks/edit";
    }
}

module.exports = ApiEditCheck;