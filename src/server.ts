import express from "express";
import "express-async-errors";
import "reflect-metadata";
import createConnection from "./database";
import { router } from "./routes";

createConnection();
const server = express();

server.use(express.json());
server.use(router);

server.listen(process.env.PORT, () =>
  console.log(`Server is running in port ${process.env.PORT}`)
);
