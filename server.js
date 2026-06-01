const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Cole sua chave entre as aspas
const API_KEY = "AIzaSyD-7FkauDy-u0TPRUnS-Q1OxtTs-LsJzwA";

app.post("/verificar", async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      found: false,
      error: "Consulta vazia."
    });
  }

  try {
    const url =
      "https://factchecktools.googleapis.com/v1alpha1/claims:search" +
      `?query=${encodeURIComponent(query)}` +
      "&languageCode=pt" +
      "&pageSize=5" +
      `&key=${API_KEY}`;

    const respostaGoogle = await fetch(url);
    const dadosGoogle = await respostaGoogle.json();

    if (!respostaGoogle.ok) {
      return res.status(respostaGoogle.status).json({
        found: false,
        error: dadosGoogle.error?.message || "Erro ao consultar a API."
      });
    }

    const claims = dadosGoogle.claims || [];

    if (claims.length === 0) {
      return res.json({
        found: false,
        texto: "Nenhuma checagem correspondente foi encontrada."
      });
    }

    const claim = claims[0];
    const review = claim.claimReview?.[0];

    if (!review) {
      return res.json({
        found: false,
        texto: "A informação foi encontrada, mas não há revisão disponível."
      });
    }

    const avaliacao = review.textualRating || "Sem classificação";
    const avaliacaoNormalizada = avaliacao.toLowerCase();

    let rating = "unknown";

    if (
      avaliacaoNormalizada.includes("false") ||
      avaliacaoNormalizada.includes("falso") ||
      avaliacaoNormalizada.includes("fake") ||
      avaliacaoNormalizada.includes("enganoso") ||
      avaliacaoNormalizada.includes("misleading") ||
      avaliacaoNormalizada.includes("incorrect") ||
      avaliacaoNormalizada.includes("incorreto")
    ) {
      rating = "false";
    } else if (
      avaliacaoNormalizada.includes("true") ||
      avaliacaoNormalizada.includes("verdadeiro") ||
      avaliacaoNormalizada.includes("correto") ||
      avaliacaoNormalizada.includes("correct")
    ) {
      rating = "true";
    }

    return res.json({
      found: true,
      rating: rating,
      texto: avaliacao,
      claimText: claim.text || query,
      titulo: review.title || "Checagem encontrada",
      fonte: review.publisher?.name || "Fonte não informada",
      url: review.url || ""
    });

  } catch (erro) {
    return res.status(500).json({
      found: false,
      error: "Erro ao consultar a API."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});