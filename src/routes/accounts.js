const express = require('express');
const router = express.Router();
const request = require('request-json');
const mongoose = require('mongoose');
const { currency } = require('../models/enums/currency');
const { validate_jwt } = require('../middlewares/authentication.js');
const { mensajesFuncionales } = require('../utils/mensajesRespuestaFuncional');

//Importacion de esquemas
const AccountsSchema = require('../models/accounts');
const OperationsSchema = require('../models/operations');


//Importacion del logger
let { logger } = require("../utils/pintarLog");
logger.is = 'src.routes.accounts';

//Variables 
var client = request.createClient(process.env.URL_API_EXCHANGE_SERVICE);
const apiKey = `&key=${process.env.API_KEY_EXCHANGE_SERVICE}`;


//Metodo ue obtiene la conversión de moneda
const ejecutarExchangeService = (monto, currencyOriginAccount, currencyDestinationAccount) => {
    return new Promise((resolve, reject) => {
        logger.pintarLog(COLORS.prompt("Realizando consulta de conversión"));
        logger.pintarLog(COLORS.prompt(`${currency[currencyOriginAccount].id}/${currency[currencyDestinationAccount].id}/json?quantity=${monto}${apiKey}`));
        client.get(`${currency[currencyOriginAccount].id}/${currency[currencyDestinationAccount].id}/json?quantity=${monto}${apiKey}`, function (error, res, body) {
            if (error) {
                logger.pintarLog(`Se obtuvo un error mientras se obtenia la conversión: ${COLORS.error(error)}`);
                reject({amount: -1});
            }
            logger.pintarLog(`Se obtuvo como valor de conversión: ${COLORS.debug(body.result.value)}`);
            resolve({ amount: body.result.amount, rate: body.result.value});
        });
    });
};

/**
 * 
 * SERVICIO QUE PERMITE LA AUTENTICACIÓN DE UN USUARIO
 *  SERVICE NAME: executeWireTransfer
 *  SERVICE CODE: 04-2020001
 * 
 */
router.post('/:originAccountId/execute-wire-transfer/:destinationAccountId', validate_jwt, (req, res) => {
    let originAccountId = req.params.originAccountId;
    let destinationAccountId = req.params.destinationAccountId;
    let customerId = req.get('customerId');
    let operation_amount = req.body.operation_amount;
    let operation_concept_desc = req.body.operation_concept_desc;

    logger.pintarLog(COLORS.prompt(`Inicializando una transferencia bancaria: ${originAccountId}->${destinationAccountId}`));
    logger.pintarLog(COLORS.prompt("Verificando que cuenta destino != cuenta origen"));
    if (originAccountId == destinationAccountId) {
        logger.pintarLog(COLORS.error(mensajesFuncionales.E_OPERATION_SAME_ORIGIN_DESTINATION.message));
        return res.status(400).json({
            state: 'error',
            error: mensajesFuncionales.E_OPERATION_SAME_ORIGIN_DESTINATION
        });
    }

    logger.pintarLog(COLORS.prompt("Verificando el monto de la transferencia"));
    if (!operation_amount) {
        logger.pintarLog(COLORS.error("Falta ingresar monto"));
        return res.status(400).json({
            state: 'error',
            error: mensajesFuncionales.E_PARAM_REQ
        });
    }

    if (Number.isNaN(operation_amount) && operation_amount > 0) {
        logger.pintarLog(COLORS.error(mensajesFuncionales.E_OPERATION_BAD_AMMOUNT.message));
        return res.status(400).json({
            state: 'error',
            error: mensajesFuncionales.E_OPERATION_BAD_AMMOUNT
        });
    }

    logger.pintarLog(COLORS.prompt("Consultando coleccion c_accounts_detail por la cuenta origen"));
    AccountsSchema.findById(originAccountId, 'currency_id customer account_curr_bal_amount', (error, originAccountDb) => {
        if (error) {
            logger.pintarLog(mensajesFuncionales.E_TRANSAC_DB.message);
            logger.pintarLog(error);
            return res.status(500).json({
                state: 'error',
                error: mensajesFuncionales.E_TRANSAC_DB
            });
        };

        logger.pintarLog(COLORS.prompt("Verificando resultado de la consulta"));
        if (!originAccountDb) {
            logger.pintarLog(`${mensajesFuncionales.E_OPERATION_NOT_OGN_ACC.message}->${originAccountId}`);
            return res.status(409).json({
                state: 'error',
                error: mensajesFuncionales.E_OPERATION_NOT_OGN_ACC
            });
        }

        logger.pintarLog(`Respuesta obtenida ${COLORS.debug(JSON.stringify(originAccountDb))}`);
        if (!(originAccountDb.customer == customerId)) {
            logger.pintarLog(mensajesFuncionales.E_OPERATION_NOT_OWNER_CUSTOMER.message);
            return res.status(409).json({
                state: 'error',
                error: mensajesFuncionales.E_OPERATION_NOT_OWNER_CUSTOMER
            });
        }

        logger.pintarLog(COLORS.prompt("Obteniendo moneda de la cuenta origen"));
        let currencyOriginAccount = originAccountDb.currency_id;
        logger.pintarLog(COLORS.prompt(`Moneda obtenido de la cuenta origen ${COLORS.debug(originAccountId)} -> ${COLORS.debug(currencyOriginAccount)}`));

        logger.pintarLog(COLORS.prompt("Validando que el monto a transferir es menor al balance de la cuenta"));
        if (operation_amount >= originAccountDb.account_curr_bal_amount) {
            logger.pintarLog(mensajesFuncionales.E_OPERATION_INSUFFICIENT_BALANCE.message);
            return res.status(409).json({
                state: 'error',
                error: mensajesFuncionales.E_OPERATION_INSUFFICIENT_BALANCE
            });
        }

        logger.pintarLog(COLORS.prompt("Consultando coleccion c_accounts_detail por la cuenta destino"));
        AccountsSchema.findById(destinationAccountId, 'currency_id', async (error, destinationAccountDb) => {
            if (error) {
                logger.pintarLog(mensajesFuncionales.E_TRANSAC_DB.message);
                logger.pintarLog(error);
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            logger.pintarLog(COLORS.prompt("Verificando resultado de la consulta"));
            if (!destinationAccountDb) {
                logger.pintarLog(mensajesFuncionales.E_OPERATION_NOT_DTN_ACC.message, destinationAccountId);
                return res.status(400).json({
                    state: 'error',
                    error: mensajesFuncionales.E_OPERATION_NOT_DTN_ACC
                });
            }

            logger.pintarLog(`Respuesta obtenida ${COLORS.debug(JSON.stringify(destinationAccountDb))}`);

            logger.pintarLog(COLORS.prompt("Obteniendo moneda de la cuenta origen"));
            let currencyDestinationAccount = destinationAccountDb.currency_id;
            logger.pintarLog(COLORS.prompt(`Moneda obtenido de la cuenta destino ${COLORS.debug(originAccountId)} -> ${COLORS.debug(currencyDestinationAccount)}`));

            let montoCuentaDestino = operation_amount;
            let rateExchange = 1;
            logger.pintarLog(COLORS.prompt("Verificación de cambio de moneda"));
            if (!(currencyOriginAccount == currencyDestinationAccount)) {
                logger.pintarLog(COLORS.warn("Se requiere una conversión de moneda"));
                responseExchange = await ejecutarExchangeService(operation_amount, currencyOriginAccount, currencyDestinationAccount);
                rateExchange = responseExchange.rate;
                montoCuentaDestino = responseExchange.amount;
                if (montoCuentaDestino == -1) {
                    logger.pintarLog(COLORS.error(mensajesFuncionales.E_OPERATION_REQUEST_CONVERSION.message));
                    return res.status(400).json({
                        state: 'error',
                        error: mensajesFuncionales.E_OPERATION_REQUEST_CONVERSION
                    });
                }
            }
            logger.pintarLog(`Monto a cargar en la cuenta destino ${COLORS.debug(montoCuentaDestino)}`);

            logger.pintarLog(COLORS.prompt("Generando un ObjectId para la operación"));
            let idOperacion = mongoose.Types.ObjectId();
            logger.pintarLog(`Se ha generado el siguiente ObjectId ${COLORS.debug(idOperacion)}`);

            let operationsWriteDb = new OperationsSchema({
                _id: idOperacion,
                debit_account_id: originAccountId,
                destination_account_id: destinationAccountId,
                operation_amount: operation_amount,
                operation_concept_desc: operation_concept_desc,
                exchange_amount: rateExchange,
                itf_amount: 0,
                origin_currency_id: currencyOriginAccount,
                destination_currency_id: currencyDestinationAccount
            });

            logger.pintarLog(COLORS.prompt("Guardando en la coleccion c_operations_detail"));
            operationsWriteDb.save((error, operationDb) => {
                if (error) {
                    logger.pintarLog(mensajesFuncionales.E_TRANSAC_DB.message);
                    logger.pintarLog(error);
                    return res.status(500).json({
                        state: 'error',
                        error: mensajesFuncionales.E_TRANSAC_DB
                    });
                };

                logger.pintarLog(COLORS.prompt("Actualizando campo account_curr_bal_amount en la coleccion c_accounts_detail de la cuenta origen"));
                AccountsSchema.findByIdAndUpdate(originAccountId, { $inc: { 'account_curr_bal_amount': -1 * operation_amount } }).exec((error) => {
                    if (error) {
                        logger.pintarLog(mensajesFuncionales.E_TRANSAC_DB.message);
                        logger.pintarLog(error);
                        return res.status(500).json({
                            state: 'error',
                            error: mensajesFuncionales.E_TRANSAC_DB
                        });
                    };

                    logger.pintarLog(COLORS.prompt("Actualizando campo account_curr_bal_amount en la coleccion c_accounts_detail de la cuenta destino"));
                    AccountsSchema.findByIdAndUpdate(destinationAccountId, { $inc: { 'account_curr_bal_amount': montoCuentaDestino } }).exec((error) => {
                        if (error) {
                            logger.pintarLog(mensajesFuncionales.E_TRANSAC_DB.message);
                            logger.pintarLog(error);
                            return res.status(500).json({
                                state: 'error',
                                error: mensajesFuncionales.E_TRANSAC_DB
                            });
                        };

                        let fecha = operationDb["transaction_date"];
                        operationDb["transaction_date"] = `${ fecha.getDate() }/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`;
                        logger.pintarLog(COLORS.info("Transferencia ejecutada de manera exitosa"));
                        res.status(200).json({
                            state: 'success',
                            data: operationDb,
                            tsec: req.tsec
                        });
                    });
                });
            });
        });
    });
});

/**
 * 
 * SERVICIO QUE PERMITE MOSTRAR LA INFORMACIÓN BASICA DEL DUEÑO DE UNA CUENTA
 *  SERVICE NAME: showAccountOwnerInformation
 *  SERVICE CODE: 04-2020002
 * 
 */

router.get('/:account_id', validate_jwt, (req, res) => {

    let account_id = req.params.account_id;

    if (!account_id) {
        logger.pintarLog("FALTA account_id".error);
        return res.status(500).json({
            state: 'error',
            error: mensajesFuncionales.E_PARAM_REQ
        });
    }

    if (Number.isNaN(account_id) || account_id.length != 18) {
        logger.pintarLog(`${COLORS.error(mensajesFuncionales.E_ACCOUNT_BAD_NUMBER.message)} ${COLOR.debug(account_id)}`);
        return res.status(400).json({
            state: 'error',
            error: mensajesFuncionales.E_ACCOUNT_BAD_NUMBER
        });
    }

    AccountsSchema
        .findOne(
            { "account_id": account_id },
            'account_id currency_id'
            )
        .populate({
            path: 'customer',
            select: 'first_name last_name',
            model: 'c_customers_detail'
        })
        .exec((error, accountDB) => {
            if (error) {
                logger.pintarLog(mensajesFuncionales.E_TRANSAC_DB.message);
                logger.pintarLog(error);
                return res.status(500).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            if (!accountDB) {
                logger.pintarLog(COLORS.error(mensajesFuncionales.E_ACCOUNT_NOT_EXIST.message));
                return res.status(409).json({
                    state: 'error',
                    error: mensajesFuncionales.E_TRANSAC_DB
                });
            };

            return res.status(200).json({
                state: "success",
                data: accountDB.sinIds(),
                tsec: req.tsec
            });
        })
});

module.exports = router;