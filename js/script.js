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
    const queryInput = document.getElementById('search-input');
    const query = queryInput.value.trim();
    const loading = document.getElementById('loading-msg');
    const btn = document.getElementById('btn-verificar');

    if (!query) return alert("Por favor, digite ou cole algo para verificar.");

    loading.style.display = "block";
    btn.disabled = true;

    try {
        const response = await fetch("https://seniorgo.onrender.com/verificar", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
            throw new Error(`Erro no servidor: ${response.status}`);
        }

        const dados = await response.json();
        
        // --- ABAIXO: LÓGICA DE EXIBIÇÃO ---
        const card = document.getElementById('result-card');
        const title = document.getElementById('result-title');
        const icon = document.getElementById('result-icon');
        const text = document.getElementById('result-text');

        if (dados.rating === "false") {
            card.className = "result-box res-falso";
            title.innerText = "FALSO";
            icon.innerText = "❌";
        } else if (dados.rating === "true") {
            card.className = "result-box res-verdadeiro";
            title.innerText = "VERDADEIRO";
            icon.innerText = "✅";
        } else {
            card.className = "result-box"; // Estilo neutro para suspeitos ou erro
            title.innerText = "SUSPEITO";
            icon.innerText = "⚠️";
        }

        text.innerText = dados.texto;
        showScreen('view-result');

    } catch (error) {
        console.error("Erro na conexão:", error);
        alert("Ocorreu um erro ao conectar com a IA. Tente novamente em alguns segundos.");
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