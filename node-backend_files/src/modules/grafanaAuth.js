const jwt = require('jsonwebtoken');
const fs = require('fs');

class GrafanaAuth {
    constructor() {
        this.privateKey = fs.readFileSync('/etc/hidra_exporter/certs/grafana.key', 'utf8');
    }

    generateToken() {
        const payload = {
            user: 'viewer',
            sub: 'viewer@localhost',
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });

        return token;
    }
}

module.exports = GrafanaAuth;