module.exports = {
    path: '/api/get/test-check-name',
    method: function (req, res) {
        console.log('comprueba el nombre del check si está en uso');
        res.send('comprueba el nombre del check si está en uso');
    }
};