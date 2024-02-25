

const BaseApi = require('../base_api');

class ApiGetChecksTable extends BaseApi {

    async handleRequest(req) {
        try {
            var processed_data = [];
            var response = await this.queryPrometheus('hidra_sample_status');
            if (response.status != 'success') {
                return Promise.reject(response);
            }
            var response4 = await this.queryPrometheus('hidra_http_response_status_code');
            if (response4.status != 'success') {
                return Promise.reject(response4);
            }

            for (const metric of response.data.result) {
                var response2 = await this.queryPrometheus(`100*avg_over_time((hidra_sample_status{sample_name="${metric.metric.sample_name}"}==1)[24h:])`);
                if (response2.status != 'success') {
                    return Promise.reject(response2);
                }
                var response3 = await this.queryPrometheus(`100*avg_over_time((hidra_sample_status{sample_name="${metric.metric.sample_name}"}==1)[7d:])`);
                if (response3.status != 'success') {
                    return Promise.reject(response3);
                }

                for (const metric2 of response4.data.result) {
                    if (metric.metric.sample_name == metric2.metric.sample_name) {
                        metric.metric.url = metric2.metric.url;
                    }
                }

                var dashboard_min = await this.getDashboardByName(metric.metric.sample_name + "_min");

                if (dashboard_min.length == 0) {
                    console.log("No dashboard found for", metric.metric.sample_name + "_min");
                    dashboard_min = await this.createDashboard(metric.metric.sample_name, "domain_http_dashboard_min");
                } else {
                    dashboard_min = dashboard_min[0]
                }
                var panelID = 1;
                var panelStatusID = 2;
                var panelURL = dashboard_min.url.replace('/d/', '/d-solo/')
                var iframe = `<iframe src="http://localhost:3000${panelURL}?orgId=1&refresh=30s&panelId=${panelID}" width="500" height="70" frameborder="0"></iframe>`
                var iframeStatus = `<iframe src="http://localhost:3000${panelURL}?orgId=1&refresh=30s&panelId=${panelStatusID}" width="100" height="70" frameborder="0"></iframe>`

                processed_data.push({
                    "Status": {"status": ((metric.value[1] == 1) ? "OK" : "NOTOK"), iframe: iframeStatus},
                    "sample_name": metric.metric.sample_name,
                    "Tipo": '<span class="badge bg-primary">' + metric.metric.plugins + '</span>',
                    "24h": response2.data.result.length > 0 ? (parseInt(response2.data.result[0].value[1]) <= 95) ? '<span class="badge bg-danger">' + parseInt(response2.data.result[0].value[1]) + '</span>' : '<span class="badge bg-success">' + parseInt(response2.data.result[0].value[1]) + ' %</span>' : "<span class='badge bg-warning'> -- </span>",
                    "7D": response3.data.result.length > 0 ? (parseInt(response3.data.result[0].value[1]) <= 95) ? '<span class="badge bg-danger">' + parseInt(response3.data.result[0].value[1]) + '</span>' : '<span class="badge bg-success">' + parseInt(response3.data.result[0].value[1]) + ' %</span>' : "<span class='badge bg-warning'> -- </span>",
                    "Checks": iframe,
                    "Dominio": '<span class="badge badge-primary"><a style="color: #fff !important;" href="' + metric.metric.url + '" target="_blank">' + metric.metric.url + '</a></span>'
                });
            }


            // order processed_data by Status.status=NOTOK first and other by alphabetical order Dominio
            processed_data.sort((a, b) => {
                if (a.Status.status === "NOTOK" && b.Status.status === "NOTOK") {
                    if (a.Dominio < b.Dominio) {
                        return -1;
                    }
                    if (a.Dominio > b.Dominio) {
                        return 1;
                    }
                    return 0;
                }
                if (a.Status.status === "NOTOK") {
                    return -1;
                }
                if (b.Status.status === "NOTOK") {
                    return 1;
                }
                if (a.Dominio < b.Dominio) {
                    return -1;
                }
                if (a.Dominio > b.Dominio) {
                    return 1;
                }
                return 0;
            });

            return Promise.resolve(processed_data);
        } catch (e) {
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
        return "/api/get/checksTable";
    }
}

module.exports = ApiGetChecksTable;