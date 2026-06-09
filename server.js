const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIGURAÇÃO DA IA - MUDAMOS PARA GEMINI-PRO PARA EVITAR O ERRO 404
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); 

app.post("/verificar", async (req, res) => {
    console.log("Pergunta recebida:", req.body.query);
    const { query } = req.body;

    if (!query) return res.status(400).json({ found: false, error: "Consulta vazia." });

    try {
        const prompt = `Analise para um idoso se a informação a seguir é verdadeira ou falsa: "${query}". Responda começando com [VERDADEIRO], [FALSO] ou [SUSPEITO]. Explique de forma simples e carinhosa em até 3 parágrafos.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analiseIA = response.text();
        const analiseUpper = analiseIA.toUpperCase();

        let rating = "unknown";
        if (analiseUpper.includes("[FALSO]")) rating = "false";
        else if (analiseUpper.includes("[VERDADEIRO]")) rating = "true";

        return res.json({
            found: true,
            rating: rating,
            texto: analiseIA,
            titulo: "Análise da SeniorGo AI",
            fonte: "Inteligência Artificial Gemini"
        });
    } catch (error) {
        console.error("ERRO NA IA:", error.message);
        return res.status(500).json({ found: false, error: "Erro ao consultar a IA." });
    }
});

app.get("/", (req, res) => res.send("SeniorGo Online e Estável!"));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});