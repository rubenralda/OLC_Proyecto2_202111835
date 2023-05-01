class Tabla{
    constructor(entorno = ""){
        this.entorno = entorno
        this.tabla = []
        this.tablasLocales = []
        this.salida = ""
        this.errores = []
    }

    agregar(id = "", primitivo = "", tipo = "", objeto = null){
        if (this.tabla.find( fila => fila.id == id)) {
            console.log("Error: El id ya existe")
            return;    
        }
        if(primitivo == "VOID"){
            tipo = "METODO"
        }
        this.tabla.push({
            id : id, 
            primitivo : primitivo, 
            tipo: tipo,
            objeto : objeto
        });
    }
}

class Errores{

}



module.exports = Tabla;