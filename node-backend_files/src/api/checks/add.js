const md5 = require('md5');
const BaseApi = require('../base_api');
const yaml = require('js-yaml');
md5hash = require('md5');
class ApiAddChecks extends BaseApi {

    async handleRequest(req) {
        try {
            var body = req.body;
            req.body.description = req.body.name;

            var checkType = req.body.checkType;
            switch (checkType) {
                case 'http':
                    // md5hash of checkType+url+method+description
                    var hash = md5hash(checkType + req.body.url + req.body.method + req.body.description);
                    // cut hash to 8 chars
                    hash = hash.substring(0, 8);
                    // replace all character except alphanumeric and _ with _
                    var tmp_filename = req.body.url.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
                    var filename = 'http_' + tmp_filename + hash + '.yml';
                    break;
            }

            // check if file exists
            var fileExists = await this.fileExists(filename);
            if (fileExists && fileExists.hasOwnProperty('error')) {
                return Promise.reject(fileExists);
            }

            // generate JSON from request body
            var jsondata = this.generateJson(req.body, checkType);
            // convert to YML
            var ymlcontent = yaml.dump(jsondata);

            var savefile = await this.saveToFile(filename, ymlcontent);
            if (savefile.hasOwnProperty('error')) {
                return Promise.reject(savefile);
            }

 
            if (await this.restartContainer().hasOwnProperty('error')) {
                return Promise.reject(restartContainer);
            }
            return Promise.resolve({ "message": "Check added" });
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
        return "/api/add/checks";
    }
}

module.exports = ApiAddChecks;
