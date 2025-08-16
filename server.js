// Simple Express server to serve TrustMe AI dashboard
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.get("/", (req,res)=> res.sendFile(path.join(__dirname, "index.html")));
app.listen(PORT, ()=> console.log(`TrustMe AI dashboard (T1–T4) at http://localhost:${PORT}`));
