const BaseApi = require('../base_api');

class ApiGetPassingFailedScenarios extends BaseApi {

    async handleRequest(req) {
        try {
            var common_dashboard = await this.getDashboardByName("common_dashboard");
            if (common_dashboard.length == 0) {
                console.log("No dashboard found for common_dashboard");
                common_dashboard = await this.createDashboard("common_dashboard", "common_dashboard");
            } else {
                common_dashboard = common_dashboard[0]
            }

            var panelSuccessID = 2;
            var panelFailedID = 1;
            var panelURL = common_dashboard.url.replace('/d/', '/d-solo/')
            var iframeSuccess = `<iframe src="http://localhost:3000${panelURL}?orgId=1&refresh=30s&panelId=${panelSuccessID}" width="auto" height="70" frameborder="0"></iframe>`
            var iframeFailed = `<iframe src="http://localhost:3000${panelURL}?orgId=1&refresh=30s&panelId=${panelFailedID}" width="auto" height="70" frameborder="0"></iframe>`
            var response = {
                "Success": iframeSuccess,
                "Failed": iframeFailed
            };

            return Promise.resolve(response);


            // --------------------------
            // var success = 0;
            // var failed = 0;
            // var failed_a = [];
            // var success_a = [];
            // var response = await this.queryPrometheus('hidra_sample_status');
            // if (response.status == 'success') {
            //     var response2 = await this.queryPrometheus('hidra_http_response_status_code');
            //     if (response.status == 'success') {
            //         response.data.result.forEach(metric => {
            //             var result = {};
            //             response2.data.result.forEach(metric2 => {
            //                 if (metric.metric.sample_name == metric2.metric.sample_name) {
            //                     result['url'] = metric2.metric.url;
            //                     result['status'] = metric.value[1];
            //                     result['description'] = metric.metric.description;
            //                 }
            //             });
            //             if (metric.value[1] == '1') {
            //                 success++;
            //                 success_a.push(result);
            //             } else {
            //                 failed++;
            //                 failed_a.push(result);
            //             }
            //         });
            //         response = {
            //             success,
            //             failed,
            //             failed_a,
            //             success_a
            //         };
            //         return Promise.resolve(response);
            //     } else {
            //         return Promise.reject(response);
            //     }
            // } else {
            //     return Promise.reject(response);
            // }
        } catch (e) {
            console.error("Error in ApiGetPassingFailedScenarios", e);
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
        return "/api/get/passingFailedScenarios";
    }
}

module.exports = ApiGetPassingFailedScenarios;