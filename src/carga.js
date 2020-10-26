const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let CustomerModel = require('./models/customers');
let CardModel = require('./models/cards');
let AccountModel = require('./models/accounts');

let customersArray = require('./../mock/costumers.json');
let cardsArray = require('./../mock/cards.json');
let accountsArray = require('./../mock/accounts.json');

//Inicio de la aplicación
mongoose.connect(
    `mongodb+srv://back-user:i500xSadVtZdybpN@cluster0.jaggg.mongodb.net/BMG_APTU_API_BACK?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false
    },
    (error, resp) => {
        if (error) {
            console.error(`Error al conectarse con la base de datos - ${error}`);
        };

        console.info('INICIANDO CARGA DE BD');

        customersArray.forEach((customer, index) => {

            let  idCustomer = mongoose.Types.ObjectId();
            let  idAccount = mongoose.Types.ObjectId();
            let  idAccount2 = mongoose.Types.ObjectId();
            let  idAccount3 = mongoose.Types.ObjectId();
            let  idCard = mongoose.Types.ObjectId();

            let customerWriteBd = new CustomerModel({
                _id: idCustomer,
                personal_id_type: customer.personal_id_type,
                personal_id: customer.personal_id,
                first_name: customer.first_name,
                last_name: customer.last_name,
                customer_gender_type: customer.customer_gender_type,
                birth_date: customer.birth_date,
                email_desc: customer.email_desc,
                customer_cellphone_id: customer.customer_cellphone_id,
                accounts:[idAccount,idAccount2,idAccount3],
                cards:[idCard]
            });

            let cardsWriteBd = new CardModel({
                _id: idCard,
                card_pan_id: cardsArray[index].card_pan_id,
                finance_card_type: cardsArray[index].finance_card_type,
                card_expiration_date: bcrypt.hashSync(cardsArray[index].card_expiration_date, 10),
                card_ccv_id: bcrypt.hashSync(cardsArray[index].card_ccv_id.toString(), 10),
                card_pin_id: bcrypt.hashSync(cardsArray[index].card_pin_id.toString(), 10),
                customer: idCustomer
            });

            let accountWriteBd = new AccountModel({
                _id: idAccount,
                account_id: accountsArray[index].account_id,
                account_type: accountsArray[index].account_type,
                currency_id: accountsArray[index].currency_id,
                account_opening_date: accountsArray[index].account_opening_date,
                account_curr_bal_amount: accountsArray[index].account_curr_bal_amount,
                customer: idCustomer
            });

            let accountWriteBd2 = new AccountModel({
                _id: idAccount2,
                account_id: accountsArray[index+50].account_id,
                account_type: accountsArray[index+50].account_type,
                currency_id: accountsArray[index+50].currency_id,
                account_opening_date: accountsArray[index+50].account_opening_date,
                account_curr_bal_amount: accountsArray[index+50].account_curr_bal_amount,
                customer: idCustomer
            });

            let accountWriteBd3 = new AccountModel({
                _id: idAccount3,
                account_id: accountsArray[index+100].account_id,
                account_type: accountsArray[index+100].account_type,
                currency_id: accountsArray[index+100].currency_id,
                account_opening_date: accountsArray[index+100].account_opening_date,
                account_curr_bal_amount: accountsArray[index+100].account_curr_bal_amount,
                customer: idCustomer
            });

            customerWriteBd.save((err, response) => {
                if (err) {
                    console.error("Error al cargar el customer " + JSON.stringify(customerWriteBd) + " " + err);
                } else {
                    console.info("Se inserto el customer " + idCustomer);

                    cardsWriteBd.save((err,response)=>{
                        if(err){
                            console.error("Error al cargar tarjeta " + JSON.stringify(cardsWriteBd) + " " + err);
                        }else{
                            console.info("Se inserto el card " + idCard);
                        }
                    });

                    accountWriteBd.save((err,response)=>{
                        if(err){
                            console.error("Error al cargar cuenta " + JSON.stringify(accountWriteBd) + " " + err);
                        }else{
                            console.info("Se inserto el card " + idAccount);
                        }
                    });

                    accountWriteBd2.save((err,response)=>{
                        if(err){
                            console.error("Error al cargar el cuenta " + JSON.stringify(accountWriteBd) + " " + err);
                        }else{
                            console.info("Se inserto el card " + idAccount2);
                        }
                    });

                    accountWriteBd3.save((err,response)=>{
                        if(err){
                            console.error("Error al cargar el cuenta " + JSON.stringify(accountWriteBd) + " " + err);
                        }else{
                            console.info("Se inserto el card " + idAccount3);
                        }
                    });

                }
            });

        });

    });