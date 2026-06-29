import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

//make public folder visable to web
app.use(express.static(path.join(__dirname, 'public')));

//get request for root to go to index.html
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//listen on the correct port
app.listen(port, () => {
    console.log(`Server is live at: localhost${port}`);
});
