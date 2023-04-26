const { Router } = require("express");
const router = Router();
const path = require("path");
const gramatica = require("../interprete/gramatica.js");

router.post("/ejecutar", (req, res) => {
  let codigo = req.body.codigo;
  //console.log(codigo);
  let parser = new gramatica.Parser();
  let respuesta = {
    Mensaje: parser.parse(codigo),
  };
  res.send(respuesta);
});

module.exports = router;
