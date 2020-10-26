//Defición de variables globales
global.AMBIENTE = process.env.PORT ? 'PROD' : 'DEV';
global.VERSION = 'v0';
global.CONTEXT = `/api-banca-web/${VERSION}`;

//Cargamos puerto si es necesario
process.env.PORT = process.env.PORT ? process.env.PORT : 3000;

//Configuracion de colores
global.COLORS = require('colors');

COLORS.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});