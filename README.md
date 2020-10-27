# TechU
TechU -Practitioner - 2020
Proyecto Tech University Api Banca Web
## Introducción 
Objetivo: Desarollo de una Banca web, donde se ejemplifican todos los conocimientos adquiridos 
en el presente curso, usando principalmente NodeJS, Polymer 3.
## Funcionalidades
1.	Creación de usuario Web.
2.	Actualización de credenciales de usuario.
3.	Validación de credenciales de acceso de un usuario.
4.	Listar cuentas por cliente.
5.	Muestra las cuentas y operaciones de un cliente.
6.	Lista tarjetas por cliente.
7.	Realizar transferencias de dinero entre clientes.
8.	Genera token de autenticación en la sesión la cual se refresca en cada operación, solicitud al backend.
9.	Conversión de moneda medinate el consumo de un api cuando las cuentas son de distinta moneda
## Variables
VG_HOST=cluster0.jaggg.mongodb.net

VG_NAME_BD=BMG_APTU_API_BACK
VG_USER_DB=back-user
VG_PASS_DB=i500xSadVtZdybpN
VG_JWT=kasnxXasmxAsd1sj9S
VG_MINUTOS_ACTIVOS=15m
VG_API_EXCHANGE_RATE=https://api.cambio.today/v1/quotes/
VG_API_KEY_EXCHANGE_RATE=4620|HiTENtqwJraRjynsHQq0oWf9pJ8DW_tU
##Dependencias 
Segun el archivo package.json  
    "bcrypt": "^3.0.0",
    "body-parser": "^1.19.0",
    "colors": "^1.4.0",
    "cors": "^2.8.5",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^5.9.14",
    "mongoose-unique-validator": "^2.0.3",
    "mongoose-validator": "^2.1.0",
    "request-json": "^0.6.5",
    "underscore": "^1.10.2"
### Ambiente - Local - Work
Instalar (solo si no se tiene)
Abrir un terminar
npm install
npm run dev

## Funcionalidades
### *Autenticacion*
backend-api-web\src\routes\auth.js
#### POST
http://localhost:3000/api-banca-web/v0/users
Petición que permite la autenticacion del usuario y la creación de un TSEC.
### *Usuarios*
backend-api-web\src\routes\users.js
#### POST
Peticion que registra al cliente, en la colección *c_user_access_credentials*, para inscribirse valida el numero de tarjeta clave del cajero datos de la *tarjeta* del *cliente*.
#### PUT
backend-api-web\src\routes\users.js
Peticion que actualiza la contraseña de un usuario,en la colección *c_user_access_credentials*, para inscribirse valida el numero de tarjeta clave del cajero datos de la *tarjeta* del *cliente*.

### *Clientes*
backend-api-web\src\routes\customers.js
#### GET
http://localhost:3000/api-banca-web/v0/customer/{customerId_ObjectId}/account
Peticion que obtiene las cuentas de un cliente*.
http://localhost:3000/api-banca-web/v0/customer/{customerId_ObjectId}/cards
Peticion que obtiene las tarjetas de un cliente.
http://localhost:3000/api-banca-web/v0//customer/{customerId_ObjectId}/accounts/{accountId_ObjectId}
Peticion que obtiene cuentas y operaciones de un cliente.

### *Operaciones*
#### POST
backend-api-web\src\routes\accounts.js
http://localhost:3000/api-banca-web/v0/operations/{{customerId_ObjectId}}/{{accountId}}/{{destinationAccountId}}
Petición que permite realizar transferencias entre cunetas de clientes .
http://localhost:3000/api-banca-web/v0/accounts/{{NRO_CTA}}
Peticion que obtiene informacion basica de una cuenta.

Autores:
Quiroz Sotelo Liz Fiorella
Velazque Tito Jesus Antonio
