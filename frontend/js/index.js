document.addEventListener("DOMContentLoaded", (e) => {
    e.preventDefault;
    if ( localStorage.getItem("texto") != null) {
        document.getElementById("contenido").value = localStorage.getItem("texto")
    }
    e.stopPropagation;
});

const cajaTexto = document.getElementById("contenido");

cajaTexto.addEventListener("change", (e) =>{
    e.preventDefault;
    localStorage.setItem("texto", cajaTexto.value)
    e.stopPropagation;
});

const btnEjecutar = document.getElementById("btn");
btnEjecutar.addEventListener("click", eventbtnEjecutar);
async function eventbtnEjecutar() {
    const ruta = `http://localhost:3000/ejecutar`;
    //crear json
    let bodyJson = {
        codigo : document.getElementById("contenido").value
    }
    const respuesta = await fetch(ruta,{
        method: 'POST', // or 'PUT'
        body: JSON.stringify(bodyJson), // data can be `string` or {object}!
        headers:{
        'Content-Type': 'application/json'
        }
    })
    .then((res)=> res.json())
    .then((data) => {
        return data
    })
    console.log(respuesta)
}