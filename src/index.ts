import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

import clientCrud from "./routes/client/crud"
import produtosCrud from "./routes/produtos/crud"

const app = express();
const prisma = new PrismaClient();
const porta = process.env.PORT ?? 5263;

app.use(express.json());
app.use(cors());

const corsOptions = {
  origin: "",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

//Rota de client
app.use("/client", clientCrud)

//Rota de produtos
app.use("/produtos",produtosCrud)
//Rota privada

const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token: string = authHeader?.split(" ")[1] as string;

  if (!token) {
    res.status(401).json({
      msg: "Acesso negado",
    });
  }

  try {
    const secret: string = process.env.SECRET as string;

    jwt.verify(token, secret);

    next();
  } catch (error) {
    res.status(400).json({ msg: "Token inválido" });
  }
};

app.get("/client/:id", verificarToken, async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const cliente = await prisma.clients.findUnique({
    where: {
      id: id,
    },
    select: {
      nome: true,
      email: true,
      vip: true,
      total_compras: true,
      data_criacao: true,
    },
  });

  res.status(200).json({
    msg: "Usuário encontrado",
    query: cliente,
  });
});

//Rota de autenticação
app.post("/auth/client", async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    const cliente = await prisma.clients.findUnique({
      where: {
        email: email,
      },
    });

    if (cliente === null) {
      res.status(404).json({
        msg: "Usuário não encontrado",
      });
      return;
    }

    const compararSenha = await compare(senha, cliente?.senha);

    if (!compararSenha) {
      res.status(404).json({
        msg: "Senha incorreta",
      });
      return;
    }

    const secret: string = process.env.SECRET as string;
    if (!secret) {
      res.status(500).json({
        msg: "Erro na configuração do servidor",
      });
    }

    const token = jwt.sign(
      {
        id: cliente.id,
      },
      secret
    );

    res.status(200).json({
      msg: "Usuário autenticado",
      query: token,
    });
  } catch (error) {
    res.status(404).json({
      mensagem: error,
    });
  } finally {
    prisma.$disconnect();
  }
});


app.listen(porta, () =>
  console.log(`API no ar em 'https://localhost:${porta}'`)
);
