//const Tabla = require("../tablaSimbolos/tablaSimbolos.js");
const Ambito = require('../ambito/ambito.js');
const { v4: uuidv4 } = require('uuid');

class Llamada{
    constructor(id = "", argumentos = [], main = false){
        this.id = id
        this.argumentos = argumentos
        this.main = main
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Llamada"]; \n`;
        if (this.main) {
            cuerpo += `"${this.idDot}main"[label="Main"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}main"\n`;
        }
        cuerpo += `"${this.idDot}id"[label="${this.id}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}id"\n`;
        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;

        if (this.argumentos.length > 0) {
            cuerpo += `"${this.idDot}argu"[label="Argumentos"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}argu"\n`;
            for (const iterator of this.argumentos) {
                cuerpo += `"${this.idDot}argu" -> ` + iterator.generarDot()
            }
        }
        

        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;
        return cuerpo
    }
}

class Funcion{
    constructor(tipo = "", id = "", parametros = [], sentencias = []){
        this.tipo = tipo //primitivo
        this.id = id
        this.parametros = parametros //lista de objetos Parametro
        this.sentencias = sentencias //lista de objetos variados
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Funcion"]; \n`;
        cuerpo += `"${this.idDot}tipo"[label="${this.tipo}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}tipo"\n`;
        cuerpo += `"${this.idDot}id"[label="${this.id}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}id"\n`;
        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;
        let i = 0;
        for (const iterator of this.parametros) {
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
            cuerpo += `"${this.idDot}coma${i}"[label="\,"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}coma${i}"\n`;
            i++;
        }
        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;
        cuerpo += `"${this.idDot}llaveAbre"[label="\{"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveAbre"\n`;
        for (const iterator of this.sentencias) {
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
        }
        cuerpo += `"${this.idDot}llaveCierra"[label="\}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveCierra"\n`;
        return cuerpo
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
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Declaracion"]; \n`;
        cuerpo += `"${this.idDot}tipo"[label="${this.tipo}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}tipo"\n`;
        cuerpo += `"${this.idDot}id"[label="${this.id}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}id"\n`;
        if (this.expresion == null) {
            return cuerpo
        }
        cuerpo += `"${this.idDot}igual"[label="\="]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}igual"\n`;
        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        return cuerpo
    }
}

class Asignacion{
    constructor(id = "", expresion = null, casteo = null, posicion = null, lista = false){
        this.id = id
        this.expresion = expresion
        this.casteo = casteo
        this.posicion = posicion
        this.lista = lista
        this.ternario = null
        this.idDot = uuidv4();
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
        switch (variable.tipo) {
            case "VARIABLE":
                variable.objeto = resultado.resultado
                return {
                    error : false
                }
            case "VECTOR":
                let posicion = this.posicion.ejecutar(ambitoLocal)
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
                if (variable.objeto instanceof Vector) {
                    const valores = variable.objeto.retonarValor(ambitoLocal);
                    if (valores.error == true) {
                        return {
                            error : true
                        }
                    }
                    if (typeof valores.resultado[posicion.resultado] === 'undefined') {
                        console.log("Posicion fuera del rango1")
                        return {
                            error : true
                        }
                    }
                    valores.resultado[posicion.resultado] = new Expresion("VALOR", resultado.resultado);
                    variable.objeto = valores.resultado 
                    return {
                        error : false
                    }
                }
                if (typeof variable.objeto[posicion.resultado] === 'undefined') {
                    console.log("Posicion fuera del rango")
                    return {
                        error : true
                    }
                }
                variable.objeto[posicion.resultado] = new Expresion("VALOR", resultado.resultado);
                return {
                    error : false
                }
            default:
                return {
                    error : true
                }
        }
        
    }

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Asignacion"]; \n`;
        cuerpo += `"${this.idDot}id"[label="${this.id}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}id"\n`;
        cuerpo += `"${this.idDot}igual"[label="\="]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}igual"\n`;
        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        return cuerpo
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
        this.idDot = uuidv4();
    }

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Parametro"]; \n`;
        cuerpo += `"${this.idDot}tipo"[label="${this.tipo}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}tipo"\n`;
        cuerpo += `"${this.idDot}id"[label="${this.id}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}id"\n`;
        return cuerpo
    }
}

//falta comprobar el char
class Expresion{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
        this.idDot = uuidv4();
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
            case "LISTA":
                let listaEncontrado = ambitoLocal.buscar(this.valor1)
                let posicionLista = this.valor2.ejecutar(ambitoLocal)
                if (posicionLista.error == true) {
                    return {
                        error : true
                    }
                }
                if (typeof(posicionLista.resultado) != "number") {
                    console.log("La expresion no es numero de una posicion lista")
                    return {
                        error : true
                    }
                }
                if (listaEncontrado == null) {
                    return {
                        error : true
                    }
                }
                if (listaEncontrado.tipo != "LISTA") {
                    console.log("El ID no corresponde a una lista")
                    return {
                        error : true
                    }   
                }
                if (typeof listaEncontrado.objeto[posicionLista.resultado] === 'undefined') {
                    console.log("Posicion fuera del rango lista")
                    return {
                        error : true
                    }
                }
                valor1 = listaEncontrado.objeto[posicionLista.resultado].ejecutar(ambitoLocal);
                if (valor1.error == true) {
                    return {
                        error : true
                    }
                }
                return {
                    error : false,
                    resultado : valor1.resultado
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

    generarDot() {
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Expresion"]; \n`;
        //console.log(this.valor1)
        switch (this.tipo) {
            case "SUMA":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}suma"[label="\+"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}suma"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "RESTA":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}resta"[label="\-"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}resta"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "MULTIPLICACION":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}multi"[label="\*"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}multi"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "DIVICION":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}div"[label="\+"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}div"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "POTENCIA":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}pot"[label="\^"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}pot"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "MODULO":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}mod"[label="\%"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}mod"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "PAR":
                cuerpo += `"${this.idDot}parAbre"[label="(+"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}parAbre"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}parCierra"\n`;
                break
            case "UNARIO":
                cuerpo += `"${this.idDot}unaro"[label="\-"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}unaro"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                break
            case "VALOR":
                cuerpo += `"${this.idDot}valor"[label="${this.valor1}"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}valor"\n`;
                break
            case "INCREMENTO":
                //console.log(this.valor1)
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}incre"[label="\++"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}incre"\n`;
                break
            case "DECREMENTO":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}decre"[label="\--"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}decre"\n`;
                break
            case "ID":
                cuerpo += `"${this.idDot}id"[label="${this.valor1}"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}id"\n`;
                break
            case "VECTOR":
                cuerpo += `"${this.idDot}idv"[label="${this.valor1}"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}idv"\n`;
                cuerpo += `"${this.idDot}corAbre"[label="\["]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}corAbre"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                cuerpo += `"${this.idDot}corCierra"[label="\]"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}corCierra"\n`;
                break
            case "LISTA":
                cuerpo += `"${this.idDot}list"[label="${this.valor1}"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}list"\n`;
                cuerpo += `"${this.idDot}corAbre"[label="\["]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}corAbre"\n`;
                cuerpo += `"${this.idDot}corAbre2"[label="\["]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}corAbre2"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                cuerpo += `"${this.idDot}corCierra"[label="\]"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}corCierra"\n`;
                cuerpo += `"${this.idDot}corCierra2"[label="\]"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}corCierra2"\n`;
                break
            case "LLAMADA":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                break
        }
        return cuerpo;
    }
}

class Retorno{
    constructor(expresion = null){
        this.expresion = expresion
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Retorno"]; \n`;
        cuerpo += `"${this.idDot}return"[label="Return"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}return"\n`;
        if (this.expresion == null) {
            return cuerpo
        }
        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        return cuerpo
    }
}

class Vector{
    constructor(tipo = "", id = "", tipo2 = "", expresion = null, listaValores = []){ //expresion es el tamaño
        this.id = id
        this.tipo = tipo
        this.tipo2 = tipo2
        this.expresion = expresion
        this.listaValores = listaValores
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Vector"]; \n`;
        cuerpo += `"${this.idDot}tipo"[label="${this.tipo}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}tipo"\n`;
        cuerpo += `"${this.idDot}corAbre"[label="\["]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}corAbre"\n`;
        cuerpo += `"${this.idDot}corCierra"[label="\]"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}corCierra"\n`;
        cuerpo += `"${this.idDot}idv"[label="${this.id}"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}idv"\n`;
        cuerpo += `"${this.idDot}igual"[label="\="]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}igual"\n`;
        if (this.expresion != null) {
            cuerpo += `"${this.idDot}nuevo"[label="new"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}nuevo"\n`;
            cuerpo += `"${this.idDot}tipo2"[label="${this.tipo2}"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}tipo2"\n`;
            cuerpo += `"${this.idDot}corAbre2"[label="\["]; \n`;
            cuerpo += `"${this.idDot}" -> "${this.idDot}corAbre2"\n`;
            cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
            cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
            cuerpo += `"${this.idDot}corCierra2"[label="\]"]; \n`;
            cuerpo += `"${this.idDot}" -> "${this.idDot}corCierra2"\n`;
            return cuerpo
        }
        cuerpo += `"${this.idDot}llaveAbre"[label="\{"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveAbre"\n`;
        let i = 0
        for (const iterator of this.listaValores) {
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
            cuerpo += `"${this.idDot}coma${i}"[label="\,"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}coma${i}"\n`;
            i++;
        }
        cuerpo += `"${this.idDot}llaveCierra"[label="\}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveCierra"\n`;
        return cuerpo
    }

}

class Lista{
    constructor(tipo = "", id = "", tipo2 = ""){
        this.tipo = tipo
        this.id = id
        this.tipo2 = tipo2
        this.idDot = uuidv4();
    }

    ejecutar(ambitoLocal){
        if (this.tipo != this.tipo2) {
            return {
                error : true
            }
        }
        ambitoLocal.agregar(this.id, this.tipo, "LISTA" , []);
        return {
            error : false
        }
    }

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Lista"]; \n`;
        cuerpo += `"${this.idDot}lista"[label="List"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}lista"\n`;
        cuerpo += `"${this.idDot}menor"[label="\<"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}menor"\n`;
        cuerpo += `"${this.idDot}tipo"[label="${this.tipo}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}tipo"\n`;
        cuerpo += `"${this.idDot}mayor"[label="\>"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}mayor"\n`;
        cuerpo += `"${this.idDot}idv"[label="${this.id}"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}idv"\n`;
        cuerpo += `"${this.idDot}igual"[label="\="]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}igual"\n`;
        cuerpo += `"${this.idDot}nuevo"[label="new"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}nuevo"\n`;
        cuerpo += `"${this.idDot}lista2"[label="List"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}lista2"\n`;
        cuerpo += `"${this.idDot}menor2"[label="\<"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}menor2"\n`;
        cuerpo += `"${this.idDot}tipo2"[label="${this.tipo2}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}tipo2"\n`;
        cuerpo += `"${this.idDot}mayor2"[label="\>"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}mayor2"\n`;
        return cuerpo
    }
}

class Imprimir{
    constructor(expresion = null){
        this.expresion = expresion
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Imprimir"]; \n`;
        cuerpo += `"${this.idDot}print"[label="print"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}print"\n`;
        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;

        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        

        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;
        return cuerpo
    }
}

class ExpresionRelacional{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Expresion"]; \n`;
        switch (this.tipo) {
            case "MAYOR":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}mayor"[label="\>"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}mayor"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "MENOR":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}menor"[label="\<"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}menor"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "MAYOR_IGUAL":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}mayorigual"[label="\>="]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}mayorigual"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "MENOR_IGUAL":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}menorigual"[label="\<="]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}menorigual"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "DOBLE_IGUAL":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}dobleigual"[label="="]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}dobleigual"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "NEGACION_IGUAL":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}negacionigual"[label="!="]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}negacionigual"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
        }
        return cuerpo
    }
}

class ActualizarLista{
    constructor(id = "", expresion = null, posicion = null){
        this.id = id
        this.expresion = expresion
        this.posicion =  posicion
        this.idDot = uuidv4();
    }

    ejecutar(ambitoLocal){
        let variable = ambitoLocal.buscar(this.id)
        if(variable == null){
            console.log("El ID no existe para asignar valor lista")
            return {
                error: true
            }
        }
        if (variable.tipo != "LISTA") {
            console.log("El ID no corresponde a una lista")
            return {
                error: true
            }
        }
        let resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true) {
            return {
                error : true
            }
        }
        if (this.posicion != null) {
            let posicion = this.posicion.ejecutar(ambitoLocal)
            if (posicion.error == true) {
                return {
                    error : true
                }
            }
            if (typeof(posicion.resultado) != "number") {
                console.log("La expresion no es numero de una posicion lista")
                return {
                    error : true
                }
            }
            if (typeof variable.objeto[posicion.resultado] === 'undefined') {
                console.log("Posicion fuera del rango")
                return {
                    error : true
                }
            }
            variable.objeto[posicion.resultado] = new Expresion("VALOR", resultado.resultado);
            return {
                error : false
            }
        }
        variable.objeto.push(new Expresion("VALOR", resultado.resultado))
        return {
            error : false
        }
    }

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="ActualizarLista"]; \n`;
        cuerpo += `"${this.idDot}idv"[label="${this.id}"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}idv"\n`;
        if (this.posicion != null) {
            cuerpo += `"${this.idDot}corAbre"[label="\["]; \n`;
            cuerpo += `"${this.idDot}" -> "${this.idDot}corAbre"\n`;
            cuerpo += `"${this.idDot}corAbre2"[label="\["]; \n`;
            cuerpo += `"${this.idDot}" -> "${this.idDot}corAbre2"\n`;
            
            cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
            cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()

            cuerpo += `"${this.idDot}corCierra"[label="\]"]; \n`;
            cuerpo += `"${this.idDot}" -> "${this.idDot}corCierra"\n`;
            cuerpo += `"${this.idDot}corCierra2"[label="\]"]; \n`;
            cuerpo += `"${this.idDot}" -> "${this.idDot}corCierra2"\n`;

            cuerpo += `"${this.idDot}igual"[label="\="]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}igual"\n`;

            cuerpo += `"${this.idDot}expre2"[label="Expresion"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre2"\n`;
            cuerpo += `"${this.idDot}expre2" -> ` + this.expresion.generarDot()
            return cuerpo
        }
        cuerpo += `"${this.idDot}punto"[label="\."]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}punto"\n`;
        cuerpo += `"${this.idDot}add"[label="add"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}add"\n`;

        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;

        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        

        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;
        return cuerpo
    }
}

class Incremento{
    constructor(id = ""){
        this.id = id
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Incremento"]; \n`;
        cuerpo += `"${this.idDot}id"[label="${this.id}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}id"\n`;
        cuerpo += `"${this.idDot}mas"[label="++"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}mas"\n`;
        return cuerpo
    }
}

class Decremento{
    constructor(id = ""){
        this.id = id
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Decremento"]; \n`;
        cuerpo += `"${this.idDot}id"[label="${this.id}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}id"\n`;
        cuerpo += `"${this.idDot}menos"[label="--"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}menos"\n`;
        return cuerpo
    }
}

class ExpresionLogica{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Expresion"]; \n`;
        switch (this.tipo) {
            case "AND":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}and"[label="&&"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}and"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "OR":
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                cuerpo += `"${this.idDot}or"[label="||"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}or"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor2.generarDot()
                break
            case "NEGACION":
                cuerpo += `"${this.idDot}nega"[label="!"]; \n`;
                cuerpo += `"${this.idDot}" -> "${this.idDot}nega"\n`;
                cuerpo += `"${this.idDot}" -> ` + this.valor1.generarDot()
                break
        }
        return cuerpo
    }
}

class InstruccionIf{
    constructor(expresion, sentencias = [], sentenciaElse = [], siguiente = null){
        this.expresion = expresion
        this.sentencias = sentencias
        this.sentenciaElse = sentenciaElse
        this.siguiente = siguiente
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="InstruccionIf"]; \n`;
        cuerpo += `"${this.idDot}if"[label="if"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}if"\n`;

        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;
        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;

        cuerpo += `"${this.idDot}llaveAbre"[label="\{"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveAbre"\n`;
        for (const iterator of this.sentencias) {
            if (iterator == "BREAK") {
                cuerpo += `"${this.idDot}break"[label="break"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}break"\n`;
                continue
            }
            if (iterator == "CONTINUE") {
                cuerpo += `"${this.idDot}conti"[label="continue"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}conti"\n`;
                continue
            }
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
        }
        cuerpo += `"${this.idDot}llaveCierra"[label="\}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveCierra"\n`;
        if (this.siguiente != null) {
            cuerpo += `"${this.idDot}else"[label="else"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}else"\n`;
            cuerpo += `"${this.idDot}else" -> ` + this.siguiente.generarDot()
        }
        if (this.sentenciaElse.length > 0) {
            cuerpo += `"${this.idDot}else2"[label="else"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}else2"\n`;
            cuerpo += `"${this.idDot}llaveAbre2"[label="\{"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveAbre2"\n`;
            for (const iterator of this.sentenciaElse) {
                if (iterator == "BREAK") {
                    cuerpo += `"${this.idDot}break1"[label="break"]; \n`;
                    cuerpo +=  `"${this.idDot}" -> "${this.idDot}break1"\n`;
                    continue
                }
                if (iterator == "CONTINUE") {
                    cuerpo += `"${this.idDot}conti1"[label="continue"]; \n`;
                    cuerpo +=  `"${this.idDot}" -> "${this.idDot}conti1"\n`;
                    continue
                }
                cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
            }
            cuerpo += `"${this.idDot}llaveCierra2"[label="\}"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveCierra2"\n`;
        }
        return cuerpo
    }
}

class IntruccionSwitch{
    constructor(expresion, caseList = [], defaultCase = []){
        this.expresion = expresion
        this.caseList = caseList
        this.defaultCase = defaultCase
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="InstruccionSwitch"]; \n`;
        cuerpo += `"${this.idDot}switch"[label="switch"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}switch"\n`;

        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;
        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;

        cuerpo += `"${this.idDot}llaveAbre"[label="\{"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveAbre"\n`;
        for (const iterator of this.caseList) {
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
        }
        if (this.defaultCase.length > 0) {
            cuerpo += `"${this.idDot}default"[label="Default"]; \n`;
            cuerpo +=  `"${this.idDot}" -> "${this.idDot}default"\n`;
            for (const iterator of this.defaultCase) {
                if (iterator == "BREAK") {
                    cuerpo += `"${this.idDot}break1"[label="break"]; \n`;
                    cuerpo +=  `"${this.idDot}" -> "${this.idDot}break1"\n`;
                    continue
                }
                if (iterator == "CONTINUE") {
                    cuerpo += `"${this.idDot}conti1"[label="continue"]; \n`;
                    cuerpo +=  `"${this.idDot}" -> "${this.idDot}conti1"\n`;
                    continue
                }
                cuerpo += `"${this.idDot}default" -> ` + iterator.generarDot()
            }
        }
        cuerpo += `"${this.idDot}llaveCierra"[label="\}"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveCierra"\n`;
        return cuerpo
    }
}

class InstruccionCase{
    constructor(expresion, sentencias = []){
        this.expresion = expresion
        this.sentencias = sentencias
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="InstruccionCase"]; \n`;
        cuerpo += `"${this.idDot}case"[label="case"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}case"\n`;
        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()

        cuerpo += `"${this.idDot}dospuntos"[label="\:"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}dospuntos"\n`;
        
        for (const iterator of this.sentencias) {
            if (iterator == "BREAK") {
                cuerpo += `"${this.idDot}break"[label="break"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}break"\n`;
                continue
            }
            if (iterator == "CONTINUE") {
                cuerpo += `"${this.idDot}conti"[label="continue"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}conti"\n`;
                continue
            }
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
        }
        
        return cuerpo
    }
}

class BucleWhile{
    constructor(expresion, sentencias = []){
        this.expresion = expresion
        this.sentencias = sentencias
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="InstruccionWhile"]; \n`;
        cuerpo += `"${this.idDot}while"[label="while"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}while"\n`;

        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;
        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;

        cuerpo += `"${this.idDot}llaveAbre"[label="\{"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveAbre"\n`;
        for (const iterator of this.sentencias) {
            if (iterator == "BREAK") {
                cuerpo += `"${this.idDot}break"[label="break"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}break"\n`;
                continue
            }
            if (iterator == "CONTINUE") {
                cuerpo += `"${this.idDot}conti"[label="continue"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}conti"\n`;
                continue
            }
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
        }
        cuerpo += `"${this.idDot}llaveCierra"[label="\}"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}llaveCierra"\n`;
        return cuerpo
    }
}

class BucleFor{
    constructor(declaracionFor, expresion, actualizacion, sentencias = []){
        this.declaracionFor = declaracionFor
        this.expresion = expresion
        this.actualizacion = actualizacion
        this.sentencias = sentencias
        this.idDot = uuidv4();
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="InstruccionFor"]; \n`;
        cuerpo += `"${this.idDot}for"[label="for"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}for"\n`;

        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;

        cuerpo += `"${this.idDot}declafor"[label="declaracionVariableFor"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}declafor"\n`;
        cuerpo += `"${this.idDot}declafor" -> ` + this.declaracionFor.generarDot()
        cuerpo += `"${this.idDot}puto"[label=";"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}puto"\n`;

        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()

        cuerpo += `"${this.idDot}puto2"[label=";"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}puto2"\n`;

        cuerpo += `"${this.idDot}actu"[label="Actualizacion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}actu"\n`;
        cuerpo += `"${this.idDot}actu" -> ` + this.actualizacion.generarDot()

        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;

        cuerpo += `"${this.idDot}llaveAbre"[label="\{"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveAbre"\n`;
        for (const iterator of this.sentencias) {
            if (iterator == "BREAK") {
                cuerpo += `"${this.idDot}break"[label="break"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}break"\n`;
                continue
            }
            if (iterator == "CONTINUE") {
                cuerpo += `"${this.idDot}conti"[label="continue"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}conti"\n`;
                continue
            }
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
        }
        cuerpo += `"${this.idDot}llaveCierra"[label="\}"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}llaveCierra"\n`;
        return cuerpo
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

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="InstruccionDoWhile"]; \n`;
        cuerpo += `"${this.idDot}do"[label="Do"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}do"\n`;

        cuerpo += `"${this.idDot}llaveAbre"[label="\{"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}llaveAbre"\n`;
        for (const iterator of this.sentencias) {
            if (iterator == "BREAK") {
                cuerpo += `"${this.idDot}break"[label="break"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}break"\n`;
                continue
            }
            if (iterator == "CONTINUE") {
                cuerpo += `"${this.idDot}conti"[label="continue"]; \n`;
                cuerpo +=  `"${this.idDot}" -> "${this.idDot}conti"\n`;
                continue
            }
            cuerpo += `"${this.idDot}" -> ` + iterator.generarDot()
        }
        cuerpo += `"${this.idDot}llaveCierra"[label="\}"]; \n`;
        cuerpo += `"${this.idDot}" -> "${this.idDot}llaveCierra"\n`;
        cuerpo += `"${this.idDot}while"[label="while"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}while"\n`;
        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;
        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()
        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;
        return cuerpo
    }
}

class Largo{
    constructor(expresion){
        this.expresion = expresion
        this.idDot = uuidv4();
    }

    ejecutar(ambitoLocal){
        let resultado = this.expresion.ejecutar(ambitoLocal)
        if (resultado.error == true) {
            return {
                error : true
            }
        }
        if (this.expresion.tipo == "ID") {
            if (Array.isArray(resultado.resultado)) {
                return {
                    error: false,
                    retorno : resultado.resultado.length,
                    romper : false,
                    continuar : false
                }
            }
        }
        if (typeof resultado.resultado === "string") {
            return {
                error: false,
                retorno : resultado.resultado.length,
                romper : false,
                continuar : false
            }
        }
        return {
            error : true
        }
    }

    generarDot(){
        let cuerpo = `"${this.idDot}"\n"${this.idDot}"[label="Length"]; \n`;
        cuerpo += `"${this.idDot}parAbre"[label="\("]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parAbre"\n`;

        cuerpo += `"${this.idDot}expre"[label="Expresion"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}expre"\n`;
        cuerpo += `"${this.idDot}expre" -> ` + this.expresion.generarDot()

        cuerpo += `"${this.idDot}parCierra"[label="\)"]; \n`;
        cuerpo +=  `"${this.idDot}" -> "${this.idDot}parCierra"\n`;
        
        return cuerpo
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
    ActualizarLista,
    ExpresionLogica,
    Incremento,
    Decremento,
    ExpresionRelacional,
    InstruccionIf,
    IntruccionSwitch,
    InstruccionCase,
    BucleWhile,
    BucleFor,
    BucleDoWhile,
    Largo
};