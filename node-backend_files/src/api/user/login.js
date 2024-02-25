

const BaseApi = require('../base_api');
const Config = require('../../util/config');

class ApiUserLogin extends BaseApi {

    async handleRequest(req) {
        try {
            var usernames = JSON.parse(Config.usernames);
            
            if (req.body.email in usernames) {
                if (req.body.password === usernames[req.body.email]) {

                    return Promise.resolve({ token: req.body.email });
                }
            }

            return Promise.reject({ message: 'Invalid user or password' });

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