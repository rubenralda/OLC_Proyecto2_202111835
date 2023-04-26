class Funcion{
    constructor(tipo = "", id = "", parametros = [], sentencias = []){
        this.tipo = tipo
        this.id = id
        this.parametros = parametros
        this.sentencias = sentencias
    }
}

class DeclaracionVariables{
    constructor(tipo = "", id = "", expresion = null, casteo = null){
        this.tipo = tipo
        this.id = id
        if (expresion == null) {
            switch (tipo) {
                case "INT":
                    this.expresion = 0
                    break;
                case "DOUBLE":
                    this.expresion = 0
                    break;
                case "BOOL":
                    this.expresion = true
                    break;
                case "CHAR":
                    this.expresion = ''
                    break;
                case "STRING":
                    this.expresion = ""
                    break;
                default:
                    console.log("Error inesperado totalmente inesperado")
                    break;
            }
        }else{
            this.expresion = expresion
        }
        if (casteo != null) {
            console.log(casteo == tipo)
            //si es true entonces lo que devuelva expresion aplicar casteo correspondiente
        }else{
            this.casteo = null
        }
        this.ternario = null
    }

    guardarTernario(expresionLogica, expresion1, expresion2){
        this.ternario = new Ternario(expresionLogica, expresion1, expresion2)
    }
}

class Asignacion{
    constructor(id = "", expresion = null, tipo = null){
        this.id = id
        this.expresion = expresion
        this.tipo = tipo
        this.ternario = null
    }

    guardarTernario(expresionLogica, expresion1, expresion2){
        this.ternario = new Ternario(expresionLogica, expresion1, expresion2)
    }
}

class Ternario{
    constructor(expresionLogica, expresion1, expresion2) {
        this.expresionLogica = expresionLogica
        this.expresion1 = expresion1
        this.expresion2 = expresion2
    }
    resultado(){
        //retornar el resultado de la operacion
    }
}

class Parametros{
    constructor(tipo = "", id = ""){
        this.tipo = tipo
        this.id = id
    }
}

class Expresion{
    constructor(tipo = "", valor1 = null, valor2 = null){
        this.tipo = tipo
        this.valor1 = valor1
        this.valor2 = valor2
    }
}

class Retorno{
    constructor(expresion = null){
        this.expresion = expresion
    }
}

class Llamada{
    constructor(id = "", argumentos = [], main = false){
        this.id = id
        this.argumentos = argumentos
        this.main = main
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


module.exports = {
    Retorno, 
    Funcion, 
    DeclaracionVariables, 
    Parametros,
    Expresion, 
    Llamada, 
    Vector,
    Lista,
    Asignacion
};