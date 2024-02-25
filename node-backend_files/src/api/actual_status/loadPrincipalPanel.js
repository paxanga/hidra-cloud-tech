

const BaseApi = require('../base_api');

class ApiGetloadPrincipalPanel extends BaseApi {

    async handleRequest(req) {
        try {
            var principal_dashboard = await this.getDashboardByName("principal_dashboard");

            if (principal_dashboard.length == 0) {
                console.log("No dashboard found for principal_dashboard");
                principal_dashboard = await this.createDashboard("principal_dashboard", "principal_dashboard");
            } else {
                principal_dashboard = principal_dashboard[0]
            }

            var hidra_dashboard = await this.getDashboardByName("hidra_dashboard");

            if (hidra_dashboard.length == 0) {
                console.log("No dashboard found for hidra_dashboard");
                hidra_dashboard = await this.createDashboard("hidra_dashboard", "hidra_dashboard");
            } else {
                hidra_dashboard = hidra_dashboard[0]
            }

            return Promise.resolve(principal_dashboard.url);
        } catch (e) {
            console.log(e);
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
        return "/api/get/loadPrincipalPanel";
    }
}

module.exports = ApiGetloadPrincipalPanel;