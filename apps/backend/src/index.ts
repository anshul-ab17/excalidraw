import express from "express"; 
import healthRoute from "./routes/health"

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/health",healthRoute)
app.use("/", )

 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
