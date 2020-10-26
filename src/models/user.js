const mongoose = require('mongoose');
let uniqueVal = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    password:{
        type: String,
        required: [true, 'Campo password es obligatorio'],
        unique: true
    },
    customer:{
        type: Schema.Types.ObjectId,
        ref: 'c_customers_detail',
        required: [true, 'Campo Customer es obligatorio'],
        unique: true
    }

})

userSchema.plugin(uniqueVal, {
    message: 'El {PATH} debe ser único'
});

userSchema.methods.toJSON = function() {
    let Aux = this;
    let AuxObjeto = Aux.toObject();
    delete AuxObjeto.password;
    AuxObjeto.customer.personal_id = `***${(AuxObjeto.customer.personal_id+"").slice(-3)}`;

    return AuxObjeto;
}

module.exports = mongoose.model('c_user_access_credentials', userSchema);