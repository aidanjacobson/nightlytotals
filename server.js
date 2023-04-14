var reportsList = [];

if (attemptDecryption()) getReportsList();

async function submitReport() {
    submitBtn.disabled = true;
    await doAccessCheck();
    if (isOutdated()) {
        if (!confirm("Warning: This content is out of date. Are you sure you want to upload?")) return;
    } else {
        if (!confirm("Are you sure you want to upload?")) return;
    }
    await getReportsList();
    var reportNum = reportsList.length;
    var fileName = "nightly.report." + reportNum;
    reportsList = reportsList.filter(report=>report.fileName!=fileName);
    reportsList.push({fileName: fileName, timestamp: Date.now(), dateString: config.tablets.dateString});
    await setStorageBin(fileName, config);
    await setStorageBin("nightly.fileList", reportsList);
    submitBtn.removeAttribute("disabled");
    if (confirm("Successfully uploaded. Would you like to send this report to Marlene?")) {
        await homeAssistantCall(reportNum);
        alert("Successfully sent report.");
    }
}

function isOutdated() {
    var now = new Date();
    var dString = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()-2000}`;
    return config.tablets.dateString != dString;
}

var access_token = "";
var encrypted_access_token = "U2FsdGVkX1/Zq+Ha/mE2FZTpkFinAjC1V5zGbHvw9fI=";
var encrypted_notify = "U2FsdGVkX19J71WcJMUIRQdjy9C5Kiy3gGjlKspHMJZgbam1TsfNqu9OQNs0QqFL2tJjG12JnsFWVDNWUqwVZfJeocc3nQZyRI6Pd6MBDTmct/Fy4gbnRFP8SeKTRUAghdMILGWYd5buvDHElOpTYJ05a2dpKf1sAh43fiLNzkTXRq5jkoRzlQ5YXhZjE2rFk+5TbpiFBhx72dZxkZg0FvWwGsLEOBfW6CRD6gZgzxxYE+bW6w4QmVoQHf1HcmzmDh4i9VEVc++Fu8LkyxNQpw==";

async function doAccessCheck() {
    while (!attemptDecryption()) {
        await askForPassword();
    }
    closeToMain();
}

function attemptDecryption() {
    if (!localStorage.getItem("nightly_dpin")) return false;
    try {
        access_token = CryptoJS.AES.decrypt(encrypted_access_token, "accesscode_" + localStorage.getItem("nightly_dpin")).toString(CryptoJS.enc.Utf8);
        if (access_token != "") {
            return true;
        } else {
            return false;
        }
    } catch(e) {
        return false;
    }
}

var firstAttempt = true;
async function askForPassword() {
    hideEverything();
    showNumberPanel();
    instructions.innerText = (firstAttempt ? "" : "Incorrect pin. ") + "Enter Access Token (hint: Marlene's clover tablet login)";
    var dpin = await awaitNumberInput();
    firstAttempt = false;
    localStorage.setItem("nightly_dpin", dpin);
    hideNumberPanel();
}

function getStorageBin(binName) {
    return new Promise(function(resolve) {
        var x = new XMLHttpRequest();
        x.open("GET", "https://aidanjacobson.duckdns.org:42069/store/" + binName);
        x.setRequestHeader("Security-key", access_token);
        x.onload = function() {
            resolve(JSON.parse(x.responseText));
        }
        x.send();
    });
}

function setStorageBin(binName, jsonData) {
    return new Promise(function(resolve) {
        var x = new XMLHttpRequest();
        x.open("POST", "https://aidanjacobson.duckdns.org:42069/store/" + binName);
        x.setRequestHeader("Security-key", access_token);
        x.setRequestHeader("Content-Type", "application/json");
        x.onload = function() {
            resolve(JSON.parse(x.responseText));
        }
        x.onerror = function() {
            alert("A network request has failed. Reloading page...");
            location.reload();
        }
        x.send(JSON.stringify(jsonData));
    });
}

async function getReportsList() {
    reportsList = await getStorageBin("nightly.fileList");
    reportsList.sort(function(a, b) {
        return b.timestamp-a.timestamp;
    });
}

async function downloadReport() {
    hideEverything();
    await doAccessCheck();
    hideEverything();
    browseUI.show();
    reportListDiv.innerHTML = "Loading reports...";
    await getReportsList();
    reportListDiv.innerHTML = "";
    for (var i = 0; i < reportsList.length; i++) {
        reportListDiv.innerHTML += `<button onclick="openReport(${i})">${reportsList[i].dateString}</button><br>`;
    }
}

var lastReportOpen;
async function openReport(reportNumber, bypassHTML=false) {
    lastReportOpen = reportNumber;
    advanced.classList.add("hide");
    if (!bypassHTML) {
        reportListDiv.children[reportNumber*2].innerText = "Loading...";
        reportListDiv.children[reportNumber*2].disabled = true;
    }
    var configData = await getStorageBin(reportsList[reportNumber].fileName);
    if (!bypassHTML) {
        reportListDiv.children[reportNumber*2].innerText = reportsList[reportNumber].dateString;
        reportListDiv.children[reportNumber*2].removeAttribute("disabled");
    }
    hideEverything();
    viewReportUI.show();
    browseSales.innerText = Math.floor((configData.z1.adjTtl + configData.tablets.total)*100)/100;
    browseRegister.innerText = configData.register.values.sum();
    browseDeposit.innerText = Math.floor((configData.z1.cashInDrawer - configData.cc.tips - configData.z1.storePurchases)*100)/100;

    var registerLiHTML = "";
    var labels = ["Big bills", "20s", "10s", "5s", "1s", "Quarters", "Dimes", "Nickels", "Pennies", "Underneath", "Envelope", "Other"];
    for (var i = 0; i < configData.register.values.length; i++) {
        registerLiHTML += `<li>${labels[i]}: $${roundCents(configData.register.values[i])}</li>`;
    }

    advanced.innerHTML = `
        <h3>Tablets</h3>
        <ul>
            <li>ChowNow: $${configData.tablets.cn}</li>
            <li>DoorDash: $${configData.tablets.dd}</li>
            <li>Uber Eats: $${configData.tablets.ue}</li>
            <li>GrubHub: $${configData.tablets.gh}</li>
        </ul>
        <h3>Z1</h3>
        <ul>
            <li>Adj. Total: $${configData.z1.adjTtl}</li>
            <li>Misc1 Tender: $${configData.z1.ccTend}</li>
            <li>Cash in Drawer: $${configData.z1.cashInDrawer}</li>
            <li>Store Purchases: $${configData.z1.storePurchases}</li>
        </ul>
        <h3>CC</h3>
        <ul>
            <li>Net: $${configData.cc.net}</li>
            <li>Tips: $${configData.cc.tips}</li>
            <li>Actual: $${roundCents((configData.cc.net-configData.cc.tips)/1.04)}</li>
        </ul>
        <h3>Register Values</h3>
        <ul>
            ${registerLiHTML}
        </ul>
    `;
    
}

function backToBrowse() {
    hideEverything();
    browseUI.show();
}

function toggleAdvanced() {
    advanced.classList.toggle("hide");
}

Array.prototype.sum = function() {
    var total = 0;
    for (var i = 0; i < this.length; i++) {
        total += +this[i];
    }
    return total;
}

async function deleteReport() {
    if (!confirm("Are you sure you want to delete this report?")) return;
    reportsList.splice(lastReportOpen, 1);
    hideEverything();
    await setStorageBin("nightly.fileList", reportsList);
    downloadReport();
}

async function homeAssistantCall(number) {
    return new Promise(function(resolve) {
        var x = new XMLHttpRequest();
        x.open("POST", "https://aidanjacobson.duckdns.org:8123/api/services/notify/salesemail");
        x.setRequestHeader("Authorization", `Bearer ${CryptoJS.AES.decrypt(encrypted_notify, "accesscode_" + localStorage.getItem("nightly_dpin")).toString(CryptoJS.enc.Utf8)}`);
        x.setRequestHeader("Content-Type", "application/json");
        x.send(JSON.stringify({
            title: "New Nightly Report Created",
            message: "View it here: https://aidanjacobson.github.io/nightlytotals/?report=" + number,
            target: "ordonezenterprisesllc@hotmail.com"
        }));
        return new Promise(function(resolve) {
            x.onload = function() {
                resolve();
            }
        })
    });
}

async function openReportFromMain(number) {
    await doAccessCheck();
    await downloadReports();
/*
    await getReportsList();
    reportListDiv.innerHTML = "";
    for (var i = 0; i < reportsList.length; i++) {
        reportListDiv.innerHTML += `<button onclick="openReport(${i})">${reportsList[i].dateString}</button><br>`;
    }
    openReport(number, true);
*/
}
