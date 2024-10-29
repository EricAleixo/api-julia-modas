import express, { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import cors from "cors"

const app = express()
const prisma = new PrismaClient()
const porta = process.env.PORT ?? 3000

app.use(express.json())
app.use(cors())

const corsOptions = {
    origin: '',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
  };
  
app.use(cors(corsOptions))

app.get("/client", async (req: Request, res: Response) => {

    try {
        const clientes = await prisma.clients.findMany()
        res.status(200).json({
            "mensagem": "Consulta realizada com sucesso!",
            "query": clientes
        })
    } catch (error) {
        res.status(400).json({
            "mensagem": "Erro ao realizar a consulta.",
            "query": error
        })
    } finally {
        await prisma.$disconnect()
    }

})

app.post("/client", async (req: Request, res: Response) => {

    try {
        const { nome, email, senha, vip, totalCompras } = req.body
        await prisma.clients.create({
            data: {
                nome: nome,
                email: email,
                senha: senha,
                vip: vip,
                total_compras: totalCompras
            }
        })
        res.status(201).json({
            "mensagem": `Usuário "${nome}" cadastrado com sucesso!`
        })
    } catch (error) {
        res.status(400).json({
            "mensagem": "Erro ao realizar a consulta.",
            "query": error
        })
    } finally {
        prisma.$disconnect()
    }

})
app.put("/client/:id", async (req: Request, res: Response) => {

    try {
        const idQuery = req.params.id
        const idUser = Number(idQuery)
        
        const {nome, email, senha, vip, totalCompras } = req.body
        await prisma.clients.update({
            where: {
                id: idUser
            },
            data: {
                nome: nome,
                email: email,
                senha: senha,
                vip: vip,
                total_compras: totalCompras
            }
        })
        res.status(201).json({
            "mensagem": `Usuário "${nome}" atualizado com sucesso!`
        })
    } catch (error) {
        res.status(400).json({
            "mensagem": "Erro ao realizar a atualização.",
            "query": error
        })
    } finally {
        prisma.$disconnect()
    }

})

app.delete("/client/:id", async (req: Request, res: Response)=>{

    try{

        const idQuery = req.params.id
        const idUser = Number(idQuery)

        const nome = await prisma.clients.findUnique({
            where:{
                id: idUser
            }
        })

        await prisma.clients.delete({
            where:{
                id: idUser
            }
        })

        res.status(201).json({
            "mensagem": `Usuário ${nome?.nome} deletado com sucesso`
        })

    } catch (error) {
        res.status(400).json({
            "mensagem": "Erro ao realizar a atualização.",
            "query": error
        })
    } finally {
        prisma.$disconnect()
    }

})

app.listen(porta, () => console.log(`API no ar em 'https://localhost:${porta}'`))
