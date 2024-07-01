import express from "express";
import mysql from "mysql2";
import smCrypto from "sm-crypto";

const app = express();
app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "passwordcloud"
});

connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

// 添加初始管理员账号
app.get("/addAdmin", (req, res) => {
  const username = "admin";
  const password = "admin123";
  const encryptedPassword = smCrypto.sm3(password);

  connection.query(
    "INSERT INTO user (username, password) VALUES (?, ?)",
    [username, encryptedPassword],
    error => {
      if (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "数据库错误" });
      } else {
        res.send({ success: true, message: "管理员账户已创建" });
      }
    }
  );
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
