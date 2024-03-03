'use strict';
const tls = require('tls');
const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const config = require('./src/util/config');
const bodyParser = require('body-parser');
const moment = require('moment');
const ApiAddChecks = require('./src/api/checks/add');
const ApiGetloadPrincipalPanel = require('./src/api/actual_status/loadPrincipalPanel');
const ApiUserLogin = require('./src/api/user/login');
const ApiUserGetToken = require('./src/api/user/getToken');
const ApiGetChecksTable = require('./src/api/checks/checksTable');
const ApiDeleteCheck = require('./src/api/checks/delete');
const ApiEditCheck = require('./src/api/checks/edit');
const ApiGetAlertsTable = require('./src/api/alerts/alertsTable');

class App {

    constructor() {
        this.express = express();
        this.express.use(bodyParser.json());

        this.express.use((req, res, next) => {
            let ip, date, method, url;

            ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            date = moment().format();
            method = req.method;
            url = req.url;

            console.log("<-- | " + ip + " - - " + date + " - - \"" + method + " " + url + "\" - - " + JSON.stringify(req.body));
            next();
        });

        // cors
        this.express.options('*', function (req, res) {
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.header('Access-Control-Allow-Origin', '*');
            // X-Frame-Options
            res.header('X-Frame-Options', 'ALLOWALL');
            res.sendStatus(200);
        });

        this.express.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "http://localhost:3002");

            res.header("Access-Control-Allow-Headers", "*");
            next();
        });

        this.server = http.createServer(config.http, this.express);

        // Attach Socket.IO to the HTTP server
        // add cors origin 127.0.0.1 and localhost
        this.io = socketIo(this.server, {
            cors: {
                origin: ["http://127.0.0.1:3002", "http://localhost:3002"],
                credentials: true
            }
        });

        this.initializeMethods();
    }

    initializeMethods() {
        new ApiAddChecks(this);
        new ApiGetloadPrincipalPanel(this);
        new ApiUserLogin(this);
        new ApiUserGetToken(this);
        new ApiGetChecksTable(this);
        new ApiDeleteCheck(this);
        new ApiEditCheck(this);
        new ApiGetAlertsTable(this);
    }

    async startWebServer() {
        console.log('Starting web server on port ' + config.http.port);

        // Start the combined Express and Socket.IO server
        return this.server.listen(config.http.port, () => {
            console.log('Web server listening on port ' + config.http.port);
        });
    }
}

module.exports = App;
