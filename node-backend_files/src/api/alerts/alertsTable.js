

const BaseApi = require('../base_api');

class ApiGetAlertsTable extends BaseApi {

    async handleRequest(req) {
        try {
            return this.getAllContactsPoint()
            .then(async (response) => {
                var found_telegram_conctact = false;
                for (var i = 0; i < response.length; i++) {
                    if (response[i].type === 'telegram') {
                        found_telegram_conctact = true;
                        break;
                    }
                }
                if (!found_telegram_conctact) {
                    await this.createContactPoint('telegram');
                }
                return this.getNotificationPolicies()
            }).then(async (policies) => {
                console.log(policies)
                var found_policy = false;
                for (var i = 0; i < policies.length; i++) {
                    if (policies[i].name === 'default') {
                        found_policy = true;
                        break;
                    }
                }
                if (!found_policy) {
                     await this.createNotificationPolicy(policies);
                }
                return this.getAlerts()
            }).then(async (alerts) => {
                var default_alert = false
                for (var i = 0; i < alerts.length; i++) {
                    if (alerts[i].title === 'default') {
                        default_alert = true;
                        break;
                    }
                }
                if (!default_alert) {
                    await this.createAlert()
                }
                return this.getActualAlerts()
            }).catch((e) => {
                console.log(e);
                return Promise.reject(e);
            });
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
        return "/api/alerts/alertsTable";
    }
}

module.exports = ApiGetAlertsTable;