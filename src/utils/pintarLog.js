//Pintado de logs
let logger = {
    is: "",
    pintarLog(mensaje) {
        console.log(`[${this.is}]\n\t${mensaje}`);
    }
};

module.exports={
    logger
}