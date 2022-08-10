/*
    Values:
    20, 10, 5, 1, quarter, dime, nickel, penny, under, envelope, other
*/

async function register() {
    parseConfig();
    hideEverything();
    registerUI.show();
}

async function increment(event) {
    hideEverything();
    showNumberPanel();
    var currentValue = +event.target.previousElementSibling.value;
    instructions.innerText = "Increment by how much?";
    var amt = await awaitNumberInput();
    event.target.previousElementSibling.value = currentValue + amt;
    hideNumberPanel();
    registerUI.show();
    uploadValues();
}

window.addEventListener("load", function() {
    inputsArray = [count_20, count_10, count_5, count_1, count_q, count_d, count_n, count_p, count_under, count_envelope, count_other];
    cashInputs = [count_20,count_10,count_5,count_1];
});
var inputsArray = [];
var cashInputs = [];

function inputsAdd(inputs_init) {
    var inputs = values(inputs_init);
    var out = 0;
    for (var i = 0; i < inputs.length; i++) {
        out += +inputs[i];
    }
    return out;
}

function values(inputs) {
    return inputs.map(e=>e.value);
}

function inputsAreFilled() {
    return inputsArray.every(e=>e.value!="");
}

function regInputChange() {
    if (inputsAreFilled()) {
        readRegInputs();
        uploadValues();
    }
}

function readRegInputs() {
    regTotal.innerText = inputsAdd(inputsArray);
    cashEnvTotal.innerText = inputsAdd(cashInputs);
    grayEnvTotal.innerText = count_envelope.value;
    config.register.values = values(inputsArray);
    if (config.register.compared == "") config.register.compared = "Compare to last night"
    config.register.compared = lnDisp.innerText;
}

async function compareLastNight() {
    hideEverything();
    showNumberPanel();
    instructions.innerText = "Enter last night";
    var lastNight = await awaitNumberInput();
    hideNumberPanel();
    registerUI.show();
    var diff = Math.round((inputsAdd(inputsArray) - lastNight)*100)/100;
    var lnString = diff.toString();
    if (diff >= 0) lnString = "+" + lnString;
    lnDisp.innerText = `Compared to last night: ${lnString}`;
    config.register.compared = lnDisp.innerText;
    uploadValues();
}