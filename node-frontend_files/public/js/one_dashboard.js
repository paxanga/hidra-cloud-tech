$(document).ready(function () {
    _loadOneDashboard();
});

async function _loadOneDashboardStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sample = urlParams.get('sample');

    const username = getCookie('token');

    const response = await makeRequest({
        method: 'POST',
        url: '/api/user/getToken',
        data: { "username": username },
        success: function (data) {
            var iframe = `<iframe src="http://localhost:3000/d/hidra_dashboard/hidra-dashboard?orgId=1&var-sample=${sample}&var-job=hidra-exporter&kiosk&auth_token=${data.token}" frameborder="0" style="width: 100%; height: 930px;"></iframe>`;
            $("#principal_dashboard").html(iframe);
        },
        error: function (data) {
            console.log(data);
            _generateToast('Error, no se ha podido obtener el token', '', data.responseJSON.message, 'danger');
        }
    });


}