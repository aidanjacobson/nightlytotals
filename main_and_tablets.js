var tabletsDone = false;
var tabletReport = {};
var put3Back = false;
var adjTotal = 0;

function hideEverything() {
    hideMainMenu();
    nightTipsUI.hide();
    salesUI.hide();
    hideNumberPanel();
    tabletOutput.hide();
    tip3Back.hide();
    tabletUI.hide();
    depositUI.hide();
    registerUI.hide();
    finalUI.hide();
}

function closeToMain() {
    hideEverything();
    showMainMenu();
}

var config = {
    z1: {
        done: false,
        adjTtl: 0,
        ccTend: 0,
        cashInDrawer: 0,
        storePurchases: 0
    },
    cc: {
        done: false,
        net: 0,
        tips: 0
    },
    register: {
        values: [],
        compared: ""
    }
}

function parseConfig() {
    for (var i = 0; i < inputsArray.length; i++) {
        if (typeof config.register.values[i] !== "undefined") {
            inputsArray[i].value = config.register.values[i];
        }
    }
    readRegInputs();
    readDepositValues();
}

function downloadValues() {
    if (localStorage.getItem("tabletReport") && JSON.parse(localStorage.getItem("tabletReport")) != "") {
        tabletsDone = true;
        tabletReport = {};
        if (tabletsDone) {
            tabletReport = JSON.parse(localStorage.getItem("tabletReport"));
        }
    } else {
        tabletsDone = false;
        tabletReport = {};
    }
    if (tabletReport == "") tabletReport = {};
    p3bcheck.checked = (localStorage.getItem("put3Back") && localStorage.getItem("put3Back") != 'false');
    tipSplitOut.innerText = localStorage.getItem("tipSplitOut");
    if (localStorage.getItem("config")) {
        config = JSON.parse(localStorage.getItem("config"));
    }
}
window.addEventListener("load", function() {
    updateTime();
    downloadValues();
    p3bcheck.onclick = function() {
        uploadValues();
    }
    Array.from(document.getElementsByClassName("masterhr")).forEach(e=>e.hide());
})

function uploadValues() {
    localStorage.setItem("tabletReport", JSON.stringify(tabletReport));
    localStorage.setItem("put3Back", p3bcheck.checked);
    localStorage.setItem("tipSplitOut", tipSplitOut.innerText);
    localStorage.setItem("config", JSON.stringify(config));
}

function clearMemory() {
    if (!confirm("Are you sure you want to clear the memory?")) return;
    localStorage.removeItem("tabletReport");
    tabletReport = {};
    localStorage.removeItem("put3Back");
    put3Back = false;
    localStorage.removeItem("tipSplitOut");
    tipSplitOut.innerText = "";
    localStorage.removeItem("adjTtl");
    adjTotal = 0;
    localStorage.removeItem("config");
    alert("Memory Cleared.");
    location.reload();
}

function hideMainMenu() {
    mainMenu.setAttribute("hidden", true);
}

function showMainMenu() {
    mainMenu.removeAttribute("hidden");
}

function showNumberPanel() {
    numberPanel.removeAttribute("hidden");
    numberInput.focus();
}

function hideNumberPanel() {
    numberPanel.setAttribute("hidden", true);
}

async function doTablets(calc=true) {
    tabletUI.hide();
    hideMainMenu();
    showNumberPanel();
    if (calc) {
        tabletReport.cn = await totalTablet("ChowNow");
        tabletReport.dd = await totalTablet("DoorDash");
        tabletReport.ue = await totalTablet("UberEats", true);
        tabletReport.gh = await totalTablet("GrubHub");
    }
    var now = new Date();
    var dateString = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()-2000}`;
    var total = tabletReport.cn+tabletReport.dd+tabletReport.ue+tabletReport.gh;
    var hour = now.getHours();
    var minute = now.getMinutes();
    var needTime = false;
    if (hour < 20 || hour == 20 && minute < 30) {
        needTime = true;
    }
    //var totalString = `\$${total}${needTime ? ` @ ${hour-20}:${minute.toString().padStart(2, 0)} PM` : ""}`;
    var totalString = `\$${total}${needTime ? ` @ ${timeString}` : ""}`;
    /*tabletReport = {
        dateString, cn:tabletReport.cn, dd:tabletReport.dd, ue:tabletReport.ue, gh:tabletReport.gh, total, totalString
    }*/
    tabletReport.dateString = dateString;
    tabletReport.total = total,
    tabletReport.totalString = totalString;
    await displayTabletResults();
}

function makeTabletReport() {
    displayTabletResults();
}

function displayTabletResults() {
    hideEverything();
    tabletOutput.removeAttribute("hidden");
    tabletOutput.innerHTML = convertTabletReport(tabletReport);
    tabletsDone = true;
    uploadValues();
    return new Promise(function(resolve) {
        doneWithTablets = function() {
            hideEverything();
            showTabletsUI();
            resolve();
        }
    });
}

function convertTabletReport(tReport) {
    return `
        <h1>Tablet Totals ${tReport.dateString}</h1>
        <hr>
        <ul>
            <li>ChowNow: \$${tReport.cn}</li>
            <li>DoorDash: \$${tReport.dd}</li>
            <li>UberEats: \$${tReport.ue}</li>
            <li>GrubHub: \$${tReport.gh}</li>
        </ul>
        <hr>
        Total: ${tReport.totalString}<br>
        <button class="closer" onclick="doneWithTablets()">Click Here To Finish</button>
    `
}

var doneWithTablets = function() {};

async function totalTablet(name, instatotal=false) {
    if (instatotal) {
        instructions.innerText = `Enter amount for ${name}`;
        var amount = await awaitNumberInput();
        instructions.innerText = `Enter second amount for ${name}, or 0 if done`;
        var add = await awaitNumberInput();
        if (add != "") {
            amount = +amount + (+add);
        }
        amount = +amount;
        return +amount; // I FUCKING LOVE PLUSSES
    } else {
        instructions.innerText = `Enter new amount for ${name}, or 0 if done`;
        var amount = 0;
        while(true) {
            var newAmount = await awaitNumberInput();
            if (newAmount == "" || newAmount == 0) break;
            amount += +newAmount;
        }
        return amount;
    }
}

function awaitNumberInput() {
    return new Promise(function(resolve) {
        numberInput.onchange = function() {
            var ret = numberInput.value;
            numberInput.value = "";
            resolve(+ret);
        }
    });
}

window.addEventListener("load", function() {
    numberInput.onkeypress = function(e) {
        if (e.key.toLowerCase() == "enter") {
            numberInput.onchange();
        }
    }
});

HTMLElement.prototype.hide = function() {
    this.setAttribute("hidden", true);
}

HTMLElement.prototype.show = function() {
    this.removeAttribute("hidden");
}

var timeString = "";
function updateTime() {
    var now = new Date();
    var hour = now.getHours();
    var apm = "AM";
    if (hour > 12) {
        hour -= 12;
        apm = "PM";
    }
    var minute = now.getMinutes().toString().padStart(2, 0);
    var seconds = now.getSeconds().toString().padStart(2, 0);
    var month = now.getMonth()+1;
    var date = now.getDate();
    var year = now.getFullYear()-2000;
    timeString = `${month}/${date}/${year} ${hour}:${minute}:${seconds} ${apm}`;
    timeShow.innerText = timeString;
}

setInterval(updateTime, 1000);

function showTabletsUI() {
    hideEverything();
    tabletUI.show();
}

function createMasterReport() {
    parseConfig();
    hideEverything();
    tabletOutput.innerHTML = convertTabletReport(tabletReport);
    tabletOutput.show();
    tip3Back.show();
    depositUI.show();
    registerUI.show();
    finalUI.show();
    Array.from(document.getElementsByClassName("closer")).forEach(e=>e.hide());
    Array.from(document.getElementsByClassName("masterhr")).forEach(e=>e.show());
}

function closeMaster() {
    Array.from(document.getElementsByClassName("closer")).forEach(e=>e.show());
    Array.from(document.getElementsByClassName("masterhr")).forEach(e=>e.hide());
    closeToMain();
}

async function tabletManual() {
    hideEverything();
    showNumberPanel();
    instructions.innerText = "Enter ChowNow Total";
    var cn = await awaitNumberInput();
    instructions.innerText = "Enter DoorDash Total";
    var dd = await awaitNumberInput();
    instructions.innerText = "Enter UberEats Total";
    var ue = await awaitNumberInput();
    instructions.innerText = "Enter GrubHub Total";
    var gh = await awaitNumberInput();
    tabletReport = {cn, dd, ue, gh, dateString:"", total:0, totalString:""};
    uploadValues();
    doTablets(false);
}