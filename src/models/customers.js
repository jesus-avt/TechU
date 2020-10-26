let mongoose = require('mongoose');
let uniqueVal = require('mongoose-unique-validator');
let Schema = mongoose.Schema;
let _ = require('underscore');

//Importación necesarias
let {
    personal_id_type_enum,
    gender_enum
} = require('./enums/enums');

let currencyData = require('./enums/currency').currency;

let CustomerSchema = new Schema({
    personal_id_type: {
        type: String,
        required: [true, 'Campo personal_id_type es obligatorio'],
        enum: personal_id_type_enum
    },
    personal_id: {
        unique: true,
        type: Number,
        required: [true, 'Campo personal_id es obligatorio']
    },
    first_name: {
        type: String,
        required: [true, 'Campo first_name es obligatorio']
    },
    last_name: {
        type: String,
        required: [true, 'Campo last_name es obligatorio']
    },
    customer_gender_type: {
        type: String,
        required: [true, 'Campo customer_gender_type es obligatorio'],
        enum: gender_enum
    },
    birth_date: {
        type: Date,
        required: [true, 'Campo birth_date es obligatorio']
    },
    email_desc: {
        type: String,
        required: [true, 'Campo email_desc es obligatorio']
    },
    customer_cellphone_id: {
        type: Number,
        unique: true,
        required: [true, 'Campo customer_cellphone_id es obligatorio'],
        min: [900000000, 'Campo customer_cellphone_id debe tener una longitud de 9'],
        max: [999999999, 'Campo customer_cellphone_id debe tener una longitud de 9'],
        required: [true, 'Campo customer_cellphone_id es obligatorio']
    },
    accounts: [{ type: Schema.Types.ObjectId, ref: 'c_accounts_details' }],
    cards: [{ type: Schema.Types.ObjectId, ref: 'Cards' }]

})


CustomerSchema.plugin(uniqueVal, {
    message: 'El {PATH} debe ser único'
});

CustomerSchema.methods.toJSON = function () {
    let Aux = this;
    let AuxObjeto = Aux.toObject();

    let cards = AuxObjeto.cards;
    if ( cards && cards[0]["card_pan_id"] ) {
        AuxObjeto.cards = _.map(
            AuxObjeto.cards,
            function (card) {
                card.card_pan_id = `**${card.card_pan_id.substring(card.card_pan_id.length - 3)}`
                return card;
            });
    }

    let accounts = AuxObjeto.accounts;
    if ( accounts && accounts[0]["account_number"] ) {
        AuxObjeto.accounts = _.map(
            AuxObjeto.accounts,
            function (account) {
                let currency_short = currencyData[account.currency].short;
                let account_number = account["account_number"];
                account["currency_short_format"] = currency_short;
                account["balance_format"] = `${currency_short} ${account["balance"]}`;
                account["cci_format"] = `${account_number.substring(1, 4)}-${account_number.substring(5,8)}-00${account_number.substring(8)}-15`;
                account["account_number_format"] = `${account_number.substring(0, 4)}-${account_number.substring(4,8)}-${account_number.substring(8)}`;

                return account;
            });
    }

    return AuxObjeto;
}

module.exports = mongoose.model('c_customers_detail', CustomerSchema);