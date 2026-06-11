const API =
"https://script.google.com/macros/s/SEU_SCRIPT/exec";

document.getElementById("dataAtual")
.innerText =
new Date().toLocaleDateString("pt-BR");

function registrar(codigo){

    const operacao =
    document.getElementById("operacao").value;

    const tipo =
    codigo.length > 20
      ? "QRCode"
      : "Barcode";

    fetch(API,{
        method:"POST",
        body:JSON.stringify({
            codigo,
            operacao,
            tipo
        })
    })
    .then(r=>r.json())
    .then(()=>{

        document.getElementById("codigo")
        .innerText = codigo;

        document.getElementById("hora")
        .innerText =
        new Date()
        .toLocaleTimeString("pt-BR");

        navigator.vibrate?.(200);

    });

}

const scanner =
new Html5QrcodeScanner(
    "reader",
    {
      fps:10,
      qrbox:250
    }
);

scanner.render((codigo)=>{

    registrar(codigo);

});
