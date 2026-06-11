/* =====================================
   ELEMENTOS
===================================== */

const resultField =
document.getElementById("result");

const historyList =
document.getElementById("historyList");

const totalScansEl =
document.getElementById("totalScans");

const todayScansEl =
document.getElementById("todayScans");

const lastScanEl =
document.getElementById("lastScan");

/* =====================================
   HISTÓRICO
===================================== */

let historyData =
JSON.parse(
localStorage.getItem(
"scanner_history"
)
) || [];

/* =====================================
   SALVAR HISTÓRICO
===================================== */

function saveHistory(code){

    const item = {

        code: code,

        date:
        new Date()
        .toISOString(),

        localDate:
        new Date()
        .toLocaleString(
        "pt-BR"
        )

    };

    historyData.unshift(item);

    historyData =
    historyData.slice(0,500);

    localStorage.setItem(
        "scanner_history",
        JSON.stringify(
        historyData
        )
    );

    renderHistory();

}

/* =====================================
   RENDER HISTÓRICO
===================================== */

function renderHistory(){

    historyList.innerHTML = "";

    historyData.forEach(item=>{

        const li =
        document.createElement("li");

        li.innerHTML = `

        <strong>
        ${item.code}
        </strong>

        <br>

        <small>
        ${item.localDate}
        </small>

        `;

        historyList.appendChild(li);

    });

    updateStats();

}

/* =====================================
   ESTATÍSTICAS
===================================== */

function updateStats(){

    totalScansEl.innerText =
    historyData.length;

    const today =
    new Date()
    .toDateString();

    const todayCount =
    historyData.filter(item=>{

        return (
        new Date(item.date)
        .toDateString()
        === today
        );

    }).length;

    todayScansEl.innerText =
    todayCount;

    if(historyData.length){

        lastScanEl.innerText =
        historyData[0].code
        .substring(0,12);

    }else{

        lastScanEl.innerText =
        "-";

    }

}

/* =====================================
   COPIAR
===================================== */

document
.getElementById("copyBtn")
.addEventListener(

"click",

async()=>{

    const value =
    resultField.value;

    if(!value){

        showToast(
        "Nada para copiar"
        );

        return;
    }

    await navigator.clipboard
    .writeText(value);

    showToast(
    "Copiado"
    );

}
);

/* =====================================
   COMPARTILHAR
===================================== */

document
.getElementById("shareBtn")
.addEventListener(

"click",

async()=>{

    const value =
    resultField.value;

    if(!value){

        showToast(
        "Nada para compartilhar"
        );

        return;
    }

    if(navigator.share){

        navigator.share({

            title:
            "Código Detectado",

            text:value

        });

    }

}
);

/* =====================================
   PESQUISAR
===================================== */

document
.getElementById("searchBtn")
.addEventListener(

"click",

()=>{

    const value =
    resultField.value;

    if(!value){

        showToast(
        "Nenhum código"
        );

        return;
    }

    window.open(

    "https://www.google.com/search?q="+
    encodeURIComponent(value),

    "_blank"

    );

}
);

/* =====================================
   LIMPAR RESULTADO
===================================== */

document
.getElementById("clearBtn")
.addEventListener(

"click",

()=>{

    resultField.value="";

    showToast(
    "Resultado limpo"
    );

}
);

/* =====================================
   EXPORTAR CSV
===================================== */

document
.getElementById("exportBtn")
.addEventListener(

"click",

()=>{

    let csv =
    "Codigo,Data\n";

    historyData.forEach(item=>{

        csv +=
        `"${item.code}","${item.localDate}"\n`;

    });

    const blob =
    new Blob(
    [csv],
    {
        type:
        "text/csv"
    }
    );

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href = url;

    a.download =
    "historico_scanner.csv";

    a.click();

    URL.revokeObjectURL(url);

}
);

/* =====================================
   LIMPAR HISTÓRICO
===================================== */

document
.getElementById(
"clearHistoryBtn"
)
.addEventListener(

"click",

()=>{

    const confirmDelete =
    confirm(
    "Apagar histórico?"
    );

    if(!confirmDelete)
    return;

    historyData=[];

    localStorage.removeItem(
    "scanner_history"
    );

    renderHistory();

    showToast(
    "Histórico apagado"
    );

}
);

/* =====================================
   GOOGLE APPS SCRIPT
===================================== */

/*
Substituir pela URL do seu
Web App publicado
*/

const APPS_SCRIPT_URL =
"COLE_AQUI_SUA_URL";

/* =====================================
   ENVIAR PARA PLANILHA
===================================== */

async function sendToAppsScript(code){

    if(
    APPS_SCRIPT_URL ===
    "COLE_AQUI_SUA_URL"
    ){
        return;
    }

    try{

        await fetch(

        APPS_SCRIPT_URL,

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:
            JSON.stringify({

                code:code,

                date:
                new Date()
                .toISOString()

            })

        }

        );

    }
    catch(error){

        console.error(
        error
        );

    }

}

/* =====================================
   INICIALIZAÇÃO
===================================== */

renderHistory();

updateStats();
