// document ready
$(document).ready(function () {
    $(document).on('click', '#sing-in-submit', async function () {
        var email = $('#login_email').val();
        var password = $('#login_password').val();

        if (email == '') {
            _generateToast('Error', 'Error', 'Email is required', 'danger');
            return;
        }
        if (password == '') {
            _generateToast('Error', 'Error', 'Password is required', 'danger');
            return;
        }

        var checkData = {
            email,
            password,
        };

        const response = await makeRequest({
            method: 'POST',
            url: '/api/user/login',
            data: checkData,
            success: function (data) {
                _generateToast('Success', 'Success', 'Login success', 'success');
                _sleep(2000).then(() => {
                    document.cookie = `token=${data.token}`;
                    window.location.href = '/';
                });
            },
            error: function (data) {
                console.log(data);
                _generateToast('Error, el usuario no existe', '', data.responseJSON.message, 'danger');
            }
        });
    });
});