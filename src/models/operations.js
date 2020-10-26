let mongoose = require('mongoose');
let Schema = mongoose.Schema;

//Importación necesarias
let {
    currency_enum
} = require('./enums/enums');

//Importación necesarias
let currency_data = require('./enums/currency').currency;

let OperationSchema = new Schema({
    debit_account_id: {
        type: Schema.Types.ObjectId,
        ref: 'Accounts',
        required: [true, 'Campo debit_account_id es obligatorio']
    },
    destination_account_id: {
        type: Schema.Types.ObjectId,
        ref: 'Accounts',
        required: [true, 'Campo destination_account_id es obligatorio']
    },
    operation_amount: {
        type: Number,
        required: [true, 'Campo operation_amount es obligatorio']
    },
    transaction_date: {
        type: Date,
        required: [true, 'Campo transaction_date es obligatorio'],
        default: new Date()
    },
    operation_concept_desc: {
        type: String
    },
    exchange_amount: {
        type: Number,
        required: [true, 'Campo exchange_amount es obligatorio']
    },
    itf_amount: {
        type: Number,
        required: [true, 'Campo itf_amount es obligatorio']
    },
    origin_currency_id: {
        type: String,
        required: [true, 'Campo origin_currency_id es obligatorio'],
        enum: currency_enum
    },
    destination_currency_id: {
        type: String,
        required: [true, 'Campo destination_currency_id es obligatorio'],
        enum: currency_enum
    }
})

OperationSchema.methods.toShowAccountFormat = function (accountId) {
    let Aux = this;
    let operacion = Aux.toObject();
    let fecha = operacion["transaction_date"];

    if (operacion.debit_account_id == accountId) {
        operacion.operation_amount *= -1;
        operacion["currency_short_format"] = currency_data[operacion.origin_currency_id].short;
        operacion["amount_format"] = `${currency_data[operacion.origin_currency_id].short} ${operacion.operation_amount}`
    }
    if (operacion.destination_account_id == accountId) {
        operacion.operation_amount *= operacion.exchange_amount;
        operacion["currency_short_format"] = currency_data[operacion.origin_currency_id].short;
        operacion["amount_format"] = `${currency_data[operacion.destination_currency_id].short} ${operacion.operation_amount}`
    }

    operacion["transaction_date"] = `${ fecha.getDate() }/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`;
    operacion["operation_amount"] = operacion["operation_amount"].toFixed(2);


    delete operacion.debit_account_id;
    delete operacion.destination_account_id;
    delete operacion.exchange_amount;
    delete operacion.__v;
    delete operacion.origin_currency_id;
    delete operacion.destination_currency_id;

    return operacion;
}

module.exports = mongoose.model('c_operations_detail', OperationSchema);