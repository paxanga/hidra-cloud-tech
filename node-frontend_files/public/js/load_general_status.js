async function _loadGeneralStats() {
    console.log('cargando general status')
    await _loadPrincipalPanel();
}

async function _loadPrincipalPanel() {
    const response = await makeRequest({
        method: 'GET',
        url: 'http://localhost:3001/api/get/loadPrincipalPanel',
        headers: { 'Content-Type': 'application/json' },
        data: "",
        success: function (data) {
            var iframe = `<iframe src="http://localhost:3000${data}?orgId=1&refresh=30s&panelId=1&kiosk" frameborder="0" style="width: 100%; height: 930px;"></iframe>`;
            $("#principal_dashboard").html(iframe);
        },
        error: function (data) {
            console.log(data);
            _generateToast('Error al recuperar los datos de PassingFailed', '', data.responseJSON.message, 'danger');
        }
    });
}

// async function _loadPassingFailedScenarios() {
//     const response = await makeRequest({
//         method: 'GET',
//         url: 'http://localhost:3001/api/get/passingFailedScenarios',
//         headers: { 'Content-Type': 'application/json' },
//         data: "",
//         success: function (data) {
//             console.log("data-->", data);
//             $("#_passing_dashboard").html(data.Success);
//             $("#_failed_dashboard").html(data.Failed);
//         },
//         error: function (data) {
//             console.log(data);
//             _generateToast('Error al recuperar los datos de PassingFailed', '', data.responseJSON.message, 'danger');
//         }
//     });
// }

// function _loadChecksTable() {

//     console.log('cargando checks table')

//     domains = [];

//     _sleep(1000).then(() => {

//         $("#jsgridChecksTable").jsGrid({
//             height: "100%",
//             width: "100%",

//             tableClass: "jsgrid-table table table-sm",

//             sorting: true,
//             paging: true,

//             data: domains,

//             fields: [
//                 // {
//                 //     name: "Status", type: "text", itemTemplate: function (value, item) {
//                 //         if (value === "OK") {
//                 //             return $("<i>").addClass("fas fa-check-circle text-success");
//                 //         } else {
//                 //             return $("<i>").addClass("fas fa-times-circle text-danger");
//                 //         }
//                 //     }
//                 // },
//                 { name: "Status", type: "text", itemTemplate: function (value, item) {
//                     return value.iframe;
//                 } },
//                 { name: "Dominio", type: "text" },
//                 { name: "Tipo", type: "text" },
//                 { name: "Checks", type: "text", title: "Tiempo de respuesta (3h)" },
//                 { name: "24h", type: "text" },
//                 { name: "7D", type: "text" },
//             ]
//         });
//     })
//         .then(async () => {

//             const response = await makeRequest({
//                 method: 'GET',
//                 url: 'http://localhost:3001/api/get/checksTable',
//                 headers: { 'Content-Type': 'application/json' },
//                 data: "",
//                 success: function (data) {
//                     console.log("data-->", data);
//                     $("#jsgridChecksTable").jsGrid("option", "data", data);

//                     var columnasCuerpo = $("#jsgridChecksTable tbody tr:first-child td").map(function () {
//                         return $(this).width();
//                     });

//                     var cabeceras = $("#jsgridChecksTable th");
//                     cabeceras.each(function (index) {
//                         $(this).width(columnasCuerpo[index]);
//                     });
//                 },
//                 error: function (data) {
//                     console.log(data);
//                     _generateToast('Error al recuperar los datos de ChecksTable', '', data.responseJSON.message, 'danger');
//                 }
//             });



//             // var newData = [
//             //     { "Status": "OK", "Dominio": "Ejemplo1.com", "Tipo": "Tipo1", 'Checks': '<iframe src="http://localhost:3000/d-solo/cefe4337-050a-4d12-a270-3d6eea1b8f69/test?orgId=1&refresh=5s&panelId=1&kiosk&fullscreen" width="200" height="50" frameborder="0"></iframe>', '24h': "Info24h", '7D': "Info7D" },
//             //     { "Status": "NOTOK", "Dominio": "Ejemplo2.com", "Tipo": "Tipo2", 'Checks': "24h", '24h': "Info24h", '7D': "Info7D" },
//             // ];


//         });
// }
