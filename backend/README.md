# Instalación
Dependencias instaladas:
~~~
npm install express
npm install morgan
npm install nodemon -D
npm install cors
npm install jison
~~~
Script agregados en el archivo package.json:
~~~
"dev": "nodemon src/index.js"
~~~
En dado caso jison no funcione el comando, agregar esto a los scripts:
~~~
"jison" : "./node_modules/.bin/jison"
~~~

# Uso de la API
Para correr el servidor busco la ruta del archivo index **node run src/index.js**

Con nodemon despues de agregar el escript dev cambia a **npm run dev** y para ejecutar jison el comando es **npm run jison**

