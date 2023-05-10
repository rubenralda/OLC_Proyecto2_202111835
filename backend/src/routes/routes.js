const { Router } = require("express");
const router = Router();
const gramatica = require("../interprete/gramatica.js");
const {Llamada, Vector, Lista, Asignacion} = require('../arbol/nodoAST.js');
const {Funcion} = require('../arbol/nodoAST.js');
const {DeclaracionVariables} = require('../arbol/nodoAST.js');
const Ambito = require('../ambito/ambito.js');
const {Errores} = require('../arbol/errores.js');
let tabla = null

router.post("/ejecutar", (req, res) => {
  let codigo = req.body.codigo;
  let parser = new gramatica.Parser();
  let raiz = parser.parse(codigo);
  //console.log(raiz)
  if (raiz.length > 0) {
    if (raiz[0] instanceof Errores) {
      let respuesta = {
        error : raiz
      };
      res.send(respuesta);
      raiz.length = 0;
      return
    }
  }
  let ejecucion = null;
  let huboError = false;
  
  let ambitoGlobal = new Ambito("global", null); //null porque es la raiz
  for (const sentencia of raiz) {
    if (sentencia instanceof DeclaracionVariables) {//agrega las variables a tabla de simbolos
      ambitoGlobal.agregar(sentencia.id, sentencia.tipo, "VARIABLE" , sentencia)//falta agregar vectores y listas
    }else if (sentencia instanceof Funcion) {
      ambitoGlobal.agregar(sentencia.id, sentencia.tipo, "FUNCION" , sentencia)
    }else if (sentencia instanceof Vector) {
      ambitoGlobal.agregar(sentencia.id, sentencia.tipo, "VECTOR" , sentencia)
    }else if (sentencia instanceof Lista) {
      ambitoGlobal.agregar(sentencia.id, sentencia.tipo, "LISTA" , [])
    }else if (sentencia instanceof Asignacion){
      let resul = sentencia.ejecutar(ambitoGlobal)
      if (resul.error == true) {
        huboError = true
        break
      }
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
  
  if (ejecucion == null ) {//no encontro el main
    huboError = true
    mensaje += "No hay método Main\n"
  }else if(huboError == true){
    mensaje += "Error hay dos métodos o funciones declaradas Main\n"
  }else {//si no ocurrio ningún error hacer la ejecucion
    const resultado = ejecucion.ejecutar(ambitoGlobal, ambitoGlobal)
    if (resultado.error == true) {
      console.log("Ejecucion terminada con error")
    }
  }
  tabla = ambitoGlobal
  let respuesta = {
    ast: raiz, //el resultado del parser
    salida : ambitoGlobal.salida,
    tablaSimbolos : ambitoGlobal.tabla,
    error : null
  };
  res.send(respuesta);
});

router.post("/ast", (req, res) => {
  let codigo = req.body.codigo;
  let parser = new gramatica.Parser();
  let raiz = parser.parse(codigo);
  let cuerpo = `digraph{
    fontname="Helvetica,Arial,sans-serif"
    node [fontname="Helvetica,Arial,sans-serif", shape=box]
    edge [fontname="Helvetica,Arial,sans-serif"]\n`;
  cuerpo += `"raiz"[label="Sentencias"]; \n`;
  for (const sentencia of raiz) {
    cuerpo += `"raiz" -> ` + sentencia.generarDot();
  }
  cuerpo += "}";
  //const dot = fs.readFileSync('ejemplo.dot', 'utf8');
  let respuesta = {
    arbol: cuerpo,
    //imagen: cuerpo //para mostrar el arbol con graphviz
  };
  res.send(respuesta);
});

router.get("/simbolos", (req, res) => {
  let respuesta = {
    tabla: tabla.mostrarTablaDeSimbolos(),
    //imagen: cuerpo //para mostrar el arbol con graphviz
  };
  res.send(respuesta);
});

module.exports = router;
