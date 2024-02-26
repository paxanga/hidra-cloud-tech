

const BaseApi = require('../base_api');
const Config = require('../../util/config');

class ApiUserGetToken extends BaseApi {

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

                    if (req.body.username in usernames) {
                        return Promise.resolve({ "token": this.grafanaAuth.generateToken() });
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
        return "/api/user/getToken";
    }
}

module.exports = ApiUserGetToken;