class Errores{
    constructor(tipo, mensaje, linea, columna){
        this.tipo = tipo
        this.mensaje = mensaje
        this.linea = linea
        this.columna = columna
    }
}

module.exports = {Errores}