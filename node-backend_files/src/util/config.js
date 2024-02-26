function getEnv(name, default_value) {
    let value = null;

    if (!(name in process.env)) {
        if (default_value !== undefined) {
            value = default_value;
        }
        else {
            value = '';
        }
    }
    else {
        value = process.env[name];
    }

    return value;
}

module.exports = {
    'environment': getEnv('environment', 'local'),
    'usernames' : getEnv('users_and_passwords',{
        'admin': 'admin',
    }),
    'http': {
        'port': 3001,
        'host': '1.1.1.1'
    },
    'grafana': {
        'url': 'http://grafana',
        'adminPassword': getEnv('grafanaApiPassword', 'admin'),
        'port': 3000,
    }
};
