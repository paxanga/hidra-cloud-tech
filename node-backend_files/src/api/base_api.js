const Config = require('../util/config');
const fs = require('fs');
const ejs = require('ejs');
const HttpRequest = require('../modules/HttpRequest');
const grafanaAuth = require('../modules/grafanaAuth');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const yaml = require('js-yaml');

const PATH_PROD = '/etc/hidra_exporter/data/'
// DEVELOP BELOW
// const PATH_PROD = __dirname + '/../../../data/hidra_data/'
class BaseApi {
    constructor(app) {
        this.app = app;
        this.app.express[this.getMethod()](this.getRoute(), this.prehandle.bind(this));
        this.HttpRequest = new HttpRequest();
        this.grafanaAuth = new grafanaAuth();
        this.grafanaHeaders = {
            'Authorization': this.CalculateBasicAuthHeader('admin', Config['grafana']['adminPassword']),
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Disable-Provenance': 'true'
        };
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
                    this.grafanaHeaders
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
                this.grafanaHeaders
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
                this.grafanaHeaders
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
                    actualHost: Config.http.host,
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
                    this.grafanaHeaders
                );
            }).catch(error => {
                console.error('Error obtaining datasource:', error);
            });


        } catch (error) {
            console.error('Error creating dashboard:', error);
            return Promise.reject(error);
        }
    }

    createViewerUser() {
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/admin/users`,
                'POST',
                JSON.stringify({
                    'name': 'viewer',
                    'email': 'viewer@localhost',
                    'login': 'viewer',
                    'password': Config.grafana.adminPassword
                }),
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error creating viewer user:', error);
            return Promise.reject(error);
        }
    }

    checkIfViewerUserExists() {
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/users/lookup?loginOrEmail=viewer@localhost`,
                'GET',
                null,
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error checking if user exists:', error);
            return Promise.reject(error);
        }
    }

    getAllContactsPoint() {
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/v1/provisioning/contact-points`,
                'GET',
                null,
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error checking if contact point exists:', error);
            return Promise.reject(error);
        }
    }

    createContactPoint(type) {
        var body;
        switch (type) {
            case 'telegram':
                body = {
                    'name': 'telegram',
                    'type': 'telegram',
                    'settings': {
                        'bottoken': Config.telegram.botToken,
                        'chatId': Config.telegram.chatId
                    },
                    uid: 'telegram'
                };
                break;
            default:
                return Promise.reject({ 'message': 'Invalid type' });
        }
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/v1/provisioning/contact-points`,
                'POST',
                JSON.stringify(body),
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error creating contact point:', error);
            return Promise.reject(error);
        }
    }

    getAlerts() {
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/v1/provisioning/alert-rules`,
                'GET',
                null,
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error getting alerts:', error);
            return Promise.reject(error);
        }
    }

    getNotificationPolicies() {
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/v1/provisioning/policies`,
                'GET',
                null,
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error getting notification policies:', error);
            return Promise.reject(error);
        }
    }

    createNotificationPolicy(json) {
        try {
            return this.getAllContactsPoint().then(async (contacts) => {
                for (var i = 0; i < contacts.length; i++) {
                    if (contacts[i].type === 'telegram') {
                        json.receiver = 'telegram'
                        break;
                    }
                }
                return this.HttpRequest.makeRequest(
                    `${Config['grafana']['url']}:${Config['grafana']['port']}/api/v1/provisioning/policies`,
                    'PUT',
                    JSON.stringify(json),
                    this.grafanaHeaders
                );
            });
        } catch (error) {
            console.error('Error creating notification policy:', error);
            return Promise.reject(error);
        }
    }

    getFolders() {
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/folders`,
                'GET',
                null,
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error getting folders:', error);
            return Promise.reject(error);
        }
    }

    createFolder() {
        try {
            var body = {
                title: "default",
                uid: "default"
            };
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/folders`,
                'POST',
                JSON.stringify(body),
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error creating folder:', error);
            return Promise.reject(error);
        }
    }

    createAlert() {
        try {
            var body = {
                title: "default",
                condition: "C",
                data: [
                    {
                        refId: "A",
                        queryType: "",
                        relativeTimeRange: {
                            from: 300,
                            to: 0
                        },
                        datasourceUid: "XXXXXX",
                        model: {
                            editorMode: "code",
                            expr: "hidra_sample_status",
                            hide: false,
                            instant: true,
                            intervalMs: 1000,
                            maxDataPoints: 43200,
                            range: false,
                            refId: "A"
                        }
                    },
                    {
                        refId: "B",
                        queryType: "",
                        relativeTimeRange: {
                            from: 300,
                            to: 0
                        },
                        datasourceUid: "__expr__",
                        model: {
                            conditions: [
                                {
                                    evaluator: {
                                        params: [],
                                        type: "gt"
                                    },
                                    operator: {
                                        type: "and"
                                    },
                                    query: {
                                        params: [
                                            "B"
                                        ]
                                    },
                                    reducer: {
                                        params: [],
                                        type: "last"
                                    },
                                    type: "query"
                                }
                            ],
                            datasource: {
                                type: "__expr__",
                                uid: "__expr__"
                            },
                            expression: "A",
                            hide: false,
                            intervalMs: 1000,
                            maxDataPoints: 43200,
                            reducer: "last",
                            refId: "B",
                            type: "reduce"
                        }
                    },
                    {
                        refId: "C",
                        queryType: "",
                        relativeTimeRange: {
                            from: 300,
                            to: 0
                        },
                        datasourceUid: "__expr__",
                        model: {
                            conditions: [
                                {
                                    evaluator: {
                                        params: [
                                            1
                                        ],
                                        type: "lt"
                                    },
                                    operator: {
                                        type: "and"
                                    },
                                    query: {
                                        params: [
                                            "C"
                                        ]
                                    },
                                    reducer: {
                                        params: [],
                                        type: "last"
                                    },
                                    type: "query"
                                }
                            ],
                            datasource: {
                                type: "__expr__",
                                uid: "__expr__"
                            },
                            expression: "B",
                            hide: false,
                            intervalMs: 1000,
                            maxDataPoints: 43200,
                            refId: "C",
                            type: "threshold"
                        }
                    }
                ],
                execErrState: "Error",
                folderUID: "default",
                for: "2m",
                noDataState: "NoData",
                orgID: 1,
                ruleGroup: "eval_group_1",
            };
            return this.getFolders().then(async (folders) => {
                for (var i = 0; i < folders.length; i++) {
                    if (folders[i].title == 'default') {
                        return Promise.resolve(folders[i].uid);
                    }
                }
                return this.createFolder().then((folder) => {
                    return folder.uid;
                });
            }).then((folderUID) => {
                body.folderUID = folderUID;
                return this.getDataSOurce().then(async (datasource) => {
                    body.data[0].datasourceUid = datasource.uid;
                    return this.HttpRequest.makeRequest(
                        `${Config['grafana']['url']}:${Config['grafana']['port']}/api/v1/provisioning/alert-rules`,
                        'POST',
                        JSON.stringify(body),
                        this.grafanaHeaders
                    );
                });
            });
        } catch (error) {
            console.error('Error creating alert:', error);
            return Promise.reject(error);
        }
    }

    getActualAlerts() {
        try {
            return this.HttpRequest.makeRequest(
                `${Config['grafana']['url']}:${Config['grafana']['port']}/api/prometheus/grafana/api/v1/rules?limit_alerts=1000`,
                'GET',
                null,
                this.grafanaHeaders
            );
        } catch (error) {
            console.error('Error getting actual alerts:', error);
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

    getAllCheckFiles() {
        console.log("Getting all check files")
        try {
            const files = fs.readdirSync(PATH_PROD);
            return Promise.resolve(files);
        } catch (err) {
            return Promise.reject({ 'message': 'Error al obtener los ficheros', 'error': err });
        }
    }

    readFile(filename) {
        console.log("Reading file: " + PATH_PROD + filename)
        try {
            var data = fs.readFileSync(PATH_PROD + filename, 'utf8');
            data += `filename: ${filename}\n`;
            return Promise.resolve(data);
        }
        catch (err) {
            return Promise.reject({ 'message': 'Error al leer el fichero', 'error': err });
        }
    }

    yamlToJson(YAMLcontent) {
        try {
            return Promise.resolve(yaml.load(YAMLcontent));
        } catch (err) {
            return Promise.reject({ 'message': 'Error al convertir el fichero a JSON', 'error': err });
        }
    }

    deleteCheckFile(filename) {
        console.log("Deleting file: " + PATH_PROD + filename)
        try {
            fs.unlinkSync(PATH_PROD + filename);
            return Promise.resolve({ 'message': 'Fichero eliminado', 'filename': filename });
        } catch (err) {
            return Promise.reject({ 'message': 'Error al eliminar el fichero', 'error': err });
        }
    }

    renameFile(filename, newFilename) {
        console.log("Renaming file: " + PATH_PROD + filename)
        try {
            fs.renameSync(PATH_PROD + filename, PATH_PROD + newFilename);
            return Promise.resolve({ 'message': 'Fichero renombrado', 'filename': filename, 'newFilename': newFilename });
        }
        catch (err) {
            return Promise.reject({ 'message': 'Error al renombrar el fichero', 'error': err });
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
