const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Verificação de segurança da chave (Log aparecerá no Render)
if (!process.env.GEMINI_API_KEY) {
    console.error("ERRO: A variável GEMINI_API_KEY não foi encontrada no Render!");
} else {
    console.log("Chave de API detectada com sucesso.");
}

// Inicialização da IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mudamos para 'gemini-1.5-flash', que é o sucessor estável e gratuito
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/verificar", async (req, res) => {
    const { query } = req.body;
    console.log("Pergunta recebida:", query);

    if (!query) return res.status(400).json({ found: false, error: "Consulta vazia." });

    try {
        // Log para monitorar a chamada
        console.log("Chamando Google Gemini...");

        const prompt = `Analise para um idoso: "${query}". Comece com [VERDADEIRO], [FALSO] ou [SUSPEITO]. Explique de forma simples em até 3 parágrafos.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analiseIA = response.text();

        let rating = "unknown";
        if (analiseIA.toUpperCase().includes("[FALSO]")) rating = "false";
        else if (analiseIA.toUpperCase().includes("[VERDADEIRO]")) rating = "true";

        console.log("IA respondeu corretamente!");

        return res.json({
            found: true,
            rating: rating,
            texto: analiseIA,
            titulo: "Análise SeniorGo AI",
            fonte: "Google Gemini 1.5 Flash"
        });

    } catch (error) {
        // Se der 404 aqui, o erro será detalhado no Log
        console.error("DETALHE DO ERRO NA IA:", error.message);
        
        return res.status(500).json({ 
            found: false, 
            error: "Erro na IA: " + error.message 
        });
    }
});

app.get("/", (req, res) => res.send("Servidor SeniorGo Online"));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});