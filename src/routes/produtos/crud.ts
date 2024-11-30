import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

const prisma = new PrismaClient();
const rotas = express.Router();

rotas.get("/exibirprodutos", async (req: Request, res: Response) => {
  try {
    const produtos = await prisma.produtos.findMany();

    if (produtos.length === 0) {
      res.status(200).json({
        mensagem: "Consulta realizada com sucesso",
        query: "Nenhum produto encontrado",
      });
      return;
    }

    res.status(200).json({
      mensagem: "Consulta realizada com sucesso",
      query: produtos,
    });
  } catch (error) {
    res.status(400).json({
      mensagem: "Falha na consulta",
      query: error,
    });
  } finally {
    await prisma.$disconnect();
  }
});

rotas.post("/adicionarprodutos", async (req: Request, res: Response) => {
  try {
    //Mais de 1 item
    if (Array.isArray(req.body)) {
      for (let i of req.body) {
        const { imagemURL, nome, preco, fornecedor, desconto } = i;

        await prisma.produtos.create({
          data: {
            imagemURL: imagemURL,
            nome: nome,
            preco: preco,
            fornecedor: fornecedor,
            desconto: desconto,
          },
        });
      }
      res.status(200).json({
        mensagem: "Consulta realizada com sucesso",
        query: `Produtos cadastrados`,
      });
      return;
    }

    //Só 1 item
    const { imagemURL, nome, preco, fornecedor, desconto } = req.body;

    await prisma.produtos.create({
      data: {
        imagemURL: imagemURL,
        nome: nome,
        preco: preco,
        fornecedor: fornecedor,
        desconto: desconto,
      },
    });

    res.status(200).json({
      mensagem: "Consulta realizada com sucesso",
      query: `${nome} cadastrado!`,
    });
  } catch (error) {
    res.status(400).json({
      mensagem: "Falha na consulta",
      query: error,
    });
  } finally {
    await prisma.$disconnect();
  }
});

rotas.delete("/deletarprodutos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.produtos.delete({
      where: {
        id: id,
      },
    });

    res.status(202).json({
      mensagem: "Consulta realizada com sucesso!",
      query: "Produto deletado com sucesso",
    });
  } catch (error) {
    res.status(400).json({
      mensagem: "Falha na consulta",
      query: error,
    });
  } finally {
    await prisma.$disconnect();
  }
});

export default rotas;
