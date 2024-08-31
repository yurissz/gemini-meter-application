import dotenv from 'dotenv'
import express from 'express'
import { route } from './routes/routes'

dotenv.config()

const app = express()

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.use((req, res, next) => {
    res.setHeader('Acess-Control-Alow-Origin', '*')
    res.setHeader('Acess-Control-Alow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Acess-Control-Alow-Headers', 'Content-Type')
    next()
})

app.use(route);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
