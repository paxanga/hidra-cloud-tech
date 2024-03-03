$(document).ready(function() {
    $(document).on('click', '#reloadAlerts', function () {
        _showPreloader(1);
        _loadAlertsTable();
    });
});

async function _loadAlertsTable() {
    console.log('cargando alerts table');

    var alerts = [];

    var colorMap = {};

    _sleep(1000).then(() => {
        $("#jsgridAlertsTable").jsGrid({
            height: "100%",
            width: "100%",

            tableClass: "jsgrid-table table table-sm",

            sorting: true,
            paging: true,

            data: alerts,

            fields: [
                { 
                    name: "state", 
                    type: "text", 
                    title: "State", 
                    width:40 , 
                    itemTemplate: function(value, item) {
                        // Normal = success
                        // Pending = warning
                        // Firing = danger
                        return $("<div>").text(value).addClass("badge " + (value === "Normal" ? "badge-success" : (value === "Pending" ? "badge-warning" : "badge-danger")));
                    }
                },
                {
                    name: "lastEvaluation",
                    type: "text",
                    title: "Last Evaluation",
                    width: 100,
                    itemTemplate: function(value, item) {
                        return new Date(value).toLocaleString();
                    }
                },
                { 
                    name: "labels", 
                    type: "text", 
                    title: "Labels", 
                    itemTemplate: function(value, item) {
                        var labels = "";
                        for(var key in value) {
                            var color = colorMap[key] || getRandomColor();
                            colorMap[key] = color;
                            labels += '<span class="badge" style="background-color: ' + color + '">' + key + '=' + value[key] + '</span> ';
                        }
                        return labels;
                    }
                }
            ]
        });
    })
    .then(async () => {
        const response = await makeRequest({
            method: 'GET',
            url: '/api/alerts/alertsTable',
            data: null,
            success: function (data) {

                // Flatten the nested groups array
                var flattenedGroups = data.data.groups.flatMap(group => {
                    // Flatten the nested rules array
                    var flattenedRules = group.rules.flatMap(rule => {
                        // Flatten the alerts array for each rule
                        var flattenedAlerts = rule.alerts.map(alert => {
                            // Include lastEvaluation at the alert level
                            alert.lastEvaluation = rule.lastEvaluation;
                            return alert;
                        });
                        return flattenedAlerts;
                    });
                    return flattenedRules;
                });

                // updateAlertCountBadge(flattenedGroups.length);

                // Assign the flattened alerts as data for the jsgrid
                $("#jsgridAlertsTable").jsGrid("option", "data", flattenedGroups);

                var columnasCuerpo = $("#jsgridAlertsTable tbody tr:first-child td").map(function () {
                    return $(this).width();
                });

                var cabeceras = $("#jsgridAlertsTable th");
                cabeceras.each(function (index) {
                    $(this).width(columnasCuerpo[index]);
                });

            },
            error: function (data) {
                console.log(data);
                _generateToast('Error al recuperar los datos de alertas', '', data.responseJSON.message, 'danger');
            }
        });
    });
}