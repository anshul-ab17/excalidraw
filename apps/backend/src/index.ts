import express from "express"; 
import healthRoute from "./routes/health"
import authRoute from "./routes/auth"


const app = express();
const PORT = 3002;

app.use(express.json());

app.use("/health",healthRoute)
app.use("/",authRoute )

 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
