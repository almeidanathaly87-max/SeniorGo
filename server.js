const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
// O Render define a porta automaticamente, geralmente 10000
const PORT = process.env.PORT || 10000;

// Configuração do Gemini (A chave será pega direto do painel do Render)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

app.post("/verificar", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ found: false, error: "Consulta vazia." });

    try {
        const prompt = `Analise para um idoso: "${query}". Comece com [VERDADEIRO], [FALSO] ou [SUSPEITO]. Explique de forma simples e carinhosa em até 3 parágrafos.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analiseIA = response.text();

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
        console.error("Erro na IA:", error);
        return res.status(500).json({ found: false, error: "Erro ao consultar a IA." });
    }
});

app.get("/", (req, res) => res.send("SeniorGo Online"));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});