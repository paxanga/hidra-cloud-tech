const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const HttpRequest = require('./src/modules/HttpRequest');

const http_req = new HttpRequest();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware para analizar las cookies
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Establecer la carpeta de vistas y el motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configurar una ruta para renderizar la vista principal
app.get('/', (req, res) => {
  if (req.cookies.token) {
    res.render('index', { company_name: 'Cloud-Tech', email: req.cookies.token });
  } else {
    res.redirect('/login');
  }
});

app.get('/one_dashboard', (req, res) => {
  if (req.cookies.token) {
    res.render('index', { company_name: 'Cloud-Tech', email: req.cookies.token });
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

app.post('/api/user/login', async (req, res) => {
  try {
    http_req.makeRequest(
      "http://node-backend:3001/api/user/login",
      'POST',
      req.body
    ).then((response) => {
      res.send(response);
    }).catch((error) => {
      res.status(400).send(error.response.data);
    });
  } catch (error) {
    return Promise.reject(error);
  }
});

app.get('/api/get/loadPrincipalPanel', async (req, res) => {
  try {
    http_req.makeRequest(
      "http://node-backend:3001/api/get/loadPrincipalPanel",
      'GET',
      null,
    ).then((response) => {
      res.send(response);
    }).catch((error) => {
      res.status(400).send(error.response.data);
    });
  } catch (error) {
    return Promise.reject(error);
  }
});

app.post('/api/add/checks', async (req, res) => {
  try {
    http_req.makeRequest(
      "http://node-backend:3001/api/add/checks",
      'POST',
      req.body
    ).then((response) => {
      res.send(response);
    }).catch((error) => {
      res.status(400).send(error.response.data);
    });
  } catch (error) {
    return Promise.reject(error);
  }
});

app.post('/api/user/getToken', async (req, res) => {
  try {
    http_req.makeRequest(
      "http://node-backend:3001/api/user/getToken",
      'POST',
      req.body
    ).then((response) => {
      res.send(response);
    }).catch((error) => {
      res.status(400).send(error.response.data);
    });
  } catch (error) {
    return Promise.reject(error);
  }
});

app.use('/public', express.static(path.join(__dirname, 'public')));

// Configurar la carpeta pública para servir archivos estáticos
app.use('/static', express.static(path.join(__dirname, 'node_modules/socket.io-client/dist')));

// Ruta para servir el archivo socket.io.js
app.get('/socket.io.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/socket.io-client/dist/socket.io.js'));
});

// Ruta de inicio de sesión
app.get('/login', (req, res) => {
  if (req.cookies.token) {
    res.redirect('/');
  }
  res.render('login', { company_name: 'Cloud-Tech', login: true });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor frontend escuchando en el puerto ${PORT}`);
});
