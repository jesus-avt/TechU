let eliminarPropiedadesObject = function (object, propiedad) {
    delete object[propiedad];

    return object;
}