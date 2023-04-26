const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

// creacion de la app o mi API
const app = express();

//configuraciones
app.set("port", 3000);

// usando morgan para middlewares
app.use(morgan("dev")); // para poder visualizar los estados de nuestro servidor
app.use(express.json()); // para poder manejar los json
app.use(cors());

// router mas avanzado
app.use(require("./routes/routes.js"));

// inicializando mi servidor
// app.listen(4000) -> opcion 1 para iniciar el server
app.listen(app.get("port"), () => {
  console.log("Servidor iniciado en el puerto: " + app.get("port"));
});

// correr el servidor busco la ruta del archivo index
// node src/index.js
// con nodemon cambia a npm run dev

// comando utilizados
// npm install express
// npm install morgan
// npm install nodemon -D
// npm install cors
