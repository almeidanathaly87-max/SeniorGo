const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração de segurança e leitura de dados
app.use(cors());
app.use(express.json()); // Tradutor de JSON
app.use(express.urlencoded({ extended: true })); // Tradutor extra para garantir a leitura

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ROTA PRINCIPAL
app.post("/verificar", async (req, res) => {
    // LOG DE DIAGNÓSTICO (Veremos isso no painel do Render)
    console.log("Conteúdo recebido no servidor:", req.body);

    const { query } = req.body;

    if (!query || query.trim() === "") {
        console.error("ERRO: Query vazia recebida.");
        return res.status(400).json({ found: false, error: "Consulta vazia." });
    }

    try {
        const prompt = `Analise para um idoso: "${query}". Comece obrigatoriamente com [VERDADEIRO], [FALSO] ou [SUSPEITO]. Explique de forma simples e carinhosa em até 3 parágrafos.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analiseIA = response.text();
        const analiseUpper = analiseIA.toUpperCase();

        let rating = "unknown";
        if (analiseUpper.includes("[FALSO]")) rating = "false";
        else if (analiseUpper.includes("[VERDADEIRO]")) rating = "true";
        else if (analiseUpper.includes("[SUSPEITO]")) rating = "suspect";

        console.log("IA respondeu com sucesso. Rating:", rating);

        return res.json({
            found: true,
            rating: rating,
            texto: analiseIA,
            titulo: "Análise da SeniorGo AI",
            fonte: "Inteligência Artificial Gemini"
        });

    } catch (error) {
        console.error("Erro crítico na IA:", error);
        return res.status(500).json({ found: false, error: "Erro ao consultar a IA." });
    }
});

app.get("/", (req, res) => res.send("Servidor SeniorGo está Online!"));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});