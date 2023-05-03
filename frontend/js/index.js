const lineNumbers = document.querySelector('.line-numbers')
const btnEjecutar = document.getElementById("btn");
const codigo = document.getElementById("codigo");//textarea
const lineNumbersConsole = document.querySelector('.line-numbers-consola')
const consola = document.getElementById("textConsola");//textarea

document.addEventListener("DOMContentLoaded", (e) => {
    e.preventDefault;
    if ( localStorage.getItem("texto") != null) {
        codigo.value = localStorage.getItem("texto")
        let dispararEvento = new Event("keyup")
        codigo.dispatchEvent(dispararEvento)
    }
    e.stopPropagation;
});

codigo.addEventListener("input", (e) =>{
    e.preventDefault;
    localStorage.setItem("texto", codigo.value)
    e.stopPropagation;
});

codigo.addEventListener("keyup", event => {
    const numberOfLines = event.target.value.split("\n").length;
    lineNumbers.innerHTML = Array(numberOfLines)
    .fill('<span></span>')
    .join('')
});

codigo.addEventListener("keydown", function(event) {
    if (event.key === "Tab") {
      event.preventDefault();  // Evita que el foco cambie al siguiente elemento
      const tabCharacter = "    "; // 4 espacios para simular un tabulador
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.substring(0, start) + tabCharacter + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + tabCharacter.length;
    }
});

consola.addEventListener("keyup", event => {
    const numberOfLines = event.target.value.split("\n").length;
    lineNumbersConsole.innerHTML = Array(numberOfLines)
    .fill('<span></span>')
    .join('')
});

btnEjecutar.addEventListener("click", eventbtnEjecutar);
async function eventbtnEjecutar() {
    const ruta = `http://localhost:3000/ejecutar`;
    let bodyJson = {
        codigo : codigo.value
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
    consola.value = respuesta.salida
    let dispararEvento = new Event("keyup")
    consola.dispatchEvent(dispararEvento)
    console.log(respuesta)
}