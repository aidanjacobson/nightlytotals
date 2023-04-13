function submitReport() {
    var fileName = "nightlyreport_" + config.tablets.dateString.replace(/\//g, "-");
}

function downloadReport() {
    if (!confirm("Warning! This will overwrite all unsaved data. Do you want to continue?")) return;
}

var access_token = "";
var encrypted_access_token = "U2FsdGVkX1/Zq+Ha/mE2FZTpkFinAjC1V5zGbHvw9fI=";

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
    instructions.innerText = (firstAttempt ? "" : "Incorrect pin. ") + "Enter Access Token (hint: Marlene's credit card login)";
    var dpin = await awaitNumberInput();
    firstAttempt = false;
    localStorage.setItem("nightly_dpin", dpin);
    hideNumberPanel();
}

function getStorageBin(binName) {
    return new Promise(function(resolve) {
        var x = new XMLHttpRequest();
        x.open("GET", "https://aidanjacobson.duckdns.org:9999/store/" + binName);
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
        x.open("POST", "https://aidanjacobson.duckdns.org:9999/store/" + binName);
        x.setRequestHeader("Security-key", access_token);
        x.setRequestHeader("Content-Type", "application/json");
        x.onload = function() {
            resolve(JSON.parse(x.responseText));
        }
        x.send(JSON.stringify(jsonData));
    });
}