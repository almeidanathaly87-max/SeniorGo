// No seu server.js
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Este é o melhor modelo para o plano gratuito: rápido e eficiente
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
});

app.post("/verificar", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ found: false, error: "Consulta vazia." });

    try {
        // Log para conferirmos no Render
        console.log("Consultando Gemini Gratuito para:", query);

        const prompt = `Analise para um idoso: "${query}". Responda de forma simples, carinhosa e comece com [VERDADEIRO], [FALSO] ou [SUSPEITO].`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analiseIA = response.text();

        let rating = "unknown";
        if (analiseIA.toUpperCase().includes("[FALSO]")) rating = "false";
        else if (analiseIA.toUpperCase().includes("[VERDADEIRO]")) rating = "true";

        return res.json({
            found: true,
            rating: rating,
            texto: analiseIA,
            titulo: "Análise SeniorGo",
            fonte: "IA Gratuita Gemini"
        });
    } catch (error) {
        console.error("Erro no servidor:", error.message);
        // Se der erro 404 aqui com a CHAVE NOVA, o problema é a região do servidor do Render
        return res.status(500).json({ found: false, error: "Erro na IA." });
    }
});