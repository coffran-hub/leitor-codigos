const resultField =
    document.getElementById("result");

const historyList =
    document.getElementById("historyList");

const todayScansEl =
    document.getElementById("todayScans");

const qrCountEl =
    document.getElementById("qrCount");

const barcodeCountEl =
    document.getElementById("barcodeCount");

let historyData =
    JSON.parse(
        localStorage.getItem(
            "scanner_history"
        )
    ) || [];

/* =========================
   TIPO
========================= */

function detectCodeType(code) {

    if (
        code.startsWith("http") ||
        code.includes("://") ||
        code.length > 30
    ) {
        return "QR";
    }

    return "BARCODE";
}

/* =========================
   HISTÓRICO
========================= */

function saveHistory(code) {

    const movement =
        document.getElementById(
            "movementSelect"
        )?.value || "ENTRADA";

    const item = {

        code,

        movement,

        type:
            detectCodeType(code),

        date:
            new Date().toISOString(),

        localDate:
            new Date()
                .toLocaleString(
                    "pt-BR"
                )

    };

    historyData.unshift(item);

    historyData =
        historyData.slice(0, 500);

    localStorage.setItem(
        "scanner_history",
        JSON.stringify(
            historyData
        )
    );

    renderHistory();

}

function renderHistory() {

    if (!historyList) return;

    historyList.innerHTML = "";

    historyData.forEach(item => {

        const li =
            document.createElement(
                "li"
            );

        li.innerHTML = `

        <div class="scan-card">

            <div class="scan-top">

                <span class="movement-badge">

                    ${item.movement}

                </span>

                <span class="scan-time">

                    ${item.localDate}

                </span>

            </div>

            <div class="scan-code">

                ${item.code}

            </div>

        </div>

        `;

        historyList.appendChild(
            li
        );

    });

    updateStats();

}

/* =========================
   ESTATÍSTICAS
========================= */

function updateStats() {

    const today =
        new Date()
            .toDateString();

    let todayCount = 0;
    let qrCount = 0;
    let barcodeCount = 0;

    historyData.forEach(item => {

        if (
            new Date(item.date)
                .toDateString() === today
        ) {

            todayCount++;

            if (
                item.type === "QR"
            ) {
                qrCount++;
            }
            else {
                barcodeCount++;
            }

        }

    });

    if (todayScansEl) {
        todayScansEl.innerText =
            todayCount;
    }

    if (qrCountEl) {
        qrCountEl.innerText =
            qrCount;
    }

    if (barcodeCountEl) {
        barcodeCountEl.innerText =
            barcodeCount;
    }

}

/* =========================
   EXPORTAR CSV
========================= */

document
    .getElementById("exportBtn")
    ?.addEventListener(
        "click",
        () => {

            let csv =
                "Codigo,Movimento,Data\n";

            historyData.forEach(item => {

                csv +=
                    `"${item.code}","${item.movement}","${item.localDate}"\n`;

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
                URL.createObjectURL(
                    blob
                );

            const a =
                document.createElement(
                    "a"
                );

            a.href = url;
            a.download =
                "historico_scanner.csv";

            a.click();

            URL.revokeObjectURL(
                url
            );

        }
    );

/* =========================
   LIMPAR HISTÓRICO
========================= */

document
    .getElementById(
        "clearHistoryBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Apagar histórico?"
                )
            ) return;

            historyData = [];

            localStorage.removeItem(
                "scanner_history"
            );

            renderHistory();

            showToast(
                "Histórico apagado"
            );

        }
    );

/* =========================
   APPS SCRIPT
========================= */

async function sendToAppsScript(code){

    alert("sendToAppsScript executou");

    console.log("Código:", code);

    try{

        const response =
        await fetch(
            APPS_SCRIPT_URL,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({

                    code:code,

                    movement:
                    document.getElementById(
                    "movementSelect"
                    )?.value || "ENTRADA",

                    user:"WEB_APP",

                    device:
                    navigator.userAgent

                })
            }
        );

        console.log(
            "Status:",
            response.status
        );

        const text =
        await response.text();

        console.log(
            "Resposta:",
            text
        );

    }
    catch(error){

        console.error(
            "Erro:",
            error
        );

    }

}
/* =========================
   INIT
========================= */

renderHistory();
updateStats();
