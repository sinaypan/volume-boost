const slider = document.getElementById('gain');
const label = document.getElementById('value');
const status = document.getElementById('status');
const RELOAD_HINT = 'Recharge la page pour activer le boost.';

async function activeTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id;
}

function show(percent) {
  slider.value = percent;
  label.textContent = `${percent} %`;
}

async function setGain(percent) {
  show(percent);
  try {
    // Sans frameId, le message part dans toutes les frames (lecteurs en iframe compris).
    await chrome.tabs.sendMessage(await activeTabId(), { type: 'setGain', value: percent / 100 });
    status.textContent = '';
  } catch {
    status.textContent = RELOAD_HINT;
  }
}

slider.addEventListener('input', () => setGain(Number(slider.value)));
document.getElementById('reset').addEventListener('click', () => setGain(100));

(async () => {
  try {
    const res = await chrome.tabs.sendMessage(await activeTabId(), { type: 'getGain' }, { frameId: 0 });
    show(Math.round(res.gain * 100));
  } catch {
    status.textContent = RELOAD_HINT;
  }
})();
