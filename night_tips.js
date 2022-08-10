async function nightTips() {
    hideMainMenu();
    nightTipsUI.removeAttribute("hidden");
}

async function endOfShiftTips() {
    nightTipsUI.setAttribute("hidden", true);
    showNumberPanel();
    instructions.innerText = "Enter Cash Tip Amount (not including $3)";
    tip3Back.show();
    var cashTipAmount = +(await awaitNumberInput());
    tip3Back.hide();
    instructions.innerText = "Enter Credit Card Amount";
    var ccTipAmount = +(await awaitNumberInput());
    var total = Math.floor(cashTipAmount + ccTipAmount);
    instructions.innerText = "Enter Number Of People Split"
    var split = +(await awaitNumberInput());
    hideNumberPanel();
    var tipSim = new Array(split).fill(Math.floor(total/split));
    var rem = total % split;
    for (var i = 0; i < rem; i++) {
        tipSim[i]++;
    }
    tipSplitOut.innerText = `Suggested Tipout: ${tipSim.map(e=>`\$${e}`).join(", ")}`;
    uploadValues();
    nightTips();
}