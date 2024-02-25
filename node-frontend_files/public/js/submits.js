// document ready
$(document).ready(function () {
    // on click in #check-form-submit
    $(document).on('click', '#check-form-submit', async function () {
        console.log('clock OK')
        // event.preventDefault(); 
        // prevent default
        // get values from form
        var name = $('#check_form_name').val();
        var url = $('#check_form_url').val();
        var method = $('#check_form_method').val();
        var expectedStatusCode = $('#check_form_response').val();
        var checkInterval = $('#check_form_interval').val();
        var timeType = $('#check_form_time').val();

        continue_submit = true

        // validate name must be not empty
        if (name == '') {
            _generateToast('Error en el campo nombre', '', 'El campo nombre no puede estar vacío. Por favor, introduzca un nombre.', 'danger');
            $('#check_form_name').addClass('is-invalid');
            continue_submit = false;
        } else {
            $('#check_form_name').removeClass('is-invalid');
            $('#check_form_name').addClass('is-valid');
        }

        if (_validateURLField(url) == false) {
            _generateToast('Error en el campo url', '', 'La url intoducida no tiene un formato vádilo. Por favor, introduzca una url válida.', 'danger');
            $('#check_form_url').addClass('is-invalid');
            continue_submit = false;
        } else {
            $('#check_form_url').removeClass('is-invalid');
            $('#check_form_url').addClass('is-valid');
        }

        // validate expectedStatusCode, must be int number between 100 and 599
        if (expectedStatusCode < 100 || expectedStatusCode > 599 || isNaN(expectedStatusCode)) {
            _generateToast('Error en el campo código de respuesta', '', 'El código de respuesta debe ser un número entero entre 100 y 599. Por favor, introduzca un código de respuesta válido.', 'danger');
            $('#check_form_response').addClass('is-invalid');
            continue_submit = false;
        } else {
            $('#check_form_response').removeClass('is-invalid');
            $('#check_form_response').addClass('is-valid');
        }

        // validate checkInterval, must be int number between 1 and 60
        if (checkInterval < 1 || checkInterval > 60 || isNaN(checkInterval)) {
            _generateToast('Error en el campo intervalo de comprobación', '', 'El intervalo de comprobación debe ser un número entero entre 1 y 60. Por favor, introduzca un intervalo de comprobación válido.', 'danger');
            $('#check_form_interval').addClass('is-invalid');
            continue_submit = false;
        } else {
            $('#check_form_interval').removeClass('is-invalid');
            $('#check_form_interval').addClass('is-valid');
        }

        if (continue_submit == false) {
            return false;
        }

        // create json object
        var checkData = {
            name,
            url,
            method,
            expectedStatusCode,
            checkInterval,
            timeType,
            checkType: 'http'
        };

        const response = await makeRequest({
            method: 'POST',
            url: 'http://localhost:3001/api/add/checks',
            headers: { 'Content-Type': 'application/json' },
            data: checkData,
            success: function (data) {
                console.log(data);
                _generateToast('Check añadido correctamente', '', 'El check se ha añadido correctamente.', 'success');
                _sleep(1000).then(() => {
                    window.location.href = '/';
                });
            },
            error: function (data) {
                console.log(data);
                _generateToast('Error al añadir el check', '', data.responseJSON.message, 'danger');
            }
        });
    });
}
)