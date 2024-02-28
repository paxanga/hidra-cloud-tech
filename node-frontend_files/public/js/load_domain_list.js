function _loadChecksTable() {

    console.log('cargando checks table')

    domains = [];

    _sleep(1000).then(() => {

        $("#jsgridChecksTable").jsGrid({
            height: "100%",
            width: "100%",

            tableClass: "jsgrid-table table table-sm",

            sorting: true,
            paging: true,

            data: domains,

            fields: [
                { name: "dominio", type: "text", title: "Dominio" },
                { name: "intervalo", type: "text", title: "Intervalo" },
                { name: "metodo", type: "text", title: "Método" },
                { name: "respuesta", type: "text", title: "Respuesta" },
                { name: "descripción", type: "text", title: "Descripción" },
                { name: "acciones", type: "text", title: "Acciones", width: 100 }
            ]
        });
    })
        .then(async () => {

            const response = await makeRequest({
                method: 'GET',
                url: '/api/checks/checksTable',
                data: null,
                success: function (data) {
                    $("#jsgridChecksTable").jsGrid("option", "data", data);

                    var columnasCuerpo = $("#jsgridChecksTable tbody tr:first-child td").map(function () {
                        return $(this).width();
                    });

                    var cabeceras = $("#jsgridChecksTable th");
                    cabeceras.each(function (index) {
                        $(this).width(columnasCuerpo[index]);
                    });
                },
                error: function (data) {
                    console.log(data);
                    _generateToast('Error al recuperar los datos de dominios', '', data.responseJSON.message, 'danger');
                }
            });
        });
}