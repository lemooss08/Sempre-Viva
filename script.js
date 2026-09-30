// ============================================================
// SISTEMA DE NOTIFICAÇÕES (TOAST)
// ============================================================

function showNotification(message, type = "success", duration = 7000) {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = { success: "✨", error: "⚠️", info: "ℹ️" };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] ?? ""}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, duration);
}

// ============================================================
// MÁSCARAS E VALIDAÇÕES
// ============================================================

function maskCPF(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  let formatted = "";
  if (value.length > 0) {
    formatted = value.slice(0, 3);
    if (value.length > 3) formatted += "." + value.slice(3, 6);
    if (value.length > 6) formatted += "." + value.slice(6, 9);
    if (value.length > 9) formatted += "-" + value.slice(9, 11);
  }
  input.value = formatted;
}

function maskPhone(input) {
  const isDeleting =
    window.event && window.event.inputType === "deleteContentBackward";
  let value = input.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  if (isDeleting && value.length <= 2) {
    input.value = value;
    return;
  }
  let formatted = "";
  if (value.length > 0) {
    formatted = "(" + value.slice(0, 2);
    if (value.length > 2) formatted += ") " + value.slice(2, 7);
    if (value.length > 7) formatted += "-" + value.slice(7, 11);
  }
  input.value = formatted;
}

// ============================================================
// MEGA MENU (DESKTOP)
// ============================================================

const items = document.querySelectorAll(".nav-item[data-menu]");
const overlay = document.getElementById("overlay");
const navbar = document.getElementById("navbar");
let currentMenu = null;
let closeTimer = null;

function disableAllTransitions() {
  document
    .querySelectorAll(".mega-menu")
    .forEach((m) => (m.style.transition = "none"));
}

function enableAllTransitions() {
  requestAnimationFrame(() => {
    document
      .querySelectorAll(".mega-menu")
      .forEach((m) => (m.style.transition = ""));
  });
}

function openMenu(menuId) {
  if (window.innerWidth <= 768) return; // Desktop only
  cancelClose();
  if (currentMenu === menuId) return;

  if (currentMenu) {
    disableAllTransitions();
    const prev = document.getElementById("menu-" + currentMenu);
    if (prev) prev.classList.remove("visible");
  }

  const next = document.getElementById("menu-" + menuId);
  if (next) {
    if (currentMenu) {
      next.classList.add("visible");
      enableAllTransitions();
    } else {
      enableAllTransitions();
      next.classList.add("visible");
      if (overlay) overlay.classList.add("visible");
      if (navbar) navbar.classList.add("menu-open");
    }
  }

  currentMenu = menuId;
}

function scheduleClose() {
  if (window.innerWidth <= 768) return;
  closeTimer = setTimeout(closeAll, 120);
}

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function closeAll() {
  if (currentMenu) {
    const menu = document.getElementById("menu-" + currentMenu);
    if (menu) {
      menu.style.transition = "opacity 0.12s ease, transform 0.12s ease";
      menu.classList.remove("visible");
      setTimeout(() => {
        menu.style.transition = "";
      }, 130);
    }
  }
  currentMenu = null;
  if (overlay) {
    overlay.style.transition = "none";
    overlay.classList.remove("visible");
    requestAnimationFrame(() => {
      overlay.style.transition = "";
    });
  }
  if (navbar) navbar.classList.remove("menu-open");
}

// Desktop hover events
items.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    if (window.innerWidth > 768) openMenu(item.dataset.menu);
  });
  item.addEventListener("mouseleave", () => {
    if (window.innerWidth > 768) scheduleClose();
  });
});

document.querySelectorAll(".mega-menu").forEach((menu) => {
  menu.addEventListener("mouseenter", cancelClose);
  menu.addEventListener("mouseleave", scheduleClose);
});

if (navbar) navbar.addEventListener("mouseenter", cancelClose);
if (overlay) overlay.addEventListener("click", closeAll);

// ============================================================
// SCROLL SUAVE
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      closeAll();
      closeMobileMenu();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ============================================================
// REVEAL ANIMATION
// ============================================================

const elements = document.querySelectorAll(".reveal, .pulse");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  },
  { threshold: 0.2 },
);

elements.forEach((el) => observer.observe(el));

// ============================================================
// ALTERNAR TEMA
// ============================================================

const btnDarkMode = document.getElementById("btn-dark-mode");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark-mode");
} else if (
  !savedTheme &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  document.documentElement.classList.add("dark-mode");
}

if (btnDarkMode) {
  btnDarkMode.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark-mode");
    if (isDark) {
      localStorage.setItem("theme", "dark");
      btnDarkMode.textContent = "Modo Claro";
    } else {
      localStorage.setItem("theme", "light");
      btnDarkMode.textContent = "Modo Escuro";
    }
  });
}

// ============================================================
// DOAÇÃO VIA PIX (nova seção, abaixo de "Seja Voluntário(a)")
// ============================================================

// ATENÇÃO: troque "chave" pela chave Pix oficial da ONG (CPF/CNPJ, e-mail,
// telefone ou chave aleatória) cadastrada no banco antes de publicar.
// Sem uma chave real e válida, o QR Code é apenas ilustrativo.
const PIX_CONFIG = {
  chave: "15524498401",
  nomeRecebedor: "ONG SEMPRE VIVA",
  cidade: "RECIFE",
};

// Monta um campo TLV (Tag-Length-Value) do padrão BR Code (Pix estático).
function pixTLV(id, valor) {
  const tamanho = String(valor.length).padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

// CRC16/CCITT-FALSE exigido no final do payload Pix.
function pixCRC16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Gera o payload "copia e cola" de um QR Code Pix estático (sem valor fixo,
// o doador informa o valor no próprio app do banco).
function gerarPayloadPix({ chave, nomeRecebedor, cidade }) {
  const merchantAccountInfo =
    pixTLV("00", "br.gov.bcb.pix") + pixTLV("01", chave);

  let payload = "";
  payload += pixTLV("00", "01"); // Payload Format Indicator
  payload += pixTLV("01", "11"); // QR estático e reutilizável
  payload += pixTLV("26", merchantAccountInfo);
  payload += pixTLV("52", "0000"); // Merchant Category Code
  payload += pixTLV("53", "986"); // Moeda: Real (BRL)
  payload += pixTLV("58", "BR");
  payload += pixTLV("59", nomeRecebedor.substring(0, 25));
  payload += pixTLV("60", cidade.substring(0, 15));
  payload += pixTLV("62", pixTLV("05", "***")); // Identificador da transação

  payload += "6304";
  return payload + pixCRC16(payload);
}

const btnAbrirPix = document.getElementById("btn-abrir-pix");
const pixPainel = document.getElementById("pix-painel");
const pixFechar = document.getElementById("pix-fechar");
const formPix = document.getElementById("form-pix");
const pixQrcodeImg = document.getElementById("pix-qrcode-img");

function atualizarQrCodePix() {
  if (!pixQrcodeImg) return;
  const payload = gerarPayloadPix(PIX_CONFIG);
  const url =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
    encodeURIComponent(payload);
  pixQrcodeImg.src = url;
}

function abrirPainelPix() {
  if (!pixPainel) return;
  pixPainel.hidden = false;
  btnAbrirPix?.setAttribute("aria-expanded", "true");
  atualizarQrCodePix();
  document.getElementById("pix-nome")?.focus();
}

function fecharPainelPix() {
  if (!pixPainel) return;
  pixPainel.hidden = true;
  btnAbrirPix?.setAttribute("aria-expanded", "false");
  formPix?.reset();
}

btnAbrirPix?.addEventListener("click", () => {
  if (pixPainel?.hidden === false) {
    fecharPainelPix();
  } else {
    abrirPainelPix();
  }
});

pixFechar?.addEventListener("click", fecharPainelPix);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && pixPainel?.hidden === false) {
    fecharPainelPix();
  }
});

function cpfValido(cpfFormatado) {
  const cpf = String(cpfFormatado).replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // bloqueia 111.111.111-11 etc.

  const calcularDigito = (base) => {
    let soma = 0;
    let peso = base.length + 1;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * peso;
      peso--;
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(cpf.slice(0, 9));
  const digito2 = calcularDigito(cpf.slice(0, 9) + digito1);
  return cpf.slice(9) === `${digito1}${digito2}`;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

formPix?.addEventListener("submit", (event) => {
  event.preventDefault();
  const dados = new FormData(formPix);
  const nome = String(dados.get("nome") || "").trim();
  const cpf = String(dados.get("cpf") || "").trim();
  const email = String(dados.get("email") || "").trim();

  if (!nome) {
    showNotification("Preencha seu nome para continuar.", "error");
    document.getElementById("pix-nome")?.focus();
    return;
  }

  if (!cpfValido(cpf)) {
    showNotification("CPF inválido. Confira os números digitados.", "error");
    document.getElementById("pix-cpf")?.focus();
    return;
  }

  if (!emailValido(email)) {
    showNotification("Informe um e-mail válido.", "error");
    document.getElementById("pix-email")?.focus();
    return;
  }

  // Aqui entraria a confirmação real do pagamento junto ao banco/PSP.
  fecharPainelPix();
  showNotification(
    `Obrigado, ${nome}! Sua doação via Pix foi confirmada. 💚`,
    "success",
    5000,
  );
});

// ============================================================
// PILARES — TABS
// ============================================================

function openPilarTab(evt, tabName) {
  document
    .querySelectorAll(".pilar-content")
    .forEach((c) => c.classList.remove("active"));
  document
    .querySelectorAll(".pilar-tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById("tab-" + tabName)?.classList.add("active");
  evt.currentTarget.classList.add("active");
}

// ============================================================
// FORMULÁRIO DE CONTATO
// ============================================================

document.getElementById("form")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = this.querySelector('input[type="text"]').value.trim();
  const email = this.querySelector('input[type="email"]').value.trim();
  const telefone = this.querySelector('input[type="tel"]').value.trim();
  const mensagem = this.querySelector("textarea").value.trim();

  const textoCompleto = `Olá, me chamo ${nome}.\n\nE-mail: ${email}\nTelefone: ${telefone}\n\n${mensagem}`;

  const whatsappURL = `https://wa.me/5581991886606?text=${encodeURIComponent(textoCompleto)}`;
  const gmailURL = `https://mail.google.com/mail/?view=cm&to=semprevivasocial@gmail.com&su=${encodeURIComponent("Contato pelo site — " + nome)}&body=${encodeURIComponent(textoCompleto)}`;
  const instagramURL = `https://www.instagram.com/semprevivasocial/`;

  const secaoContato = document.getElementById("contato");
  const container = secaoContato?.querySelector(".container");

  if (container) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;animation:fadeIn 0.6s ease;">
        <div style="font-size:56px;margin-bottom:16px;">💚</div>
        <h2 style="color:#1abc9c;font-size:1.9rem;margin-bottom:10px;border:none;display:block;padding:0;">
          Mensagem pronta!
        </h2>
        <p style="font-size:1rem;color:#555;max-width:480px;margin:0 auto 28px;line-height:1.8;">
          Escolha por onde quer enviar sua mensagem para a <strong>ONG Sempre Viva Social</strong>:
        </p>

        <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;">

          <a href="${whatsappURL}" target="_blank"
             style="display:flex;align-items:center;gap:10px;
                    background:#25D366;color:#fff;
                    padding:13px 22px;border-radius:30px;
                    font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;
                    text-decoration:none;box-shadow:0 4px 14px rgba(37,211,102,0.35);
                    transition:opacity 0.2s;"
             onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
                 style="width:22px;height:22px;filter:brightness(0) invert(1);">
            Enviar pelo WhatsApp
          </a>

          <a href="${gmailURL}" target="_blank"
             style="display:flex;align-items:center;gap:10px;
                    background:#EA4335;color:#fff;
                    padding:13px 22px;border-radius:30px;
                    font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;
                    text-decoration:none;box-shadow:0 4px 14px rgba(234,67,53,0.35);
                    transition:opacity 0.2s;"
             onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
            <img src="https://cdn-icons-png.flaticon.com/512/281/281769.png"
                 style="width:22px;height:22px;filter:brightness(0) invert(1);">
            Enviar pelo Gmail
          </a>

          <a href="${instagramURL}" target="_blank"
             style="display:flex;align-items:center;gap:10px;
                    background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);
                    color:#fff;
                    padding:13px 22px;border-radius:30px;
                    font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;
                    text-decoration:none;box-shadow:0 4px 14px rgba(188,24,136,0.35);
                    transition:opacity 0.2s;"
             onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                 style="width:22px;height:22px;filter:brightness(0) invert(1);">
            Ir para o Instagram
          </a>

        </div>

        <p style="margin-top:22px;font-size:13px;color:#999;font-family:'Montserrat',sans-serif;">
          ℹ️ O Instagram não permite envio direto de mensagens por link. Ao clicar, você será levado ao perfil da ONG para enviar uma DM manualmente.
        </p>
      </div>
    `;
  }
});

// ============================================================
// CARROSSEL DOS CARDS DE INICIATIVAS
// ============================================================

function initCardCarousel(carousel) {
  const track = carousel.querySelector(".card-carousel-track");
  const slides = carousel.querySelectorAll(".card-carousel-slide");
  const dots = carousel.querySelectorAll(".card-carousel-dot");
  const total = slides.length;
  let idx = 0;

  if (total <= 1) {
    carousel
      .querySelectorAll(".card-carousel-btn")
      .forEach((b) => (b.style.display = "none"));
    carousel.querySelector(".card-carousel-dots").style.display = "none";
    return;
  }

  function goTo(n) {
    idx = (n + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  carousel
    .querySelector(".card-carousel-btn.prev")
    ?.addEventListener("click", () => goTo(idx - 1));

  carousel
    .querySelector(".card-carousel-btn.next")
    ?.addEventListener("click", () => goTo(idx + 1));

  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

  let touchStartX = 0;
  carousel.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true },
  );
  carousel.addEventListener(
    "touchend",
    (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? idx + 1 : idx - 1);
    },
    { passive: true },
  );
}

document.querySelectorAll(".card-carousel").forEach(initCardCarousel);

// ============================================================
// CARROSSEL DA EQUIPE
// ============================================================

(function () {
  const track = document.getElementById("equipeTrack");
  const btnPrev = document.getElementById("equipePrev");
  const btnNext = document.getElementById("equipeNext");
  if (!track) return;

  const grupos = Array.from(track.children);
  let index = 0;
  let animando = false;

  function goTo(i) {
    if (animando) return;
    animando = true;
    index = (i + grupos.length) % grupos.length;
    grupos.forEach((g, idx) => {
      if (idx === index) {
        g.style.display = "";
        g.style.opacity = "0";
        g.style.transform = "translateX(30px)";
        g.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        setTimeout(() => {
          g.style.opacity = "1";
          g.style.transform = "translateX(0)";
          setTimeout(() => {
            animando = false;
          }, 400);
        }, 10);
      } else {
        g.style.display = "none";
        g.style.opacity = "0";
      }
    });
  }

  grupos.forEach((g) => {
    g.style.opacity = "0";
    g.style.display = "none";
  });

  btnNext.addEventListener("click", function () {
    goTo(index + 1);
  });
  btnPrev.addEventListener("click", function () {
    goTo(index - 1);
  });

  goTo(0);
})();

// ============================================================
// CARROSSEL DE ENTREVISTAS
// ============================================================

(function () {
  const track = document.getElementById("entrevistasTrack");
  const btnPrev = document.getElementById("entrevistasPrev");
  const btnNext = document.getElementById("entrevistasNext");
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.children);
  const total = cards.length;
  let offset = 0;

  function getVisible() {
    const vw = window.innerWidth;
    if (vw <= 600) return 1;
    if (vw <= 900) return 2;
    return 3;
  }

  function update() {
    const visible = getVisible();
    const maxOffset = Math.max(0, total - visible);
    offset = Math.max(0, Math.min(offset, maxOffset));

    const gap = 24;
    const viewportW = track.parentElement.offsetWidth;
    const cardWidth = (viewportW - gap * (visible - 1)) / visible;

    cards.forEach((c) => {
      c.style.minWidth = cardWidth + "px";
      c.style.width = cardWidth + "px";
      c.style.marginRight = gap + "px";
    });
    const shift = offset * (cardWidth + gap);
    track.style.transform = `translateX(-${shift}px)`;

    btnPrev.disabled = offset === 0;
    btnNext.disabled = offset >= maxOffset;
  }

  btnNext.addEventListener("click", () => {
    offset++;
    update();
  });
  btnPrev.addEventListener("click", () => {
    offset--;
    update();
  });

  window.addEventListener("resize", () => {
    offset = 0;
    update();
  });

  update();
})();

function toggleDescricao(btn) {
  const descricao = btn.previousElementSibling;
  const expandido = descricao.classList.toggle("expanded");
  btn.textContent = expandido ? "Ver menos ▴" : "Saiba mais ▾";
}

// ============================================================
// SLIDER FONTE
// ============================================================

(function () {
  const IS_DARK = () =>
    document.documentElement.classList.contains("dark-mode");

  const T = {
    light: {
      wrap: "rgba(255,255,255,0.97)",
      border: "#ececec",
      track: "#eeeeee",
      thumb: "#ffffff",
      aSmall: "#cccccc",
      aBig: "#1abc9c",
      shadow: "0 4px 20px rgba(0,0,0,0.09)",
      hoverSh:
        "0 6px 28px rgba(26,188,156,0.18), 0 0 0 1.5px rgba(26,188,156,0.2)",
      dragSh: "0 2px 12px rgba(0,0,0,0.12), 0 0 0 3px rgba(26,188,156,0.28)",
      thumbSh: "0 2px 8px rgba(0,0,0,0.13), 0 0 0 1px rgba(26,188,156,0.12)",
    },
    dark: {
      wrap: "rgba(22,22,22,0.97)",
      border: "#282828",
      track: "#1c1c1c",
      thumb: "#323232",
      aSmall: "#3a3a3a",
      aBig: "#2ecc71",
      shadow: "0 4px 20px rgba(0,0,0,0.5)",
      hoverSh:
        "0 6px 28px rgba(46,204,113,0.2), 0 0 0 1.5px rgba(46,204,113,0.25)",
      dragSh: "0 2px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(46,204,113,0.3)",
      thumbSh: "0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(46,204,113,0.15)",
    },
  };

  const wrap = Object.assign(document.createElement("div"), {
    id: "fslider-wrapper",
  });
  const aS = Object.assign(document.createElement("span"), {
    id: "fslider-a-small",
    textContent: "A",
  });
  const track = Object.assign(document.createElement("div"), {
    id: "fslider-track",
  });
  const fill = Object.assign(document.createElement("div"), {
    id: "fslider-fill",
  });
  const thumb = Object.assign(document.createElement("div"), {
    id: "fslider-thumb",
  });
  const grip = Object.assign(document.createElement("div"), {
    id: "fslider-grip",
  });
  const aB = Object.assign(document.createElement("span"), {
    id: "fslider-a-big",
    textContent: "A",
  });

  thumb.appendChild(grip);
  track.append(fill, thumb);
  wrap.append(aS, track, aB);
  document.body.appendChild(wrap);

  const css = (el, styles) => Object.assign(el.style, styles);

  css(wrap, {
    position: "fixed",
    top: window.innerWidth <= 768 ? "62px" : "76px",
    right: "20px",
    zIndex: "10000",
    display: "flex",
    alignItems: "center",
    gap: "3px",
    borderRadius: "50px",
    padding: "3px 6px",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    userSelect: "none",
    transition: "box-shadow 0.25s ease, background 0.25s ease",
  });
  css(aS, {
    fontFamily: "'Montserrat',sans-serif",
    fontWeight: "700",
    fontSize: "0.58rem",
    lineHeight: "1",
    flexShrink: "0",
    transition: "color 0.25s",
  });
  css(track, {
    position: "relative",
    width: "108px",
    height: "32px",
    borderRadius: "16px",
    cursor: "pointer",
    flexShrink: "0",
    overflow: "hidden",
    transition: "background 0.25s",
  });
  css(fill, {
    position: "absolute",
    top: "0",
    left: "0",
    height: "100%",
    width: "0",
    borderRadius: "16px",
    background: "linear-gradient(90deg,#1abc9c,#2ecc71)",
    opacity: "0.22",
    pointerEvents: "none",
  });
  css(thumb, {
    position: "absolute",
    top: "3px",
    left: "3px",
    width: "50px",
    height: "26px",
    borderRadius: "13px",
    cursor: "grab",
    zIndex: "2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition:
      "left 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
  });
  css(grip, {
    display: "flex",
    gap: "3px",
    pointerEvents: "none",
  });
  for (let i = 0; i < 3; i++) {
    const line = document.createElement("div");
    css(line, {
      width: "2px",
      height: "10px",
      borderRadius: "2px",
      background: "linear-gradient(180deg,#1abc9c,#2ecc71)",
      opacity: "0.55",
    });
    grip.appendChild(line);
  }
  css(aB, {
    fontFamily: "'Montserrat',sans-serif",
    fontWeight: "700",
    fontSize: "1.05rem",
    lineHeight: "1",
    flexShrink: "0",
    transition: "color 0.25s",
  });

  function applyTheme() {
    const c = IS_DARK() ? T.dark : T.light;
    css(wrap, {
      background: c.wrap,
      borderColor: c.border,
      boxShadow: c.shadow,
      border: `1.5px solid ${c.border}`,
    });
    css(track, {
      background: c.track,
      boxShadow: IS_DARK()
        ? "inset 0 2px 6px rgba(0,0,0,0.45)"
        : "inset 0 2px 6px rgba(0,0,0,0.08)",
    });
    css(thumb, { background: c.thumb, boxShadow: c.thumbSh });
    aS.style.color = c.aSmall;
    aB.style.color = c.aBig;
  }

  const LEVELS = ["", "font-size-1", "font-size-2"];
  const FONT_SCALE = [18, 20, 23];
  let current = Math.min(
    parseInt(localStorage.getItem("fontSizeLevel") || "0", 10),
    2,
  );
  let ratio = current / 2;
  let dragging = false,
    startX = 0,
    startRatio = 0;

  const innerW = () => track.offsetWidth - thumb.offsetWidth - 6;
  const toLeft = (r) => 3 + r * innerW();
  const toRatio = (px) => Math.max(0, Math.min(1, (px - 3) / innerW()));
  const toLevel = (r) => (r < 0.33 ? 0 : r < 0.67 ? 1 : 2);

  function setPos(r, animate) {
    const tr = animate ? "left 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none";
    const fr = animate ? "width 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none";
    thumb.style.transition = tr + ", box-shadow 0.2s ease";
    fill.style.transition = fr;
    thumb.style.left = toLeft(r) + "px";
    fill.style.width = toLeft(r) + thumb.offsetWidth / 2 + "px";
  }

  function liveFont(r) {
    document.body.style.fontSize =
      FONT_SCALE[0] + r * (FONT_SCALE[2] - FONT_SCALE[0]) + "px";
  }

  function commitLevel(n) {
    LEVELS.forEach((c) => {
      if (c) document.documentElement.classList.remove(c);
    });
    document.body.style.fontSize = "";
    if (LEVELS[n]) document.documentElement.classList.add(LEVELS[n]);
    localStorage.setItem("fontSizeLevel", n);
    current = n;
    ratio = n / 2;
  }

  requestAnimationFrame(() => {
    setPos(ratio, false);
    applyTheme();
  });
  window.addEventListener("resize", () => setPos(ratio, false));
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributeFilter: ["class"],
  });

  wrap.addEventListener("mouseenter", () => {
    wrap.style.boxShadow = (IS_DARK() ? T.dark : T.light).hoverSh;
  });
  wrap.addEventListener("mouseleave", () => applyTheme());

  thumb.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX;
    startRatio = ratio;
    thumb.style.transition = "box-shadow 0.2s ease";
    fill.style.transition = "none";
    thumb.style.cursor = "grabbing";
    thumb.style.boxShadow = (IS_DARK() ? T.dark : T.light).dragSh;
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    ratio = Math.max(
      0,
      Math.min(1, startRatio + (e.clientX - startX) / innerW()),
    );
    setPos(ratio, false);
    liveFont(ratio);
  });
  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    thumb.style.cursor = "grab";
    commitLevel(toLevel(ratio));
    setPos(ratio, true);
    applyTheme();
  });

  thumb.addEventListener(
    "touchstart",
    (e) => {
      dragging = true;
      startX = e.touches[0].clientX;
      startRatio = ratio;
      thumb.style.transition = "none";
      fill.style.transition = "none";
    },
    { passive: true },
  );
  document.addEventListener(
    "touchmove",
    (e) => {
      if (!dragging) return;
      ratio = Math.max(
        0,
        Math.min(1, startRatio + (e.touches[0].clientX - startX) / innerW()),
      );
      setPos(ratio, false);
      liveFont(ratio);
    },
    { passive: true },
  );
  document.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;
    commitLevel(toLevel(ratio));
    setPos(ratio, true);
    applyTheme();
  });

  track.addEventListener("click", (e) => {
    if (thumb.contains(e.target)) return;
    const r = toRatio(
      e.clientX -
        track.getBoundingClientRect().left -
        thumb.offsetWidth / 2 +
        3,
    );
    commitLevel(toLevel(r));
    ratio = toLevel(r) / 2;
    setPos(ratio, true);
  });
})();

// ============================================================
// MENU MOBILE — CLIQUE VAI DIRETO PRA SEÇÃO (SEM SUBMENU)
// ============================================================

const hamburger = document.getElementById("hamburger");
const navCenter = document.querySelector(".nav-center");

// Painel de submenu mobile continua existindo no DOM (por compatibilidade
// com o CSS), mas não é mais aberto — os itens do menu agora levam
// diretamente para a seção principal correspondente.
const mobileSubmenu = document.createElement("div");
mobileSubmenu.id = "mobile-submenu";
mobileSubmenu.innerHTML = `
  <button id="mobile-back-btn">
    <span class="back-arrow">←</span>
    Voltar
  </button>
  <div id="mobile-submenu-content"></div>
`;
document.body.appendChild(mobileSubmenu);

const mobileBackBtn = document.getElementById("mobile-back-btn");
const mobileSubmenuContent = document.getElementById("mobile-submenu-content");

function closeMobileSubmenu() {
  mobileSubmenu.classList.remove("active");
}

function closeMobileMenu() {
  navCenter?.classList.remove("mobile-open");
  closeMobileSubmenu();
}

// Hambúrguer: abre/fecha o nav-center
hamburger?.addEventListener("click", () => {
  const isOpen = navCenter.classList.toggle("mobile-open");
  if (!isOpen) closeMobileSubmenu();
});

// Mapeia cada item do menu para a seção principal correspondente
const mobileMainAnchor = {
  sobre: "#sobre",
  doacoes: "#acoes",
  "nosso-trabalho": "#nosso-trabalho",
  parcerias: "#parcerias",
  contato: "#contato",
};

// Itens do nav no mobile: clique leva direto pra seção principal (sem submenu)
items.forEach((item) => {
  item.addEventListener("click", (e) => {
    if (window.innerWidth > 768) return;
    e.preventDefault();
    const menuId = item.dataset.menu;
    const anchor = mobileMainAnchor[menuId];
    closeMobileMenu();
    if (anchor) {
      const target = document.querySelector(anchor);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Itens sem submenu (Doações): fecha o menu ao clicar
document
  .querySelectorAll("#nav-center-list .nav-item:not([data-menu])")
  .forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth > 768) return;
      closeMobileMenu();
    });
  });

// Botão Voltar: fecha o submenu, mantém o nav-center aberto
mobileBackBtn?.addEventListener("click", () => {
  closeMobileSubmenu();
});

// Overlay fecha tudo no mobile
overlay?.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    closeMobileMenu();
  }
});

// Fecha ao redimensionar para desktop
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeMobileMenu();
  }
});

// ============================================================
// TRANSPARÊNCIA — TABS
// ============================================================

function openTransparenciaTab(evt, tabName) {
  document
    .querySelectorAll(".transp-content")
    .forEach((c) => c.classList.remove("active"));
  document
    .querySelectorAll(".transp-tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById("tab-" + tabName)?.classList.add("active");
  evt.currentTarget.classList.add("active");
}

// ============================================================
// ODS — TOOLTIP NO MOBILE (substitui o flip 3D)
// ============================================================

(function () {
  // Textos de cada ODS (mesma ordem dos cards no HTML)
  const odsTextos = [
    "Erradicação da Pobreza",
    "Fome Zero e Agricultura Sustentável",
    "Saúde e Bem-Estar",
    "Educação de Qualidade",
    "Igualdade de Gênero",
    "Redução das Desigualdades",
    "Cidades e Comunidades Sustentáveis",
    "Consumo e Produção Responsáveis",
    "Ação Contra a Mudança Global do Clima",
  ];

  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Injeta o span de tooltip dentro de cada .ods-card
  document.querySelectorAll(".ods-card").forEach((card, i) => {
    // Pega o texto da face traseira já existente no HTML
    const descEl = card.querySelector(".ods-desc");
    const numEl = card.querySelector(".ods-num");
    const texto = descEl ? descEl.textContent.trim() : odsTextos[i] || "";
    const num = numEl ? numEl.textContent.trim() : "";

    const tooltip = document.createElement("span");
    tooltip.className = "ods-tooltip";
    tooltip.textContent = (num ? `ODS ${num}: ` : "") + texto;
    card.appendChild(tooltip);

    // Toque: toggle da classe .touched
    card.addEventListener(
      "touchstart",
      (e) => {
        if (!isMobile()) return;
        e.preventDefault(); // evita o flip acidental
        const isOpen = card.classList.contains("touched");
        // Fecha todos os outros
        document
          .querySelectorAll(".ods-card.touched")
          .forEach((c) => c.classList.remove("touched"));
        if (!isOpen) card.classList.add("touched");
      },
      { passive: false },
    );
  });

  // Toque fora fecha todos os tooltips
  document.addEventListener(
    "touchstart",
    (e) => {
      if (!isMobile()) return;
      if (!e.target.closest(".ods-card")) {
        document
          .querySelectorAll(".ods-card.touched")
          .forEach((c) => c.classList.remove("touched"));
      }
    },
    { passive: true },
  );
})();

// ============================================================
// PATCH v5 — MODO DE EDIÇÃO DO SITE
// Apague QUALQUER versão anterior deste patch que você tenha
// colado, e cole este bloco no lugar, no final do script.js.
// ============================================================

(function () {
  const SELETOR_GRUPO = ".equipe-item, .parceiro-item";

  // ---------- BOTÃO "EDITAR SITE" (dentro da navbar, à esquerda do Modo Escuro) ----------
  const navActions = document.querySelector(".nav-actions");
  const btnDarkMode = document.getElementById("btn-dark-mode");

  const btnEditar = document.createElement("button");
  btnEditar.id = "btn-editar-site";
  btnEditar.type = "button";
  btnEditar.setAttribute("aria-label", "Editar site");
  btnEditar.textContent = "✎";

  if (navActions && btnDarkMode) {
    navActions.insertBefore(btnEditar, btnDarkMode);
  } else if (navActions) {
    navActions.insertBefore(btnEditar, navActions.firstChild);
  } else {
    document.body.appendChild(btnEditar);
  }

  btnEditar.addEventListener("click", () => {
    const ativo = document.body.classList.toggle("edit-mode-ativo");
    btnEditar.classList.toggle("ativo", ativo);
    btnEditar.textContent = ativo ? "✕" : "✎";
    btnEditar.setAttribute(
      "aria-label",
      ativo ? "Sair da edição" : "Editar site",
    );
    if (!ativo) {
      document
        .querySelectorAll(
          ".ee-img-menu.ee-aberto, .ee-carrossel-menu.ee-aberto, .ee-grupo-menu.ee-aberto",
        )
        .forEach((m) => m.classList.remove("ee-aberto"));
      document
        .querySelectorAll(".ee-grupo-modo-imagem, .ee-grupo-modo-texto")
        .forEach((g) =>
          g.classList.remove("ee-grupo-modo-imagem", "ee-grupo-modo-texto"),
        );
    }
  });

  // ---------- contadores globais (usados tanto pelos textos/imagens avulsos quanto pelos agrupados) ----------
  let contadorTexto = 0;
  let contadorImg = 0;

  // ---------- função reutilizável: configura um texto (botão "+" e "↺") ----------
  function configurarTexto(el, agrupado) {
    if (
      el.closest(
        "nav, .modal, form, .mega-menu, .dropdown-content, #mobile-submenu",
      )
    )
      return;
    if (el.dataset.eeInit) return;
    if (!el.textContent.trim()) return;

    el.dataset.eeInit = "1";
    const indice = contadorTexto++;
    const chave = "ee-texto-" + indice;
    const chaveHist = "ee-texto-hist-" + indice;

    const conteudoOriginal = el.innerHTML;
    const salvo = localStorage.getItem(chave);
    if (salvo !== null) el.innerHTML = salvo;

    if (getComputedStyle(el).position === "static") {
      el.style.position = "relative";
    }

    function obterHistorico() {
      try {
        return JSON.parse(localStorage.getItem(chaveHist) || "[]");
      } catch (erro) {
        return [];
      }
    }
    function salvarHistorico(hist) {
      localStorage.setItem(chaveHist, JSON.stringify(hist));
    }

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = agrupado ? "ee-text-btn ee-text-btn-g" : "ee-text-btn";
    botao.textContent = "+";
    botao.setAttribute("aria-label", "Editar texto");
    botao.setAttribute("contenteditable", "false");

    const botaoRecuperar = document.createElement("button");
    botaoRecuperar.type = "button";
    botaoRecuperar.className = agrupado
      ? "ee-recuperar-btn ee-recuperar-btn-g"
      : "ee-recuperar-btn";
    botaoRecuperar.textContent = "↺";
    botaoRecuperar.setAttribute("aria-label", "Recuperar versão anterior");
    botaoRecuperar.setAttribute("contenteditable", "false");
    botaoRecuperar.title = "Recuperar";

    el.appendChild(botao);
    el.appendChild(botaoRecuperar);

    function atualizarEstadoRecuperar() {
      botaoRecuperar.style.display = obterHistorico().length > 0 ? "" : "none";
    }
    atualizarEstadoRecuperar();

    function salvarConteudo() {
      const anteriorSalvo = localStorage.getItem(chave);
      const valorParaHistorico =
        anteriorSalvo !== null ? anteriorSalvo : conteudoOriginal;
      const hist = obterHistorico();
      hist.push(valorParaHistorico);
      salvarHistorico(hist);

      const clone = el.cloneNode(true);
      clone
        .querySelectorAll(".ee-text-btn, .ee-recuperar-btn")
        .forEach((b) => b.remove());
      localStorage.setItem(chave, clone.innerHTML);
      atualizarEstadoRecuperar();
    }

    function alternarEdicao() {
      const editando = el.getAttribute("contenteditable") === "true";
      if (editando) {
        el.setAttribute("contenteditable", "false");
        botao.textContent = "+";
        botao.classList.remove("ee-ativo");
        salvarConteudo();
      } else {
        el.setAttribute("contenteditable", "true");
        el.focus();
        botao.textContent = "✓";
        botao.classList.add("ee-ativo");
      }
    }

    botao.addEventListener("mousedown", (e) => e.preventDefault());
    botao.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      alternarEdicao();
    });

    el.addEventListener("blur", () => {
      if (el.getAttribute("contenteditable") === "true") {
        el.setAttribute("contenteditable", "false");
        botao.textContent = "+";
        botao.classList.remove("ee-ativo");
        salvarConteudo();
      }
    });

    botaoRecuperar.addEventListener("mousedown", (e) => e.preventDefault());
    botaoRecuperar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const hist = obterHistorico();
      if (hist.length === 0) return;
      const anterior = hist.pop();
      salvarHistorico(hist);
      localStorage.setItem(chave, anterior);
      el.innerHTML = anterior;
      el.appendChild(botao);
      el.appendChild(botaoRecuperar);
      atualizarEstadoRecuperar();
      if (typeof showNotification === "function") {
        showNotification("Texto recuperado.", "info");
      }
    });
  }

  // ---------- função reutilizável: configura uma imagem avulsa (botão verde "+") ----------
  function configurarImagem(img, agrupado) {
    if (img.dataset.eeInit) return;
    if (img.closest("nav, .modal, form")) return;
    img.dataset.eeInit = "1";
    img.dataset.eeImagemOriginal = img.currentSrc || img.src;

    const chaveImg = "ee-img-" + contadorImg++;
    img.dataset.eeChave = chaveImg;
    const salva = localStorage.getItem(chaveImg);
    if (salva) img.src = salva;

    const ancora = img.parentElement;
    if (!ancora) return;
    if (getComputedStyle(ancora).position === "static") {
      ancora.style.position = "relative";
    }

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = agrupado ? "ee-img-btn ee-img-btn-g" : "ee-img-btn";
    botao.textContent = "+";
    botao.setAttribute("aria-label", "Editar imagem");
    ancora.appendChild(botao);

    const menu = document.createElement("div");
    menu.className = "ee-img-menu";
    menu.innerHTML = `
      <button type="button" class="ee-adicionar">Adicionar imagem</button>
      <button type="button" class="ee-restaurar">↺ Restaurar imagem</button>
      <button type="button" class="ee-remover">Excluir imagem</button><button type="button" class="ee-cancelar-imagem">− Não vou editar</button>
    `;
    ancora.appendChild(menu);

    const inputArquivo = document.createElement("input");
    inputArquivo.type = "file";
    inputArquivo.accept = "image/*";
    inputArquivo.style.display = "none";
    ancora.appendChild(inputArquivo);

    botao.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      document
        .querySelectorAll(
          ".ee-img-menu.ee-aberto, .ee-carrossel-menu.ee-aberto, .ee-grupo-menu.ee-aberto",
        )
        .forEach((m) => {
          if (m !== menu) m.classList.remove("ee-aberto");
        });
      menu.classList.toggle("ee-aberto");
    });

    menu.querySelector(".ee-adicionar").addEventListener("click", (e) => {
      e.stopPropagation();
      inputArquivo.click();
    });

    menu.querySelector(".ee-restaurar").addEventListener("click", (e) => {
      e.stopPropagation();
      img.src = img.dataset.eeImagemOriginal || img.src;
      img.style.display = "";
      delete img.dataset.eeRemovida;
      localStorage.removeItem(chaveImg);
      menu.classList.remove("ee-aberto");
      if (typeof showNotification === "function")
        showNotification("Imagem original restaurada.", "info");
    });

    menu.querySelector(".ee-cancelar-imagem").addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("ee-aberto");
    });

    menu.querySelector(".ee-remover").addEventListener("click", (e) => {
      e.stopPropagation();
      img.style.display = "none";
      img.dataset.eeRemovida = "1";
      menu.classList.remove("ee-aberto");
      if (typeof showNotification === "function") {
        showNotification("Imagem removida.", "info");
      }
    });

    inputArquivo.addEventListener("change", () => {
      const arquivo = inputArquivo.files[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = (ev) => {
        img.src = ev.target.result;
        img.style.display = "";
        delete img.dataset.eeRemovida;
        try {
          localStorage.setItem(chaveImg, ev.target.result);
        } catch (erro) {
          // imagem grande demais para o localStorage: fica só na tela desta sessão
        }
        menu.classList.remove("ee-aberto");
        if (typeof showNotification === "function") {
          showNotification("Imagem atualizada.", "success");
        }
      };
      leitor.readAsDataURL(arquivo);
    });
  }

  // ---------- TEXTOS E IMAGENS "AVULSOS" (fora de cartões de equipe/parceiros) ----------
  const seletorTextos =
    "h1, h2, h3, h4, p, li, blockquote, td, .equipe-nome, .equipe-cargo, .link-titulo, .ods-desc, .status-badge";

  document.querySelectorAll(seletorTextos).forEach((el) => {
    if (el.closest(SELETOR_GRUPO) || el.closest(".ods-card")) return;
    configurarTexto(el, false);
  });

  document
    .querySelectorAll(
      ".section img:not(.icon-img):not(.card-carousel-slide img)",
    )
    .forEach((img) => {
      if (img.closest(SELETOR_GRUPO) || img.closest(".ods-card")) return;
      configurarImagem(img, false);
    });

  // ---------- CARTÕES AGRUPADOS (equipe e parceiros): UM botão só ----------
  function configurarGrupo(container) {
    if (container.dataset.eeGrupoInit) return;
    container.dataset.eeGrupoInit = "1";

    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

    container
      .querySelectorAll("h1, h2, h3, h4, p, li, .equipe-nome, .equipe-cargo")
      .forEach((el) => {
        configurarTexto(el, true);
      });
    container.querySelectorAll("img:not(.icon-img)").forEach((img) => {
      configurarImagem(img, true);
    });

    const botaoGrupo = document.createElement("button");
    botaoGrupo.type = "button";
    botaoGrupo.className = "ee-grupo-btn";
    botaoGrupo.textContent = "+";
    botaoGrupo.setAttribute("aria-label", "Editar cartão");
    container.appendChild(botaoGrupo);

    const menu = document.createElement("div");
    menu.className = "ee-grupo-menu";
    menu.innerHTML = `
      <button type="button" class="ee-opcao-imagem">Editar imagem</button>
      <button type="button" class="ee-opcao-texto">Editar texto</button>
      <button type="button" class="ee-opcao-desfazer">↺ Voltar alteração</button>
    `;
    container.appendChild(menu);

    botaoGrupo.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      document
        .querySelectorAll(
          ".ee-grupo-menu.ee-aberto, .ee-img-menu.ee-aberto, .ee-carrossel-menu.ee-aberto",
        )
        .forEach((m) => {
          if (m !== menu) m.classList.remove("ee-aberto");
        });
      menu.classList.toggle("ee-aberto");
    });

    menu.querySelector(".ee-opcao-imagem").addEventListener("click", (e) => {
      e.stopPropagation();
      const ativar = !container.classList.contains("ee-grupo-modo-imagem");
      container.classList.remove("ee-grupo-modo-texto");
      container.classList.toggle("ee-grupo-modo-imagem", ativar);
      menu.classList.remove("ee-aberto");
    });

    menu.querySelector(".ee-opcao-texto").addEventListener("click", (e) => {
      e.stopPropagation();
      const ativar = !container.classList.contains("ee-grupo-modo-texto");
      container.classList.remove("ee-grupo-modo-imagem");
      container.classList.toggle("ee-grupo-modo-texto", ativar);
      menu.classList.remove("ee-aberto");
    });

    // Desfaz uma alteração por vez em cada texto do cartão, até chegar ao original.
    menu.querySelector(".ee-opcao-desfazer").addEventListener("click", (e) => {
      e.stopPropagation();
      let recuperado = 0;
      container.querySelectorAll(".ee-recuperar-btn-g").forEach((btn) => {
        if (getComputedStyle(btn).display !== "none") {
          btn.click();
          recuperado++;
        }
      });
      menu.classList.remove("ee-aberto");
      if (typeof showNotification === "function")
        showNotification(
          recuperado
            ? "Alteração anterior recuperada."
            : "Não há mais alterações para recuperar.",
          recuperado ? "info" : "error",
        );
    });
  }

  document.querySelectorAll(SELETOR_GRUPO).forEach(configurarGrupo);

  // ---------- CARROSSÉIS (iniciativas): botão único para o carrossel inteiro ----------
  document
    .querySelectorAll(".card-carousel")
    .forEach(configurarCarrosselEditavel);

  function configurarCarrosselEditavel(carouselOriginal) {
    if (carouselOriginal.dataset.eeCarrosselInit) return;

    const carousel = carouselOriginal.cloneNode(true);
    carousel.dataset.eeCarrosselInit = "1";
    carouselOriginal.replaceWith(carousel);

    const track = carousel.querySelector(".card-carousel-track");
    if (!track) return;
    const dotsContainer = carousel.querySelector(".card-carousel-dots");
    const btnPrev = carousel.querySelector(".card-carousel-btn.prev");
    const btnNext = carousel.querySelector(".card-carousel-btn.next");

    let indiceAtual = 0;
    let modoExclusaoAtivo = false;

    function slidesAtuais() {
      return Array.from(
        track.querySelectorAll(".card-carousel-slide:not(.ee-add-tile)"),
      );
    }

    function irPara(n) {
      const total = slidesAtuais().length;
      if (total === 0) return;
      indiceAtual = (n + total) % total;
      track.style.transform = `translateX(-${indiceAtual * 100}%)`;
      if (dotsContainer) {
        dotsContainer
          .querySelectorAll(".card-carousel-dot")
          .forEach((d, i) => d.classList.toggle("active", i === indiceAtual));
      }
    }

    function atualizarNav() {
      const total = slidesAtuais().length;
      if (dotsContainer) {
        dotsContainer.innerHTML = "";
        for (let i = 0; i < total; i++) {
          const dot = document.createElement("span");
          dot.className =
            "card-carousel-dot" + (i === indiceAtual ? " active" : "");
          dot.addEventListener("click", () => irPara(i));
          dotsContainer.appendChild(dot);
        }
        dotsContainer.style.display = total > 1 ? "" : "none";
      }
      if (btnPrev) btnPrev.style.display = total > 1 ? "" : "none";
      if (btnNext) btnNext.style.display = total > 1 ? "" : "none";
      if (indiceAtual >= total) indiceAtual = Math.max(0, total - 1);
      irPara(indiceAtual);
    }

    if (btnPrev)
      btnPrev.addEventListener("click", () => irPara(indiceAtual - 1));
    if (btnNext)
      btnNext.addEventListener("click", () => irPara(indiceAtual + 1));

    let touchX = 0;
    carousel.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.changedTouches[0].clientX;
      },
      { passive: true },
    );
    carousel.addEventListener(
      "touchend",
      (e) => {
        const diff = touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) irPara(indiceAtual + (diff > 0 ? 1 : -1));
      },
      { passive: true },
    );

    atualizarNav();

    if (getComputedStyle(carousel).position === "static") {
      carousel.style.position = "relative";
    }

    const botaoGerenciar = document.createElement("button");
    botaoGerenciar.type = "button";
    botaoGerenciar.className = "ee-carrossel-btn";
    botaoGerenciar.innerHTML = "🖼 Fotos";
    botaoGerenciar.setAttribute("aria-label", "Gerenciar fotos do carrossel");
    carousel.appendChild(botaoGerenciar);

    const menu = document.createElement("div");
    menu.className = "ee-carrossel-menu";
    const itemExcluir = document.createElement("button");
    itemExcluir.type = "button";
    itemExcluir.textContent = "Excluir foto";
    menu.appendChild(itemExcluir);
    carousel.appendChild(menu);

    botaoGerenciar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      document
        .querySelectorAll(
          ".ee-img-menu.ee-aberto, .ee-carrossel-menu.ee-aberto, .ee-grupo-menu.ee-aberto",
        )
        .forEach((m) => {
          if (m !== menu) m.classList.remove("ee-aberto");
        });
      menu.classList.toggle("ee-aberto");
    });

    const inputArquivoCarrossel = document.createElement("input");
    inputArquivoCarrossel.type = "file";
    inputArquivoCarrossel.accept = "image/*";
    inputArquivoCarrossel.style.display = "none";
    carousel.appendChild(inputArquivoCarrossel);

    function criarBotaoRemoverEm(slide) {
      if (getComputedStyle(slide).position === "static")
        slide.style.position = "relative";
      const btnRemover = document.createElement("button");
      btnRemover.type = "button";
      btnRemover.className = "ee-slide-remove";
      btnRemover.textContent = "✕";
      btnRemover.setAttribute("aria-label", "Excluir esta foto");
      btnRemover.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        slide.remove();
        atualizarNav();
      });
      slide.appendChild(btnRemover);
    }

    function criarTileAdicionar() {
      const tile = document.createElement("div");
      tile.className = "card-carousel-slide ee-add-tile";
      tile.innerHTML =
        '<span class="ee-add-tile-conteudo">+<br>Adicionar foto</span>';
      tile.addEventListener("click", () => inputArquivoCarrossel.click());
      return tile;
    }

    function ligarModoExclusao(ativo) {
      modoExclusaoAtivo = ativo;
      itemExcluir.textContent = ativo
        ? "Concluir edição de fotos"
        : "Excluir foto";

      track.querySelectorAll(".ee-slide-remove").forEach((b) => b.remove());
      track.querySelectorAll(".ee-add-tile").forEach((t) => t.remove());

      if (ativo) {
        slidesAtuais().forEach(criarBotaoRemoverEm);
        track.appendChild(criarTileAdicionar());
      }
      atualizarNav();
    }

    itemExcluir.addEventListener("click", (e) => {
      e.stopPropagation();
      ligarModoExclusao(!modoExclusaoAtivo);
      menu.classList.remove("ee-aberto");
    });

    inputArquivoCarrossel.addEventListener("change", () => {
      const arquivo = inputArquivoCarrossel.files[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = (ev) => {
        const novoSlide = document.createElement("div");
        novoSlide.className = "card-carousel-slide";
        const novaImg = document.createElement("img");
        novaImg.src = ev.target.result;
        novaImg.alt = "Foto adicionada";
        novaImg.style.cssText =
          "width:100%;height:100%;object-fit:cover;display:block;";
        novoSlide.appendChild(novaImg);

        const tileAdicionar = track.querySelector(".ee-add-tile");
        if (tileAdicionar) track.insertBefore(novoSlide, tileAdicionar);
        else track.appendChild(novoSlide);

        if (modoExclusaoAtivo) criarBotaoRemoverEm(novoSlide);

        atualizarNav();
        indiceAtual = slidesAtuais().length - 1;
        irPara(indiceAtual);

        if (typeof showNotification === "function") {
          showNotification("Foto adicionada.", "success");
        }
      };
      leitor.readAsDataURL(arquivo);
      inputArquivoCarrossel.value = "";
    });
  }

  window.eeConfigurarTexto = configurarTexto;
  window.eeConfigurarImagem = configurarImagem;

  // fecha qualquer menu aberto ao clicar fora dele
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".ee-img-menu") &&
      !e.target.closest(".ee-img-btn") &&
      !e.target.closest(".ee-carrossel-menu") &&
      !e.target.closest(".ee-carrossel-btn") &&
      !e.target.closest(".ee-grupo-menu") &&
      !e.target.closest(".ee-grupo-btn")
    ) {
      document
        .querySelectorAll(
          ".ee-img-menu.ee-aberto, .ee-carrossel-menu.ee-aberto, .ee-grupo-menu.ee-aberto",
        )
        .forEach((m) => m.classList.remove("ee-aberto"));
    }
  });
})();
// ============================================================

// ============================================================
// PATCH v8 — UM ÚNICO + MESTRE POR CONJUNTO DE CARTÕES
// ============================================================
(function () {
  const conjuntos = document.querySelectorAll(
    ".equipe-carousel, .parcerias-galeria",
  );
  conjuntos.forEach((conjunto) => {
    if (conjunto.dataset.eeMestreConjunto) return;
    conjunto.dataset.eeMestreConjunto = "1";
    conjunto.classList.add("ee-conjunto-editavel");

    // Remove da interface os mestres que haviam sido criados em cada cartão.
    conjunto
      .querySelectorAll(".ee-grupo-btn, .ee-grupo-menu")
      .forEach((el) => el.remove());

    const mestre = document.createElement("button");
    mestre.type = "button";
    mestre.className = "ee-conjunto-btn";
    mestre.textContent = "+";
    mestre.setAttribute("aria-label", "Editar conjunto de cartões");
    mestre.title = "Editar cartões";
    conjunto.appendChild(mestre);

    const menu = document.createElement("div");
    menu.className = "ee-conjunto-menu";
    menu.innerHTML =
      '<button type="button" class="ee-conjunto-imagem">Editar imagem</button><button type="button" class="ee-conjunto-texto">Editar texto</button><button type="button" class="ee-conjunto-desfazer">↺ Voltar alteração</button><button type="button" class="ee-conjunto-cancelar">− Não vou editar</button>';
    conjunto.appendChild(menu);

    function fecharMenus() {
      document
        .querySelectorAll(".ee-conjunto-menu.aberto")
        .forEach((m) => m.classList.remove("aberto"));
    }
    mestre.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      fecharMenus();
      menu.classList.toggle("aberto");
    });
    menu.querySelector(".ee-conjunto-imagem").addEventListener("click", (e) => {
      e.stopPropagation();
      conjunto.classList.remove("ee-conjunto-texto");
      conjunto.classList.add("ee-conjunto-imagem");
      menu.classList.remove("aberto");
    });
    menu.querySelector(".ee-conjunto-texto").addEventListener("click", (e) => {
      e.stopPropagation();
      conjunto.classList.remove("ee-conjunto-imagem");
      conjunto.classList.add("ee-conjunto-texto");
      menu.classList.remove("aberto");
    });
    menu
      .querySelector(".ee-conjunto-cancelar")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        conjunto.classList.remove("ee-conjunto-imagem", "ee-conjunto-texto");
        menu.classList.remove("aberto");
      });

    menu
      .querySelector(".ee-conjunto-desfazer")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        let total = 0;
        conjunto.querySelectorAll(".ee-recuperar-btn-g").forEach((btn) => {
          btn.click();
          total++;
        });
        // Também restaura imagens alteradas/removidas neste conjunto.
        conjunto
          .querySelectorAll("img[data-eeImagemOriginal]")
          .forEach((img) => {
            const original = img.dataset.eeImagemOriginal;
            if (original && (img.src !== original || img.dataset.eeRemovida)) {
              img.src = original;
              img.style.display = "";
              delete img.dataset.eeRemovida;
              const chave = img.dataset.eeChave;
              if (chave) localStorage.removeItem(chave);
              total++;
            }
          });
        menu.classList.remove("aberto");
        if (typeof showNotification === "function")
          showNotification(
            total
              ? "Alteração anterior recuperada."
              : "Não há mais alterações para recuperar.",
            total ? "info" : "error",
          );
      });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ee-conjunto-editavel"))
      document
        .querySelectorAll(".ee-conjunto-menu.aberto")
        .forEach((m) => m.classList.remove("aberto"));
  });
})();

// PATCH v9 — limpar a modalidade escolhida ao sair da edição
(function () {
  const editar = document.getElementById("btn-editar-site");
  if (!editar) return;
  editar.addEventListener("click", () => {
    requestAnimationFrame(() => {
      if (!document.body.classList.contains("edit-mode-ativo")) {
        document
          .querySelectorAll(".ee-conjunto-editavel")
          .forEach((el) =>
            el.classList.remove("ee-conjunto-imagem", "ee-conjunto-texto"),
          );
        document
          .querySelectorAll(".ee-conjunto-menu.aberto")
          .forEach((el) => el.classList.remove("aberto"));
      }
    });
  });
})();

// ============================================================
// PATCH v12 — FINALIZAÇÃO LIMPA DOS CARROSSÉIS
// ============================================================
(function () {
  const carrosseis = document.querySelectorAll(".card-carousel");
  carrosseis.forEach((carousel) => {
    const menu = carousel.querySelector(".ee-carrossel-menu");
    const botao = carousel.querySelector(".ee-carrossel-btn");
    if (!menu || !botao || menu.querySelector(".ee-carrossel-cancelar")) return;

    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.className = "ee-carrossel-cancelar";
    cancelar.textContent = "− Não vou editar";
    menu.appendChild(cancelar);

    const concluirOuEditar = menu.querySelector("button");
    concluirOuEditar?.addEventListener("click", () => {
      requestAnimationFrame(() => {
        // O código original troca o texto para "Concluir" ao entrar
        // e volta para "Excluir foto" ao confirmar.
        if (concluirOuEditar.textContent.trim() === "Excluir foto") {
          carousel.classList.add("ee-carrossel-finalizado");
        } else {
          carousel.classList.remove("ee-carrossel-finalizado");
        }
      });
    });

    cancelar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      carousel.classList.add("ee-carrossel-finalizado");
      menu.classList.remove("ee-aberto");
      carousel
        .querySelectorAll(".ee-slide-remove")
        .forEach((el) => el.remove());
      carousel.querySelectorAll(".ee-add-tile").forEach((el) => el.remove());
    });
  });

  const editar = document.getElementById("btn-editar-site");
  editar?.addEventListener("click", () => {
    requestAnimationFrame(() => {
      if (document.body.classList.contains("edit-mode-ativo")) {
        document
          .querySelectorAll(".ee-carrossel-finalizado")
          .forEach((el) => el.classList.remove("ee-carrossel-finalizado"));
      }
    });
  });
})();

// ============================================================
// PATCH v13 — CONFIRMAR, CANCELAR E RETORNAR AO BOTÃO ORIGINAL
// ============================================================
(function () {
  // Textos: ✓ confirma e − cancela sem salvar. Depois de confirmar,
  // o mesmo texto pode ser editado novamente normalmente.
  document.querySelectorAll(".ee-text-btn").forEach((botao) => {
    if (botao.dataset.eeCancelInit) return;
    botao.dataset.eeCancelInit = "1";
    const el = botao.parentElement;
    if (!el) return;
    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.className = "ee-cancel-text-btn";
    cancelar.textContent = "−";
    cancelar.title = "Não vou editar";
    cancelar.setAttribute("aria-label", "Cancelar edição");
    cancelar.setAttribute("contenteditable", "false");
    el.appendChild(cancelar);
    let copiaAntes = "";
    let editando = false;

    botao.addEventListener("mousedown", () => {
      if (el.getAttribute("contenteditable") !== "true") {
        const clone = el.cloneNode(true);
        clone
          .querySelectorAll(
            ".ee-text-btn, .ee-recuperar-btn, .ee-cancel-text-btn",
          )
          .forEach((b) => b.remove());
        copiaAntes = clone.innerHTML;
        editando = true;
      } else {
        editando = false;
        cancelar.style.display = "none";
      }
    });
    cancelar.addEventListener("mousedown", (e) => e.preventDefault());
    cancelar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!editando) return;

      // pega o botão "recuperar" (U) ANTES de apagar o conteúdo, pra não perdê-lo
      const recuperar = el.querySelector(":scope > .ee-recuperar-btn");

      el.setAttribute("contenteditable", "false");
      el.innerHTML = copiaAntes;

      el.appendChild(botao);
      if (recuperar) el.appendChild(recuperar); // recoloca o "U" de volta
      el.appendChild(cancelar);

      botao.textContent = "+";
      botao.classList.remove("ee-ativo", "ee-confirmado"); // volta ao "+" normal, sem ficar verde
      cancelar.style.display = "none";
      editando = false;
    });
    botao.addEventListener("click", () => {
      requestAnimationFrame(() => {
        const ativo = el.getAttribute("contenteditable") === "true";
        cancelar.style.display = ativo ? "flex" : "none";
        if (!ativo) editando = false;
      });
    });
  });

  // Carrossel: confirmar ou cancelar encerra o submodo, mas preserva
  // apenas o botão mestre "Fotos" visível.
  document.querySelectorAll(".card-carousel").forEach((carousel) => {
    const menu = carousel.querySelector(".ee-carrossel-menu");
    if (!menu) return;
    const concluir = menu.querySelector("button:not(.ee-carrossel-cancelar)");
    concluir?.addEventListener("click", () => {
      requestAnimationFrame(() => {
        carousel.classList.remove("ee-carrossel-finalizado");
        menu.classList.remove("ee-aberto");
      });
    });
    menu
      .querySelector(".ee-carrossel-cancelar")
      ?.addEventListener("click", () => {
        carousel.classList.remove("ee-carrossel-finalizado");
        menu.classList.remove("ee-aberto");
      });
  });
})();

// ============================================================
// PATCH v14 — ESTADO NORMAL APÓS CONFIRMAR OU CANCELAR
// ============================================================
(function () {
  document.querySelectorAll(".ee-text-btn").forEach((botao) => {
    const el = botao.parentElement;
    if (!el || botao.dataset.eeEstadoInit) return;
    botao.dataset.eeEstadoInit = "1";
    const cancelar = el.querySelector(":scope > .ee-cancel-text-btn");
    const recuperar = el.querySelector(":scope > .ee-recuperar-btn");
    cancelar?.addEventListener("click", () =>
      botao.classList.add("ee-confirmado"),
    );

    botao.addEventListener("click", () => {
      requestAnimationFrame(() => {
        const editando = el.getAttribute("contenteditable") === "true";
        if (editando) {
          botao.classList.remove("ee-confirmado");
          if (cancelar) cancelar.style.display = "flex";
          if (recuperar) recuperar.style.display = "flex";
        } else {
          botao.classList.add("ee-confirmado");
          if (cancelar) cancelar.style.display = "none";
          // O botão de voltar continua disponível quando há histórico.
          if (recuperar && recuperar.style.display !== "none")
            recuperar.style.display = "flex";
        }
      });
    });
  });

  document.querySelectorAll(".card-carousel").forEach((carousel) => {
    const menu = carousel.querySelector(".ee-carrossel-menu");
    const chefe = carousel.querySelector(".ee-carrossel-btn");
    if (!menu || !chefe || carousel.dataset.eeEstadoInit) return;
    carousel.dataset.eeEstadoInit = "1";
    const finalizar = () => {
      carousel.classList.remove("ee-carrossel-finalizado");
      menu.classList.remove("ee-aberto");
      carousel
        .querySelectorAll(".ee-slide-remove, .ee-add-tile")
        .forEach((el) => el.remove());
      chefe.style.display = "";
    };
    menu.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => requestAnimationFrame(finalizar));
    });
  });
})();

// ============================================================
// PATCH v16 — CARDS ODS: BOTÃO CHEFE IGUAL AO DO CARROSSEL
// ============================================================
(function () {
  document.querySelectorAll(".ods-card").forEach((card) => {
    if (card.dataset.eeOdsInit) return;
    card.dataset.eeOdsInit = "1";
    card.classList.add("ee-conjunto-editavel");

    const desc = card.querySelector(".ods-desc");
    const num = card.querySelector(".ods-num");
    if (desc) window.eeConfigurarTexto?.(desc, true);
    if (num) window.eeConfigurarTexto?.(num, true);

    const img = card.querySelector(".ods-card-front img");
    if (img) window.eeConfigurarImagem?.(img, true);

    const mestre = document.createElement("button");
    mestre.type = "button";
    mestre.className = "ee-conjunto-btn";
    mestre.textContent = "+";
    mestre.setAttribute("aria-label", "Editar card ODS");
    card.appendChild(mestre);

    const menu = document.createElement("div");
    menu.className = "ee-conjunto-menu";
    menu.innerHTML = `
      <button type="button" class="ee-conjunto-imagem">Editar imagem</button>
      <button type="button" class="ee-conjunto-texto">Editar texto</button>
      <button type="button" class="ee-ods-excluir">Excluir cartão</button>
      <button type="button" class="ee-conjunto-desfazer">↺ Voltar alteração</button>
      <button type="button" class="ee-conjunto-cancelar">− Não vou editar</button>
    `;
    card.appendChild(menu);

    function fecharMenus() {
      document
        .querySelectorAll(".ee-conjunto-menu.aberto")
        .forEach((m) => m.classList.remove("aberto"));
    }

    mestre.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      fecharMenus();
      menu.classList.toggle("aberto");
    });

    menu.querySelector(".ee-conjunto-imagem").addEventListener("click", (e) => {
      e.stopPropagation();
      window.eeFecharEdicoesAtivas?.(card);
      card.classList.remove("ee-conjunto-texto");
      card.classList.add("ee-conjunto-imagem");
      menu.classList.remove("aberto");
    });

    menu.querySelector(".ee-conjunto-texto").addEventListener("click", (e) => {
      e.stopPropagation();
      card.classList.remove("ee-conjunto-imagem");
      card.classList.add("ee-conjunto-texto");
      menu.classList.remove("aberto");
    });

    menu
      .querySelector(".ee-conjunto-cancelar")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        window.eeFecharEdicoesAtivas?.(card);
        card.classList.remove("ee-conjunto-imagem", "ee-conjunto-texto");
        menu.classList.remove("aberto");
      });

    menu.querySelector(".ee-ods-excluir").addEventListener("click", (e) => {
      e.stopPropagation();
      card.classList.add("ee-ods-excluido");
      menu.classList.remove("aberto");
      if (typeof showNotification === "function")
        showNotification(
          'Cartão ocultado. Use "Voltar alteração" pra restaurar.',
          "info",
        );
    });

    menu
      .querySelector(".ee-conjunto-desfazer")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        let total = 0;
        if (card.classList.contains("ee-ods-excluido")) {
          card.classList.remove("ee-ods-excluido");
          total++;
        }
        card.querySelectorAll(".ee-recuperar-btn-g").forEach((btn) => {
          btn.click();
          total++;
        });
        card
          .querySelectorAll("img[data-ee-imagem-original]")
          .forEach((imgEl) => {
            const original = imgEl.dataset.eeImagemOriginal;
            if (
              original &&
              (imgEl.src !== original || imgEl.dataset.eeRemovida)
            ) {
              imgEl.src = original;
              imgEl.style.display = "";
              delete imgEl.dataset.eeRemovida;
              const chave = imgEl.dataset.eeChave;
              if (chave) localStorage.removeItem(chave);
              total++;
            }
          });
        menu.classList.remove("aberto");
        if (typeof showNotification === "function")
          showNotification(
            total
              ? "Alteração anterior recuperada."
              : "Não há mais alterações para recuperar.",
            total ? "info" : "error",
          );
      });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ods-card")) {
      document
        .querySelectorAll(".ee-conjunto-menu.aberto")
        .forEach((m) => m.classList.remove("aberto"));
    }
  });
})();

// ============================================================
// PATCH v17 — ODS: UM ÚNICO BOTÃO CHEFE PRA TODO O CONJUNTO
// ============================================================
(function () {
  const conjunto = document.querySelector(".ods-container");
  if (!conjunto || conjunto.dataset.eeMestreConjunto) return;
  conjunto.dataset.eeMestreConjunto = "1";
  conjunto.classList.add("ee-conjunto-editavel", "ee-ods-conjunto");

  // Prepara cada card individualmente (botões ficam ocultos até o modo ser escolhido)
  conjunto.querySelectorAll(".ods-card").forEach((card) => {
    const desc = card.querySelector(".ods-desc");
    const num = card.querySelector(".ods-num");
    if (desc) window.eeConfigurarTexto?.(desc, true);
    if (num) window.eeConfigurarTexto?.(num, true);

    const img = card.querySelector(".ods-card-front img");
    if (img) window.eeConfigurarImagem?.(img, true);
  });

  const mestre = document.createElement("button");
  mestre.type = "button";
  mestre.className = "ee-conjunto-btn";
  mestre.textContent = "+";
  mestre.setAttribute("aria-label", "Editar cards ODS");
  mestre.title = "Editar cards ODS";
  conjunto.appendChild(mestre);

  const menu = document.createElement("div");
  menu.className = "ee-conjunto-menu";
  menu.innerHTML = `
    <button type="button" class="ee-conjunto-imagem">Editar imagem</button>
    <button type="button" class="ee-conjunto-texto">Editar texto</button>
    <button type="button" class="ee-conjunto-desfazer">↺ Voltar alteração</button>
    <button type="button" class="ee-conjunto-cancelar">− Não vou editar</button>
  `;
  conjunto.appendChild(menu);

  function fecharMenus() {
    document
      .querySelectorAll(".ee-conjunto-menu.aberto")
      .forEach((m) => m.classList.remove("aberto"));
  }

  mestre.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    fecharMenus();
    menu.classList.toggle("aberto");
  });

  menu.querySelector(".ee-conjunto-imagem").addEventListener("click", (e) => {
    e.stopPropagation();
    window.eeFecharEdicoesAtivas?.(conjunto);
    conjunto.classList.remove("ee-conjunto-texto");
    conjunto.classList.add("ee-conjunto-imagem");
    menu.classList.remove("aberto");
  });

  menu.querySelector(".ee-conjunto-texto").addEventListener("click", (e) => {
    e.stopPropagation();
    conjunto.classList.remove("ee-conjunto-imagem");
    conjunto.classList.add("ee-conjunto-texto");
    menu.classList.remove("aberto");
  });

  menu.querySelector(".ee-conjunto-cancelar").addEventListener("click", (e) => {
    e.stopPropagation();
    window.eeFecharEdicoesAtivas?.(conjunto);
    conjunto.classList.remove("ee-conjunto-imagem", "ee-conjunto-texto");
    menu.classList.remove("aberto");
  });

  menu.querySelector(".ee-conjunto-desfazer").addEventListener("click", (e) => {
    e.stopPropagation();
    let total = 0;
    conjunto.querySelectorAll(".ee-recuperar-btn-g").forEach((btn) => {
      btn.click();
      total++;
    });
    conjunto
      .querySelectorAll("img[data-ee-imagem-original]")
      .forEach((imgEl) => {
        const original = imgEl.dataset.eeImagemOriginal;
        if (original && (imgEl.src !== original || imgEl.dataset.eeRemovida)) {
          imgEl.src = original;
          imgEl.style.display = "";
          delete imgEl.dataset.eeRemovida;
          const chave = imgEl.dataset.eeChave;
          if (chave) localStorage.removeItem(chave);
          total++;
        }
      });
    menu.classList.remove("aberto");
    if (typeof showNotification === "function")
      showNotification(
        total
          ? "Alteração anterior recuperada."
          : "Não há mais alterações para recuperar.",
        total ? "info" : "error",
      );
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ods-container")) fecharMenus();
  });
})();

// ============================================================
// PATCH FINAL — ODS SEM BOTÕES DUPLICADOS E CONTROLES ORGANIZADOS
// ============================================================
(function () {
  const conjunto = document.querySelector(".ods-container");
  if (!conjunto) return;

  // Mantém apenas o mestre criado no próprio conjunto.
  conjunto
    .querySelectorAll(
      ".ods-card > .ee-conjunto-btn, .ods-card > .ee-conjunto-menu, .ods-master-btn, .ods-master-menu, .ods-text-edit-btn",
    )
    .forEach((el) => el.remove());
  conjunto.classList.add("ee-ods-conjunto");

  // Evita a edição de imagem “avulsa” da imagem do conjunto aparecer fora dele.
  conjunto
    .querySelectorAll(":scope > .ee-img-btn, :scope > .ee-img-menu")
    .forEach((el) => el.remove());

  // O botão mestre deve permanecer visível apenas no modo de edição.
  const mestre = conjunto.querySelector(":scope > .ee-conjunto-btn");
  if (mestre) {
    mestre.classList.add("ee-ods-mestre-unico");
    mestre.title = "Editar cards ODS";
  }

  // Garante que o botão de imagem seja clicável e fique no canto da foto.
  conjunto.querySelectorAll(".ods-card .ee-img-btn-g").forEach((btn) => {
    btn.classList.add("ee-ods-img-control");
  });

  // Reserva uma faixa lateral para os controles de texto, sem cobrir palavras.
  conjunto
    .querySelectorAll(".ods-card .ods-desc, .ods-card .ods-num")
    .forEach((el) => {
      el.classList.add("ee-ods-text-area");
      el.querySelectorAll(".ee-text-btn-g").forEach((btn) =>
        btn.classList.add("ee-ods-text-control"),
      );
      el.querySelectorAll(".ee-recuperar-btn-g").forEach((btn) =>
        btn.classList.add("ee-ods-restore-control"),
      );
    });
})();

// ============================================================
// PATCH v18 — CORRIGE O BOTÃO/MENU DE IMAGEM DOS CARDS ODS
// (move pra fora do .ods-card-front, que corta o conteúdo)
// ============================================================
(function () {
  document.querySelectorAll(".ods-card").forEach((card) => {
    const front = card.querySelector(".ods-card-front");
    if (!front) return;

    const btn = front.querySelector(":scope > .ee-img-btn-g");
    const menu = front.querySelector(":scope > .ee-img-menu");
    const input = front.querySelector(':scope > input[type="file"]');

    if (btn && !btn.dataset.eeMovido) {
      btn.dataset.eeMovido = "1";
      if (getComputedStyle(card).position === "static") {
        card.style.position = "relative";
      }
      card.appendChild(btn);
      if (menu) card.appendChild(menu);
      if (input) card.appendChild(input);
    }
  });
})();

(function () {
  function alinharModosComBotaoNativo() {
    const btnEditarNativo = document.getElementById("btn-editar-site");
    if (!btnEditarNativo) return;

    const secaoTrabalho =
      document.getElementById("nosso-trabalho") ||
      document.querySelector(".section");
    if (!secaoTrabalho) return;

    let wrapperPainel = document.getElementById("ee-painel-wrapper-geral");
    if (!wrapperPainel) {
      wrapperPainel = document.createElement("div");
      wrapperPainel.className = "ee-secao-panel-container";
      wrapperPainel.id = "ee-painel-wrapper-geral";

      // Botão minimalista principal da seção
      const btnGatilhoLocal = document.createElement("button");
      btnGatilhoLocal.type = "button";
      btnGatilhoLocal.className = "ee-secao-panel-trigger";
      btnGatilhoLocal.textContent = "⚙️ Personalizar Cards";

      // Caixa dropdown discreta que abre para baixo
      const dropdownBox = document.createElement("div");
      dropdownBox.id = "ee-painel-local-dropdown";
      dropdownBox.className = "ee-secao-dropdown-box";
      dropdownBox.innerHTML = `
        <div class="ee-panel-title">Opções de Alteração</div>
        <button type="button" class="ee-local-opt" data-target="texto">✍️ Editar Textos</button>
        <button type="button" class="ee-local-opt" data-target="fotos">📸 Editar Fotos</button>
        <button type="button" class="ee-local-opt" data-target="ods">🌍 Editar ODS</button>
        <button type="button" class="ee-local-opt ee-opt-cancel" data-target="limpar">✕ Concluir</button>
      `;

      wrapperPainel.appendChild(btnGatilhoLocal);
      wrapperPainel.appendChild(dropdownBox);
      secaoTrabalho.insertBefore(wrapperPainel, secaoTrabalho.firstChild);

      // Evento para abrir/fechar o menu minimalista local
      btnGatilhoLocal.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdownBox.classList.toggle("ee-aberto");
        btnGatilhoLocal.classList.toggle("ee-trigger-ativo");
      });

      // Lógica das opções internas
      dropdownBox.querySelectorAll(".ee-local-opt").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const modo = e.target.closest(".ee-local-opt").dataset.target;

          document.body.classList.remove(
            "global-modo-texto",
            "global-modo-fotos",
            "global-modo-ods",
          );
          document
            .querySelectorAll(".iniciativa-card [contenteditable='true']")
            .forEach((el) => {
              el.setAttribute("contenteditable", "false");
            });

          // Atualiza o texto do botão principal para mostrar o modo ativo
          if (modo === "texto")
            btnGatilhoLocal.textContent = "✍️ Editar textos";
          else if (modo === "fotos")
            btnGatilhoLocal.textContent = "📸 Modo Fotos Ativo";
          else if (modo === "ods")
            btnGatilhoLocal.textContent = "🌍 Modo ODS Ativo";
          else btnGatilhoLocal.textContent = "⚙️ Personalizar Cards";

          dropdownBox.classList.remove("ee-aberto");
          btnGatilhoLocal.classList.remove("ee-trigger-ativo");

          if (modo === "limpar") {
            btnEditarNativo.click(); // Desliga o editor global ao concluir
            return;
          }

          if (modo === "texto")
            document.body.classList.add("global-modo-texto");
          else if (modo === "fotos") {
            document.body.classList.add("global-modo-fotos");
            document.querySelectorAll(".iniciativa-card").forEach((card) => {
              const carrosselMenuBtn = card.querySelector(
                ".ee-carrossel-menu button",
              );
              if (
                carrosselMenuBtn &&
                carrosselMenuBtn.textContent.trim() === "Excluir foto"
              )
                carrosselMenuBtn.click();
            });
          } else if (modo === "ods")
            document.body.classList.add("global-modo-ods");
        });
      });
    }

    // Sincroniza exibição do botão minimalista com o botão de lápis original
    if (document.body.classList.contains("edit-mode-ativo")) {
      wrapperPainel.classList.add("ee-painel-visivel");
    } else {
      wrapperPainel.classList.remove("ee-painel-visivel");
      document.body.classList.remove(
        "global-modo-texto",
        "global-modo-fotos",
        "global-modo-ods",
      );
      const trigger = wrapperPainel.querySelector(".ee-secao-panel-trigger");
      if (trigger) trigger.textContent = "⚙️ Personalizar Cards";
      const dropdown = document.getElementById("ee-painel-local-dropdown");
      if (dropdown) dropdown.classList.remove("ee-aberto");
    }

    // Mantém o motor inline integrado aos elementos
    document.querySelectorAll(".iniciativa-card").forEach((card) => {
      card.querySelectorAll("h3, p").forEach((el) => {
        if (
          typeof window.eeConfigurarTexto === "function" &&
          !el.dataset.eeInit
        )
          window.eeConfigurarTexto(el, true);
      });
      card
        .querySelectorAll(".card-carousel-slide img, .ods-badges img")
        .forEach((img) => {
          if (
            typeof window.eeConfigurarImagem === "function" &&
            !img.dataset.eeInit
          )
            window.eeConfigurarImagem(img, true);
        });
    });
  }

  // Fecha o dropdown se clicar fora do painel
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ee-secao-panel-container")) {
      const dropdown = document.getElementById("ee-painel-local-dropdown");
      const trigger = document.querySelector(".ee-secao-panel-trigger");
      if (dropdown) dropdown.classList.remove("ee-aberto");
      if (trigger) trigger.classList.remove("ee-trigger-ativo");
    }
  });

  alinharModosComBotaoNativo();
  document.addEventListener("DOMContentLoaded", alinharModosComBotaoNativo);
  setInterval(alinharModosComBotaoNativo, 500);
})();

// ============================================================
// MOTOR DE CONTROLE CONTÍNUO - EXCLUSÃO MÚLTIPLA E CANCELAMENTO (ODS/IMAGENS)
// Cole este bloco exatamente na ÚLTIMA LINHA do seu script.js
// ============================================================
(function () {
  function blindarESeccionarOdsPorCard() {
    // 1. Localiza todos os cards de iniciativas da página
    document.querySelectorAll(".iniciativa-card").forEach((card, cardIndex) => {
      // Mapeia todas as imagens de ODS presentes especificamente DENTRO deste card
      const imagensOds = card.querySelectorAll(".ods-badges img");

      imagensOds.forEach((img, imgIndex) => {
        // Cria uma identificação única e imutável para esta ODS baseada no card dela
        const idUnicoOds = `card-${cardIndex}-ods-${imgIndex}`;
        img.dataset.eeIdControle = idUnicoOds;

        // Verifica se esta ODS foi gravada como removida no LocalStorage
        const estadoSalvo = localStorage.getItem(idUnicoOds);
        if (estadoSalvo === "removida") {
          img.style.setProperty("display", "none", "important");
          img.dataset.eeRemovida = "true";
        }

        // Guarda o caminho original da imagem se ainda não guardou
        if (!img.dataset.eeImagemOriginal) {
          img.dataset.eeImagemOriginal = img.src;
        }

        // 2. Localiza o menu flutuante (.ee-img-menu) injetado ao lado desta ODS
        const ancora = img.parentElement;
        if (!ancora) return;
        const menuImg = ancora.querySelector(".ee-img-menu");

        if (menuImg && !menuImg.dataset.eePainelReconfigurado) {
          menuImg.dataset.eePainelReconfigurado = "1";

          // Remove os botões antigos defeituosos limpando a poluição visual e lógica
          menuImg.innerHTML = "";

          // Cria os novos botões com as ações isoladas estritamente para esta ODS deste card
          const btnExcluir = document.createElement("button");
          btnExcluir.type = "button";
          btnExcluir.className = "ee-adicionar"; // reaproveita classe visual
          btnExcluir.style.color = "#e74c3c";
          btnExcluir.textContent = "🗑 Excluir ODS";

          const btnRestaurarCard = document.createElement("button");
          btnRestaurarCard.type = "button";
          btnRestaurarCard.className = "ee-restaurar";
          btnRestaurarCard.style.color = "#e67e22";
          btnRestaurarCard.textContent = "↺ Restaurar Todas";

          const btnCancelar = document.createElement("button");
          btnCancelar.type = "button";
          btnCancelar.className = "ee-cancelar-imagem";
          btnCancelar.textContent = "− Não vou editar";

          menuImg.appendChild(btnExcluir);
          menuImg.appendChild(btnRestaurarCard);
          menuImg.appendChild(btnCancelar);

          // --- EVENTO 1: EXCLUIR APENAS ESTA ODS DESTE CARD ---
          btnExcluir.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            img.style.setProperty("display", "none", "important");
            img.dataset.eeRemovida = "true";

            // Grava na memória usando o ID único isolado por card
            localStorage.setItem(idUnicoOds, "removida");

            if (typeof showNotification === "function") {
              showNotification(
                "Selo ODS ocultado deste card de forma isolada!",
                "warning",
              );
            }
          });

          // --- EVENTO 2: RESTAURAR TODAS AS ODS DO CARD DE UMA VEZ ---
          btnRestaurarCard.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            let restaurados = 0;
            // Varre apenas as ODS deste card específico e limpa o ID único delas da memória
            card.querySelectorAll(".ods-badges img").forEach((imgCard) => {
              const idImg = imgCard.dataset.eeIdControle;
              if (idImg) {
                localStorage.removeItem(idImg); // Deleta da memória permanentemente
              }

              imgCard.src = imgCard.dataset.eeImagemOriginal || imgCard.src;
              imgCard.style.removeProperty("display");
              imgCard.style.display = "";
              delete imgCard.dataset.eeRemovida;
              restaurados++;
            });

            menuImg.classList.remove("ee-aberto");

            if (typeof showNotification === "function") {
              showNotification(
                `Sucesso! ${restaurados} imagens originais restauradas neste card!`,
                "success",
              );
            }
          });

          // --- EVENTO 3: CANCELAR E FECHAR O MENU ---
          btnCancelar.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            menuImg.classList.remove("ee-aberto");
          });
        }
      });
    });
  }

  // Executa e passa a monitorar continuamente o DOM a cada 400ms para neutralizar scripts antigos
  blindarESeccionarOdsPorCard();
  document.addEventListener("DOMContentLoaded", blindarESeccionarOdsPorCard);
  setInterval(blindarESeccionarOdsPorCard, 400);
})();



// ============================================================
// PATCH 0909 — UM ÚNICO CONTROLE DE TEXTO POR CARROSSEL
// ============================================================
(function () {
  document.querySelectorAll('.card-carousel').forEach(carousel => {
    const menu = carousel.querySelector('.ee-carrossel-menu');
    const card = carousel.closest('.iniciativa-card');
    if (!menu || !card || menu.querySelector('.ee-carrossel-texto')) return;

    const btnTexto = document.createElement('button');
    btnTexto.type = 'button';
    btnTexto.className = 'ee-carrossel-texto';
    btnTexto.textContent = 'Editar textos';
    menu.appendChild(btnTexto);

    const btnCancelar = document.createElement('button');
    btnCancelar.type = 'button';
    btnCancelar.className = 'ee-carrossel-texto-cancelar';
    btnCancelar.textContent = '− Não vou editar textos';
    menu.appendChild(btnCancelar);

    function fecharTexto() {
      card.classList.remove('ee-carrossel-texto-ativo');
      document.body.classList.remove('global-modo-texto');
      menu.classList.remove('ee-aberto');
    }

    btnTexto.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      document.querySelectorAll('.iniciativa-card.ee-carrossel-texto-ativo').forEach(c => c.classList.remove('ee-carrossel-texto-ativo'));
      card.classList.add('ee-carrossel-texto-ativo');
      menu.classList.remove('ee-aberto');
    });
    btnCancelar.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      card.querySelectorAll('[contenteditable="true"]').forEach(el => el.setAttribute('contenteditable', 'false'));
      fecharTexto();
    });

    card.addEventListener('click', e => {
      if (!e.target.closest('.ee-text-btn, .ee-recuperar-btn, .ee-cancel-text-btn')) return;
      card.classList.add('ee-carrossel-texto-ativo');
    });
  });
})();


// ============================================================
// PATCH 0910 — BOTÃO ÚNICO VISÍVEL PARA EDITAR TEXTOS DO CARD
// ============================================================
(function () {
  document.querySelectorAll('.card-carousel').forEach(carousel => {
    const card = carousel.closest('.iniciativa-card');
    if (!card || card.querySelector(':scope > .ee-card-texto-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ee-card-texto-btn';
    btn.textContent = '✍ Editar textos';
    btn.setAttribute('aria-label', 'Editar textos deste carrossel');
    btn.title = 'Editar textos deste carrossel';
    card.appendChild(btn);

    function ativar() {
      document.querySelectorAll('.iniciativa-card.ee-carrossel-texto-ativo').forEach(outro => {
        if (outro !== card) outro.classList.remove('ee-carrossel-texto-ativo');
      });
      card.classList.add('ee-carrossel-texto-ativo');
      document.body.classList.add('global-modo-texto');
    }

    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      ativar();
    });

    // Também aceita o item textual existente no menu do botão CHEFE.
    const menu = carousel.querySelector('.ee-carrossel-menu');
    menu?.addEventListener('click', e => {
      const alvo = e.target.closest('button');
      if (alvo && /editar textos?/i.test(alvo.textContent || '')) ativar();
    });
  });

  // Se o painel local geral for usado, ativa o botão único de cada card.
  document.querySelectorAll('.ee-local-opt[data-target="texto"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.iniciativa-card').forEach(card => {
        if (card.querySelector('.card-carousel')) card.classList.add('ee-carrossel-texto-ativo');
      });
    });
  });
})();


// ============================================================
// PATCH 0911 — BOTÃO DE TEXTO FORA DO TÍTULO E RETORNO NO −
// ============================================================
(function () {
  document.querySelectorAll('.iniciativa-card').forEach(card => {
    const btn = card.querySelector(':scope > .ee-card-texto-btn');
    if (!btn || card.dataset.eeTextoFluxo0911) return;
    card.dataset.eeTextoFluxo0911 = '1';
    btn.addEventListener('click', () => {
      requestAnimationFrame(() => { btn.style.display = 'none'; });
    });

    card.addEventListener('click', e => {
      const cancelou = e.target.closest('.ee-cancel-text-btn, .ee-carrossel-texto-cancelar');
      if (!cancelou) return;
      e.preventDefault();
      e.stopPropagation();
      card.classList.remove('ee-carrossel-texto-ativo');
      btn.style.display = '';
    }, true);
  });
})();


// ============================================================
// PATCH 0912 — EDITAR TEXTOS SOMENTE DENTRO DO BOTÃO CHEFE
// ============================================================
(function () {
  document.querySelectorAll('.iniciativa-card').forEach(card => {
    const flutuante = card.querySelector(':scope > .ee-card-texto-btn');
    if (flutuante) {
      flutuante.hidden = true;
      flutuante.style.display = 'none';
      flutuante.setAttribute('aria-hidden', 'true');
    }

    const carousel = card.querySelector('.card-carousel');
    const menu = carousel?.querySelector('.ee-carrossel-menu');
    if (!menu) return;

    let editar = menu.querySelector('.ee-carrossel-texto');
    if (!editar) {
      editar = document.createElement('button');
      editar.type = 'button';
      editar.className = 'ee-carrossel-texto';
      editar.textContent = '✍ Editar textos';
      menu.appendChild(editar);
    }
    if (editar.dataset.eeMenu0912) return;
    editar.dataset.eeMenu0912 = '1';

    editar.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.iniciativa-card.ee-carrossel-texto-ativo')
        .forEach(outro => outro.classList.remove('ee-carrossel-texto-ativo'));
      card.classList.add('ee-carrossel-texto-ativo');
      menu.classList.remove('ee-aberto');
    });
  });
})();


// ============================================================
// PATCH 0913 — CONTROLES AUTOMÁTICOS E MENU DE IMAGENS FUNCIONAL
// ============================================================
(function () {
  function mostrarTextos(card) {
    card.classList.add('ee-carrossel-texto-ativo');
  }

  document.querySelectorAll('.iniciativa-card').forEach(card => {
    const menu = card.querySelector('.ee-carrossel-menu');
    const editarTexto = menu?.querySelector('.ee-carrossel-texto');
    if (editarTexto && !editarTexto.dataset.eeAuto0913) {
      editarTexto.dataset.eeAuto0913 = '1';
      editarTexto.addEventListener('click', () => {
        requestAnimationFrame(() => mostrarTextos(card));
      });
    }

    card.querySelectorAll('.ee-img-btn, .ee-img-btn-g').forEach(btn => {
      if (btn.dataset.eeOpen0913) return;
      btn.dataset.eeOpen0913 = '1';
      btn.addEventListener('click', () => {
        requestAnimationFrame(() => {
          const ancora = btn.parentElement;
          ancora?.querySelector('.ee-img-menu')?.classList.add('ee-aberto');
        });
      });
    });
  });
})();


// ============================================================
// PATCH 0914 — MODOS EXPLÍCITOS DE TEXTO E IMAGEM NO CARROSSEL
// ============================================================
(function () {
  document.querySelectorAll('.card-carousel').forEach(carousel => {
    const card = carousel.closest('.iniciativa-card');
    const menu = carousel.querySelector('.ee-carrossel-menu');
    if (!card || !menu) return;

    let editarImagens = menu.querySelector('.ee-carrossel-imagens');
    if (!editarImagens) {
      editarImagens = document.createElement('button');
      editarImagens.type = 'button';
      editarImagens.className = 'ee-carrossel-imagens';
      editarImagens.textContent = '📷 Editar imagens';
      menu.appendChild(editarImagens);
    }
    if (editarImagens.dataset.eeInit0914) return;
    editarImagens.dataset.eeInit0914 = '1';

    editarImagens.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      card.classList.remove('ee-carrossel-texto-ativo');
      card.classList.add('ee-carrossel-imagem-ativo');
      document.body.classList.remove('global-modo-texto');

      carousel.querySelectorAll('.card-carousel-slide img').forEach(img => {
        if (!img.dataset.eeInit && typeof window.eeConfigurarImagem === 'function') {
          window.eeConfigurarImagem(img, true);
        }
      });
      menu.classList.remove('ee-aberto');
    });
  });

  // Ao ativar o editor do site, nenhum modo de conteúdo é escolhido automaticamente.
  const editor = document.getElementById('btn-editar-site');
  editor?.addEventListener('click', () => {
    document.querySelectorAll('.iniciativa-card').forEach(card => {
      card.classList.remove('ee-carrossel-texto-ativo', 'ee-carrossel-imagem-ativo');
    });
    document.body.classList.remove('global-modo-texto', 'global-modo-fotos', 'global-modo-ods');
  });
})();


// ============================================================
// PATCH 0915 — REPARO ROBUSTO DOS BOTÕES DE IMAGEM DO CARROSSEL
// ============================================================
(function () {
  function repararImagem(img) {
    if (!img) return;
    const slide = img.closest('.card-carousel-slide');
    if (!slide || img.closest('.ee-add-tile')) return;

    let btn = slide.querySelector(':scope > .ee-img-btn, :scope > .ee-img-btn-g');
    if (!btn && typeof window.eeConfigurarImagem === 'function') {
      // Algumas imagens já têm eeInit, mas perderam o botão durante a clonagem do carrossel.
      delete img.dataset.eeInit;
      window.eeConfigurarImagem(img, true);
      btn = slide.querySelector(':scope > .ee-img-btn, :scope > .ee-img-btn-g');
    }
    if (!btn) return;

    btn.classList.add('ee-carousel-image-control');
    btn.style.setProperty('display', 'flex', 'important');
    btn.style.setProperty('z-index', '300', 'important');

    const menu = slide.querySelector(':scope > .ee-img-menu');
    if (menu) {
      menu.classList.add('ee-carousel-image-menu');
      btn.addEventListener('click', () => {
        requestAnimationFrame(() => menu.classList.add('ee-aberto'));
      }, { once: false });
    }
  }

  function repararCard(card) {
    if (!card.classList.contains('ee-carrossel-imagem-ativo')) return;
    card.querySelectorAll('.card-carousel-slide img').forEach(repararImagem);
  }

  document.querySelectorAll('.iniciativa-card').forEach(card => {
    repararCard(card);
    card.querySelector('.ee-carrossel-imagens')?.addEventListener('click', () => {
      requestAnimationFrame(() => {
        card.classList.add('ee-carrossel-imagem-ativo');
        repararCard(card);
      });
    });
  });
})();


// ============================================================
// PATCH 0916 — BOTÃO ORIGINAL DE IMAGEM REINJETADO NO CARROSSEL
// ============================================================
(function () {
  function criarControlesOriginais(card) {
    if (!card.classList.contains('ee-carrossel-imagem-ativo')) return;

    card.querySelectorAll('.card-carousel-slide').forEach((slide, index) => {
      if (slide.classList.contains('ee-add-tile') || slide.dataset.eeOriginalImageButton) return;
      const img = slide.querySelector('img');
      if (!img) return;
      slide.dataset.eeOriginalImageButton = '1';
      slide.style.overflow = 'visible';
      if (!img.dataset.eeOriginalCarrossel) img.dataset.eeOriginalCarrossel = img.currentSrc || img.src;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ee-img-btn ee-img-btn-original';
      btn.textContent = '+';
      btn.setAttribute('aria-label', 'Editar imagem');
      btn.title = 'Editar imagem';

      const menu = document.createElement('div');
      menu.className = 'ee-img-menu ee-img-menu-original';
      menu.innerHTML = `
        <button type="button" class="ee-original-add">Adicionar imagem</button>
        <button type="button" class="ee-original-restore">↺ Restaurar imagem</button>
        <button type="button" class="ee-original-remove">Excluir imagem</button>
        <button type="button" class="ee-original-cancel">− Não vou editar</button>`;

      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*'; input.hidden = true;

      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        card.querySelectorAll('.ee-img-menu-original.ee-aberto').forEach(m => m.classList.remove('ee-aberto'));
        menu.classList.toggle('ee-aberto');
      });
      menu.querySelector('.ee-original-add').addEventListener('click', e => { e.stopPropagation(); input.click(); });
      menu.querySelector('.ee-original-restore').addEventListener('click', e => {
        e.stopPropagation(); img.src = img.dataset.eeOriginalCarrossel || img.src; img.style.display = ''; menu.classList.remove('ee-aberto');
      });
      menu.querySelector('.ee-original-remove').addEventListener('click', e => {
        e.stopPropagation(); img.style.display = 'none'; menu.classList.remove('ee-aberto');
      });
      menu.querySelector('.ee-original-cancel').addEventListener('click', e => { e.stopPropagation(); menu.classList.remove('ee-aberto'); });
      input.addEventListener('change', () => {
        const file = input.files && input.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { img.src = ev.target.result; img.style.display = ''; menu.classList.remove('ee-aberto'); };
        reader.readAsDataURL(file); input.value = '';
      });

      slide.append(btn, menu, input);
    });
  }

  document.querySelectorAll('.iniciativa-card').forEach(card => {
    card.querySelector('.ee-carrossel-imagens')?.addEventListener('click', () => {
      requestAnimationFrame(() => criarControlesOriginais(card));
    });
    card.querySelector('.ee-carrossel-menu')?.addEventListener('click', e => {
      if (e.target.closest('.ee-carrossel-imagens')) requestAnimationFrame(() => criarControlesOriginais(card));
    });
  });
})();


// ============================================================
// PATCH 0917 — CARROSSEL ALIMENTOS COM AFETO
// ============================================================
(function () {
  const card = Array.from(document.querySelectorAll('.iniciativa-card')).find(c =>
    c.querySelector('img[src*="alimentos com afeto"]')
  );
  if (!card) return;
  const carousel = card.querySelector('.card-carousel');
  const menu = carousel?.querySelector('.ee-carrossel-menu');
  if (!carousel || !menu || menu.dataset.eeAlimentos0917) return;
  menu.dataset.eeAlimentos0917 = '1';

  let opcao = menu.querySelector('.ee-carrossel-imagens');
  if (!opcao) {
    opcao = document.createElement('button');
    opcao.type = 'button';
    opcao.className = 'ee-carrossel-imagens';
    opcao.textContent = '📷 Editar imagens';
    menu.appendChild(opcao);
  }

  function ativarBotoes() {
    card.classList.add('ee-carrossel-imagem-ativo');
    carousel.querySelectorAll('.card-carousel-slide').forEach(slide => {
      if (slide.classList.contains('ee-add-tile') || slide.dataset.eeAlimentosBtn) return;
      const img = slide.querySelector('img');
      if (!img) return;
      slide.dataset.eeAlimentosBtn = '1';
      slide.style.overflow = 'visible';

      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'ee-img-btn ee-img-btn-original ee-alimentos-img-btn';
      botao.textContent = '+';
      botao.setAttribute('aria-label', 'Editar imagem');

      const painel = document.createElement('div');
      painel.className = 'ee-img-menu ee-img-menu-original ee-alimentos-img-menu';
      painel.innerHTML = '<button type="button" class="ee-alimentos-add">Adicionar imagem</button><button type="button" class="ee-alimentos-remove">Excluir imagem</button><button type="button" class="ee-alimentos-cancel">− Não vou editar</button>';
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*'; input.hidden = true;

      botao.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        card.querySelectorAll('.ee-alimentos-img-menu.ee-aberto').forEach(p => p.classList.remove('ee-aberto'));
        painel.classList.toggle('ee-aberto');
      });
      painel.querySelector('.ee-alimentos-add').addEventListener('click', e => { e.stopPropagation(); input.click(); });
      painel.querySelector('.ee-alimentos-remove').addEventListener('click', e => { e.stopPropagation(); img.style.display = 'none'; painel.classList.remove('ee-aberto'); });
      painel.querySelector('.ee-alimentos-cancel').addEventListener('click', e => { e.stopPropagation(); painel.classList.remove('ee-aberto'); });
      input.addEventListener('change', () => {
        const file = input.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = e => { img.src = e.target.result; img.style.display = ''; painel.classList.remove('ee-aberto'); };
        reader.readAsDataURL(file); input.value = '';
      });
      slide.append(botao, painel, input);
    });
  }

  opcao.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    menu.classList.remove('ee-aberto');
    requestAnimationFrame(ativarBotoes);
  });
})();


// ============================================================
// PATCH 0918 — ALTERAR FOTOS: CARROSSÉIS + ODS
// ============================================================
(function () {
  function ativarFotosUnificadas() {
    document.body.classList.add('global-modo-fotos', 'global-modo-ods');
    document.querySelectorAll('.iniciativa-card').forEach(card => {
      card.classList.add('ee-carrossel-imagem-ativo');
      card.querySelectorAll('.card-carousel-slide').forEach(slide => {
        const img = slide.querySelector('img');
        if (!img || slide.classList.contains('ee-add-tile') || slide.dataset.eeUnifiedPhoto) return;
        slide.dataset.eeUnifiedPhoto = '1';
        slide.style.overflow = 'visible';
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'ee-img-btn ee-unified-photo-btn'; btn.textContent = '+';
        const menu = document.createElement('div'); menu.className = 'ee-img-menu ee-unified-photo-menu';
        menu.innerHTML = '<button type="button" data-photo-add>Adicionar imagem</button><button type="button" data-photo-remove>Excluir imagem</button><button type="button" data-photo-cancel>− Não vou editar</button>';
        const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.hidden = true;
        btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); menu.classList.toggle('ee-aberto'); });
        menu.querySelector('[data-photo-add]').addEventListener('click', e => { e.stopPropagation(); input.click(); });
        menu.querySelector('[data-photo-remove]').addEventListener('click', e => { e.stopPropagation(); img.style.display = 'none'; menu.classList.remove('ee-aberto'); });
        menu.querySelector('[data-photo-cancel]').addEventListener('click', e => { e.stopPropagation(); menu.classList.remove('ee-aberto'); });
        input.addEventListener('change', () => { const f=input.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=e=>{img.src=e.target.result;img.style.display='';menu.classList.remove('ee-aberto');}; r.readAsDataURL(f); input.value=''; });
        slide.append(btn, menu, input);
      });
      card.querySelectorAll('.ods-badges .ee-img-btn, .ods-badges .ee-img-btn-g, .ods-badges .ee-img-menu').forEach(el => el.classList.add('ee-unified-ods-control'));
    });
  }

  document.querySelectorAll('.ee-local-opt[data-target="fotos"]').forEach(btn => {
    btn.addEventListener('click', () => requestAnimationFrame(ativarFotosUnificadas));
  });
})();


// ============================================================
// ============================================================
// PATCH 0920 — ESCOLHA VISUAL: CARROSSEL OU ODS
// ============================================================
(function () {
  function fecharModal() {
    document.querySelectorAll('.ee-photo-choice-modal').forEach(m => m.remove());
  }
  function executarAcao(acao, alvo, menu) {
    if (acao === 'excluir') {
      alvo.style.display = 'none';
      menu?.classList.remove('ee-aberto');
      return;
    }
    const input = menu?.parentElement?.querySelector('input[type="file"]');
    if (!input) return;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => { alvo.src = e.target.result; alvo.style.display = ''; menu?.classList.remove('ee-aberto'); input.value = ''; };
      reader.readAsDataURL(file);
    };
    input.click();
  }
  function mostrarEscolhaOds(card, acao, menu) {
    const ods = Array.from(card.querySelectorAll('.ods-badges img'));
    if (ods.length === 1) return executarAcao(acao, ods[0], menu);
    const modal = document.createElement('div');
    modal.className = 'ee-photo-choice-modal';
    modal.innerHTML = '<div class="ee-photo-choice-box"><strong>Qual ODS você deseja alterar?</strong><div class="ee-photo-choice-options"></div><button type="button" class="ee-photo-choice-cancel">Cancelar</button></div>';
    const options = modal.querySelector('.ee-photo-choice-options');
    ods.forEach((odsImg, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ee-ods-choice-button';
      const thumb = document.createElement('img');
      thumb.src = odsImg.currentSrc || odsImg.src;
      thumb.alt = odsImg.alt || `ODS ${i + 1}`;
      const label = document.createElement('span');
      label.textContent = `${i + 1}ª ODS`;
      b.append(thumb, label);
      b.title = odsImg.title || odsImg.alt || `ODS ${i + 1}`;
      b.addEventListener('click', () => { fecharModal(); executarAcao(acao, odsImg, menu); });
      options.appendChild(b);
    });
    modal.querySelector('.ee-photo-choice-cancel').addEventListener('click', fecharModal);
    document.body.appendChild(modal);
  }
  function mostrarDestino(acao, img, menu) {
    const card = menu.closest('.iniciativa-card');
    const modal = document.createElement('div');
    modal.className = 'ee-photo-choice-modal';
    modal.innerHTML = `<div class="ee-photo-choice-box"><strong>Você deseja ${acao} a imagem onde?</strong><div class="ee-photo-choice-options"><button type="button" data-destino="carrossel">Carrossel</button><button type="button" data-destino="ods">ODS</button></div><button type="button" class="ee-photo-choice-cancel">Cancelar</button></div>`;
    modal.querySelector('[data-destino="carrossel"]').addEventListener('click', () => { fecharModal(); executarAcao(acao, img, menu); });
    modal.querySelector('[data-destino="ods"]').addEventListener('click', () => { fecharModal(); mostrarEscolhaOds(card, acao, menu); });
    modal.querySelector('.ee-photo-choice-cancel').addEventListener('click', fecharModal);
    document.body.appendChild(modal);
  }
  document.addEventListener('click', e => {
    const add = e.target.closest('.ee-unified-photo-menu [data-photo-add]');
    const remove = e.target.closest('.ee-unified-photo-menu [data-photo-remove]');
    if (!add && !remove) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const menu = e.target.closest('.ee-unified-photo-menu');
    const img = menu?.closest('.card-carousel-slide')?.querySelector('img');
    if (img && menu) mostrarDestino(add ? 'adicionar' : 'excluir', img, menu);
  }, true);
})();



// ============================================================
// PATCH 0922 — MENU CHEFE: SEM EDITAR ODS E CONCLUIR SEM DESLIGAR
// ============================================================
(function () {
  function ajustarMenu() {
    document.querySelectorAll('.ee-local-opt[data-target="ods"]').forEach(btn => btn.remove());
    document.querySelectorAll('.ee-local-opt.ee-opt-cancel').forEach(btn => {
      btn.textContent = '✓ Concluir tarefa';
      btn.title = 'Concluir a tarefa e ocultar os símbolos de edição';
    });
  }

  // Intercepta antes do listener antigo para não clicar no botão global de desligar.
  document.addEventListener('click', e => {
    const concluir = e.target.closest('.ee-local-opt.ee-opt-cancel');
    if (!concluir) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.__eeForceConclude?.();
    const painel = concluir.closest('.ee-secao-panel-container');
    painel?.querySelector('.ee-secao-dropdown-box')?.classList.remove('ee-aberto');
    painel?.querySelector('.ee-secao-panel-trigger')?.classList.remove('ee-trigger-ativo');
    ajustarMenu();
  }, true);

  ajustarMenu();
  document.addEventListener('DOMContentLoaded', ajustarMenu);
  setInterval(ajustarMenu, 500);
})();


// ============================================================
// PATCH 0923 — FECHAR MENU OCULTA OS CONTROLES ATIVOS
// ============================================================
(function () {
  function encerrarModoVisual() {
    document.querySelectorAll('.iniciativa-card').forEach(card => {
      card.classList.remove('ee-carrossel-texto-ativo', 'ee-carrossel-imagem-ativo');
      card.querySelectorAll('.ee-img-menu, .ee-carrossel-menu, .ee-unified-photo-menu').forEach(menu => menu.classList.remove('ee-aberto'));
    });
    document.body.classList.remove('global-modo-texto', 'global-modo-fotos', 'global-modo-ods');
    document.querySelectorAll('.ee-photo-choice-modal').forEach(modal => modal.remove());
  }

  document.addEventListener('click', e => {
    const fechar = e.target.closest('.ee-local-opt.ee-opt-cancel');
    if (!fechar) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    encerrarModoVisual();
    const painel = fechar.closest('.ee-secao-panel-container');
    painel?.querySelector('.ee-secao-dropdown-box')?.classList.remove('ee-aberto');
    painel?.querySelector('.ee-secao-panel-trigger')?.classList.remove('ee-trigger-ativo');
  }, true);
})();


// ============================================================
// PATCH 0924 — CONCLUIR TAREFA REMOVE TODOS OS SÍMBOLOS
// ============================================================
(function () {
  function concluirTarefa() {
    document.body.classList.add('ee-visual-controls-closed');
    document.querySelectorAll('.iniciativa-card').forEach(card => {
      card.classList.remove('ee-carrossel-texto-ativo', 'ee-carrossel-imagem-ativo');
      card.querySelectorAll('.ee-img-menu, .ee-carrossel-menu, .ee-unified-photo-menu, .ee-photo-choice-modal').forEach(el => el.classList.remove('ee-aberto'));
    });
    document.body.classList.remove('global-modo-texto', 'global-modo-fotos', 'global-modo-ods');
    document.querySelectorAll('.ee-photo-choice-modal').forEach(el => el.remove());
  }
  function reabrirControles() {
    document.body.classList.remove('ee-visual-controls-closed');
  }
  document.addEventListener('click', e => {
    const concluir = e.target.closest('.ee-local-opt.ee-opt-cancel');
    if (concluir) {
      e.preventDefault(); e.stopImmediatePropagation();
      concluirTarefa();
      const painel = concluir.closest('.ee-secao-panel-container');
      painel?.querySelector('.ee-secao-dropdown-box')?.classList.remove('ee-aberto');
      painel?.querySelector('.ee-secao-panel-trigger')?.classList.remove('ee-trigger-ativo');
      return;
    }
    if (e.target.closest('.ee-local-opt[data-target="texto"], .ee-local-opt[data-target="fotos"], .ee-carrossel-texto, .ee-carrossel-imagens')) reabrirControles();
  }, true);
  document.querySelectorAll('.ee-local-opt.ee-opt-cancel').forEach(btn => {
    btn.textContent = '✓ Concluir tarefa';
    btn.title = 'Concluir a tarefa e ocultar os símbolos de edição';
  });
})();


// ============================================================
// PATCH 0925 — CONCLUSÃO REAL E CANCELAMENTO INDIVIDUAL
// ============================================================
(function () {
  window.__eeForceConclude = function () {
    document.querySelectorAll('.iniciativa-card.ee-carrossel-texto-ativo, .iniciativa-card.ee-carrossel-imagem-ativo').forEach(card => {
      card.classList.remove('ee-carrossel-texto-ativo', 'ee-carrossel-imagem-ativo');
      card.classList.add('ee-card-controls-concluded');
      card.querySelectorAll('.ee-img-btn, .ee-img-btn-g, .ee-img-btn-original, .ee-unified-photo-btn, .ee-alimentos-img-btn, .ee-slide-remove, .ee-add-tile, .ee-carrossel-btn, .ee-conjunto-btn').forEach(control => {
        control.style.setProperty('display', 'none', 'important');
      });
      card.querySelectorAll('.ee-img-menu, .ee-carrossel-menu, .ee-unified-photo-menu').forEach(m => m.classList.remove('ee-aberto'));
    });
    document.querySelectorAll('.ee-photo-choice-modal').forEach(m => m.remove());
    if (!document.querySelector('.iniciativa-card.ee-carrossel-texto-ativo, .iniciativa-card.ee-carrossel-imagem-ativo')) {
      document.body.classList.remove('ee-visual-controls-closed');
    }
  };

  // Intercepta somente a propagação até o card. O handler do próprio botão − continua funcionando.
  document.addEventListener('click', e => {
    const cancel = e.target.closest('.ee-cancel-text-btn');
    if (!cancel) return;
    cancel.addEventListener('click', ev => ev.stopPropagation(), { once: true });
  }, true);

  document.addEventListener('click', e => {
    const abrir = e.target.closest('.ee-local-opt[data-target="texto"], .ee-local-opt[data-target="fotos"], .ee-carrossel-texto, .ee-carrossel-imagens');
    if (abrir) {
      document.body.classList.remove('ee-visual-controls-closed');
      const card = e.target.closest('.iniciativa-card');
      if (card) {
        card.classList.remove('ee-card-controls-concluded');
        card.querySelectorAll('.ee-img-btn, .ee-img-btn-g, .ee-img-btn-original, .ee-unified-photo-btn, .ee-alimentos-img-btn, .ee-slide-remove, .ee-add-tile, .ee-carrossel-btn, .ee-conjunto-btn').forEach(control => {
          control.style.removeProperty('display');
        });
      }
    }
  }, true);
})();


// ============================================================
// PATCH 0926 — CANCELAMENTO INDIVIDUAL DO TEXTO
// ============================================================
(function () {
  function normalizarCancelamento(cancelar) {
    const el = cancelar.parentElement;
    if (!el) return;
    cancelar.classList.add('ee-text-cancelado');
    cancelar.style.setProperty('display', 'none', 'important');
    el.setAttribute('contenteditable', 'false');
    const mais = el.querySelector(':scope > .ee-text-btn');
    const voltar = el.querySelector(':scope > .ee-recuperar-btn');
    mais?.classList.remove('ee-ativo', 'ee-confirmado');
    if (mais) mais.textContent = '+';
    if (voltar) voltar.style.removeProperty('display');
  }

  document.addEventListener('click', e => {
    const cancelar = e.target.closest('.ee-cancel-text-btn');
    if (!cancelar) return;
    requestAnimationFrame(() => normalizarCancelamento(cancelar));
  });

  // Se o texto entrar novamente em edição, libera somente o botão daquele texto.
  document.addEventListener('click', e => {
    const mais = e.target.closest('.ee-text-btn');
    if (!mais) return;
    const el = mais.parentElement;
    const cancelar = el?.querySelector(':scope > .ee-cancel-text-btn');
    if (cancelar) {
      cancelar.classList.remove('ee-text-cancelado');
      cancelar.style.removeProperty('display');
    }
  }, true);
})();


// ============================================================
// PATCH 0927 — CONTROLES ISOLADOS POR CARD E POR TEXTO
// ============================================================
(function () {
  function prepararCards() {
    document.querySelectorAll('.iniciativa-card').forEach(card => {
      card.style.setProperty('position', 'relative');
      card.style.setProperty('overflow', 'visible');
      if (!card.classList.contains('ee-carrossel-texto-ativo')) {
        card.style.removeProperty('z-index');
      }
    });
    document.querySelectorAll('.iniciativa-card.ee-carrossel-texto-ativo').forEach(card => {
      card.style.setProperty('z-index', '100', 'important');
    });
  }

  document.addEventListener('click', e => {
    const cancelar = e.target.closest('.ee-cancel-text-btn');
    if (!cancelar) return;
    const texto = cancelar.parentElement;
    const card = cancelar.closest('.iniciativa-card');
    e.stopPropagation();
    requestAnimationFrame(() => {
      cancelar.classList.add('ee-text-cancelado');
      cancelar.style.setProperty('display', 'none', 'important');
      texto?.setAttribute('contenteditable', 'false');
      const mais = texto?.querySelector(':scope > .ee-text-btn');
      const voltar = texto?.querySelector(':scope > .ee-recuperar-btn');
      if (mais) { mais.textContent = '+'; mais.classList.remove('ee-ativo', 'ee-confirmado'); mais.style.removeProperty('display'); }
      if (voltar) voltar.style.removeProperty('display');
      // Reexibe os controles dos demais textos somente deste card.
      if (card?.classList.contains('ee-carrossel-texto-ativo')) {
        card.querySelectorAll(':scope > p .ee-text-btn, :scope > p .ee-recuperar-btn, :scope > h3 .ee-text-btn, :scope > h3 .ee-recuperar-btn').forEach(control => {
          if (!control.classList.contains('ee-text-cancelado')) control.style.removeProperty('display');
        });
      }
      prepararCards();
    });
  }, true);

  document.addEventListener('click', prepararCards, true);
  prepararCards();
})();


// ============================================================
// PATCH 0929 — MESTRE DO CARROSSEL DE ENTREVISTAS
// ============================================================
(function () {
  const wrapper = document.querySelector('.entrevistas-wrapper');
  if (!wrapper || wrapper.dataset.eeEntrevistasMaster) return;
  wrapper.dataset.eeEntrevistasMaster = '1';
  const cards = [...wrapper.querySelectorAll('.card-entrevista')];
  cards.forEach(card => {
    const desc = card.querySelector('.card-descricao');
    if (desc && !desc.dataset.eeOriginal) desc.dataset.eeOriginal = desc.innerHTML;
    const img = card.querySelector('.card-thumb img');
    if (img && !img.dataset.eeOriginal) img.dataset.eeOriginal = img.src;
  });

  const area = document.createElement('div');
  area.className = 'ee-entrevistas-master-area';
  area.innerHTML = '<button type="button" class="ee-entrevistas-master">⚙ Personalizar entrevistas</button><div class="ee-entrevistas-menu"><button type="button" data-ee-ent-mode="texto">✍ Editar texto</button><button type="button" data-ee-ent-mode="imagem">📷 Editar imagem</button><button type="button" data-ee-ent-mode="restaurar">↺ Restaurar tudo</button><button type="button" data-ee-ent-mode="cancelar">− Não quero editar</button></div>';
  wrapper.insertBefore(area, wrapper.firstChild);
  const master = area.querySelector('.ee-entrevistas-master');
  const menu = area.querySelector('.ee-entrevistas-menu');

  function fechar() { menu.classList.remove('ee-aberto'); }
  function sairModos() {
    wrapper.classList.remove('ee-entrevistas-texto-ativo', 'ee-entrevistas-imagem-ativo');
    cards.forEach(card => {
      card.querySelectorAll('[contenteditable="true"]').forEach(el => el.setAttribute('contenteditable', 'false'));
      card.querySelectorAll('.ee-entrevista-img-menu').forEach(m => m.classList.remove('ee-aberto'));
    });
  }
  function ativarTexto() {
    sairModos(); wrapper.classList.add('ee-entrevistas-texto-ativo');
    cards.forEach(card => { const d=card.querySelector('.card-descricao'); if(d){ d.classList.add('expanded'); d.setAttribute('contenteditable','true'); } });
  }
  function ativarImagem() {
    sairModos(); wrapper.classList.add('ee-entrevistas-imagem-ativo');
    cards.forEach(card => {
      const holder=card.querySelector('.card-thumb'); const img=holder?.querySelector('img'); if(!holder||!img||holder.querySelector('.ee-entrevista-img-btn')) return;
      const btn=document.createElement('button'); btn.type='button'; btn.className='ee-entrevista-img-btn'; btn.textContent='+';
      const panel=document.createElement('div'); panel.className='ee-entrevista-img-menu'; panel.innerHTML='<button type="button" data-ent-add>Adicionar imagem</button><button type="button" data-ent-remove>Excluir imagem</button><button type="button" data-ent-cancel>− Não vou editar</button>';
      const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.hidden=true;
      btn.onclick=e=>{e.preventDefault();e.stopPropagation();panel.classList.toggle('ee-aberto');};
      panel.querySelector('[data-ent-add]').onclick=()=>input.click(); panel.querySelector('[data-ent-remove]').onclick=()=>{img.style.display='none';panel.classList.remove('ee-aberto');}; panel.querySelector('[data-ent-cancel]').onclick=()=>panel.classList.remove('ee-aberto');
      input.onchange=()=>{const f=input.files?.[0];if(!f)return;const r=new FileReader();r.onload=e=>{img.src=e.target.result;img.style.display='';panel.classList.remove('ee-aberto');};r.readAsDataURL(f);};
      holder.append(btn,panel,input);
    });
  }
  function restaurar() {
    sairModos(); cards.forEach(card=>{const d=card.querySelector('.card-descricao');if(d){d.innerHTML=d.dataset.eeOriginal||d.innerHTML;d.classList.remove('expanded');d.setAttribute('contenteditable','false');}const i=card.querySelector('.card-thumb img');if(i){i.src=i.dataset.eeOriginal||i.src;i.style.display='';}});
  }
  master.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); menu.classList.toggle('ee-aberto'); });
  menu.querySelectorAll('[data-ee-ent-mode]').forEach(btn=>btn.addEventListener('click',()=>{const mode=btn.dataset.eeEntMode;if(mode==='texto')ativarTexto();else if(mode==='imagem')ativarImagem();else if(mode==='restaurar')restaurar();else sairModos();fechar();}));
})();


// ============================================================
// PATCH 0930 — ENTREVISTAS: CONTROLES SÓ NO MODO ESCOLHIDO
// ============================================================
(function () {
  const wrapper = document.querySelector('.entrevistas-wrapper');
  if (!wrapper) return;
  const cards = [...wrapper.querySelectorAll('.card-entrevista')];

  function esconderControles(card) {
    card.querySelectorAll('.ee-text-btn, .ee-recuperar-btn, .ee-cancel-text-btn, .ee-img-btn, .ee-img-btn-g, .ee-conjunto-btn').forEach(b => b.style.setProperty('display', 'none', 'important'));
    card.querySelectorAll('.ee-entrevista-img-menu').forEach(m => m.classList.remove('ee-aberto'));
  }
  function sairTexto() {
    wrapper.classList.remove('ee-entrevistas-texto-ativo');
    cards.forEach(card => {
      const desc = card.querySelector('.card-descricao');
      if (desc) { desc.classList.remove('expanded'); desc.setAttribute('contenteditable','false'); }
      const saiba = card.querySelector('.btn-saiba-mais');
      if (saiba) saiba.style.removeProperty('display');
      esconderControles(card);
    });
  }
  function entrarTexto() {
    wrapper.classList.remove('ee-entrevistas-imagem-ativo');
    wrapper.classList.add('ee-entrevistas-texto-ativo');
    cards.forEach(card => {
      const desc = card.querySelector('.card-descricao');
      if (desc) { desc.classList.add('expanded'); desc.setAttribute('contenteditable','true'); }
      const saiba = card.querySelector('.btn-saiba-mais');
      if (saiba) saiba.style.setProperty('display','none','important');
      card.querySelectorAll('.ee-text-btn, .ee-recuperar-btn, .ee-cancel-text-btn').forEach(b => {
        b.classList.remove('ee-text-cancelado');
        b.style.removeProperty('display');
      });
    });
  }

  const texto = wrapper.querySelector('.ee-entrevistas-menu [data-ee-ent-mode="texto"]');
  const cancelar = wrapper.querySelector('.ee-entrevistas-menu [data-ee-ent-mode="cancelar"]');
  texto?.addEventListener('click', () => requestAnimationFrame(entrarTexto));
  cancelar?.addEventListener('click', () => requestAnimationFrame(sairTexto));

  // O botão − de um texto encerra apenas aquele parágrafo, sem afetar os outros.
  wrapper.addEventListener('click', e => {
    const cancel = e.target.closest('.ee-cancel-text-btn');
    if (!cancel) return;
    e.stopPropagation();
    const el = cancel.parentElement;
    cancel.style.setProperty('display','none','important');
    cancel.classList.add('ee-text-cancelado');
    el?.setAttribute('contenteditable','false');
    const mais = el?.querySelector(':scope > .ee-text-btn');
    if (mais) { mais.textContent = '+'; mais.classList.remove('ee-ativo','ee-confirmado'); }
  }, true);

  // Esconde os símbolos genéricos no carregamento público/edição geral.
  cards.forEach(esconderControles);
})();


// ============================================================
// PATCH 0931 — ENTREVISTAS: CONTROLES DIRETOS E LAYOUT ESTÁVEL
// ============================================================
(function () {
  const wrapper = document.querySelector('.entrevistas-wrapper');
  if (!wrapper) return;
  const cards = [...wrapper.querySelectorAll('.card-entrevista')];

  cards.forEach(card => {
    const desc = card.querySelector('.card-descricao');
    if (!desc || desc.dataset.eeInterviewText091031) return;
    desc.dataset.eeInterviewText091031 = '1';
    if (!desc.dataset.eeOriginalInterview) desc.dataset.eeOriginalInterview = desc.innerHTML;
    desc.style.position = 'relative';

    const mais = document.createElement('button');
    mais.type = 'button'; mais.className = 'ee-interview-text-plus ee-text-btn'; mais.textContent = '+'; mais.title = 'Editar texto';
    const voltar = document.createElement('button');
    voltar.type = 'button'; voltar.className = 'ee-interview-text-restore ee-recuperar-btn'; voltar.textContent = '↺'; voltar.title = 'Restaurar texto';
    const cancelar = document.createElement('button');
    cancelar.type = 'button'; cancelar.className = 'ee-interview-text-cancel ee-cancel-text-btn'; cancelar.textContent = '−'; cancelar.title = 'Não vou editar';
    desc.append(mais, voltar, cancelar);

    let antes = desc.innerHTML;
    const limpar = html => { const box=document.createElement('div'); box.innerHTML=html; box.querySelectorAll('button').forEach(b=>b.remove()); return box.innerHTML; };
    function sair() {
      desc.setAttribute('contenteditable','false'); mais.textContent='+'; mais.classList.remove('ee-ativo'); cancelar.style.display='none'; desc.classList.remove('ee-editing-interview');
    }
    mais.addEventListener('click', e => { e.preventDefault(); e.stopPropagation();
      if (desc.getAttribute('contenteditable') === 'true') { sair(); return; }
      antes = limpar(desc.innerHTML); desc.setAttribute('contenteditable','true'); desc.classList.add('ee-editing-interview'); mais.textContent='✓'; mais.classList.add('ee-ativo'); cancelar.style.display='flex'; desc.focus();
    });
    cancelar.addEventListener('mousedown', e => e.preventDefault());
    cancelar.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); desc.innerHTML=antes; desc.append(mais,voltar,cancelar); sair(); });
    voltar.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); desc.innerHTML=desc.dataset.eeOriginalInterview; desc.append(mais,voltar,cancelar); sair(); });
  });

  function atualizar() {
    const ativo = wrapper.classList.contains('ee-entrevistas-texto-ativo');
    cards.forEach(card => {
      const desc=card.querySelector('.card-descricao'); const saiba=card.querySelector('.btn-saiba-mais');
      if (!desc) return;
      desc.querySelectorAll('.ee-interview-text-plus,.ee-interview-text-restore,.ee-interview-text-cancel').forEach(b => b.style.setProperty('display', ativo ? 'flex' : 'none','important'));
      if (ativo) { desc.classList.add('expanded'); if(saiba) saiba.style.visibility='hidden'; }
      else { desc.classList.remove('expanded'); if(saiba) saiba.style.visibility='visible'; }
    });
  }
  const menu=wrapper.querySelector('.ee-entrevistas-menu');
  menu?.addEventListener('click', e => requestAnimationFrame(atualizar));
  const observer=new MutationObserver(atualizar); observer.observe(wrapper,{attributes:true,subtree:false,attributeFilter:['class']});
  atualizar();
})();


// ============================================================
// PATCH 0932 — ENTREVISTAS: VISIBILIDADE IMEDIATA E CONTROLES À FRENTE
// ============================================================
(function () {
  const wrapper = document.querySelector('.entrevistas-wrapper');
  if (!wrapper) return;
  const cards = [...wrapper.querySelectorAll('.card-entrevista')];
  const area = wrapper.querySelector('.ee-entrevistas-master-area');

  function estado() {
    const ativo = wrapper.classList.contains('ee-entrevistas-texto-ativo');
    const editorLigado = document.body.classList.contains('edit-mode-ativo');
    if (area) area.style.setProperty('display', editorLigado ? 'flex' : 'none', 'important');
    cards.forEach(card => {
      const desc = card.querySelector('.card-descricao');
      if (!desc) return;
      if (editorLigado && ativo) {
        desc.style.setProperty('position', 'relative', 'important');
        desc.style.setProperty('overflow', 'visible', 'important');
      } else {
        desc.style.removeProperty('position');
        desc.style.removeProperty('overflow');
      }
      desc.querySelectorAll('.ee-interview-text-plus, .ee-interview-text-restore, .ee-interview-text-cancel').forEach((b, i) => {
        const mostrar = editorLigado && ativo && !b.classList.contains('ee-text-cancelado');
        b.style.setProperty('display', mostrar ? 'flex' : 'none', 'important');
        b.style.setProperty('z-index', '9999', 'important');
        b.style.setProperty('pointer-events', mostrar ? 'auto' : 'none', 'important');
      });
    });
  }

  // Atualiza imediatamente ao escolher Editar texto, sem esperar sair do modo.
  wrapper.querySelector('.ee-entrevistas-menu [data-ee-ent-mode="texto"]')?.addEventListener('click', () => {
    wrapper.classList.add('ee-entrevistas-texto-ativo');
    requestAnimationFrame(estado);
    setTimeout(estado, 0);
  });
  wrapper.querySelector('.ee-entrevistas-menu [data-ee-ent-mode="cancelar"]')?.addEventListener('click', () => {
    wrapper.classList.remove('ee-entrevistas-texto-ativo');
    requestAnimationFrame(estado);
  });
  document.addEventListener('click', e => {
    if (e.target.closest('#btn-editar-site')) requestAnimationFrame(estado);
  });
  const observer = new MutationObserver(estado);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  estado();
})();


// ============================================================
// PATCH 0933 — ENTREVISTAS: EDITAR TEXTO SEM SEGUNDO CLIQUE
// ============================================================
(function () {
  const wrapper = document.querySelector('.entrevistas-wrapper');
  if (!wrapper) return;

  function forcarTexto() {
    wrapper.classList.add('ee-entrevistas-texto-ativo');
    wrapper.querySelectorAll('.card-entrevista').forEach(card => {
      const desc = card.querySelector('.card-descricao');
      if (!desc) return;
      desc.setAttribute('contenteditable', 'true');
      desc.classList.add('expanded');
      desc.style.setProperty('position', 'relative', 'important');
      desc.style.setProperty('overflow', 'visible', 'important');
      desc.style.setProperty('padding-right', '92px', 'important');
      const saiba = card.querySelector('.btn-saiba-mais');
      if (saiba) saiba.style.setProperty('visibility', 'hidden', 'important');

      const controles = [
        [desc.querySelector('.ee-interview-text-plus'), 58],
        [desc.querySelector('.ee-interview-text-restore'), 31],
        [desc.querySelector('.ee-interview-text-cancel'), 4],
      ];
      controles.forEach(([controle, right]) => {
        if (!controle || controle.classList.contains('ee-text-cancelado')) return;
        controle.style.setProperty('display', 'flex', 'important');
        controle.style.setProperty('visibility', 'visible', 'important');
        controle.style.setProperty('opacity', '1', 'important');
        controle.style.setProperty('pointer-events', 'auto', 'important');
        controle.style.setProperty('position', 'absolute', 'important');
        controle.style.setProperty('top', '50%', 'important');
        controle.style.setProperty('right', `${right}px`, 'important');
        controle.style.setProperty('transform', 'translateY(-50%)', 'important');
        controle.style.setProperty('z-index', '99999', 'important');
      });
    });
  }

  const botao = wrapper.querySelector('.ee-entrevistas-menu [data-ee-ent-mode="texto"]');
  botao?.addEventListener('click', () => {
    forcarTexto();
    requestAnimationFrame(forcarTexto);
    setTimeout(forcarTexto, 30);
  }, true);

  // Se o menu for reconstruído ou o modo for alterado, mantém o estado correto.
  wrapper.addEventListener('click', e => {
    if (e.target.closest('[data-ee-ent-mode="texto"]')) forcarTexto();
  }, true);
})();


// ============================================================
// PATCH 0934 — TÍTULOS DAS ENTREVISTAS SEM SOBREPOSIÇÃO
// ============================================================
(function () {
  const wrapper = document.querySelector('.entrevistas-wrapper');
  if (!wrapper) return;
  const cards = [...wrapper.querySelectorAll('.card-entrevista')];

  cards.forEach(card => {
    const titulo = card.querySelector('.link-titulo');
    if (!titulo || card.querySelector('.ee-interview-title-controls')) return;
    const faixa = document.createElement('span');
    faixa.className = 'ee-interview-title-controls';
    faixa.setAttribute('aria-label', 'Controles do título');
    faixa.innerHTML = '<button type="button" class="ee-title-plus">+</button><button type="button" class="ee-title-restore">↺</button><button type="button" class="ee-title-cancel">−</button>';
    titulo.insertAdjacentElement('afterend', faixa);

    const mais = faixa.querySelector('.ee-title-plus');
    const voltar = faixa.querySelector('.ee-title-restore');
    const cancelar = faixa.querySelector('.ee-title-cancel');
    let antes = titulo.innerHTML;
    mais.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const editando = titulo.getAttribute('contenteditable') === 'true';
      if (!editando) { antes=titulo.innerHTML; titulo.setAttribute('contenteditable','true'); mais.textContent='✓'; cancelar.style.display='flex'; titulo.focus(); }
      else { titulo.setAttribute('contenteditable','false'); mais.textContent='+'; cancelar.style.display='none'; }
    });
    cancelar.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); titulo.innerHTML=antes; titulo.setAttribute('contenteditable','false'); mais.textContent='+'; cancelar.style.display='none'; });
    voltar.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); titulo.innerHTML=titulo.dataset.eeOriginalTitle || antes; titulo.setAttribute('contenteditable','false'); mais.textContent='+'; cancelar.style.display='none'; });
  });

  function atualizarTitulos() {
    const ativo = wrapper.classList.contains('ee-entrevistas-texto-ativo') && document.body.classList.contains('edit-mode-ativo');
    cards.forEach(card => card.querySelectorAll('.ee-interview-title-controls').forEach(faixa => {
      faixa.style.setProperty('display', ativo ? 'flex' : 'none', 'important');
      faixa.querySelectorAll('button').forEach(b => b.style.setProperty('pointer-events', ativo ? 'auto' : 'none', 'important'));
    }));
  }
  wrapper.querySelector('.ee-entrevistas-menu [data-ee-ent-mode="texto"]')?.addEventListener('click', () => { wrapper.classList.add('ee-entrevistas-texto-ativo'); requestAnimationFrame(atualizarTitulos); setTimeout(atualizarTitulos, 20); });
  wrapper.querySelector('.ee-entrevistas-menu [data-ee-ent-mode="cancelar"]')?.addEventListener('click', () => { wrapper.classList.remove('ee-entrevistas-texto-ativo'); atualizarTitulos(); });
  document.addEventListener('click', e => { if (e.target.closest('#btn-editar-site')) requestAnimationFrame(atualizarTitulos); });
  new MutationObserver(atualizarTitulos).observe(document.body, { attributes:true, attributeFilter:['class'] });
  atualizarTitulos();
})();


// ============================================================
// PATCH 0935 — CONTROLES DE TEXTO DA NOSSA EQUIPE
// ============================================================
(function () {
  const equipe = document.querySelector('#nossa-equipe');
  if (!equipe) return;
  const alvos = equipe.querySelectorAll('.equipe-nome, .equipe-cargo, .equipe-secao-titulo');

  alvos.forEach(el => {
    if (el.dataset.eeTeamControls) return;
    el.dataset.eeTeamControls = '1';
    el.style.position = 'relative';
    el.dataset.eeOriginal = el.innerHTML;
    const controls = document.createElement('span');
    controls.className = 'ee-team-text-controls';
    controls.innerHTML = '<button type="button" class="ee-team-plus">+</button><button type="button" class="ee-team-restore">↺</button><button type="button" class="ee-team-cancel">−</button>';
    controls.querySelectorAll('button').forEach(b => { b.setAttribute('contenteditable','false'); b.addEventListener('mousedown', e => e.preventDefault()); });
    el.appendChild(controls);
    const plus=controls.querySelector('.ee-team-plus'), restore=controls.querySelector('.ee-team-restore'), cancel=controls.querySelector('.ee-team-cancel');
    let before=el.innerHTML;
    const contentOnly=()=>{const clone=el.cloneNode(true); clone.querySelector('.ee-team-text-controls')?.remove(); return clone.innerHTML;};
    plus.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); before=contentOnly(); el.setAttribute('contenteditable','true'); el.classList.add('ee-team-editing'); plus.textContent='✓'; cancel.classList.remove('ee-team-cancelled'); });
    restore.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); el.innerHTML=el.dataset.eeOriginal; el.appendChild(controls); el.setAttribute('contenteditable','false'); plus.textContent='+'; el.classList.remove('ee-team-editing'); });
    cancel.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); el.innerHTML=before; el.appendChild(controls); el.setAttribute('contenteditable','false'); el.classList.remove('ee-team-editing'); plus.textContent='+'; cancel.classList.add('ee-team-cancelled'); });
  });

  function atualizar() {
    const mostrar = document.body.classList.contains('edit-mode-ativo') && document.body.classList.contains('global-modo-texto');
    alvos.forEach(el => {
      const box=el.querySelector('.ee-team-text-controls');
      if (box) box.style.setProperty('display', mostrar ? 'flex' : 'none', 'important');
    });
  }
  const obs=new MutationObserver(atualizar); obs.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('click', e => { if (e.target.closest('.ee-local-opt[data-target="texto"]')) requestAnimationFrame(atualizar); }, true);
  atualizar();
})();


// ============================================================
// PATCH 0937 — NOSSA EQUIPE: MODO DE TEXTO INDEPENDENTE
// ============================================================
(function () {
  const equipe = document.querySelector('#nossa-equipe');
  if (!equipe) return;
  const controles = () => equipe.querySelectorAll('.ee-team-text-controls');
  function mostrar() {
    equipe.classList.add('ee-team-text-active');
    controles().forEach(box => {
      box.style.setProperty('display', 'flex', 'important');
      box.style.setProperty('visibility', 'visible', 'important');
      box.style.setProperty('opacity', '1', 'important');
      box.style.setProperty('z-index', '999999', 'important');
    });
  }
  function ocultar() {
    equipe.classList.remove('ee-team-text-active');
    controles().forEach(box => box.style.setProperty('display', 'none', 'important'));
  }
  document.addEventListener('click', e => {
    const opcao = e.target.closest('.ee-local-opt[data-target]');
    if (!opcao) return;
    if (opcao.dataset.target === 'texto') {
      requestAnimationFrame(mostrar); setTimeout(mostrar, 30);
    } else if (opcao.dataset.target === 'limpar' || opcao.dataset.target === 'fotos' || opcao.dataset.target === 'ods') {
      ocultar();
    }
  }, true);
  document.addEventListener('click', e => {
    if (e.target.closest('#btn-editar-site')) {
      requestAnimationFrame(() => { if (!document.body.classList.contains('edit-mode-ativo')) ocultar(); });
    }
  }, true);
  const observer = new MutationObserver(() => {
    if (equipe.classList.contains('ee-team-text-active')) mostrar();
  });
  observer.observe(equipe, { childList: true, subtree: true });
  ocultar();
})();


// ============================================================
// PATCH 0938 — TÍTULOS DE SEÇÃO SEM SÍMBOLOS DE EDIÇÃO
// ============================================================
(function () {
  function limparTitulos() {
    document.querySelectorAll('section h1, section h2').forEach(titulo => {
      titulo.querySelectorAll(':scope > .ee-text-btn, :scope > .ee-recuperar-btn, :scope > .ee-cancel-text-btn, :scope > .ee-text-btn-g, :scope > .ee-recuperar-btn-g').forEach(btn => btn.remove());
      titulo.classList.remove('ee-editavel', 'ee-conjunto-texto');
      titulo.removeAttribute('contenteditable');
    });
  }
  limparTitulos();
  new MutationObserver(limparTitulos).observe(document.body, { childList: true, subtree: true });
})();