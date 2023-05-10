const { v4: uuidv4 } = require('uuid');

class Ambito{ //arbol n-ario con hijos de ambitos locales y tabla de simbolos como informacion
    constructor(nombreAmbito = "", padre){
        this.nombreAmbito = nombreAmbito
        this.padre = padre
        this.salida = ""
        this.ambitosLocales = [] //hijos
        this.tabla = [] //declaraciones de variables, vectores y listas. La raiz tiene funciones
        this.idDot = nombreAmbito;
    }

    agregar(id = "", primitivo = "", tipo = "", objeto = null){
        /*
            if (this.buscar(id) != null){
            console.log("El id ya existe " + id);
            return false;
        }
        */
        if(primitivo == "VOID"){
            tipo = "METODO";
        }
        this.tabla.push({
            id : id, 
            primitivo : primitivo, 
            tipo: tipo,
            objeto : objeto
        });
        return true;
    }

    buscar(id = ""){
        let anterior = this
        let encontrado = null
        while (anterior != null) {
            encontrado = anterior.tabla.find(fila => fila.id == id)
            if (encontrado) {
                //console.log("¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿", encontrado)
                break
            }
            anterior = anterior.padre
        }
        return encontrado;
    }

    agregarSalida(salida = ""){
        let anterior = this
        while (anterior != null) {
            if (anterior.padre == null) {
                anterior.salida += salida + "\n"
            }
            anterior = anterior.padre
        }
    }

    agregarHijo(ambitoLocal){
        this.ambitosLocales.push(ambitoLocal)
    }

    retornaRaiz(){
        let anterior = this
        while (anterior != null) {
            if (anterior.padre == null) {
                return anterior
            }
            anterior = anterior.padre
        }
    }

    mostrarTablaDeSimbolos(){
        let cuerpo = "digraph tabla {\n"
                + "    node [shape=plaintext]\n"
                + "\n"
                + "    tbl [\n"
                + "        label=<\n"
                + "            <table border=\"0\" cellborder=\"1\" cellspacing=\"0\">"
                + "<tr><td bgcolor=\"/rdylgn11/5:/rdylgn11/5\"><b>Identificador</b></td>"
                + "<td bgcolor=\"/rdylgn11/5:/rdylgn11/5\"><b>Tipo</b></td>"
                + "<td bgcolor=\"/rdylgn11/5:/rdylgn11/5\"><b>Primitivo</b></td>"
                + "<td bgcolor=\"/rdylgn11/5:/rdylgn11/5\"><b>Entorno</b></td>"
                + "</tr>";
        
        for (const fila of this.tabla) {
            cuerpo += `<tr>
                <td>${fila.id}</td>
                <td>${fila.tipo}</td>
                <td>${fila.primitivo}</td>
                <td>${this.nombreAmbito}</td>
                </tr>`;
        }
        let aux = []
        for (const hijo of this.ambitosLocales) {
            if (aux.find(nombre => nombre == hijo.idDot) && hijo.idDot != "IF" && hijo.idDot != "SWITCH") {
                //console.log("entro")
                continue
            }
            cuerpo += this.reporteHijos(hijo);
            aux.push(hijo.idDot)
        }
        cuerpo += "   </table>\n"
                + "        >\n"
                + "    ];\n"
                + "}";
        return cuerpo
    }

    reporteHijos(nodo) {
       let cuerpo = ""
       for (const fila of nodo.tabla) {
        cuerpo += `<tr>
            <td>${fila.id}</td>
            <td>${fila.tipo}</td>
            <td>${fila.primitivo}</td>
            <td>${nodo.nombreAmbito}</td>
            </tr>`;
        }
        let aux = []
        for (const hijo of nodo.ambitosLocales) {
            if (aux.find(nombre => nombre == hijo.idDot) && hijo.idDot != "IF" && hijo.idDot != "SWITCH") {
                //console.log("entro")
                continue
            }
            cuerpo += nodo.reporteHijos(hijo);
            aux.push(hijo.idDot)
        }
        return cuerpo;
    }
}

module.exports = Ambito;