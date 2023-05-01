const { Router } = require("express");
const router = Router();
const gramatica = require("../interprete/gramatica.js");
const {Llamada} = require('../arbol/nodoAST.js');
const Tabla = require("../tablaSimbolos/tablaSimbolos.js")
const {Funcion} = require('../arbol/nodoAST.js');
const {DeclaracionVariables} = require('../arbol/nodoAST.js');
const Ambito = require('../ambito/ambito.js');
//const path = require("path");


router.post("/ejecutar", (req, res) => {
  let codigo = req.body.codigo;
  let parser = new gramatica.Parser();
  let raiz = parser.parse(codigo);
  let ejecucion = null;
  let huboError = false;
  let mensaje = "";
  let ambitoGlobal = new Ambito("global", null); //null porque es la raiz
  for (const sentencia of raiz) {
    if (sentencia instanceof DeclaracionVariables) {//agrega las variables a tabla de simbolos
      ambitoGlobal.agregar(sentencia.id, sentencia.tipo, "VARIABLE" , sentencia)//falta agregar vectores y listas
    }else if (sentencia instanceof Funcion) {
      ambitoGlobal.agregar(sentencia.id, sentencia.tipo, "FUNCION" , sentencia)
    }else if(sentencia instanceof Llamada){
      if(sentencia.main){//si no es main lo ignora
        if (ejecucion == null) {
          ejecucion = sentencia
        }else{
          huboError = true
          break
        }
      }
    }
  }
  let salida = null
  if (ejecucion == null ) {//no encontro el main
    huboError = true
    mensaje += "No hay método Main\n"
  }else if(huboError == true){
    mensaje += "Error hay dos métodos o funciones declaradas Main\n"
  }else {
    //si no ocurrio ningún error hacer la ejecucion
    ejecucion.ejecutar(ambitoGlobal, ambitoGlobal)
    //mensaje += "Error: el método o función no existe"
  }
  //console.log(ambitoGlobal.tabla)
  let respuesta = {
    arbol: "", //para mostrar el arbol con graphviz
    ast: raiz, //el resultado del parser
    salida : ambitoGlobal.salida
  };
  res.send(respuesta);
});

module.exports = router;
