async function nightTips() {
    hideMainMenu();
    tip3Back.show();
    nightTipsUI.removeAttribute("hidden");
}

async function endOfShiftTips() {
    nightTipsUI.setAttribute("hidden", true);
    showNumberPanel();
    instructions.innerText = "Enter Cash Tip Amount (not including $3)";
    var cashTipAmount = +(await awaitNumberInput());
    instructions.innerText = "Enter Credit Card Amount";
    var ccTipAmount = +(await awaitNumberInput());
    var total = roundCents(cashTipAmount + ccTipAmount);
    instructions.innerText = "Enter Number Of People Split"
    var split = +(await awaitNumberInput());
    hideNumberPanel();
    var tipSim = new Array(split).fill(Math.floor(Math.floor(total)/split));
    var rem = Math.floor(total) % split;
    for (var i = 0; i < rem; i++) {
        tipSim[i]++;
    }
    var remain = total - Math.floor(total);
    remain = roundCents(remain);
    console.log(total, split, remain);
    tipSplitOut.innerText = `Suggested Tipout: ${tipSim.map(e=>`\$${e}`).join(", ")}`;
    remainingCents.innerText = `Remain in jar: \$${remain}`;
    uploadValues();
    nightTips();
}