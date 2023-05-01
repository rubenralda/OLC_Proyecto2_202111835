const Tabla = require("../tablaSimbolos/tablaSimbolos.js");
const Ambito = require('../ambito/ambito.js');

class Llamada{
    constructor(id = "", argumentos = [], main = false){
        this.id = id
        this.argumentos = argumentos
        this.main = main
    }

    ejecutar(ambitoLocal){//clase ambitoLocal
        //console.log(ambitoLocal)
        let ambitoGlobal = ambitoLocal.retornaRaiz();
        let funcionEncontrada = ambitoLocal.buscar(this.id);
        if (funcionEncontrada != null) {
            if (funcionEncontrada.tipo == "METODO" || funcionEncontrada.tipo == "FUNCION"){
                return funcionEncontrada.objeto.ejecutar(ambitoGlobal, ambitoLocal, this.argumentos)
            }else {
                console.log("No se puede hacer la llamada porque no es funcion")
                return {
                    error : true
                }
            }
        }else {
            console.log("La función o método no existe")
            return {
                error : true
            }
        }
    }
}

class Funcion{
    constructor(tipo = "", id = "", parametros = [], sentencias = []){
        this.tipo = tipo //primitivo
        this.id = id
        this.parametros = parametros //lista de objetos Parametro
        this.sentencias = sentencias //lista de objetos variados
    }

    /*
     *Argumentos: lista de objetos expresiones
    */
    ejecutar(ambitoGlobal, ambitoPadre, argumentos = []){
        let ambitoLocal = new Ambito(this.id, ambitoGlobal); //ambito de la funcion
        ambitoGlobal.agregarHijo(ambitoLocal)
        let largo = this.parametros.length
        if (argumentos.length != largo) {
            console.log("Error faltan argumentos en la funcion " + this.id); //quitar mensaje xd
            return {
                error: true
            }
        }
        for (let index = 0; index < largo; index++) {
            ambitoLocal.agregar(this.parametros[index].id, 
                this.parametros[index].tipo, 
                "VARIABLE", 
                argumentos[index].ejecutar(ambitoPadre)
                );
        }
        for (const sentencia of this.sentencias) {//ejecuto cada sentencia de la funcion
            //console.log(sentencia)
            if (sentencia instanceof Retorno) {
                let retorno = sentencia.ejecutar(ambitoLocal);
                if (retorno == null && this.tipo == "VOID") {
                    return null
                    /*return {
                        error: false,
                        retorno : null
                    }*/
                }else if (this.tipo != "VOID" && retorno != null) {
                    /*return {
                        error: false,
                        retorno : retorno
                    } */
                    return retorno
                }else {
                    console.log("Error el retorno no coincide con el tipo de la funcion")
                    return {
                        error : true
                    }
                }
            }
            /*if (sentencia instanceof Llamada) {
                sentencia.ejecutar(ambitoGlobal, ambitoLocal);
            } else {
                sentencia.ejecutar(ambitoLocal);
            }*/
            //console.log(sentencia)
            sentencia.ejecutar(ambitoLocal);
            
        }
        if (this.tipo == "VOID") {
            return {
                error: false,
                retorno : null
            }    
        }else{
            console.log("Falta un retorno")
            return {
                error: true
            }
        }
        
    }
}

class DeclaracionVariables{
    constructor(tipo = "", id = "", expresion = null, casteo = null){
        this.id = id
        this.tipo = tipo
        if (expresion == null) {
            switch (tipo) {//cambiar a la la clase primitiva
                case "INT":
                    this.expresion = new Expresion("VALOR", 0)
                    break;
                case "DOUBLE":
                    this.expresion = new Expresion("VALOR", 0)
                    break;
                case "BOOL":
                    this.expresion = new Expresion("VALOR", false)
                    break;
                case "CHAR":
                    this.expresion = new Expresion("VALOR", '')
                    break;
                case "STRING":
                    this.expresion = new Expresion("VALOR", "")
                    break;
                default:
                    console.log("Error inesperado al inicializar la variable")
                    break;
            }
        }else{
            this.expresion = expresion
        }
        this.casteo = casteo
        this.ternario = null
    }

    guardarTernario(expresionLogica, expresion1, expresion2){
        this.ternario = new Ternario(expresionLogica, expresion1, expresion2)
    }

    ejecutar(ambitoLocal){
        ambitoLocal.agregar(this.id, this.tipo, "VARIABLE" , this.retonarValor(ambitoLocal));
    }

    retonarValor(ambitoLocal){
        if (this.casteo != null) {
            if(this.casteo == this.tipo){
                switch (this.casteo) {
                    case "INT":
                        this.expresion = new Expresion("VALOR", parseInt(this.expresion.ejecutar(ambitoLocal)))
                        break;
                    case "DOUBLE":
                        this.expresion = new Expresion("VALOR", parseFloat(this.expresion.ejecutar(ambitoLocal)))
                        break;
                    case "CHAR":
                        this.expresion = new Expresion("VALOR", String.fromCharCode(parseInt(this.expresion.ejecutar(ambitoLocal))))
                        break;
                    default:
                        console.log("Casteo no valido")
                        break;
                }
                this.casteo == null
                return this.expresion
            }else{
                console.log("Casteo no posible")
                return null
            }
        }else if(this.ternario != null){
            this.ternario = null
            this.expresion = this.ternario.ejecutar(ambitoLocal)
        }
        return this.expresion.ejecutar(ambitoLocal)
    }

    cambiarValor(expresion){
        this.casteo = null
        this.ternario = null
        this.expresion = expresion
    }
}

class Asignacion{
    constructor(id = "", expresion = null, casteo = null, posicion = -1, lista = false){
        this.id = id
        this.expresion = expresion
        this.casteo = casteo
        this.posicion = posicion
        this.lista = lista
        this.ternario = null
    }

    guardarTernario(expresionLogica, expresion1, expresion2){
        this.ternario = new Ternario(expresionLogica, expresion1, expresion2)
    }

    ejecutar(ambitoLocal){
        let variable = ambitoLocal.buscar(this.id)
        if(variable == null){
           return
        }
        if (this.casteo != null) {
            if(this.casteo == variable.tipo){
                switch (this.casteo) {
                    case "INT":
                        this.expresion = new Expresion("VALOR", parseInt(this.expresion.ejecutar(ambitoLocal)))
                        break;
                    case "DOUBLE":
                        this.expresion = new Expresion("VALOR", parseFloat(this.expresion.ejecutar(ambitoLocal)))
                        break;
                    case "CHAR":
                        this.expresion = new Expresion("VALOR", String.fromCharCode(parseInt(this.expresion.ejecutar(ambitoLocal))))
                        break;
                    default:
                        console.log("Casteo no valido")
                        break;
                }
            }else{
                console.log("Casteo no posible")
            }
        }
        if(this.ternario != null){
            this.expresion = this.ternario.ejecutar(ambitoLocal)
        }
        variable.objeto = this.expresion.ejecutar(ambitoLocal)
    }
}

class Ternario{
    constructor(expresionLogica, expresion1, expresion2) {
        this.expresionLogica = expresionLogica
        this.expresion1 = expresion1
        this.expresion2 = expresion2
    }
    
    ejecutar(ambitoLocal){
        let resultado = this.expresionLogica.ejecutar(ambitoLocal);
        if (resultado == true || resultado == false) {
            return resultado ? this.expresion1 : this.expresion2 ;
        }
        console.log("Expresion logica no valida, se retorna la expresion verdadera")
        return this.expresion1;        
    }
}

class Parametros{
    constructor(tipo = "", id = ""){
        this.tipo = tipo
        this.id = id
        this.valor = null
    }
}

//falta comprobar el char
class Expresion{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
    }

    ejecutar(ambitoLocal){
        switch (this.tipo) {
            case "SUMA":
                return this.valor1.ejecutar(ambitoLocal) + this.valor2.ejecutar(ambitoLocal);
            case "RESTA":
                return this.valor1.ejecutar(ambitoLocal) - this.valor2.ejecutar(ambitoLocal);
            case "MULTIPLICACION":
                return this.valor1.ejecutar(ambitoLocal) * this.valor2.ejecutar(ambitoLocal);
            case "DIVICION":
                return this.valor1.ejecutar(ambitoLocal) / this.valor2.ejecutar(ambitoLocal);
            case "PAR":
                return this.valor1.ejecutar(ambitoLocal);
            case "VALOR":
                return this.valor1;
            case "UNARIO":
                return -this.valor1.ejecutar(ambitoLocal);
            case "ID":
                let valorEncontrado = ambitoLocal.buscar(this.valor1)
                if (valorEncontrado) {
                    if (valorEncontrado.objeto instanceof DeclaracionVariables) {
                        return valorEncontrado.objeto.retonarValor(ambitoLocal);    
                    }else {
                        return valorEncontrado.objeto;
                    }
                }
                break;
            case "POTENCIA":
                return this.valor1.ejecutar(ambitoLocal) ** this.valor2.ejecutar(ambitoLocal);
            case "MODULO":
                return this.valor1.ejecutar(ambitoLocal) % this.valor2.ejecutar(ambitoLocal);
            default:
                console.log("Error inesperado totalmente inesperado de expresion")
                break;
        }
    }
}

class Retorno{
    constructor(expresion = null){
        this.expresion = expresion
    }

    ejecutar(ambitoLocal){
        if (this.expresion == null) {
            return null
        }
        return this.expresion.ejecutar(ambitoLocal)
    }
}

class Vector{
    constructor(tipo = "", id = "", tipo2 = "", expresion = null, listaValores = []){ //expresion es el tamaño
        this.tipo = tipo
        this.id = id
        this.tipo2 = tipo2
        this.expresion = expresion
        this.listaValores = listaValores
    }
}

class Lista{
    constructor(tipo = "", id = "", tipo2 = ""){
        this.tipo = tipo
        this.id = id
        this.tipo2 = tipo2
    }
}

class Imprimir{
    constructor(expresion = null){
        this.expresion = expresion
    }

    ejecutar(ambitoLocal){
        let salida = this.expresion.ejecutar(ambitoLocal)
        console.log("-------------------------------")
        ambitoLocal.agregarSalida(salida)
        console.log(salida)
        console.log("-------------------------------")
    }
}

class ExpresionRelacional{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
    }

    ejecutar(ambitoLocal){
        switch (this.tipo) {
            case "MAYOR":
                return this.valor1.ejecutar(ambitoLocal) > this.valor2.ejecutar(ambitoLocal);
            case "MENOR":
                return this.valor1.ejecutar(ambitoLocal) < this.valor2.ejecutar(ambitoLocal);
            case "MAYOR_IGUAL":
                return this.valor1.ejecutar(ambitoLocal) >= this.valor2.ejecutar(ambitoLocal);
            case "MENOR_IGUAL":
                return this.valor1.ejecutar(ambitoLocal) <= this.valor2.ejecutar(ambitoLocal);
            case "DOBLE_IGUAL":
                return this.valor1.ejecutar(ambitoLocal) == this.valor2.ejecutar(ambitoLocal);
            case "NEGACION_IGUAL":
                return this.valor1.ejecutar(ambitoLocal) != this.valor2.ejecutar(ambitoLocal);
            default:
                console.log("Error inesperado totalmente inesperado de expresion logica")
                break;
        }
    }
}

class AccesoValor{
    constructor(id = "", expresion = null, lista = false){
        this.posicion = expresion
        this.id = id
        this.lista = lista
    }
}

class Incremento{
    constructor(id = ""){
        this.id = id
    }

    ejecutar(ambitoLocal){
        ambitoLocal.buscar(this.id)
    }
}

class Decremento{
    constructor(id = ""){
        this.id = id
    }

    ejecutar(ambitoLocal){
        ambitoLocal.buscar(this.id)
    }
}

class ExpresionLogica{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
    }

    ejecutar(ambitoLocal){
        switch (this.tipo) {
            case "AND":
                return this.valor1.ejecutar(ambitoLocal) && this.valor2.ejecutar(ambitoLocal);
            case "OR":
                return this.valor1.ejecutar(ambitoLocal) || this.valor2.ejecutar(ambitoLocal);
            case "NEGACION":
                return !this.valor1.ejecutar(ambitoLocal);
            default:
                console.log("Error inesperado totalmente inesperado de expresion logica")
                break;
        }
    }
}

class InstruccionIf{
    constructor(expresion, sentencia = [], sentenciaElse = [], siguiente = null){
        this.expresion = expresion
        this.sentencia = sentencia
        this.sentenciaElse = sentenciaElse
        this.siguiente = siguiente
    }
}

module.exports = {
    Retorno, 
    Funcion, 
    DeclaracionVariables, 
    Parametros,
    Expresion, 
    Llamada, 
    Vector,
    Lista,
    Asignacion,
    Imprimir,
    AccesoValor,
    ExpresionLogica,
    Incremento,
    Decremento,
    ExpresionRelacional,
    InstruccionIf
};