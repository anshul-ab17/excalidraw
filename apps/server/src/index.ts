import express from "express";
import authRoute from "./auth"


const app = express();
const PORT = 3002;

app.use(express.json());
app.use("/",authRoute )

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


