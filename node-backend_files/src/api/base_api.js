const Config = require('../util/config');
const fs = require('fs');
const ejs = require('ejs');
const HttpRequest = require('../modules/HttpRequest');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const PATH_PROD = '/etc/hidra_exporter/data/'
// DEVELOP BELOW
// const PATH_PROD = __dirname + '/../../../data/hidra_data/'
class BaseApi {
    constructor(app) {
        this.app = app;
        this.app.express[this.getMethod()](this.getRoute(), this.prehandle.bind(this));
        this.HttpRequest = new HttpRequest();
    }

    verifyRequest(req) {
        if (this.getIsProxied()) {
            if (Config['tlsproxy']['secret'] != req.headers['proxysecret']) {
                return Promise.reject({ 'statusCode': 403, 'message': 'Unable to call private method' });
            }
        }

        return Promise.resolve();
    }

    prehandle(req, res) {
        return this.verifyRequest(req)
            .then(_ => this.handleRequest(req))
            .then(data => {
                res.send(data);
            })
            .catch(data => {
                let statusCode = 500;

                if (data.hasOwnProperty('statusCode')) {
                    statusCode = data['statusCode'];
                    delete data['statusCode'];
                }

                res.status(statusCode).send(data);
            });
    }

    verifySecret(req, iccid) {
        if (!this.getIsProxiedAuthenticated()) {
            return Promise.resolve();
        }

        return Credentials.Model.findOne({
            where: { iccid }
        })
            .then(row => {
                // Should be verified before continuing.
                if (!row) {
                    return Promise.resolve();
                }

                if (req.headers['clientsecret'] != btoa(row['psk'])) {

                }
                return Promise.resolve();
            });
    }

    handleRequest(req) {
        return Promise.resolve({});
    }

    getIsProxied() {
        return false;
    }

    getIsProxiedAuthenticated() {
        return false;
    }

    getMethod() {
        return 'post';
    }

    getRoute() {
        throw "Not implemented";
    }

    getChecksTypes() {
        return ['http', 'ping', 'tcp'];
    }

    queryPrometheus(query) {
        try {
            return this.getDataSOurce().then(async (datasource) => {
                return this.HttpRequest.makeRequest(
                    `${Config['grafana']['url']}:${Config['grafana']['port']}/api/datasources/proxy/${datasource.id}/api/v1/query?query=${encodeURIComponent(query)}`,
                    'GET',
                    null,
                    {
                        'Authorization': this.CalculateBasicAuthHeader('admin', Config['grafana']['adminPassword']),
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                );
            });
        } catch (error) {
            console.error('Error querying Prometheus:', error);
            return Promise.reject(error);
        }
    }

    getDashboardByName(name) {
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/search?query=${name}`,
                'GET',
                null,
                {
                    'Authorization': this.CalculateBasicAuthHeader('admin', Config['grafana']['adminPassword']),
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            );
        } catch (error) {
            console.error('Error querying Grafana:', error);
            return Promise.reject(error);
        }
    }

    getDataSOurce() {
        try {
            var datasourceUID = {};
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/datasources`,
                'GET',
                null,
                {
                    'Authorization': this.CalculateBasicAuthHeader('admin', Config['grafana']['adminPassword']),
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            ).then((datasource) => {
                if (datasource.length == 0) {
                    return Promise.reject({ 'message': 'No datasource found' });
                }
                for (const ds of datasource) {
                    if (ds.name == 'prometheus_hidra') {
                        datasourceUID.id = ds.id;
                        datasourceUID.uid = ds.uid;
                        break;
                    }
                }
                return datasourceUID;
            });
        } catch (error) {
            console.error('Error getting datasources:', error);
            return Promise.reject(error);
        }
    }

    async createDashboard(name, type) {
        try {
            return this.getDataSOurce().then(async (datasource) => {
                var variables = {
                    datasourceUID: datasource.uid,
                    name: name,
                    dashboardUID: name.substring(0, 35),
                };
                return new Promise((resolve, reject) => {
                    ejs.renderFile(__dirname + '/../dashboards/' + type + '.json', variables, {}, function (err, str) {
                        if (err) {
                            console.error('Error rendering template:', err);
                            reject(err);
                        } else {
                            resolve(str);
                        }
                    });
                });
            }).then(async (template) => {
                return this.HttpRequest.makeRequest(
                    `${Config['grafana']['url']}:${Config['grafana']['port']}/api/dashboards/db`,
                    'POST',
                    template,
                    {
                        'Authorization': this.CalculateBasicAuthHeader('admin', Config['grafana']['adminPassword']),
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                );
            }).catch(error => {
                console.error('Error obtaining datasource:', error);
            });


        } catch (error) {
            console.error('Error creating dashboard:', error);
            return Promise.reject(error);
        }
    }

    CalculateBasicAuthHeader(username, password) {
        return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
    }

    generateJson(data, type) {
        switch (type) {
            case 'http':
                return {
                    'description': data.description,
                    'tags': {
                        'tenant': 'hidra'
                    },
                    'interval': data.checkInterval + data.timeType,
                    'timeout': '10s',
                    'retry': 3,
                    'steps': [
                        {
                            'plugin': 'http',
                            'action': 'followRedirects',
                            'parameters': {}
                        },
                        {
                            'plugin': 'http',
                            'action': 'request',
                            'parameters': {
                                'url': data.url
                            }
                        },
                        {
                            'plugin': 'http',
                            'action': 'statusCodeShouldBe',
                            'parameters': {
                                'statusCode': data.expectedStatusCode
                            }
                        },
                        {
                            'plugin': 'icmp',
                            'action': 'traceroute',
                            'parameters': {
                                // delete all "/" and "https" and "http" from url and get only hostname
                                'hostname': data.url.replace(/(^\w+:|^)\/\//, '').replace(/\//g, '')
                            }
                        }
                    ]
                };
            default:
                throw "Invalid type";
        }
    }

    saveToFile(filename, data) {
        console.log("saving file: " + PATH_PROD + filename)
        fs.writeFile(PATH_PROD + filename, data, function (err) {
            if (err) {
                console.log("Error giardando fichero: " + err);
                return { 'message': 'Error giardando fichero', 'error': err }
            }
            console.log("The file was saved!");
        });
        return { 'message': 'File saved', 'filename': filename };
    }

    fileExists(filename) {
        console.log("checking if file exists: " + PATH_PROD + filename);
        try {
            if (fs.existsSync(PATH_PROD + filename)) {
                return { 'message': 'El fichero ya existe', 'filename': filename, 'error': true };
            }
        } catch (err) {
            return { 'message': 'Error comprobando si el fichero existe', 'error': err };
        }
    }

    // Función para reiniciar un contenedor por nombre
    async restartContainer() {
        const containerName = 'hidra-cloud-tech_hidra';
        await docker.listContainers(function (err, containers) {
            if (err) {
                return { 'message': 'Error al listar los contenedores', 'error': err };
            }
            containers.forEach(async function (containerInfo) {
                if (containerInfo.Image == containerName) {
                    const container = docker.getContainer(containerInfo.Id);
                    await container.restart(function (err) {
                        if (err) {
                            console.log("Error al reiniciar el contenedor: " + err)
                            return { 'message': 'Error al reiniciar el contenedor', 'error': err };
                        }
                        console.log("Contenedor reiniciado")
                        return { 'message': 'Contenedor reiniciado' };
                    });
                }
            });
        });
    }
}

module.exports = BaseApi;
