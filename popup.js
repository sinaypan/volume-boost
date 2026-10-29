const slider = document.getElementById('gain');
const label = document.getElementById('value');
const status = document.getElementById('status');
const presets = document.getElementById('presets');
const RELOAD_HINT = t('reloadHint');

async function activeTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id;
}

function show(percent) {
  slider.value = percent;
  // La piste se remplit jusqu'au bouton.
  slider.style.setProperty('--fill', `${(percent / Number(slider.max)) * 100}%`);
  label.textContent = t('percent', percent);
  for (const button of presets.children) button.setAttribute('aria-pressed', String(Number(button.dataset.value) === percent));
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
presets.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-value]');
  if (button) setGain(Number(button.dataset.value));
});

show(100);

(async () => {
  try {
    const res = await chrome.tabs.sendMessage(await activeTabId(), { type: 'getGain' }, { frameId: 0 });
    show(Math.round(res.gain * 100));
  } catch {
    status.textContent = RELOAD_HINT;
  }
})();
