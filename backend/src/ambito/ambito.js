class Ambito{ //arbol n-ario con hijos de ambitos locales y tabla de simbolos como informacion
    constructor(nombreAmbito = "", padre){
        this.nombreAmbito = nombreAmbito
        this.padre = padre
        this.salida = ""
        this.ambitosLocales = [] //hijos
        this.tabla = [] //declaraciones de variables, vectores y listas. La raiz tiene funciones
    }

    agregar(id = "", primitivo = "", tipo = "", objeto = null){
        if (this.buscar(id) != null){
            console.log("El id ya existe " + id);
            return;
        }
        if(primitivo == "VOID"){
            tipo = "METODO";
        }
        this.tabla.push({
            id : id, 
            primitivo : primitivo, 
            tipo: tipo,
            objeto : objeto
        });
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

}

module.exports = Ambito;