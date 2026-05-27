const form = document.querySelector("form");
const mensagem = document.getElementById("mensagemSucesso");
const envelope = document.getElementById("envelope");
const wrapper = document.getElementById("envelopeWrapper");
const canvas = document.getElementById("luxCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const eventoData = new Date("2026-07-12T14:00:00").getTime();

let conviteAberto = false;
let particles = [];
let largura = 0;
let altura = 0;
let dpr = 1;
let pointerX = 0.5;
let pointerY = 0.5;

function abrirConvite() {
  if (conviteAberto || !envelope || !wrapper) return;

  conviteAberto = true;
  envelope.classList.add("aberto");
  soltarFaiscas(window.innerWidth / 2, window.innerHeight / 2, 42);

  setTimeout(() => {
    wrapper.classList.add("hidden");
    document.body.classList.add("convite-liberado");
  }, 1050);
}

if (envelope) {
  envelope.addEventListener("click", abrirConvite);
}

function atualizarNumero(id, valor) {
  const el = document.getElementById(id);
  if (!el) return;

  const texto = valor.toString().padStart(2, "0");
  if (el.textContent === texto) return;

  el.textContent = texto;
  const box = el.closest(".tempo-box");
  if (!box) return;

  box.classList.remove("tick");
  window.requestAnimationFrame(() => {
    box.classList.add("tick");
    setTimeout(() => box.classList.remove("tick"), 380);
  });
}

function atualizarContador() {
  const agora = new Date().getTime();
  const distancia = Math.max(eventoData - agora, 0);

  const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

  atualizarNumero("dias", dias);
  atualizarNumero("horas", horas);
  atualizarNumero("minutos", minutos);
  atualizarNumero("segundos", segundos);
}

atualizarContador();
setInterval(atualizarContador, 1000);

if (form && mensagem) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const botao = form.querySelector("button[type='submit']");
    const nome = document.getElementById("nome").value.trim();
    const acompanhantes = document.getElementById("acompanhantes").value;
    const presenca = document.getElementById("presenca").value;
    const dados = { nome, acompanhantes, presenca };

    if (botao) {
      botao.classList.add("enviando");
      botao.disabled = true;
    }

    fetch(
      "https://script.google.com/macros/s/AKfycbz3J-Sp7x-nPWZSLvkaJ-NvdqpdcBKBtQFRZNQjMB6caT1KjODcN-gPhfF3FksxwEs4/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      }
    ).catch(() => {
      // O modo no-cors não permite ler a resposta. Mantemos o retorno visual para o convidado.
    });

    setTimeout(() => {
      mensagem.textContent = presenca === "nao"
        ? "Resposta registrada. Obrigado por avisar."
        : "Presença registrada. Obrigado por confirmar.";
      mensagem.classList.add("ativo");
      form.reset();

      const rect = botao ? botao.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
      soltarFaiscas(rect.left + rect.width / 2, rect.top + rect.height / 2, 34);

      if (botao) {
        botao.classList.remove("enviando");
        botao.disabled = false;
      }
    }, 700);

    setTimeout(() => {
      mensagem.classList.remove("ativo");
    }, 5200);
  });
}

function prepararRevelacoes() {
  const elementos = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("visivel"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visivel");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });

  elementos.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
    observer.observe(el);
  });
}

prepararRevelacoes();

function atualizarPonteiro(e) {
  pointerX = e.clientX / window.innerWidth;
  pointerY = e.clientY / window.innerHeight;
  document.documentElement.style.setProperty("--mx", `${Math.round(pointerX * 100)}%`);
  document.documentElement.style.setProperty("--my", `${Math.round(pointerY * 100)}%`);
}

window.addEventListener("pointermove", atualizarPonteiro, { passive: true });

function redimensionarCanvas() {
  if (!canvas || !ctx) return;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  largura = window.innerWidth;
  altura = window.innerHeight;
  canvas.width = Math.floor(largura * dpr);
  canvas.height = Math.floor(altura * dpr);
  canvas.style.width = `${largura}px`;
  canvas.style.height = `${altura}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const quantidade = Math.min(130, Math.max(48, Math.floor((largura * altura) / 14500)));
  particles = Array.from({ length: quantidade }, () => criarParticula(true));
}

function criarParticula(espalhar) {
  return {
    x: Math.random() * largura,
    y: espalhar ? Math.random() * altura : altura + 20,
    r: Math.random() * 1.8 + 0.7,
    speed: Math.random() * 0.28 + 0.12,
    phase: Math.random() * Math.PI * 2,
    drift: Math.random() * 0.7 + 0.2,
    depth: Math.random() * 0.9 + 0.1,
    color: Math.random() > 0.52 ? "242, 217, 149" : "255, 249, 238",
  };
}

function animarCanvas(time = 0) {
  if (!ctx) return;

  ctx.clearRect(0, 0, largura, altura);

  particles.forEach((p, index) => {
    p.y -= p.speed;
    p.phase += 0.014;

    if (p.y < -20) {
      particles[index] = criarParticula(false);
      return;
    }

    const x = p.x + Math.sin(time * 0.0007 * p.drift + p.phase) * 18 + (pointerX - 0.5) * 22 * p.depth;
    const y = p.y + (pointerY - 0.5) * 16 * p.depth;
    const brilho = 0.26 + Math.sin(time * 0.002 + p.phase) * 0.22;

    ctx.beginPath();
    ctx.arc(x, y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.12, brilho)})`;
    ctx.fill();

    if (p.r > 1.9 && brilho > 0.3) {
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.strokeStyle = `rgba(${p.color}, ${brilho * 0.35})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  requestAnimationFrame(animarCanvas);
}

function soltarFaiscas(x, y, quantidade) {
  const cores = ["#f2d995", "#c59a42", "#fff9ee", "#12362f", "#4d1724"];

  for (let i = 0; i < quantidade; i += 1) {
    const spark = document.createElement("span");
    const angulo = Math.random() * Math.PI * 2;
    const distancia = 70 + Math.random() * 150;

    spark.className = "spark";
    spark.style.setProperty("--x", `${x}px`);
    spark.style.setProperty("--y", `${y}px`);
    spark.style.setProperty("--tx", `${Math.cos(angulo) * distancia}px`);
    spark.style.setProperty("--ty", `${Math.sin(angulo) * distancia}px`);
    spark.style.setProperty("--c", cores[Math.floor(Math.random() * cores.length)]);

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1000);
  }
}

if (canvas && ctx) {
  redimensionarCanvas();
  animarCanvas();
  window.addEventListener("resize", redimensionarCanvas);
}
