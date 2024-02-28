

const BaseApi = require('../base_api');

class ApiGetChecksTable extends BaseApi {

    async handleRequest(req) {
        try {
            return this.getAllCheckFiles()
            .then((files) => {
                // foreach all files and read content
                let promises = [];
                files.forEach((file) => {
                    promises.push(this.readFile(file));
                });
                return Promise.all(promises);
            }).then((contents) => {
                // yml files to json
                let jsons = [];
                contents.forEach((content) => {
                    jsons.push(this.yamlToJson(content));
                });
                return Promise.all(jsons);
            }).then((jsons) => {
                // jsons to table data
                let tableData = [];
                jsons.forEach((json) => {
                    var responseCode = json.steps[2].parameters.statusCode;
                    if (responseCode >= 200 && responseCode < 300) {
                        responseCode = `<span class="badge bg-success">${responseCode}</span>`;
                    } else if (responseCode >= 300 && responseCode < 400) {
                        responseCode = `<span class="badge bg-warning">${responseCode}</span>`;
                    } else {
                        responseCode = `<span class="badge bg-danger">${responseCode}</span>`;
                    }

                    let interval = json.interval;
                    let intervalNumber = interval.match(/\d+/)[0];
                    let intervalUnit = interval.match(/[a-zA-Z]+/)[0];

                    var actions = `<span class="badge bg-primary"><i class="fas fa-edit" onclick="editCheck('${json.filename}', '${json.description}', '${json.steps[1].parameters.url}', 'get', ${json.steps[2].parameters.statusCode}, '${intervalNumber}', '${intervalUnit}');" style="cursor: pointer;"></i></span> <span class="badge bg-danger"><i class="fas fa-trash" data-toggle="modal" data-target="#deleteCheckModal" onclick="deleteCheck('${json.filename}', '${json.steps[1].parameters.url}')" style="cursor: pointer;"></i></span>`;
                    let row = {
                        "dominio": json.steps[1].parameters.url,
                        "intervalo": json.interval,
                        "metodo": "GET",
                        "respuesta": responseCode,
                        "descripción": json.description,
                        "acciones": actions
                    };
                    tableData.push(row);
                });
                return Promise.resolve(tableData);
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
        return 'get';
    }

    getIsProxied() {
        return false;
    }

    getRoute() {
        return "/api/checks/checksTable";
    }
}

module.exports = ApiGetChecksTable;