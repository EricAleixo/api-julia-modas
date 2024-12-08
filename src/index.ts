import express from "express";
import cors from "cors";

import clientCrud from "./routes/client/crud"
import produtosCrud from "./routes/produtos/crud"

import autenticacaoCliente from "./routes/auth"

const app = express();
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
app.use("/auth", autenticacaoCliente)


app.listen(porta, () =>
  console.log(`API no ar em 'https://localhost:${porta}'`)
);
