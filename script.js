const form = document.querySelector("form");
const mensagem = document.getElementById("mensagemSucesso");
const envelope = document.getElementById("envelope");
const wrapper = document.getElementById("envelopeWrapper");

// ==========================
// ENVIO DO FORMULÁRIO
// ==========================
form.addEventListener("submit", async function(e){
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const acompanhantes = document.getElementById("acompanhantes").value;
    const presenca = document.getElementById("presenca").value;

    const dados = {
        nome,
        acompanhantes,
        presenca
    };

    try {
        await fetch("https://script.google.com/macros/s/AKfycbz3J-Sp7x-nPWZSLvkaJ-NvdqpdcBKBtQFRZNQjMB6caT1KjODcN-gPhfF3FksxwEs4/exec", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        // Mostra mensagem de sucesso
        mensagem.classList.add("ativo");

        form.reset();

        setTimeout(() => {
            mensagem.classList.remove("ativo");
        }, 4000);

    } catch (error) {
        alert("Erro ao enviar confirmação ❌");
        console.error(error);
    }
});


// ==========================
// ANIMAÇÃO DO ENVELOPE
// ==========================
envelope.addEventListener("click", () => {
    envelope.classList.add("aberto");

    setTimeout(() => {
        wrapper.classList.add("hidden");
    }, 1000);
});


// ==========================
// CONTADOR REGRESSIVO
// ==========================
const eventoData = new Date("2026-08-21T19:00:00").getTime();

setInterval(() => {
    const agora = new Date().getTime();
    const distancia = eventoData - agora;

    if (distancia < 0) return;

    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

    document.getElementById("dias").textContent = dias.toString().padStart(2, "0");
    document.getElementById("horas").textContent = horas.toString().padStart(2, "0");
    document.getElementById("minutos").textContent = minutos.toString().padStart(2, "0");
    document.getElementById("segundos").textContent = segundos.toString().padStart(2, "0");

}, 1000);