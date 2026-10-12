(() => {
  let gain = 1;
  let ctx = null;
  const seen = new WeakSet();
  const gainNodes = new Set();

  // Un média cross-origin sans CORS devient muet une fois branché sur Web Audio :
  // on le laisse tranquille plutôt que de couper le son.
  function isBlockedByCors(el) {
    const src = el.currentSrc;
    if (!/^https?:/i.test(src)) return false;
    try {
      return new URL(src).origin !== location.origin && !el.crossOrigin;
    } catch {
      return false;
    }
  }

  function hook(el) {
    if (!(el instanceof HTMLMediaElement) || seen.has(el)) return;
    if (!el.currentSrc || isBlockedByCors(el)) return;
    seen.add(el);
    try {
      ctx ??= new AudioContext();
      const node = ctx.createGain();
      node.gain.value = gain;
      ctx.createMediaElementSource(el).connect(node).connect(ctx.destination);
      gainNodes.add(node);
    } catch {
      // L'élément est déjà relié à un autre AudioContext (celui de la page).
    }
  }

  function apply() {
    // Tant que le boost n'a jamais été activé, on ne touche à rien.
    if (gain === 1 && !ctx) return;
    document.querySelectorAll('video, audio').forEach(hook);
    for (const node of gainNodes) node.gain.value = gain;
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // "play" ne remonte pas, d'où la capture : ça attrape les vidéos ajoutées plus tard.
  document.addEventListener('play', apply, true);

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'setGain') {
      gain = msg.value;
      apply();
    } else if (msg.type === 'getGain') {
      sendResponse({ gain });
    }
  });
})();
