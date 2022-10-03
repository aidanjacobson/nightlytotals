var put3Back = false;

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
    sequenceUI.hide();
}

function closeToMain() {
    hideEverything();
    if (sequenceRunning) {
        resolveFunc();
    } else {
        showMainMenu();
    }
}

var config = {
    z1: {
        adjTtl: 0,
        ccTend: 0,
        cashInDrawer: 0,
        storePurchases: 0
    },
    cc: {
        net: 0,
        tips: 0
    },
    register: {
        values: [],
        compared: ""
    },
    tablets: {
        cn: 0,
        dd: 0,
        ue: 0,
        gh: 0,
        total: 0,
        totalString: "",
        dateString: ""
    },
    completed: {
        tablets: false,
        tips: false,
        put3Back: false,
        z1: false,
        cc: false,
        register: false
    },
    tips: {
        tipSplitOut: "",
        remainingCents: ""
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
    if (localStorage.getItem("config_c")) {
        config = JSON.parse(localStorage.getItem("config_c"));
    }
    p3bcheck.checked = config.completed.put3Back;
    renderTips();
}
window.addEventListener("load", function() {
    updateTime();
    downloadValues();
    renderTips();
    p3bcheck.onclick = function() {
        uploadValues();
    }
    Array.from(document.getElementsByClassName("masterhr")).forEach(e=>e.hide());
})

function uploadValues() {
    config.completed.put3Back = p3bcheck.checked;
    localStorage.setItem("config_c", JSON.stringify(config));
}

function clearMemory() {
    if (!confirm("Are you sure you want to clear the memory?")) return;
    localStorage.removeItem("config_c");
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
        config.tablets.cn = await totalTablet("ChowNow");
        config.tablets.dd = await totalTablet("DoorDash");
        config.tablets.ue = await totalTablet("UberEats");
        config.tablets.gh = await totalTablet("GrubHub");
    }
    var now = new Date();
    var dateString = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()-2000}`;
    config.tablets.total = config.tablets.cn+config.tablets.dd+config.tablets.ue+config.tablets.gh;
    config.tablets.total = roundCents(config.tablets.total);
    var hour = now.getHours();
    var minute = now.getMinutes();
    var needTime = false;
    if (hour < 20 || hour == 20 && minute < 30) {
        needTime = true;
    }
    var totalString = `\$${config.tablets.total}${needTime ? ` @ ${timeString}` : ""}`;
    config.tablets.dateString = dateString;
    config.tablets.totalString = totalString;
    uploadValues();
    if (!sequenceRunning) await displayTabletResults();
}

function makeTabletReport() {
    displayTabletResults();
}

function displayTabletResults() {
    hideEverything();
    tabletOutput.removeAttribute("hidden");
    tabletOutput.innerHTML = convertTabletReport(config.tablets);
    config.completed.tablets = true;
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

function awaitNumberInput(defaultValue="") {
    if (defaultValue != "") numberInput.value = defaultValue;
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
    tabletOutput.innerHTML = convertTabletReport(config.tablets);
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
    tip3Back.hide();
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
    cn = roundCents(cn);
    dd = roundCents(dd);
    ue = roundCents(ue);
    gh = roundCents(gh);
    config.tablets = {cn, dd, ue, gh, dateString:"", total:0, totalString:""};
    uploadValues();
    doTablets(false);
}

function roundCents(number) {
    return Math.round(number*100)/100;
}