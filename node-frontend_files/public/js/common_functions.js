// elimina el contenido principal de la página
function _removeContent() {
    $('#content-main').empty();
}

function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function _generateToast(title, subtitle, body, type, delay = 5000) {
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
    var { method, url, data, success, error } = options;

    method = method.toUpperCase();

    return $.ajax({
        type: method,
        url: url,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (data) {
            success(data);
        },
        error: function (data) {
            error(data);
        }
    });
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}