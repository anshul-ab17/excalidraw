import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());
 
app.get("/health", (req, res) => {
  res.send("OK");
});
 

app.post("/signup", (req, res)=> {

})

app.post("/signin", (req,res) =>{

})

 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
