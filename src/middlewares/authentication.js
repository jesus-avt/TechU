const jwt = require('jsonwebtoken');
const { mensajesFuncionales } = require('./../utils/mensajesRespuestaFuncional');

//Logger
let { logger } = require("./../utils/pintarLog");
logger.is = 'src.middlewares.authentication';


// Validación del jwt tsec
let validate_jwt = (req, res, next) => {
    let tsec = req.get('tsec');
    let customerId = req.body.customer_id || req.params.customerId || req.get('customerId');
    console.log(customerId);

    if (!customerId) {
        logger.pintarLog(mensajesFuncionales.E_PARAM_REQ.message);
        return res.status(400).json({
            state: 'error',
            error: mensajesFuncionales.E_PARAM_REQ
        });
    }

    logger.pintarLog(COLORS.prompt('Verificando presencia de token'));
    if (!tsec) {
        logger.pintarLog(mensajesFuncionales.E_AUTH_NO_TOKEN.message);
        return res.status(401).json({
            state: 'error',
            error: mensajesFuncionales.E_AUTH_NO_TOKEN
        });
    }

    logger.pintarLog(COLORS.prompt('Decodificando el token presente'));
    jwt.verify(tsec, process.env.SEED_JWT, (error, decode) => {
        if (error) {
            logger.pintarLog(mensajesFuncionales.E_AUTH_NO_VALID_TOKEN.message);
            return res.status(401).json({
                state: 'error',
                error: mensajesFuncionales.E_AUTH_NO_VALID_TOKEN
            });
        };

        logger.pintarLog(COLORS.prompt('Token presente decodificado'));
        let customer= decode.customer;

        logger.pintarLog(COLORS.prompt('Verificando que el token pertenece al cliente'));
        if (customerId != customer._id) {
            logger.pintarLog(mensajesFuncionales.E_AUTH_NO_CORRECT_TOKEN.message);
            return res.status(401).json({
                state: 'error',
                error: mensajesFuncionales.E_AUTH_NO_CORRECT_TOKEN
            });
        };

        logger.pintarLog(COLORS.prompt('Token verificado correctamente'));
        logger.pintarLog(COLORS.prompt('Generando nuevo token valido'));
        req.customer = customer;
        let newToken = jwt.sign({ customer }, process.env.SEED_JWT, { expiresIn: process.env.CADUCIDAD_JWT });
        req.tsec= newToken;
        logger.pintarLog(COLORS.prompt('Prosiguiendo con la transaccion'));
        next();
    });
};

module.exports = {
    validate_jwt,
}