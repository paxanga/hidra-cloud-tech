

const BaseApi = require('../base_api');
const Config = require('../../util/config');

class ApiUserLogin extends BaseApi {

    async handleRequest(req) {
        try {
            return this.checkIfViewerUserExists()
                .catch((e) => {
                    if (e.response.data.message == "user not found") {
                        return this.createViewerUser();
                    } else {
                        return Promise.reject(e);
                    }
                })
                .then(() => {
                    var usernames = JSON.parse(Config.usernames);

                    if (req.body.email in usernames && req.body.password === usernames[req.body.email]) {
                        return { token: req.body.email };
                    } else {
                        return Promise.reject('Usuario o contraseña incorrectos');
                    }
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
        return "/api/user/login";
    }
}

module.exports = ApiUserLogin;