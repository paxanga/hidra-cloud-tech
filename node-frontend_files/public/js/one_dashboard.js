$(document).ready(function() {
    _loadOneDashboard();
});

function _loadOneDashboardStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sample = urlParams.get('sample');
    console.log(sample);
    // var iframe = `<iframe src="http://localhost:3000${data}?orgId=1&refresh=30s&panelId=1&kiosk" frameborder="0" style="width: 100%; height: 815px;"></iframe>`;
    //         $("#principal_dashboard").html(iframe);
    //     },
    // http://localhost:3000/d/hidra_dashboard/hidra-dashboard?orgId=1&var-sample=http_https___modasanas_com028df49b&var-job=hidra-exporter
    var iframe = `<iframe src="http://localhost:3000/d/hidra_dashboard/hidra-dashboard?orgId=1&var-sample=${sample}&var-job=hidra-exporter&kiosk" frameborder="0" style="width: 100%; height: 930px;"></iframe>`;
    console.log(iframe);
    $("#principal_dashboard").html(iframe);
}