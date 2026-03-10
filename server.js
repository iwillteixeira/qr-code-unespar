const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// serve todos os arquivos estáticos (html, css, js, assets, lib)
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`✅  Servidor rodando em http://localhost:${PORT}`);
});
