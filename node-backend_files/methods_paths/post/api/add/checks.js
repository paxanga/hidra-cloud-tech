module.exports = {
    path: '/api/add/checks',
    method: function (req, res) {
        console.log('req.body', req.body)
        console.log('Añadiendo checks LOGIC');
        res.send('Añadiendo checks');
    }
};