// elimina el contenido principal de la página
function _removeContent() {
    $('#content-main').empty();
}

function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function _generateToast(title, subtitle, body, type, delay=5000) {
    if (delay == 0) {
        autohide = false
    } else {
        autohide = true
    }

    datetime = new Date();
    formatdatetime = datetime.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
    subtitle = subtitle + ' (' + formatdatetime + ')';
    $(document).Toasts('create', {
        title: title,
        subtitle: subtitle,
        body: body,
        class: 'bg-' + type,
        autohide: autohide,
        delay: delay,
    });
}

function makeRequest(options) {
    var { method, url, headers, data, success, error } = options;

    method = method.toUpperCase();

    if (method === 'GET') {
        return $.ajax({
            type: method,
            url: url,
            headers: headers,
            success: function (data) {
                success(data);
            },
            error: function (data) {
                error(data);
            }
        });
    }

    if (method === 'POST') {
        return $.ajax({
            type: method,
            url: url,
            headers: headers,
            data: JSON.stringify(data),
            success: function (data) {
                success(data);
            },
            error: function (data) {
                error(data);
            }
        });
    }
}