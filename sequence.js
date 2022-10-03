async function doSequenceUI() {
    hideEverything();
    sequenceUI.show();
    updateSequenceCheckboxes();
}

function updateSequenceCheckboxes() {
    seq_tablets.checked = !config.completed.tablets;
    seq_tips.checked = !config.completed.tips;
    seq_z1.checked = !config.completed.z1;
    seq_cc.checked = !config.completed.cc;
    seq_dep.checked = ((config.completed.tablets || seq_tablets.checked) && (config.completed.z1 || seq_z1.checked) && (config.completed.cc || seq_cc.checked));
    seq_reg.checked = !config.completed.register;
    seq_master.checked = (seq_dep.checked && (seq_reg.checked || config.completed.register));
}

var sequenceRunning = false;
async function runSequence() {
    hideEverything();
    sequenceRunning = true;
    if (seq_tablets.checked) await doTablets();
    if (seq_tips.checked) await run_seq_tips();
    if (seq_z1.checked) await z1();
    if (seq_cc.checked) await cc();
    if (seq_dep.checked) await run_seq_dep();
    if (seq_reg.checked) await run_seq_reg();
    if (seq_master.checked) createMasterReport();
    sequenceRunning = false;
}

var resolveFunc = ()=>{};

function run_seq_tips() {
    return new Promise(function(resolve) {
        endOfShiftTips();
        resolveFunc = function() {
            resolve();
        }
    });
}
function run_seq_dep() {
    return new Promise(function(resolve) {
        deposit();
        resolveFunc = function() {
            resolve();
        }
    });
}

function run_seq_reg() {
    return new Promise(function(resolve) {
        register();
        resolveFunc = function() {
            resolve();
        }
    });
}