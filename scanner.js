const codeReader = new ZXing.BrowserMultiFormatReader();

const video = document.getElementById('video');
const result = document.getElementById('result');

let currentStream = null;

async function startScanner(){

const devices =
await codeReader.listVideoInputDevices();

const selectedDevice =
devices[0].deviceId;

codeReader.decodeFromVideoDevice(
  selectedDevice,
  video,
  (resultScan, err) => {

    if(resultScan){

      result.value = resultScan.text;

      saveHistory(resultScan.text);

      sendToAppsScript(resultScan.text);

      playBeep();

    }

  }
);
function stopScanner(){
codeReader.reset();
}

async function scanImage(file){

const img = URL.createObjectURL(file);

const res =
await codeReader.decodeFromImageUrl(img);

result.value = res.text;

saveHistory(res.text);

}
