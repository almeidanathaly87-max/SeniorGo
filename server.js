const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Gemini usando a variável de ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

app.post("/verificar", async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ found: false, error: "Consulta vazia." });
    }

    try {
        const prompt = `
        Você é o especialista do SeniorGo. Analise para um idoso: "${query}"
        1. Comece com [VERDADEIRO], [FALSO] ou [SUSPEITO].
        2. Explique de forma simples e carinhosa em até 3 parágrafos.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analiseIA = response.text();

        // Lógica para definir a cor (rating) no seu CSS
        let rating = "unknown";
        if (analiseIA.includes("[FALSO]")) rating = "false";
        else if (analiseIA.includes("[VERDADEIRO]")) rating = "true";

        return res.json({
            found: true,
            rating: rating,
            texto: analiseIA,
            titulo: "Análise da SeniorGo AI",
            fonte: "Inteligência Artificial Gemini"
        });

    } catch (error) {
        console.error("Erro no servidor:", error);
        return res.status(500).json({ found: false, error: "Erro ao consultar a IA." });
    }
});

// Rota padrão para teste no navegador
app.get("/", (req, res) => {
    res.send("Servidor do SeniorGo está ATIVO!");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});