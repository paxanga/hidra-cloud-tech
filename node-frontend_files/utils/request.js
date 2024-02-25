

class requestAPI {

    requestApi(url, method, body, attempts, endpoint_override) {
        return new Promise((resolve, reject) => {
            async.retry({
                times: attempts,
                interval: function (retryCount) {
                    return 25 * Math.pow(2, retryCount);
                }
            }, (end) => {
                this.makeRequest(url, method, body, endpoint_override)
                    .then((res) => {
                        end(null, res);
                    })
                    .catch(end);

            }, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }

    makeRequest(url, method, body, endpoint_override) {
        let endpoint = endpoint_override ? endpoint_override : this.options.endpoint;
        let startTime = new Date();

        if (url.length) {
            endpoint = _.trimEnd(endpoint, '/');
        }

        return new Promise((resolve, reject) => {
            request({
                url: endpoint + url + "",
                auth: this.getAuth(url),
                method: method,
                body: body,
                qsStringifyOptions: { arrayFormat: 'repeat' },
                headers: this.getRequestHeaders(url),
                timeout: this.getTimeout(),
                json: this.getIsJSON(url),
                agentOptions: this.getRequestAgentOptions(),
                proxy: this.getProxy(),
                strictSSL: false,
            }, (err, response, responseBody) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        if (response.statusCode >= 300 || (new Date()).getTime() - startTime.getTime() > 10000) {
                            EasyDiagnostic.registerAPICall(this.options.code_name, endpoint + url, (new Date()).getTime() - startTime.getTime(), response.statusCode, responseBody);
                        }
                    } catch (e) {
                        console.log("Unable to log in easy diagnostic ");
                        console.log(e);
                    }
                    resolve([response, responseBody]);
                }

            });
        }).then((responseData) => this.handleApiRequestResponse(responseData[0], responseData[1]));
    }

    handleApiRequestResponse(response, body) {

        return new Promise((resolve, reject) => {
            if (response.statusCode != 200 && response.statusCode != 204 && response.statusCode != 201) {
                var statusCode = response.statusCode;
                var message = body.errorMessage;

                if (body.error && body.error.userMessage) {
                    message = body.error.userMessage;
                }
                if (body.error && body.error[0] && body.error[0].userMessage) {
                    message = body.error[0].userMessage;
                }

                reject({
                    code: statusCode,
                    message: message,
                    body,
                });
            } else {
                resolve(body);
            }
        });
    }
}

module.exports = requestAPI;