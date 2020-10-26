let mongoose = require('mongoose');
let uniqueVal = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let {
    currency_enum
} = require('./enums/enums');

let currencyData = require('./enums/currency').currency;

let AccountsSchema = new Schema({
    account_id: {
        type: String,
        required: [true, 'Campo account_id es obligatorio'],
        unique: true
    },
    account_type: {
        type: String,
        required: [true, 'Campo account_type es obligatorio']
    },
    currency_id: {
        type: String,
        required: [true, 'Campo currency_id es obligatorio'],
        enum: currency_enum
    },
    account_opening_date: {
        type: Date,
        required: [true, 'Campo account_opening_date es obligatorio']
    },
    account_curr_bal_amount: {
        type: Number,
        required: [true, 'Campo account_curr_bal_amount es obligatorio']
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    }
})


AccountsSchema.methods.sinIds = function () {
    let Aux = this;
    let cuenta = Aux.toObject();
    let account_number = cuenta["account_id"];    
    cuenta["currency_short_format"] = currencyData[cuenta.currency_id].short;
    cuenta["currency_name_format"] = currencyData[cuenta.currency_id].name;
    cuenta["account_id"] = `${account_number.substring(0, 4)}-${account_number.substring(4,8)}-${account_number.substring(8)}`;

    delete cuenta.customer._id;

    return cuenta;
}

AccountsSchema.methods.toFormat = function () {
    let Aux = this;
    let cuenta = Aux.toObject();

    let currency_short = currencyData[cuenta.currency_id].short;
    let account_number = cuenta["account_id"];
    let fecha = cuenta["account_opening_date"];
    cuenta["currency_short_format"] = currency_short;
    cuenta["balance_format"] = `${currency_short} ${cuenta["account_curr_bal_amount"].toFixed(2)}`;
    cuenta["cci_format"] = `${account_number.substring(1, 4)}-${account_number.substring(5,8)}-00${account_number.substring(8)}-15`;
    cuenta["account_number_format"] = `${account_number.substring(0, 4)}-${account_number.substring(4,8)}-${account_number.substring(8)}`;
    cuenta["account_opening_date"] = `${ fecha.getDate() }/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    cuenta["currency_large_format"] = `${ currencyData[cuenta.currency_id].name }`;

    return cuenta;
}


AccountsSchema.plugin(uniqueVal, {
    message: 'El {PATH} debe ser único'
});

module.exports = mongoose.model('c_accounts_detail', AccountsSchema);