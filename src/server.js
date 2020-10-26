let { logger } = require("./utils/pintarLog");
logger.is= 'src.server';

//Importación de express
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

//Importamos la configuracion del servidor´
require(path.resolve(__dirname, './configs/config'));
if (AMBIENTE == 'DEV') {
    require('dotenv').config(path.resolve(__dirname, '../.env'));
}

//Aplicación
const app = express();
app.use(bodyParser.json());
app.all('*',cors())

//Importacion de rutas
app.use(`${CONTEXT}/auth`, require('./routes/auth'));
app.use(`${CONTEXT}/users`, require('./routes/users'));
app.use(`${CONTEXT}/customers`, require('./routes/customers'));
app.use(`${CONTEXT}/accounts`, require('./routes/accounts'));

// Conexión a base de datos
let generarUriMongodb = function () {
    return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
}

//Inicio de la aplicación
mongoose.connect(
    generarUriMongodb(),
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
        useFindAndModify: false
    },
    (error, resp) => {
        if (error) {
            logger.pintarLog(`Error al conectarse con la base de datos - ${COLORS.error(error)}`);
            return;
        };

        logger.pintarLog(`Base de datos: ${COLORS.info('ONLINE')}`);
        logger.pintarLog(`Datos de conexión\n\tNombre: ${COLORS.debug(process.env.DB_NAME)}\n\tHost: ${COLORS.debug(process.env.DB_HOST)}\n\tUsuario: ${COLORS.debug(process.env.DB_USER)}`);
        app.listen(process.env.PORT, () => {
            logger.pintarLog(`Aplicacion escuchando desde el puerto ${COLORS.debug(process.env.PORT)}`);
        });
    });