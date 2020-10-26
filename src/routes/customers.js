const express = require('express');
const router = express.Router();
const _ = require('underscore');
const { validate_jwt } = require('./../middlewares/authentication.js');
const { mensajesFuncionales } = require('./../utils/mensajesRespuestaFuncional');

//Importacion de esquemas
const CardsSchema = require('../models/cards');
const CostumersSchema = require('../models/customers');
const AccountsSchema = require('../models/accounts');
const OperationsSchema = require('../models/operations');

//Logger
let { logger } = require("./../utils/pintarLog");
logger.is = 'src.routes.customers';

/**
 * 
 * SERVICIO QUE PERMITE EL LISTADO DE CUENTAS DEL CLIENTE
 *  SERVICE NAME: listCustomerAccounts
 *  SERVICE CODE: 03-2020001
 * 
 */
router.get('/:customerId/accounts', validate_jwt, (req, res) => {
    let customerId = req.params.customerId;

    logger.pintarLog(COLORS.prompt('Consultando coleccion c_accounts_detail'));
    AccountsSchema
        .find(
            { "customer": customerId },
            '_id account_id currency_id account_opening_date account_curr_bal_amount account_type')
        .exec((error, accountsDB) => {
            if (error) {
                logger.pintarLog(COLOR.error(mensajesFuncionales.E_TRANSAC_DB.message));
                logger.pintarLog(error);
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            logger.pintarLog(COLORS.prompt('Verificando que el cliente tenga cuentas'));
            if (!accountsDB) {
                logger.pintarLog(mensajesFuncionales.E_CUSTOMER_NOT_ACCOUNT);
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_CUSTOMER_NOT_ACCOUNT
                });
            }

            logger.pintarLog(`Respuesta obtenida: ${COLORS.debug(accountsDB)}`);
            return res.status(200).json({
                state: "success",
                data: {
                    accounts: _.map(accountsDB, (account) => account.toFormat()),
                },
                tsec: req.tsec
            });
        });
});


/**
 * 
 * SERVICIO QUE PERMITE EL LISTADO DE TARJETAS DEL CLIENTE
 *  SERVICE NAME: listCustomerCards
 *  SERVICE CODE: 03-2020002
 * 
 */
router.get('/:customerId/cards', validate_jwt, (req, res) => {
    let customerId = req.params.customerId;

    CardsSchema
        .find(
            { "customer": customerId },
            '_id card_pan_id finance_card_type')
        .exec((error, cardsDB) => {
            if (error) {
                logger.pintarLog(COLOR.error(mensajesFuncionales.E_TRANSAC_DB.message));
                logger.pintarLog(error);
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            logger.pintarLog(COLORS.prompt('Verificando que el cliente tenga tarjetas'));
            if (!cardsDB) {
                logger.pintarLog(COLOR.error(mensajesFuncionales.E_CUSTOMER_NOT_CARDS.message));
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_CUSTOMER_NOT_CARDS
                });
            }

            logger.pintarLog(`Respuesta obtenida: ${COLORS.debug(cardsDB)}`);
            return res.status(200).json({
                state: "success",
                data: {
                    cards: cardsDB
                },
                tsec: req.tsec
            });
        });
});

/**
 * 
 * SERVICIO QUE PERMITE OBTENER EL DETALLE DE UN CUENTA
 *  SERVICE NAME: showCustomerAccountDetail
 *  SERVICE CODE: 03-2020003
 * 
 */
router.get('/:customerId/accounts/:accountObjectId', validate_jwt, (req, res) => {
    let customerId = req.params.customerId;
    let accountObjectId = req.params.accountObjectId;

    AccountsSchema
        .findById(
            accountObjectId,
            '_id account_id currency_id account_opening_date account_curr_bal_amount customer account_type')
        .exec((error, accountDb) => {
            if (error) {
                logger.pintarLog(COLOR.error(mensajesFuncionales.E_TRANSAC_DB.message));
                logger.pintarLog(error);
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            logger.pintarLog(COLORS.prompt('Verificando que el cliente tenga cuentas'));
            if (!accountDb) {
                logger.pintarLog(COLOR.error(mensajesFuncionales.E_CUSTOMER_NOT_ACCOUNT.message));
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_CUSTOMER_NOT_ACCOUNT
                });
            };

            logger.pintarLog(`Respuesta obtenida: ${COLORS.debug(accountDb)}`);
            if (!(accountDb.customer == customerId)) {
                logger.pintarLog(COLOR.error(mensajesFuncionales.E_CUSTOMER_NOT_OWNER.message));
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_CUSTOMER_NOT_OWNER
                });
            }

            logger.pintarLog(COLORS.prompt('Ejecutando la consulta en la coleccion c_operation_details'));
            OperationsSchema
                .find(
                    { $or: [{ "debit_account_id": accountObjectId }, { "destination_account_id": accountObjectId }] }
                )
                .exec((error, operationsDb) => {
                    if (error) {
                        logger.pintarLog(COLOR.error(mensajesFuncionales.E_TRANSAC_DB.message));
                        logger.pintarLog(error);
                        return res.status(500).json({
                            state: 'error',
                            error: mensajesFuncionales.E_TRANSAC_DB
                        });
                    };

                    logger.pintarLog(COLORS.prompt('Transformando el listado de cuentas al formato esperado por front'));
                    let customerAccount = accountDb.toFormat();
                    logger.pintarLog(`Respuesta obtenida: ${COLORS.debug(operationsDb)}`);
                    if (operationsDb) {
                        let ArrayOperaciones = _.map(operationsDb, (operation) => operation.toShowAccountFormat(accountObjectId));
                        customerAccount["operations"] = ArrayOperaciones;
                    }

                    logger.pintarLog(COLORS.info('Consulta exitosa al detalle de la cuenta del cliente'));
                    return res.status(200).json({
                        state: "success",
                        data: customerAccount,
                        tsec: req.tsec
                    });
                });
        });
});

module.exports = router;