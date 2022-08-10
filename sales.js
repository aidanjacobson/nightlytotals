async function sales() {
    hideMainMenu();
    salesUI.show();
}

async function adjTotal() {
    showNumberPanel();
    salesUI.hide();
    adjTtl = +(await awaitNumberInput());
    uploadValues();
    hideNumberPanel();
    salesUI.show();
}

async function calcSales() {
    hideEverything();
    salesOut.show();
    salesOut.innerHTML = `<h1>Sales: \$${adjTtl+tabletReport.total}</h1>`;
}