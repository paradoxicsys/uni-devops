const express = require("express");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("<h1>Hello World from Node.js!</h1><p>Served by Express in a node:24-alpine container.</p>");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
