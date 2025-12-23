/* Geschenk 4 – script.js
   Erwartete IDs (falls du sie in index.html so hast):
   - startBtn, step1, step2, step3
   - gift, shakeArea, shakeMeter, shakeFill
   - revealBtn, codeWrap, codeText, copyBtn, confetti
   - snowCanvas (optional)
*/

(() => {
  const $ = (sel) => document.querySelector(sel);

  // ---- Safe getters (damit nix hart crasht, falls ein Element anders heißt) ----
  const els = {
    startBtn: $("#startBtn"),
    step1: $("#step1"),
    step2: $("#step2"),
    step3: $("#step3"),
    gift: $("#gift"),
    shakeArea: $("#shakeArea"),
    shakeMeter: $("#shakeMeter"),
    shakeFill: $("#shakeFill"),
    revealBtn: $("#revealBtn"),
    codeWrap: $("#codeWrap"),
    codeText: $("#codeText"),
    copyBtn: $("#copyBtn"),
    confetti: $("#confetti"),
    snowCanvas: $("#snowCanvas"),
  };

  // ---- Gutschein-Code PLACEHOLDER (hier später in index.html oder hier ersetzen) ----
  // Am sichersten: hier NICHT deinen echten Code reinschreiben.
  const STEAM_CODE = "STEAM-CODE-HIER-EINFÜGEN"; // <- du ersetzt das am Ende selbst

  // ---- Step State ----
  let currentStep = 1;
  let shakeScore = 0;
  let shakeDone = false;

  function showStep(n) {
    currentStep = n;
    [els.step1, els.step2, els.step3].forEach((el, idx) => {
      if (!el) return;
      el.style.display = (idx + 1 === n) ? "block" : "none";
    });
  }

  // ---- Gift wobble helper ----
  function wobble(el, intensity = 8, ms = 450) {
    if (!el) return;
    el.classList.add("wobble-on");
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      const wob = (1 - p) * intensity;
      const rot = (Math.sin(t / 35) * wob) / 2;
      const x = Math.sin(t / 25) * wob;
      const y = Math.cos(t / 30) * wob * 0.35;
      el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      if (p < 1) requestAnimationFrame(tick);
      else {
        el.style.transform = "";
        el.classList.remove("wobble-on");
      }
    };
    requestAnimationFrame(tick);
  }

  // ---- Step 1: Start ----
  function initStep1() {
    if (!els.startBtn) return;
    els.startBtn.addEventListener("click", () => {
      wobble(els.gift, 10, 520);
      showStep(2);
    });
  }

  // ---- Step 2: “Schüttel”-Minigame (Mouse/Touch Bewegung sammelt Punkte) ----
  function setMeter(pct) {
    if (els.shakeFill) els.shakeFill.style.width = `${pct}%`;
    if (els.shakeMeter) els.shakeMeter.setAttribute("aria-valuenow", String(pct));
  }

  function completeShake() {
    shakeDone = true;
    setMeter(100);
    if (els.revealBtn) {
      els.revealBtn.disabled = false;
      els.revealBtn.classList.add("ready");
    }
    wobble(els.gift, 14, 650);
    // kleine “Tadaa”-Vibration
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
  }

  function initStep2() {
    if (!els.shakeArea) return;

    let lastX = null;
    let lastY = null;
    let lastT = 0;

    const onMove = (x, y) => {
      const now = performance.now();
      if (lastX === null) {
        lastX = x; lastY = y; lastT = now;
        return;
      }
      const dx = x - lastX;
      const dy = y - lastY;
      const dt = Math.max(1, now - lastT);

      // Geschwindigkeit als “Schüttel”-Signal
      const v = Math.sqrt(dx * dx + dy * dy) / dt; // px/ms
      const add = Math.min(6, v * 120); // skaliert

      // nur sammeln, wenn wir wirklich in Step 2 sind
      if (currentStep === 2 && !shakeDone) {
        shakeScore += add;
        const pct = Math.max(0, Math.min(100, (shakeScore / 140) * 100));
        setMeter(pct);

        // Gift wackelt bei Bewegung
        if (add > 1.2) wobble(els.gift, 7 + Math.min(10, add), 220);

        if (pct >= 100) completeShake();
      }

      lastX = x; lastY = y; lastT = now;
    };

    // Mouse
    els.shakeArea.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));

    // Touch
    els.shakeArea.addEventListener("touchmove", (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      onMove(t.clientX, t.clientY);
    }, { passive: true });

    // “Reset” wenn man Step 2 neu startet (falls du später Back-Button einbaust)
    const reset = () => {
      shakeScore = 0;
      shakeDone = false;
      setMeter(0);
      if (els.revealBtn) {
        els.revealBtn.disabled = true;
        els.revealBtn.classList.remove("ready");
      }
    };
    window.__resetShakeGame = reset;

    // revealBtn führt zu Step 3
    if (els.revealBtn) {
      els.revealBtn.disabled = true;
      els.revealBtn.addEventListener("click", () => {
        if (!shakeDone) return;
        showStep(3);
        setTimeout(() => wobble(els.gift, 10, 420), 50);
      });
    }
  }

  // ---- Step 3: Code anzeigen + Kopieren + Konfetti ----
  function popConfetti() {
    if (!els.confetti) return;
    els.confetti.innerHTML = "";
    const n = 90;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "confetti";
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDelay = (Math.random() * 0.25) + "s";
      p.style.transform = `translateY(-10px) rotate(${Math.random() * 360}deg)`;
      els.confetti.appendChild(p);
    }
    els.confetti.classList.add("on");
    setTimeout(() => els.confetti.classList.remove("on"), 2400);
  }

  async function copyCode() {
    const code = (els.codeText?.textContent || "").trim();
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      if (els.copyBtn) {
        const old = els.copyBtn.textContent;
        els.copyBtn.textContent = "Kopiert! ✅";
        els.copyBtn.disabled = true;
        setTimeout(() => {
          els.copyBtn.textContent = old;
          els.copyBtn.disabled = false;
        }, 1200);
      }
    } catch {
      // Fallback: Auswahl
      const r = document.createRange();
      r.selectNodeContents(els.codeText);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      alert("Kopieren ging nicht automatisch – markiert ist er schon. Bitte STRG+C.");
    }
  }

  function initStep3() {
    if (els.codeText) els.codeText.textContent = STEAM_CODE;

    // “Reveal” Animation: erst versteckt, dann rein sliden (CSS macht den Rest)
    if (els.codeWrap) {
      els.codeWrap.classList.remove("show");
      setTimeout(() => els.codeWrap.classList.add("show"), 250);
    }
    popConfetti();

    if (els.copyBtn) {
      els.copyBtn.addEventListener("click", copyCode);
    }
  }

  // Wenn Step gewechselt wird, Step-Init ggf. nachziehen
  const originalShowStep = showStep;
  showStep = (n) => {
    originalShowStep(n);
    if (n === 3) initStep3();
  };

  // ---- Optional: Schneefall Canvas (wenn snowCanvas existiert) ----
  function initSnow() {
    if (!els.snowCanvas) return;

    const c = els.snowCanvas;
    const ctx = c.getContext("2d");
    const flakes = [];
    const FLAKES = 120;

    function resize() {
      c.width = Math.floor(window.innerWidth * devicePixelRatio);
      c.height = Math.floor(window.innerHeight * devicePixelRatio);
      c.style.width = "100%";
      c.style.height = "100%";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    function addFlakes() {
      flakes.length = 0;
      for (let i = 0; i < FLAKES; i++) {
        flakes.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          r: (Math.random() * 2.4 + 0.8) * devicePixelRatio,
          s: (Math.random() * 0.7 + 0.25) * devicePixelRatio,
          w: (Math.random() * 1.8 - 0.9) * devicePixelRatio,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      for (const f of flakes) {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        f.y += f.s;
        f.x += f.w * 0.25;
        if (f.y > c.height + 10) {
          f.y = -10;
          f.x = Math.random() * c.width;
        }
        if (f.x < -10) f.x = c.width + 10;
        if (f.x > c.width + 10) f.x = -10;
      }
      ctx.fill();
      requestAnimationFrame(tick);
    }

    window.addEventListener("resize", () => {
      resize();
      addFlakes();
    });

    resize();
    addFlakes();
    tick();
  }

  // ---- Boot ----
  function boot() {
    // Default: Step 1 anzeigen
    showStep(1);

    initStep1();
    initStep2();
    initSnow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
