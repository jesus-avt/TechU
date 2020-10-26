let mongoose = require('mongoose');
let uniqueVal = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

//Importación necesarias
let { 
    card_type_enum
} = require('./enums/enums');

let CardsSchema = new Schema({
    card_pan_id: {
        type: String,
        required: [true, 'Campo card_pan_id es obligatorio'],
        unique: true
    },
    finance_card_type: {
        type: String,
        required: [true, 'Campo finance_card_type es obligatorio'],
        enum: card_type_enum
    },
    card_expiration_date: {
        type: String,
        required: [true, 'Campo card_expiration_date es obligatorio']
    },
    card_ccv_id: {
        type: String,
        required: [true, 'Campo card_ccv_id es obligatorio']
    },
    card_pin_id:{
        type: String,
        required: [true, 'Campo card_pin_id es obligatorio']
    },
    customer:{
        type: Schema.Types.ObjectId,
        ref: 'c_customer_detail'
    }
})

CardsSchema.methods.toJSON = function() {
    let Aux = this;
    let AuxObjeto = Aux.toObject();
    let card_number = AuxObjeto.card_pan_id
    
    AuxObjeto.card_pan_id = `**${card_number.substring(card_number.length - 3)}`

    return AuxObjeto;
}


CardsSchema.plugin(uniqueVal, {
    message: 'El {PATH} debe ser único'
});

module.exports = mongoose.model('c_cards_detail', CardsSchema);