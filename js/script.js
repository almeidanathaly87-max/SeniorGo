// Funções de Navegação
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0,0);
}

function goToSearch() {
    const name = document.getElementById('user-name-input').value;
    if (name.trim() !== "") {
        document.getElementById('user-tag').innerText = "OLÁ, " + name.toUpperCase();
        showScreen('view-search');
    } else {
        alert("Por favor, digite seu nome.");
    }
}

// ========================================================
// CONEXÃO COM A API (VINCULADO NOVAMENTE)
// ========================================================
async function processResult() {
    const query = document.getElementById('search-input').value;
    const loading = document.getElementById('loading-msg');
    const btn = document.getElementById('btn-verificar');

    if (!query) return alert("Digite algo para verificar.");

    // Mostra carregamento e trava o botão
    loading.style.display = "block";
    btn.disabled = true;

    try {
       // No seu arquivo js/script.js
const response = await fetch("https://seniorgo.onrender.com/verificar", { // <--- COLOQUE SEU LINK DO RENDER AQUI
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query })
});

        const dados = await response.json();

        const card = document.getElementById('result-card');
        const title = document.getElementById('result-title');
        const icon = document.getElementById('result-icon');
        const text = document.getElementById('result-text');

        // Se a API não encontrou nada
        if (!dados.found) {
            card.className = "result-box"; // Neutro
            title.innerText = "NÃO ENCONTRADO";
            icon.innerText = "⚠️";
            text.innerText = "Não conseguimos encontrar uma checagem oficial para essa informação. Procure fontes confiáveis.";
        } 
        // Se a API classificou como FALSO
        else if (dados.rating === "false") {
            card.className = "result-box res-falso";
            title.innerText = "FALSO";
            icon.innerText = "❌";
            text.innerText = dados.texto || "A checagem indica que essa informação não é verdadeira.";
        } 
        // Se a API classificou como VERDADEIRO
        else {
            card.className = "result-box res-verdadeiro";
            title.innerText = "VERDADEIRO";
            icon.innerText = "✅";
            text.innerText = dados.texto || "A checagem confirma que essa informação é real.";
        }

        showScreen('view-result');

    } catch (error) {
        console.error("Erro ao conectar na API:", error);
        alert("Erro ao conectar com o servidor. Verifique se o API está rodando.");
    } finally {
        loading.style.display = "none";
        btn.disabled = false;
    }
}

// ========================================================
// ACESSIBILIDADE
// ========================================================
let currentFontSize = 18;
function changeFontSize(delta) {
    currentFontSize += delta;
    if (currentFontSize < 14) currentFontSize = 14;
    if (currentFontSize > 30) currentFontSize = 30;
    document.documentElement.style.setProperty('--base-font', currentFontSize + 'px');
}

function toggleContrast() {
    document.body.classList.toggle('contrast-mode');
}