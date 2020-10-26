const express = require('express');
const router = express.Router();
const cors = require('cors');
const bcrypt = require('bcrypt');
const { mensajesFuncionales } = require('./../utils/mensajesRespuestaFuncional.js');
const jwt = require('jsonwebtoken')

//Schemas
const CostumersSchema = require('../models/customers');
const UserSchema = require('../models/user');

//Logger
let { logger } = require("./../utils/pintarLog");
logger.is = 'src.routes.auth';
router.all('*',cors());


/**
 * 
 * SERVICIO QUE PERMITE LA AUTENTICACIÓN DE UN USUARIO
 *  SERVICE NAME: validateUserAccessCredentials
 *  SERVICE CODE: 02-2020001
 *  GROUP CODE: 02
 * 
 */
router.post('/', (req, res) => {

    let personal_id = req.body.personal_id;
    let password = req.body.password;

    logger.pintarLog("Verificando parametros del REQUEST".prompt);

    if (!(personal_id && password)) {
        logger.pintarLog("FALTA DOCUMENTO O PASSWORD EN EL REQ".error);
        return res.status(400).json({
            state: 'error',
            error: mensajesFuncionales.E_PARAM_REQ
        });
    }

    logger.pintarLog(COLORS.prompt('Consultando coleccion c_customers_details'));
    CostumersSchema
        .findOne({"personal_id": personal_id })
        .exec((error, customerDb) => {
            if (error) {
                logger.pintarLog(mensajesFuncionales.E_TRANSAC_DB.message);
                logger.pintarLog(error);
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            logger.pintarLog("Resultado obtenido de la consulta ", customerDb);
            if (!customerDb) {
                logger.pintarLog(mensajesFuncionales.E_AUTH_CRED.message);
                return res.status(400).json({
                    state: 'error',
                    error: mensajesFuncionales.E_AUTH_CRED
                });
            };

            logger.pintarLog(COLORS.prompt('Consultando coleccion c_user_access_credentials'));
            UserSchema
                .findOne({ "customer": customerDb._id })
                .exec((error, UserDb) => {
                    if (error) {
                        logger.pintarLog(mensajesFuncionales.E_TRANSAC_DB.message);
                        logger.pintarLog(error);
                        return res.status(500).json({
                            state: 'error',
                            error: mensajesFuncionales.E_TRANSAC_DB
                        });
                    };

                    logger.pintarLog(`Respuesta obtenida ${COLORS.debug(JSON.stringify(UserDb))}`);
                    if (!UserDb) {
                        logger.pintarLog(mensajesFuncionales.E_AUTH_NO_REG.message,);
                        return res.status(409).json({
                            state: 'error',
                            error: mensajesFuncionales.E_AUTH_NO_REG
                        });
                    };

                    logger.pintarLog(COLORS.prompt('Validando la contraseña ingresada'));
                    if (!bcrypt.compareSync(password, UserDb.password)) {
                        logger.pintarLog(mensajesFuncionales.E_AUTH_CRED.message);
                        return res.status(409).json({
                            state: 'error',
                            error: mensajesFuncionales.E_AUTH_CRED
                        });
                    };

                    logger.pintarLog(COLORS.info("El usuario se ha autenticado correctamente"));
                    let customer = JSON.parse(JSON.stringify(customerDb));
                    customer["user"] = { _id: UserDb._id };
                    logger.pintarLog(COLORS.prompt('Generando token de acceso'));
                    let tsec = jwt.sign({ customer }, process.env.SEED_JWT, { expiresIn: process.env.CADUCIDAD_JWT });
                    res.status(200);
                    return res.json({
                        state: 'success',
                        data: {
                            customerId: customer._id,
                            customerFullName: `${customer.first_name} ${customer.last_name}`                          
                        },
                        tsec
                    });
                });
        });
});

module.exports = router;


