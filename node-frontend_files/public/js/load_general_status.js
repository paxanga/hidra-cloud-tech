async function _loadGeneralStats() {
    console.log('cargando general status')
    await _loadPrincipalPanel();
}

async function _loadPrincipalPanel() {
    var currentHostname = window.location.hostname;
    const response = await makeRequest({
        method: 'GET',
        url: '/api/get/loadPrincipalPanel',
        data: null,
        success: function (data) {
            var iframe = `<iframe src="http://${currentHostname}:3000${data.url}?orgId=1&refresh=30s&panelId=1&kiosk&auth_token=${data.token}" frameborder="0" style="width: 100%; height: 930px;"></iframe>`;
            $("#principal_dashboard").html(iframe);
        },
        error: function (data) {
            console.log(data);
            _generateToast('Error al recuperar los datos de PassingFailed', '', data.responseJSON.message, 'danger');
        }
    });
}
