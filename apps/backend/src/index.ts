import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());
 
app.get("/health", (req, res) => {
  res.send("OK");
});
 
app.post("/boards", (req, res) => {
  res.sendStatus(201);
});
 
app.get("/boards/:boardId", (req, res) => {
  res.sendStatus(200);
});
 
app.delete("/boards/:boardId", (req, res) => {
  res.sendStatus(204);
});
 
app.get("/boards/:boardId/elements", (req, res) => {
  res.sendStatus(200);
});
 
app.post("/boards/:boardId/elements", (req, res) => {
  res.sendStatus(200);
});
 
app.delete("/boards/:boardId/elements/:elementId", (req, res) => {
  res.sendStatus(204);
});

 

 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
