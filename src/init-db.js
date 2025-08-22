import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');
const db = new Database(dbPath);
db.exec(schema);
console.log('DB initialized at', dbPath);
