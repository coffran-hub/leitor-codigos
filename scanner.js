const codeReader =
new ZXing.BrowserMultiFormatReader();

const video =
document.getElementById("video");

const resultField =
document.getElementById("result");

let currentTrack = null;
let torchEnabled = false;

/* --------------------------
   CARREGAR CAMERAS
-------------------------- */

async function loadCameras(){

    try{

        const devices =
        await codeReader.listVideoInputDevices();

        console.log(
        "Câmeras:",
        devices
        );

    }
    catch(error){

        console.error(error);

    }

}

/* --------------------------
   INICIAR SCANNER
-------------------------- */

async function startScanner(){

    try{

        stopScanner();

        const devices =
        await codeReader
        .listVideoInputDevices();

        if(!devices.length){

            showToast(
            "Nenhuma câmera encontrada"
            );

            return;
        }

        let selectedDeviceId =
        devices[0].deviceId;

        const rearCamera =
        devices.find(device=>{

            const label =
            (device.label || "")
            .toLowerCase();

            return(

                label.includes("back") ||
                label.includes("rear") ||
                label.includes("traseira") ||
                label.includes("environment")

            );

        });

        if(rearCamera){

            selectedDeviceId =
            rearCamera.deviceId;

        }

        await codeReader
        .decodeFromVideoDevice(

            selectedDeviceId,

            video,

            (result,error)=>{

                if(result){

                    onCodeDetected(
                    result.text
                    );

                }

            }

        );

        const stream =
        video.srcObject;

        if(stream){

            currentTrack =
            stream
            .getVideoTracks()[0];

        }

        showToast(
        "Scanner iniciado"
        );

    }
    catch(error){

        console.error(error);

        showToast(
        "Erro ao iniciar câmera"
        );

    }

}

/* --------------------------
   PARAR SCANNER
-------------------------- */

function stopScanner(){

    try{

        codeReader.reset();

        if(currentTrack){

            currentTrack.stop();

            currentTrack = null;

        }

    }
    catch(error){

        console.error(error);

    }

}

/* --------------------------
   FLASH
-------------------------- */

async function toggleFlash(){

    try{

        if(!currentTrack){

            showToast(
            "Inicie a câmera primeiro"
            );

            return;
        }

        const capabilities =
        currentTrack.getCapabilities();

        if(!capabilities.torch){

            showToast(
            "Flash não suportado"
            );

            return;
        }

        torchEnabled =
        !torchEnabled;

        await currentTrack
        .applyConstraints({

            advanced:[
            {
                torch:torchEnabled
            }
            ]

        });

        showToast(

            torchEnabled
            ? "Flash ligado"
            : "Flash desligado"

        );

    }
    catch(error){

        console.error(error);

    }

}

/* --------------------------
   SCAN POR IMAGEM
-------------------------- */

async function scanImage(file){

    try{

        const imageUrl =
        URL.createObjectURL(file);

        const result =
        await codeReader
        .decodeFromImageUrl(
        imageUrl
        );

        if(result){

            onCodeDetected(
            result.text
            );

        }

    }
    catch(error){

        console.error(error);

        showToast(
        "Nenhum código encontrado"
        );

    }

}

/* --------------------------
   RESULTADO
-------------------------- */

function onCodeDetected(code){

    resultField.value =
    code;

    if(
    typeof saveHistory
    === "function"
    ){

        saveHistory(code);

    }

    if(
    typeof sendToAppsScript
    === "function"
    ){

        sendToAppsScript(code);

    }

    playBeep();

    showToast(
    "Código detectado"
    );

}

/* --------------------------
   SOM
-------------------------- */

function playBeep(){

    const audio =
    new Audio(
    "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
    );

    audio.volume = 0.4;

    audio.play();

}

/* --------------------------
   TOAST
-------------------------- */

function showToast(message){

    const toast =
    document.getElementById(
    "toast"
    );

    if(!toast)
    return;

    toast.innerText =
    message;

    toast.classList.add(
    "show"
    );

    setTimeout(()=>{

        toast.classList.remove(
        "show"
        );

    },2500);

}

/* --------------------------
   EVENTOS
-------------------------- */

window.addEventListener(

"load",

async()=>{

    await loadCameras();

}

);

document
.getElementById("startBtn")
.addEventListener(
"click",
startScanner
);

document
.getElementById("stopBtn")
.addEventListener(
"click",
stopScanner
);

document
.getElementById("flashBtn")
.addEventListener(
"click",
toggleFlash
);

document
.getElementById("imageInput")
.addEventListener(
"change",
(event)=>{

    const file =
    event.target.files[0];

    if(file){

        scanImage(file);

    }

}
);

function saveHistory(code){

    const movement =
    document.querySelector(
    'input[name="movement"]:checked'
    ).value;

    const item = {

        code,

        movement,

        type:
        detectCodeType(code),

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

    localStorage.setItem(

        "scanner_history",

        JSON.stringify(
        historyData
        )

    );

    renderHistory();

}
function detectCodeType(code){

    if(

        code.startsWith("http") ||
        code.includes("://") ||
        code.length > 30

    ){

        return "QR";

    }

    return "BARCODE";

}
function updateStats(){

    const today =
    new Date()
    .toDateString();

    let qrCount = 0;
    let barcodeCount = 0;
    let todayCount = 0;

    historyData.forEach(item=>{

        if(

            new Date(item.date)
            .toDateString()
            === today

        ){

            todayCount++;

            if(item.type==="QR"){

                qrCount++;

            }
            else{

                barcodeCount++;

            }

        }

    });

    document
    .getElementById(
    "todayScans"
    ).innerText =
    todayCount;

    document
    .getElementById(
    "qrCount"
    ).innerText =
    qrCount;

    document
    .getElementById(
    "barcodeCount"
    ).innerText =
    barcodeCount;

}
