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

function deleteCheck(filename, domain) {
    $('.deleteCheckModal_domain').text(domain);
    $('.deleteCheckModal_domain_file').val(filename);
}

async function deletePermanentDomain() {
    filename = $('.deleteCheckModal_domain_file').val();
    if (filename != 0) {
        const response = await makeRequest({
            method: 'POST',
            url: '/api/checks/delete',
            data: { filename: filename },
            success: function (data) {
                _loadDomainList();
                $('#deleteCheckModal').modal('hide');
            },
            error: function (data) {
                console.log(data);
                _generateToast('Error al eliminar el dominio', '', data.responseJSON.message, 'danger');
            }
        });
    } else {
        _generateToast('Error', '', 'No se ha podido eliminar el dominio', 'danger');
    }
}

function editCheck(filename, description, domain, method, responseCode, intervalNumber, intervalUnit) {
    _showPreloader(2);
    $("#content-main").load("../public/content/check_form.ejs");

    _sleep(2000).then(() => {
        $('.check_form_edit_card_type').removeClass('card-primary').addClass('card-warning');
        $('.check_form_edit_card_title').text('Editar dominio');
        $('#check_form_name').val(description);
        $('#check_form_url').val(domain);
        $('#check_form_method').val(method);
        $('#check_form_response').val(responseCode);
        $('#check_form_interval').val(intervalNumber);
        $('#check_form_time').val(intervalUnit);
        $('#check_form_filename_yml').val(filename);
        $('#check-form-submit').hide();
        $('#check-form-submit-edit').show();
    });
}

function _showPreloader(seconds) {
    $('.preloader').css('height', '100%');
    $('.preloader .animation__wobble').css('display', 'block');
    _sleep(seconds * 1000).then(() => {
        $('.preloader').css('height', '0px');
        $('.preloader .animation__wobble').css('display', 'none');
    });
}

function getRandomColor() {
    var colors = [
        '#28a745', // green
        '#dc3545', // red
        '#007bff', // blue
        '#ffc107', // yellow
        '#17a2b8', // teal
        '#6610f2', // purple
        '#fd7e14', // orange
        '#6f42c1', // violet
        '#20c997', // cyan
        '#e83e8c'  // pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}