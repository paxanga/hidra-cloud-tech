const axios = require('axios');


class HttpRequest {
    async makeRequest(url, method = 'GET', data = null, headers = {}, debug = false) {
        try {
            var reqoptions = {
                method: method,
                url: url,
                data: data,
                headers: headers
            }
            if (debug) {
                console.log("request-->", reqoptions)
            }
            const response = await axios(reqoptions);

            if (debug) {
                console.log("response-->", response.data)
            }

            if (response.status >= 200 && response.status < 400) {
                return Promise.resolve(response.data);
            } else {
                return Promise.reject(`La solicitud falló con el código de estado ${response.status}`);
            }
        } catch (error) {
            console.log("request error-->", error.response)
            return Promise.reject(error);
        }
    }
}


module.exports = HttpRequest;
