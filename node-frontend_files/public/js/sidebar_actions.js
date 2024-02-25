// document ready jquery
$(document).ready(function () {
    // on click on id #sidebar-add-check
    $(document).on('click', '#sidebar-add-check', function () {
        _loadCheckForm();
    });
    $(document).on('click', '#sidebar-home', function () {
        _loadDashboard();
    });

});

function _markActive(id) {
    $('ul.nav-sidebar li.nav-item a.nav-link').removeClass('active');
    // add class active to id
    $(id).addClass('active');
}

function _loadCheckForm() {
    // _removeContent();
    _markActive('#sidebar-add-check');
    $("#content-main").load("../public/content/check_form.ejs");
}

async function _loadDashboard() {
    // _removeContent();
    _markActive('#sidebar-home');
    $("#content-main").load("../public/content/dashboard.ejs");
    await _loadGeneralStats();
}

async function _loadOneDashboard() {
    // _removeContent();
    _markActive('#sidebar-home');
    $("#content-main").load("../public/content/dashboard.ejs")
    // wait until #principal_dashboard exists
    while (!$("#principal_dashboard").length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await _loadOneDashboardStatus();
}