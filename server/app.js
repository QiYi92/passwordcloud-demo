// 导入 Express 和 mysql2 库
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import {
  addProject,
  deleteProject,
  getAllProjects,
  updateProject
} from "./project/projectController.js";
import {
  getAllContract,
  addContract,
  updateContract,
  deleteContract
} from "./contract/contractController.js";
import {
  getAllPayments,
  addPayment,
  updatePayment,
  deletePayment
} from "./pay/payController.js";
import smCrypto from "sm-crypto";
const { sm3 } = smCrypto;
const app = express();
const port = 3000;

// 解析 JSON 请求体
app.use(express.json());

// 创建数据库连接
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "passwordcloud"
});

// 测试数据库连接
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");

  // 配置 CORS
  app.use(
    cors({
      origin: "http://localhost:8848", // 允许来自这个域的请求
      methods: ["GET", "POST", "PUT", "DELETE"], // 允许的 HTTP 方法
      allowedHeaders: ["Content-Type", "Authorization"] // 允许的请求头
    })
  );

  // 示例路由
  app.get("/api/data", (req, res) => {
    connection.query("SELECT * FROM your_table", (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const encryptedPassword = sm3(password);
    console.log(`Received password: ${password}`);
    console.log(`Encrypted password: ${encryptedPassword}`);

    connection.query(
      "SELECT * FROM user WHERE username = ? AND password = ?",
      [username, encryptedPassword],
      (error, results) => {
        if (error) {
          console.error("Database error:", error);
          res.status(500).send({ success: false, message: "数据库错误" });
        } else if (results.length > 0) {
          console.log("Login successful for:", username);
          res.send({ success: true, message: "登录成功" });
        } else {
          console.log("Login failed for:", username);
          res.status(401).send({ success: false, message: "用户名或密码错误" });
        }
      }
    );
  });

  // 获取项目表
  app.get("/api/projects", (req, res) => {
    getAllProjects((error, results) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.json(results);
      }
    });
  });
  // 项目表更新项目数据
  app.put("/api/projects/:id", (req, res) => {
    updateProject(req.params.id, req.body, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.send(response.message);
      }
    });
  });
  // 项目表添加新数据
  app.post("/api/projects", (req, res) => {
    addProject(req.body, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.status(201).send(response.message);
      }
    });
  });
  // 项目表删除数据
  app.delete("/api/projects/:id", (req, res) => {
    deleteProject(req.params.id, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.send(response.message);
      }
    });
  });

  // 获取合同表
  app.get("/api/contracts", (req, res) => {
    getAllContract((error, results) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.json(results);
      }
    });
  });

  // 更新合同数据
  app.put("/api/contracts/:id", (req, res) => {
    updateContract(req.params.id, req.body, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.send(response.message);
      }
    });
  });

  // 添加新合同数据
  app.post("/api/contracts", (req, res) => {
    addContract(req.body, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.status(201).send(response.message);
      }
    });
  });

  // 删除合同数据
  app.delete("/api/contracts/:id", (req, res) => {
    deleteContract(req.params.id, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.send(response.message);
      }
    });
  });

  // 获取支付表
  app.get("/api/payments", (req, res) => {
    getAllPayments((error, results) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.json(results);
      }
    });
  });

  // 更新支付数据
  app.put("/api/payments/:id", (req, res) => {
    updatePayment(req.params.id, req.body, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.send(response.message);
      }
    });
  });

  // 添加新支付数据
  app.post("/api/payments", (req, res) => {
    addPayment(req.body, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.status(201).send(response.message);
      }
    });
  });

  // 删除支付数据
  app.delete("/api/payments/:id", (req, res) => {
    deletePayment(req.params.id, (error, response) => {
      if (error) {
        res.status(error.status).send(error.message);
      } else {
        res.send(response.message);
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
