const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Gemini (Ele vai ler a chave que vamos configurar no Render)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json());

// Rota de verificação
app.post("/verificar", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ found: false, error: "Consulta vazia." });
  }

  try {
    const prompt = `
      Você é o Assistente Especialista do SeniorGo. Analise a seguinte informação para um idoso: "${query}"
      1. Comece com: [VERDADEIRO], [FALSO] ou [SUSPEITO].
      2. Explique de forma simples e carinhosa em no máximo 3 parágrafos.
    `;

    const result = await model.generateContent(prompt);
    const analiseIA = result.response.text();

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

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ found: false, error: "Erro ao consultar a IA." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});