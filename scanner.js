const codeReader = new ZXing.BrowserMultiFormatReader();

const video =
document.getElementById("video");

const resultField =
document.getElementById("result");

const cameraSelect =
document.getElementById("cameraSelect");

let selectedDeviceId = null;

let currentControls = null;

let currentTrack = null;

let torchEnabled = false;

/* --------------------------
   CARREGAR CÂMERAS
-------------------------- */

async function loadCameras(){

    try{

        const devices =
        await codeReader.listVideoInputDevices();

        cameraSelect.innerHTML = "";

        let rearCamera = null;

        devices.forEach((device,index)=>{

            const label =
            (device.label || "").toLowerCase();

            if(
                label.includes("back") ||
                label.includes("rear") ||
                label.includes("traseira") ||
                label.includes("environment")
            ){
                rearCamera = device;
            }

            const option =
            document.createElement("option");

            option.value = device.deviceId;
            option.text =
            device.label ||
            `Câmera ${index+1}`;

            cameraSelect.appendChild(option);

        });

        if(rearCamera){

            selectedDeviceId =
            rearCamera.deviceId;

            cameraSelect.value =
            rearCamera.deviceId;

        }
        else if(devices.length){

            selectedDeviceId =
            devices[0].deviceId;

        }

    }
    catch(error){

        console.error(error);

    }

}
/* --------------------------
   TROCAR CAMERA
-------------------------- */

cameraSelect.addEventListener(
"change",
()=>{

selectedDeviceId =
cameraSelect.value;

}
);

/* --------------------------
   INICIAR SCANNER
-------------------------- */

async function startScanner(){

    try{

        stopScanner();

        currentControls =
        await codeReader.decodeFromVideoDevice(

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
        "Falha ao iniciar câmera"
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

        }

    }
    catch(e){}

}

/* --------------------------
   FLASH
-------------------------- */

async function toggleFlash(){

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

    await currentTrack.applyConstraints({

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
   PROCESSAR RESULTADO
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
    typeof updateStats
    === "function"
    ){

        updateStats();

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

    if(!toast) return;

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
