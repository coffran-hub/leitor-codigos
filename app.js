const historyList =
document.getElementById('history');

let history =
JSON.parse(localStorage.getItem('history')) || [];

renderHistory();

document
.getElementById('startBtn')
.onclick = startScanner;

document
.getElementById('stopBtn')
.onclick = stopScanner;

document
.getElementById('copyBtn')
.onclick = ()=>{

navigator.clipboard.writeText(
result.value
);

};

document
.getElementById('searchBtn')
.onclick = ()=>{

window.open(
"https://www.google.com/search?q="+
encodeURIComponent(result.value)
);

};

document
.getElementById('shareBtn')
.onclick = ()=>{

navigator.share({
text:result.value
});

};

document
.getElementById('imageInput')
.onchange=(e)=>{

scanImage(e.target.files[0]);

};

function saveHistory(code){

history.unshift({
code,
date:new Date().toLocaleString()
});

history = history.slice(0,200);

localStorage.setItem(
'history',
JSON.stringify(history)
);

renderHistory();

}

function renderHistory(){

historyList.innerHTML='';

history.forEach(item=>{

const li =
document.createElement('li');

li.innerHTML =
`${item.code}<br>${item.date}`;

historyList.appendChild(li);

});

}

function exportCSV(){

let csv =
"codigo,data\n";

history.forEach(item=>{

csv +=
`${item.code},${item.date}\n`;

});

const blob =
new Blob([csv]);

const a =
document.createElement('a');

a.href =
URL.createObjectURL(blob);

a.download =
"historico.csv";

a.click();

}

document
.getElementById('exportBtn')
.onclick=exportCSV;

function playBeep(){

const audio =
new Audio(
'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'
);

audio.play();

}
