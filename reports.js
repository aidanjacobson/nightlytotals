async function z1() {
    hideEverything();
    showNumberPanel();
    instructions.innerText = "Enter Adj TTL";
    config.z1.adjTtl = +(await awaitNumberInput());
    instructions.innerText = "Enter CC Tender";
    config.z1.ccTend = +(await awaitNumberInput());
    instructions.innerText = "Enter Cash In Drawer";
    config.z1.cashInDrawer = +(await awaitNumberInput());
    config.completed.z1 = true;
    uploadValues();
    if (!sequenceRunning) closeToMain();
}

async function cc() {
    hideEverything();
    showNumberPanel();
    instructions.innerText = "Enter CC Net";
    config.cc.net = await awaitNumberInput();
    instructions.innerText = "Enter CC Tips";
    config.cc.tips = await awaitNumberInput();
    config.completed.cc = true;
    uploadValues();
    if (!sequenceRunning) closeToMain();
}

var overrideReportCheck = false;

if (overrideReportCheck) {
    console.warn("Warning: overrideReportCheck is set to true");
}
async function deposit() {
    if ((!config.completed.z1 || !config.completed.cc || !config.completed.tablets) && !overrideReportCheck) {
        if (!config.completed.z1) {
            alert("Z1 report must be completed first");
        }
        if (!config.completed.cc) {
            alert("CC report must be completed first");
        }
        if (!config.completed.tablets) {
            alert("Tablet report must be completed first");
        }
        return;
    }
    hideEverything();
    readDepositValues();
    depositUI.show();
}

function readDepositValues() {
    var ccActual = Math.round((config.cc.net-config.cc.tips)/1.04*100)/100;
    var ccDiff = ccActual - config.z1.ccTend;
    ccClover.innerText = Math.floor((ccActual)*100)/100;
    ccRegister.innerText = Math.floor((config.z1.ccTend)*100)/100;
    ccDiffOut.innerText = Math.floor((ccDiff)*100)/100;
    salesNumber.innerText = Math.floor((config.z1.adjTtl + config.tablets.total)*100)/100;
    depositAmount.innerText = Math.floor((config.z1.cashInDrawer - config.cc.tips - config.z1.storePurchases)*100)/100;
    rawVals.children[0].innerText = `Adj. Total - ${config.z1.adjTtl}`;
    rawVals.children[1].innerText = `Misc1 Tender - ${config.z1.ccTend}`;
    rawVals.children[2].innerText = `Cash In Drawer - ${config.z1.cashInDrawer}`;
    rawVals.children[3].innerText = `CC Net - ${config.cc.net}`;
    rawVals.children[4].innerText = `CC Tips - ${config.cc.tips}`;
}

async function storePurchases() {
    hideEverything();
    showNumberPanel();
    var spAmount = 0;
    while(true) {
        instructions.innerText = `Enter Store Purchase Amount, Or 0 If Done (Current: ${roundCents(spAmount)})`;
        var newSPAmount = await awaitNumberInput();
        if (newSPAmount == 0) break;
        spAmount += newSPAmount;
    }
    config.z1.storePurchases = spAmount;
    spLink.innerText = config.z1.storePurchases > 0 ? `Store Purchases: \$${config.z1.storePurchases}` : "Add Store Purchases";
    hideNumberPanel();
    uploadValues();
    deposit();
}