async function nightTips() {
    hideMainMenu();
    tip3Back.show();
    nightTipsUI.removeAttribute("hidden");
    renderTips();
}

function renderTips() {
    if (config.completed.tips) {
        tipSplitOut.innerText = config.tips.tipSplitOut;
        remainingCents.innerText = config.tips.remainingCents;
    }
}

async function endOfShiftTips() {
    nightTipsUI.setAttribute("hidden", true);
    showNumberPanel();
    instructions.innerText = "Enter Cash Tip Amount (not including $3)";
    var cashTipAmount = +(await awaitNumberInput());
    instructions.innerText = "Enter Credit Card Tip Amount";
    var ccTipAmount = +(await awaitNumberInput());
    var total = roundCents(cashTipAmount + ccTipAmount);
    instructions.innerText = `($${Math.floor(total)}) Enter Number Of People Split`;
    var split = +(await awaitNumberInput());
    hideNumberPanel();
    var tipSim = new Array(split).fill(Math.floor(Math.floor(total)/split));
    var rem = Math.floor(total) % split;
    for (var i = 0; i < rem; i++) {
        tipSim[i]++;
    }
    var remain = total - Math.floor(total);
    remain = roundCents(remain);
    config.tips.tipSplitOut = `Suggested Tipout: ${tipSim.map(e=>`\$${e}`).join(", ")}`;
    config.tips.remainingCents = `Remain in jar: \$${remain}`;
    config.completed.tips = true;
    uploadValues();
    nightTips();
}