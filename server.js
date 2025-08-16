// Express server for local preview
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname));
app.get("/", (req,res)=>res.sendFile(path.join(__dirname, "index.html")));
app.listen(PORT, ()=>console.log(`TrustMe AI (old style + T1–T4) http://localhost:${PORT}`));
