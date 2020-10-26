let personal_id_type_enum = {
    values:[
        'DNI',
        'CEXT',
        'PAS'
    ],
    message: `El valor {VALUE} no es un Tipo de Documento válido `
}

let gender_enum = {
    values:[
        'M',
        'F'
    ],
    message: `El valor {VALUE} no es un Genero válido `
}

let currency_enum = {
    values:[
        'PEN',
        'USD',
        'EUR'
    ],
    message: `El valor {VALUE} no es una Moneda válido `
}

let card_type_enum = {
    values:[
        'VISA',
        'MASTERCARD'
    ],
    message: `El valor {VALUE} no es un tipo válido `
}

module.exports = {
    gender_enum,
    personal_id_type_enum,
    currency_enum,
    card_type_enum
};

