import express, { Request, Response} from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const rotas = express.Router();

rotas.get("/exibirclients", async (req: Request, res: Response) => {
  try {
    const clientes = await prisma.clients.findMany();
    res.status(200).json({
      mensagem: "Consulta realizada com sucesso!",
      query: clientes,
    });
  } catch (error) {
    res.status(400).json({
      mensagem: "Erro ao realizar a consulta.",
      query: error,
    });
  } finally {
    await prisma.$disconnect();
  }
});

rotas.post("/adicionarclients", async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, vip, totalCompras } = req.body;

    if (!nome) {
      res.status(400).json({
        msg: "O nome não foi cadastrado",
      });
      return;
    }
    if (!email) {
      res.status(400).json({
        msg: "O email não foi cadastrado",
      });
      return;
    }
    if (!senha) {
      res.status(400).json({
        msg: "A senha não foi cadastrada",
      });
      return;
    }

    const sal = 10;
    const senhaCriptografada = await bcrypt.hash(senha, sal);
    await prisma.clients.create({
      data: {
        nome: nome,
        email: email,
        senha: senhaCriptografada,
        vip: vip,
        total_compras: totalCompras,
      },
    });
    res.status(201).json({
      mensagem: `Usuário "${nome}" cadastrado com sucesso!`,
    });
  } catch (error) {
    console.error("Erro na autenticação:", error);
    res.status(400).json({
      msg: "Erro na autenticação",
      detalhe: error instanceof Error ? error.message : "Erro desconhecido",
    });
  } finally {
    prisma.$disconnect();
  }
});

rotas.put("/atualizarclient/:id", async (req: Request, res: Response) => {
  try {
    const idQuery = req.params.id;
    const idUser = Number(idQuery);

    const nomeAntigo = await prisma.clients.findUnique({
      where: {
        id: idUser,
      },
    });

    const { nome, email, senha, vip, totalCompras } = req.body;
    await prisma.clients.update({
      where: {
        id: idUser,
      },
      data: {
        nome: nome,
        email: email,
        senha: senha,
        vip: vip,
        total_compras: totalCompras,
      },
    });
    res.status(201).json({
      mensagem: `Usuário "${nomeAntigo?.nome}" atualizado com sucesso!`,
    });
  } catch (error) {
    res.status(400).json({
      mensagem: "Erro ao realizar a atualização.",
      query: error,
    });
  } finally {
    prisma.$disconnect();
  }
});

rotas.delete("/deletarclient/:id", async (req: Request, res: Response) => {
  try {
    const idQuery = req.params.id;
    const idUser = Number(idQuery);

    const nome = await prisma.clients.findUnique({
      where: {
        id: idUser,
      },
    });

    await prisma.clients.delete({
      where: {
        id: idUser,
      },
    });

    res.status(201).json({
      mensagem: `Usuário ${nome?.nome} deletado com sucesso`,
    });
  } catch (error) {
    res.status(400).json({
      mensagem: "Erro ao realizar a atualização.",
      query: error,
    });
  } finally {
    prisma.$disconnect();
  }
});

export default rotas