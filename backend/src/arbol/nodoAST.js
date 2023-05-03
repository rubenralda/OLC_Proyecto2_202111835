//const Tabla = require("../tablaSimbolos/tablaSimbolos.js");
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
            const resulArgumento = argumentos[index].ejecutar(ambitoPadre)
            if (resulArgumento.error == true) {
                return {
                    error: true
                }
            }
            ambitoLocal.agregar(this.parametros[index].id, 
                this.parametros[index].tipo, 
                "VARIABLE",
                resulArgumento.resultado
                );
        }
        for (const sentencia of this.sentencias) {//ejecuto cada sentencia de la funcion
            //console.log(sentencia)
            if (sentencia instanceof Retorno) {
                const retorno = sentencia.ejecutar(ambitoLocal);
                if (retorno.error == true) {
                    return {
                        error : true
                    }
                }
                if (retorno.retorno == null && this.tipo == "VOID") {
                    return {
                        error: false,
                        retorno : null,
                        romper : false,
                        continuar : false
                    }
                }else if (this.tipo != "VOID" && retorno.retorno != null) {
                    return {
                        error: false,
                        retorno : retorno.retorno,
                        romper : false,
                        continuar : false
                    }
                }else {
                    console.log("Error el retorno no coincide con el tipo de la funcion")
                    return {
                        error : true
                    }
                }
            }
            const resulEjecucion = sentencia.ejecutar(ambitoLocal);
            if (resulEjecucion.error == true) {
                return {
                    error : true
                }
            }
            //console.log(resulEjecucion)
            if ("retorno" in resulEjecucion && !(sentencia instanceof Llamada)) {
                return {
                    error: false,
                    retorno : resulEjecucion.retorno,
                    romper : false,
                    continuar : false
                }
            }
        }
        if (this.tipo == "VOID") {
            return {
                error: false,
                retorno : null,
                romper : false,
                continuar : false
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
        let resultado = this.retonarValor(ambitoLocal);
        if (resultado.error == true) {
            return {
                error : true
            }
        }
        ambitoLocal.agregar(this.id, this.tipo, "VARIABLE" , resultado.resultado);
        return {
            error : false
        }
    }

    retonarValor(ambitoLocal){
        if (this.casteo != null) {
            if(this.casteo == this.tipo){
                switch (this.casteo) {//verificar que el ejecutar no retorna error : true
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
                        return {
                            error: true
                        }
                }
                this.casteo == null
            }else{
                console.log("Casteo no posible")
                return {
                    error: true
                }
            }
        }else if(this.ternario != null){
            this.ternario = null
            this.expresion = this.ternario.ejecutar(ambitoLocal)//falta tambien
        }
        let resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true) {
            return {
                error : true
            }
        }
        return {
            error : false,
            resultado : resultado.resultado
        }
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
            console.log("El ID no existe para asignar valor")
            return {
                error: true
            }
        }
        if (this.casteo != null) {
            if(this.casteo == variable.tipo){//verificar que el ejecutar no retorna error : true
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
                        return {
                            error: true
                        }
                }
                this.casteo = null
            }else{
                console.log("Casteo no posible")
                return {
                    error: true
                }
            }
        }
        if(this.ternario != null){
            this.ternario = null
            this.expresion = this.ternario.ejecutar(ambitoLocal)//falta ternario
        }
        let resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true) {
            return {
                error : true
            }
        }
        variable.objeto = resultado.resultado
        return {
            error : false
        }
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
        let valor1 = null
        let valor2 = null
        switch (this.tipo) {
            case "SUMA":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado + valor2.resultado
                }
            case "RESTA":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado - valor2.resultado
                }
            case "MULTIPLICACION":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado * valor2.resultado
                }
            case "DIVICION":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado / valor2.resultado
                }
            case "POTENCIA":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado ** valor2.resultado
                }
            case "MODULO":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado % valor2.resultado
                }
            case "PAR":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                if (valor1.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado
                }
            case "UNARIO":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                if (valor1.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : -valor1.resultado
                }
            case "VALOR":
                return {
                    error : false,
                    resultado : this.valor1
                }
            case "INCREMENTO":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                if (valor1.error == true) {
                    return {
                        error : true
                    }
                }
                if ("id" in valor1) {
                    let incre = valor1.resultado + 1
                    valor1.id.objeto = incre
                    return {
                        error: false,
                        resultado : incre
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado + 1
                }
            case "DECREMENTO":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                if (valor1.error == true) {
                    return {
                        error : true
                    }
                }
                if ("id" in valor1) {
                    let incre = valor1.resultado - 1
                    valor1.id.objeto = incre
                    return {
                        error: false,
                        resultado : incre
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado + 1
                }
            case "ID":
                let valorEncontrado = ambitoLocal.buscar(this.valor1)
                if (valorEncontrado != null) {
                    if (valorEncontrado.objeto instanceof DeclaracionVariables) {
                        const resultado = valorEncontrado.objeto.retonarValor(ambitoLocal);
                        if (resultado.error == true) {
                            return {
                                error : true
                            }
                        }
                        return {
                            error : false,
                            resultado : resultado.resultado,
                            id : valorEncontrado
                        }
                    }
                    return {
                        error : false,
                        resultado : valorEncontrado.objeto,
                        id : valorEncontrado
                    }
                }
                return {
                    error : true
                }
            case "VECTOR":
                let vectorEncontrado = ambitoLocal.buscar(this.valor1)
                let posicion = this.valor2.ejecutar(ambitoLocal)
                if (posicion.error == true) {
                    return {
                        error : true
                    }
                }
                if (typeof(posicion.resultado) != "number") {
                    console.log("La expresion no es numero de una posicion vector")
                    return {
                        error : true
                    }
                }
                if (vectorEncontrado != null) {
                    if (vectorEncontrado.tipo != "VECTOR") {
                        console.log("El ID no corresponde a un vector")
                        return {
                            error : true
                        }   
                    }
                    if (vectorEncontrado.objeto instanceof Vector) {
                        const resultado = vectorEncontrado.objeto.retonarValor(ambitoLocal);
                        if (resultado.error == true) {
                            return {
                                error : true
                            }
                        }
                        if (typeof resultado.resultado[posicion.resultado] === 'undefined') {
                            console.log("Posicion fuera del rango1")
                            return {
                                error : true
                            }
                        }
                        valor1 = resultado.resultado[posicion.resultado].ejecutar(ambitoLocal);
                        if (valor1.error == true) {
                            return {
                                error : true
                            }
                        }
                        return {
                            error : false,
                            resultado : valor1.resultado
                        }
                    }
                    if (typeof vectorEncontrado.objeto[posicion.resultado] === 'undefined') {
                        console.log("Posicion fuera del rango")
                        return {
                            error : true
                        }
                    }
                    //console.log(vectorEncontrado.objeto[posicion.resultado])
                    valor1 = vectorEncontrado.objeto[posicion.resultado].ejecutar(ambitoLocal);
                    if (valor1.error == true) {
                        return {
                            error : true
                        }
                    }
                    return {
                        error : false,
                        resultado : valor1.resultado
                    }
                }
                return {
                    error : true
                }
            case "LLAMADA":
                const resultado = this.valor1.ejecutar(ambitoLocal)
                if (resultado.error == true) {
                    return {
                        error : true
                    }
                }
                if (resultado.retorno == null) {
                    console.log("Los métodos no retornan valor")
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : resultado.retorno
                }
            default:
                console.log("Error inesperado totalmente inesperado de expresion")
                return {
                    error : true
                }
        }
    }
}

class Retorno{
    constructor(expresion = null){
        this.expresion = expresion
    }

    ejecutar(ambitoLocal){
        if (this.expresion == null) {
            return {
                error : false,
                retorno : null
            }
        }
        const resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true) {
            return {
                error : true
            }
        }
        return {
            error : false,
            retorno : resultado.resultado
        }
    }
}

class Vector{
    constructor(tipo = "", id = "", tipo2 = "", expresion = null, listaValores = []){ //expresion es el tamaño
        this.id = id
        this.tipo = tipo
        this.tipo2 = tipo2
        this.expresion = expresion
        this.listaValores = listaValores
    }

    ejecutar(ambitoLocal){
        let resultado = this.retonarValor(ambitoLocal);
        if (resultado.error == true) {
            return {
                error : true
            }
        }
        ambitoLocal.agregar(this.id, this.tipo, "VECTOR" , resultado.resultado);
        return {
            error : false
        }
    }

    retonarValor(ambitoLocal){//retorna la lista
        if (this.tipo != this.tipo2) {
            console.log("Los tipos no coinciden vector")
            return {
                error : true
            }
        }
        if (this.listaValores.length == 0) {
            let largo = this.expresion.ejecutar(ambitoLocal)
            if (largo.error == true) {
                return {
                    error : true
                }
            }
            if (typeof(largo.resultado) != "number") {
                console.log("La expresion  no es un numero para declarar el vector")
                return {
                    error : true
                }
            }            
            switch (this.tipo) {//cambiar a la la clase primitiva
                case "INT":
                    for (let index = 0; index < largo.resultado; index++) {
                        this.listaValores.push(new Expresion("VALOR", 0))
                    }
                    break;
                case "DOUBLE":
                    for (let index = 0; index < largo.resultado; index++) {
                        this.listaValores.push(new Expresion("VALOR", 0))
                    }
                    break;
                case "BOOL":
                    for (let index = 0; index < largo.resultado; index++) {
                        this.listaValores.push(new Expresion("VALOR", false))
                    }
                    break;
                case "CHAR":
                    for (let index = 0; index < largo.resultado; index++) {
                        this.listaValores.push(new Expresion("VALOR", ''))
                    }
                    break;
                case "STRING":
                    for (let index = 0; index < largo.resultado; index++) {
                        this.listaValores.push(new Expresion("VALOR", ""))
                    }
                    break;
                default:
                    console.log("Error inesperado al inicializar el vector")
                    return {
                        error : true
                    }
            }
            
        }
        return {
            error : false,
            resultado : this.listaValores
        }
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
        if (salida.error == true) {
            return {
                error : true
            }
        }
        console.log("-------------------------------")
        ambitoLocal.agregarSalida(salida.resultado)
        console.log(salida)
        console.log("-------------------------------")
        return {
            error : false
        }
    }
}

class ExpresionRelacional{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
    }

    ejecutar(ambitoLocal){
        let valor1 = null
        let valor2 = null
        switch (this.tipo) {
            case "MAYOR":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado > valor2.resultado
                }
            case "MENOR":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado < valor2.resultado
                }
            case "MAYOR_IGUAL":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado >= valor2.resultado
                }
            case "MENOR_IGUAL":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado <= valor2.resultado
                }
            case "DOBLE_IGUAL":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado == valor2.resultado
                }
            case "NEGACION_IGUAL":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado != valor2.resultado
                }
            default:
                console.log("Error inesperado totalmente inesperado de expresion logica")
                return {
                    error : true
                }
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
        let valorEncontrado = ambitoLocal.buscar(this.id)
        if (valorEncontrado != null) {
            if (valorEncontrado.objeto instanceof DeclaracionVariables) {
                const resultado = valorEncontrado.objeto.retonarValor(ambitoLocal);
                if (resultado.error == true) {
                    return {
                        error : true
                    }
                }
                valorEncontrado.objeto = resultado.resultado + 1
                return {
                    error : false
                }
            }
            valorEncontrado.objeto = valorEncontrado.objeto + 1
            return {
                error : false
            }
        }
        console.log("El ID no existe para hacer incremento")
        return {
            error : true
        }
    }
}

class Decremento{
    constructor(id = ""){
        this.id = id
    }

    ejecutar(ambitoLocal){
        let valorEncontrado = ambitoLocal.buscar(this.id)
        if (valorEncontrado != null) {
            if (valorEncontrado.objeto instanceof DeclaracionVariables) {
                const resultado = valorEncontrado.objeto.retonarValor(ambitoLocal);
                if (resultado.error == true) {
                    return {
                        error : true
                    }
                }
                valorEncontrado.objeto = resultado.resultado - 1
                return {
                    error : false
                }
            }
            valorEncontrado.objeto = valorEncontrado.objeto - 1
            return {
                error : false
            }
        }
        console.log("El ID no existe para hacer decremento")
        return {
            error : true
        }
    }
}

class ExpresionLogica{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
    }

    ejecutar(ambitoLocal){
        let valor1 = null
        let valor2 = null
        switch (this.tipo) {
            case "AND":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado && valor2.resultado
                }
            case "OR":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                valor2 = this.valor2.ejecutar(ambitoLocal);
                if (valor1.error == true || valor2.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado || valor2.resultado
                }
            case "NEGACION":
                valor1 = this.valor1.ejecutar(ambitoLocal);
                if (valor1.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : !valor1.resultado
                }
            default:
                console.log("Error inesperado totalmente inesperado de expresion logica")
                return {
                    error : true
                }
        }
    }
}

class InstruccionIf{
    constructor(expresion, sentencias = [], sentenciaElse = [], siguiente = null){
        this.expresion = expresion
        this.sentencias = sentencias
        this.sentenciaElse = sentenciaElse
        this.siguiente = siguiente
    }

    ejecutar(ambitoPadre){
        let ambitoLocal = new Ambito("IF", ambitoPadre); //ambito del if
        ambitoPadre.agregarHijo(ambitoLocal)
        const resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true) {
            return {
                error: true
            }
        }
        if (resultado.resultado == true) {
            for (const sentencia of this.sentencias) {//ejecuto cada sentencia del if
                if (sentencia instanceof Retorno) {
                    const retorno = sentencia.ejecutar(ambitoLocal);
                    if (retorno.error == true) {
                        return {
                            error : true
                        }
                    }
                    return {
                        error: false,
                        retorno : retorno.retorno,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "BREAK") {
                    return {
                        error: false,
                        romper : true,
                        continuar : false
                    }
                }
                if (sentencia == "CONTINUE") {
                    return {
                        error: false,
                        romper : false,
                        continuar : true
                    }
                }
                const resulEjecucion = sentencia.ejecutar(ambitoLocal);
                if (resulEjecucion.error == true) {
                    return {
                        error : true
                    }
                }
                if (resulEjecucion.romper == true) {
                    return {
                        error: false,
                        romper : true,
                        continuar : false
                    }
                }
                if (resulEjecucion.continuar == true) {
                    return {
                        error: false,
                        romper : false,
                        continuar : true
                    }
                }
                if ("retorno" in resulEjecucion && !(sentencia instanceof Llamada)) {
                    return {
                        error: false,
                        retorno : resulEjecucion.retorno,
                        romper : false,
                        continuar : false
                    }
                }
            }
            return {
                error: false,
                romper : false,
                continuar : false
            }
        }else if(this.siguiente != null){
            const retorno = this.siguiente.ejecutar(ambitoLocal)
            if (retorno.error == true) {
                return {
                    error : true
                }
            }
            if (retorno.romper == true) {
                return {
                    error: false,
                    romper : true,
                    continuar : false
                }
            }
            if (retorno.continuar == true) {
                return {
                    error: false,
                    romper : false,
                    continuar : true
                }
            }
            if ("retorno" in retorno) {
                return {
                    error: false,
                    retorno : retorno.retorno,
                    romper : false,
                    continuar : false
                }
            }
            return {
                error: false,
                romper : false,
                continuar : false
            }
        }else if(resultado.resultado == false){
            for (const sentencia of this.sentenciaElse) {//ejecuto cada sentencia del if
                if (sentencia instanceof Retorno) {
                    const retorno = sentencia.ejecutar(ambitoLocal);
                    if (retorno.error == true) {
                        return {
                            error : true
                        }
                    }
                    return {
                        error: false,
                        retorno : retorno.retorno,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "BREAK") {
                    return {
                        error: false,
                        romper : true,
                        continuar : false
                    }
                }
                if (sentencia == "CONTINUE") {
                    return {
                        error: false,
                        romper : false,
                        continuar : true
                    }
                }
                const resulEjecucion = sentencia.ejecutar(ambitoLocal);
                if (resulEjecucion.error == true) {
                    return {
                        error : true
                    }
                }
                if ("retorno" in resulEjecucion && !(sentencia instanceof Llamada)) {
                    return {
                        error: false,
                        retorno : resulEjecucion.retorno,
                        romper : false,
                        continuar : false
                    }
                }
            }
            return {
                error: false,
                romper : false,
                continuar : false
            }
        }else{
            console.log("La expresion es incorrecta, se espera un valor booleano")
            return {
                error : true
            }
        }
    }
}

class IntruccionSwitch{
    constructor(expresion, caseList = [], defaultCase = []){
        this.expresion = expresion
        this.caseList = caseList
        this.defaultCase = defaultCase
    }

    ejecutar(ambitoPadre){
        let ambitoLocal = new Ambito("SWITCH", ambitoPadre); //ambito del switch
        ambitoPadre.agregarHijo(ambitoLocal)
        let resultado = this.expresion.ejecutar(ambitoLocal);
        if (resultado.error == true) {
            return {
                error : true
            }
        }
        let seguir = false
        //let continuar = false
        for (const caso of this.caseList) {
            const resultCase = caso.ejecutar(ambitoLocal, resultado.resultado)
            if ("retorno" in resultCase) {
                return {
                    error: false,
                    retorno : resultCase.retorno,
                    romper : false,
                    continuar : false
                }
            }
            seguir = resultCase.romper
            if (seguir == true) {
                break;
            }
            if (resultCase.continuar == true) {
                return {
                    error: false,
                    romper : false,
                    continuar : true
                }
            }
        }
        if (seguir == false) {
            for (const sentencia of this.defaultCase) {
                if (sentencia instanceof Retorno) {
                    const retorno = sentencia.ejecutar(ambitoLocal);
                    if (retorno.error == true) {
                        return {
                            error : true
                        }
                    }
                    return {
                        error: false,
                        retorno : retorno.retorno,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "BREAK") {
                    return {
                        error: false,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "CONTINUE") {
                    return {
                        error: false,
                        romper : false,
                        continuar : true
                    }
                }
                const resulEjecucion = sentencia.ejecutar(ambitoLocal);
                if (resulEjecucion.error == true) {
                    return {
                        error : true
                    }
                }
                if ("retorno" in resulEjecucion && !(sentencia instanceof Llamada)) {
                    return {
                        error: false,
                        retorno : resulEjecucion.retorno,
                        romper : false,
                        continuar : false
                    }
                }
            }
        }
        return {
            error: false,
            romper : false,
            continuar : false
        }
    }
}

class InstruccionCase{
    constructor(expresion, sentencias = []){
        this.expresion = expresion
        this.sentencias = sentencias
    }

    ejecutar(ambitoLocal, resultado){
        const resultExpresion = this.expresion.ejecutar(ambitoLocal)
        if (resultExpresion.error == true) {
            return {
                error : true
            }
        }
        if (resultado != resultExpresion.resultado) {
            return {
                error: false,
                romper : false,
                continuar : false
            }
        }
        for (const sentencia of this.sentencias) {
            if (sentencia instanceof Retorno) {
                const retorno = sentencia.ejecutar(ambitoLocal);
                if (retorno.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error: false,
                    retorno : retorno.retorno,
                    romper : false,
                    continuar : false
                }
            }
            if (sentencia == "BREAK") {
                return {
                    error: false,
                    romper : true,
                    continuar : false
                }
            }
            if (sentencia == "CONTINUE") {
                return {
                    error: false,
                    romper : false,
                    continuar : true
                }
            }
            const resulEjecucion = sentencia.ejecutar(ambitoLocal);
            if (resulEjecucion.error == true) {
                return {
                    error : true
                }
            }
            if ("retorno" in resulEjecucion && !(sentencia instanceof Llamada)) {
                return {
                    error: false,
                    retorno : resulEjecucion.retorno,
                    romper : false,
                    continuar : false
                }
            }
        }
        return {
            error: false,
            romper : false,
            continuar : false
        }
    }
}

class BucleWhile{
    constructor(expresion, sentencias = []){
        this.expresion = expresion
        this.sentencias = sentencias
    }

    ejecutar(ambitoPadre = new Ambito("Dfdf")){
        let ambitoLocal = new Ambito("WHILE", ambitoPadre); //ambito del while
        ambitoPadre.agregarHijo(ambitoLocal)
        let resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true) {
            return {
                error: true
            }
        }
        while (resultado.resultado == true) {
            for (const sentencia of this.sentencias) {//ejecuto cada sentencia del while
                if (sentencia instanceof Retorno) {
                    const retorno = sentencia.ejecutar(ambitoLocal);
                    if (retorno.error == true) {
                        return {
                            error : true
                        }
                    }
                    return {
                        error: false,
                        retorno : retorno.retorno,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "BREAK") {
                    return {
                        error: false,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "CONTINUE") {
                    break
                }
                const resulEjecucion = sentencia.ejecutar(ambitoLocal);
                if (resulEjecucion.error == true) {
                    return {
                        error : true
                    }
                }
                if (resulEjecucion.romper == true) {
                    return {
                        error: false,
                        romper : false,
                        continuar : false
                    }
                }
                if (resulEjecucion.continuar == true) {
                    break
                }
                if ("retorno" in resulEjecucion && !(sentencia instanceof Llamada)) {
                    return {
                        error: false,
                        retorno : resulEjecucion.retorno,
                        romper : false,
                        continuar : false
                    }
                }
            }
            ambitoLocal = new Ambito("WHILE", ambitoPadre); //ambito del while
            ambitoPadre.agregarHijo(ambitoLocal)
            resultado = this.expresion.ejecutar(ambitoLocal)
            if (resultado.error == true) {
                return {
                    error: true
                }
            }
        }
        return {
            error: false,
            romper : false,
            continuar : false
        }
    }
}

class BucleFor{
    constructor(declaracionFor, expresion, actualizacion, sentencias = []){
        this.declaracionFor = declaracionFor
        this.expresion = expresion
        this.actualizacion = actualizacion
        this.sentencias = sentencias
    }

    ejecutar(ambitoPadre = new Ambito("Dfdf")){
        let ambitoLocal = new Ambito("FOR", ambitoPadre); //ambito del for
        ambitoPadre.agregarHijo(ambitoLocal)
        let declaracion = this.declaracionFor.ejecutar(ambitoLocal)
        let resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true || declaracion.error == true) {
            return {
                error: true
            }
        }
        let ambitoAuxiliar = new Ambito("FORDentro", ambitoLocal); //ambito del for
        ambitoLocal.agregarHijo(ambitoAuxiliar)
        while (resultado.resultado == true) {
            for (const sentencia of this.sentencias) {//ejecuto cada sentencia del for
                if (sentencia instanceof Retorno) {
                    const retorno = sentencia.ejecutar(ambitoAuxiliar);
                    if (retorno.error == true) {
                        return {
                            error : true
                        }
                    }
                    return {
                        error: false,
                        retorno : retorno.retorno,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "BREAK") {
                    return {
                        error: false,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "CONTINUE") {
                    break
                }
                const resulEjecucion = sentencia.ejecutar(ambitoAuxiliar);
                if (resulEjecucion.error == true) {
                    return {
                        error : true
                    }
                }
                if (resulEjecucion.romper == true) {
                    return {
                        error: false,
                        romper : false,
                        continuar : false
                    }
                }
                if (resulEjecucion.continuar == true) {
                    break
                }
                if ("retorno" in resulEjecucion && !(sentencia instanceof Llamada)) {
                    return {
                        error: false,
                        retorno : resulEjecucion.retorno,
                        romper : false,
                        continuar : false
                    }
                }
            }
            ambitoAuxiliar = new Ambito("FORDentro", ambitoLocal); //ambito del for
            ambitoLocal.agregarHijo(ambitoAuxiliar)
            let actu = this.actualizacion.ejecutar(ambitoAuxiliar)
            if (actu.error == true) {
                return {
                    error: true
                }
            }
            resultado = this.expresion.ejecutar(ambitoAuxiliar)
            if (resultado.error == true) {
                return {
                    error: true
                }
            }
        }
        return {
            error: false,
            romper : false,
            continuar : false
        }
    }
}

class BucleDoWhile{
    constructor(expresion, sentencias = []){
        this.expresion = expresion
        this.sentencias = sentencias
    }

    ejecutar(ambitoPadre = new Ambito("Dfdf")){
        let ambitoLocal = new Ambito("WHILE", ambitoPadre); //ambito del while
        ambitoPadre.agregarHijo(ambitoLocal)
        let resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true) {
            return {
                error: true
            }
        }
        do {
            for (const sentencia of this.sentencias) {//ejecuto cada sentencia del do while
                if (sentencia instanceof Retorno) {
                    const retorno = sentencia.ejecutar(ambitoLocal);
                    if (retorno.error == true) {
                        return {
                            error : true
                        }
                    }
                    return {
                        error: false,
                        retorno : retorno.retorno,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "BREAK") {
                    return {
                        error: false,
                        romper : false,
                        continuar : false
                    }
                }
                if (sentencia == "CONTINUE") {
                    break
                }
                const resulEjecucion = sentencia.ejecutar(ambitoLocal);
                if (resulEjecucion.error == true) {
                    return {
                        error : true
                    }
                }
                if (resulEjecucion.romper == true) {
                    return {
                        error: false,
                        romper : false,
                        continuar : false
                    }
                }
                if (resulEjecucion.continuar == true) {
                    break
                }
                if ("retorno" in resulEjecucion && !(sentencia instanceof Llamada)) {
                    return {
                        error: false,
                        retorno : resulEjecucion.retorno,
                        romper : false,
                        continuar : false
                    }
                }
            }
            ambitoLocal = new Ambito("DOWHILE", ambitoPadre); //ambito del while
            ambitoPadre.agregarHijo(ambitoLocal)
            resultado = this.expresion.ejecutar(ambitoLocal)
            if (resultado.error == true) {
                return {
                    error: true
                }
            }
        } while (resultado.resultado == true);
        return {
            error: false,
            romper : false,
            continuar : false
        }
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
    InstruccionIf,
    IntruccionSwitch,
    InstruccionCase,
    BucleWhile,
    BucleFor,
    BucleDoWhile
};