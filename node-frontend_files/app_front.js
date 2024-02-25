const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const e = require('express');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware para analizar las cookies
app.use(cookieParser());

// Establecer la carpeta de vistas y el motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configurar una ruta para renderizar la vista principal
app.get('/', (req, res) => {
   if (req.cookies.token) {
    res.render('index', { company_name: 'Cloud-Tech' , email: req.cookies.token });
   } else {
     res.redirect('/login');
   }
});

app.get('/one_dashboard', (req, res) => {
   if (req.cookies.token) {
    res.render('index', { company_name: 'Cloud-Tech' , email: req.cookies.token});
   } else {
     res.redirect('/login');
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
   res.render('login', { company_name: 'Cloud-Tech', login: true });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor frontend escuchando en el puerto ${PORT}`);
});
