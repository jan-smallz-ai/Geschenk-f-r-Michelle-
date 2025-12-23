// Geschenk 4 – game.js
// Passt EXAKT zu deiner aktuellen index.html + style.css

document.addEventListener("DOMContentLoaded", () => {
  const shakeBtn = document.getElementById("shakeBtn");
  const gift = document.getElementById("gift");
  const bar = document.getElementById("bar");
  const reveal = document.getElementById("reveal");
  const copyBtn = document.getElementById("copyBtn");
  const codeEl = document.getElementById("code");

  // 🔐 Platzhalter – HIER trägst du GANZ AM ENDE den echten Code ein
  const STEAM_CODE = "STEAM-CODE-HIER-EINFÜGEN";

  let progress = 0;
  const MAX = 100;

  function updateBar() {
    bar.style.width = progress + "%";
  }

  function shakeGift() {
    if (progress >= MAX) return;

    progress += 10;
    updateBar();

    // kleines Wackeln
    gift.style.transform = "rotate(-8deg) scale(1.1)";
    setTimeout(() => {
      gift.style.transform = "rotate(8deg) scale(1)";
    }, 120);

    if (progress >= MAX) {
      finishGift();
    }
  }

  function finishGift() {
    progress = MAX;
    updateBar();

    setTimeout(() => {
      reveal.style.display = "block";
      codeEl.textContent = STEAM_CODE;
    }, 400);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(codeEl.textContent);
      copyBtn.textContent = "Kopiert ✅";
      setTimeout(() => {
        copyBtn.textContent = "Code kopieren";
      }, 1500);
    } catch {
      // Fallback: markieren
      const range = document.createRange();
      range.selectNodeContents(codeEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      alert("Code ist markiert – bitte kopieren (Strg+C)");
    }
  }

  // Events
  shakeBtn.addEventListener("click", shakeGift);
  gift.addEventListener("click", shakeGift);
  copyBtn.addEventListener("click", copyCode);
});
