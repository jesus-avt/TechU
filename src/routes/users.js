const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { mensajesFuncionales } = require('./../utils/mensajesRespuestaFuncional.js');

//Importacion de esquemas
const CardsSchema = require('../models/cards');
const UserSchema = require('../models/user');
const CustomerSchema = require('../models/customers');

//Utiles
let { logger } = require("./../utils/pintarLog");
logger.is = 'src.routes.users';

/**
 * 
 * SERVICIO QUE PERMITE LA CREACIÓN DE LA CONTRASEÑA DEL USUARIO
 *  SERVICE NAME: createUserAccessCredentials
 *  SERVICE CODE: 01-2020001
 * 
 */
router.post('/', (req, res) => {
    let card_pan_id = req.body.card_pan_id;
    let card_pin_id = req.body.card_pin_id;
    let password = req.body.password;

    if (!(card_pan_id && card_pin_id && password)) {
        logger.pintarLog(COLORS.error("Falta card_pan_id o card_pin_id o password".error));
        return res.status(500).json({
            state: 'error',
            error: mensajesFuncionales.E_PARAM_REQ
        });
    }

    CardsSchema.findOne({ 'card_pan_id': card_pan_id })
        .populate('Customer', '_id')
        .exec((error, CardDB) => {
            if (error) {
                logger.pintarLog(COLORS.error(mensajesFuncionales.E_TRANSAC_DB.message));
                logger.pintarLog(COLORS.debug(error));
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            logger.pintarLog(COLORS.prompt('Consultando coleccion c_cards_details'));
            if (!CardDB) {
                logger.pintarLog(COLORS.error("No existe el número de tarjeta ingresado ") + COLOR.debug(card_pan_id));
                return res.status(409).json({
                    state: 'error',
                    error: mensajesFuncionales.E_CARD_INVALID_PIN_PAN
                });
            };

            logger.pintarLog(COLORS.prompt('Verificando card_pin_id ingresado'));
            if (!bcrypt.compareSync(card_pin_id, CardDB.card_pin_id)) {
                logger.pintarLog(COLORS.error("Clave card_pin_id no coincide con la tarjeta"));
                return res.status(409).json({
                    state: 'error',
                    error: mensajesFuncionales.E_CARD_INVALID_PIN_PAN
                });
            };

            logger.pintarLog(`Respuesta obtenida ${COLORS.debug(JSON.stringify(CardDB))}`);
            let customerId = CardDB.customer;

            logger.pintarLog(COLORS.prompt('Consultando coleccion c_user_access_credentials'));
            UserSchema.findOne({ "customer": customerId }, (error, userDb) => {
                if (error) {
                    logger.pintarLog(COLORS.error(mensajesFuncionales.E_TRANSAC_DB.message));
                    logger.pintarLog(COLORS.debug(error));
                    return res.status(500).json({
                        state: 'error',
                        error: mensajesFuncionales.E_TRANSAC_DB
                    });
                };

                logger.pintarLog(`Respuesta obtenida${COLORS.debug(userDb)}`);
                if (userDb) {
                    logger.pintarLog(COLORS.error(mensajesFuncionales.E_USER_ALREADY_EXISTS.message));
                    return res.status(409).json({
                        state: 'error',
                        error: mensajesFuncionales.E_USER_ALREADY_EXISTS
                    });
                };

                logger.pintarLog(COLORS.prompt('Creando objeto a guardar'));
                user = new UserSchema({
                    customer: customerId,
                    password: bcrypt.hashSync(password, 10)
                });

                logger.pintarLog(COLORS.prompt('Guardando en coleccion c_user_access_credentials'));
                user.save((error, userDB) => {
                    if (error) {
                        logger.pintarLog(COLORS.error(mensajesFuncionales.E_TRANSAC_DB.message));
                        logger.pintarLog(COLORS.debug(error));
                        return res.status(500).json({
                            state: 'error',
                            error: mensajesFuncionales.E_TRANSAC_DB
                        });
                    }

                    logger.pintarLog(COLORS.prompt('Consultando el cliente asociado'));
                    userDB.populate({
                        path: 'customer',
                        select: '_id personal_id personal_id_type',
                        model: 'c_customers_detail'
                    },((error, userAux)=>{
                        if (error) {
                            logger.pintarLog(COLORS.error(mensajesFuncionales.E_TRANSAC_DB.message));
                            logger.pintarLog(COLORS.debug(error));
                            return res.status(500).json({
                                state: 'error',
                                error: mensajesFuncionales.E_TRANSAC_DB
                            });
                        }
                        logger.pintarLog(COLORS.info("Se ha creado exitosamente la contraseña del usuario"));
                        return res.status(200).json({
                            state: 'success',
                            data: {
                                user: userAux
                            }
                        });
                    }));
                });
            });
        });
});


/**
 * 
 * SERVICIO QUE PERMITE LA ACTUALIZACIÓN DE LA CONTRASEÑA DEL USUARIO
 *  SERVICE NAME: updateUserAccessCredentials
 *  SERVICE CODE: 01-2020002
 * 
 */
router.put('/', (req, res) => {

    let card_pan_id = req.body.card_pan_id;
    let card_pin_id = req.body.card_pin_id;
    let password = req.body.password;

    if (!(card_pan_id && card_pin_id && password)) {
        logger.pintarLog("ERROR CON PARAMETROS card_pan_id, card_pin_id , PAN".error);
        return res.status(500).json({
            state: 'error',
            error: mensajesFuncionales.E_PARAM_REQ
        });
    }

    logger.pintarLog(COLORS.prompt('Consultando en coleccion c_cards_details'));
    CardsSchema.findOne({ 'card_pan_id': card_pan_id })
        .populate('Customer', '_id')
        .exec((error, CardDB) => {
            if (error) {
                logger.pintarLog(COLORS.error(mensajesFuncionales.E_TRANSAC_DB.message));
                logger.pintarLog(COLORS.debug(error));
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            logger.pintarLog(COLORS.prompt('Verificando resultado de la consulta'));
            if (!CardDB) {
                logger.pintarLog("Numero tarjeta invalido".error);
                return res.status(409).json({
                    state: 'error',
                    error: mensajesFuncionales.E_CARD_INVALID_PIN_PAN
                });
            }

            logger.pintarLog(COLORS.prompt('Verificando clave card_pin_id'));
            if (!bcrypt.compareSync(card_pin_id, CardDB.card_pin_id)) {
                logger.pintarLog("card_pin_id INVALIDO".error);
                return res.status(409).json({
                    state: 'error',
                    error: mensajesFuncionales.E_CARD_INVALID_PIN_PAN
                });
            }

            logger.pintarLog(`Respuesta obtenida ${COLORS.debug(JSON.stringify(CardDB))}`);
            let customerId = CardDB.customer;

            logger.pintarLog(COLORS.prompt('Consultando en coleccion c_user_access_credentials'));
            UserSchema.findOne({ 'customer': customerId }, (error, userDb) => {
                if (error) {
                    logger.pintarLog(COLORS.error(mensajesFuncionales.E_TRANSAC_DB.message));
                    logger.pintarLog(COLORS.debug(error));
                    return res.status(500).json({
                        state: 'error',
                        error: mensajesFuncionales.E_TRANSAC_DB
                    });
                }

                if (!userDb) {
                    logger.pintarLog(COLORS.error("El usuario no se encuentra registrado"));
                    return res.status(409).json({
                        state: 'error',
                        error: mensajesFuncionales.E_USER_NOT_EXISTS
                    });
                }

                logger.pintarLog(COLORS.prompt('Actualizando en coleccion c_user_access_credentials'));
                UserSchema
                    .findOneAndUpdate(
                        { "_id": userDb._id },
                        { password: bcrypt.hashSync(password, 10) },
                        { useFindAndModify: false, upsert: false })
                    .populate({
                        path: 'customer',
                        select: '_id personal_id personal_id_type',
                        model: 'c_customers_detail'
                    })
                    .exec((error, userDbAux) => {
                        if (error) {
                            logger.pintarLog(COLORS.error(mensajesFuncionales.E_TRANSAC_DB.message));
                            logger.pintarLog(COLORS.debug(error));
                            return res.status(500).json({
                                state: 'error',
                                error: mensajesFuncionales.E_TRANSAC_DB
                            });
                        }

                        logger.pintarLog(COLORS.info("Se ha actualizado exitosamente la contraseña del usuario"));
                        return res.status(200).json({
                            state: 'success',
                            data: userDbAux
                        });
                    });
            });
        });
});

module.exports = router;


