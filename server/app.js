// 导入 Express 和 mysql2 库
import express from "express";
import mysql from "mysql2";
import cors from "cors";

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

  // 获取项目表
  app.get("/api/projects", (req, res) => {
    connection.query("SELECT * FROM project_table", (error, results) => {
      console.log("Error:", error); // 输出错误信息
      console.log("Data:", results); // 输出查询结果
      if (error) {
        res.status(500).send("Error fetching data from database");
      } else {
        res.json(results);
      }
    });
  });
  // 项目表更新项目数据
  app.put("/api/projects/:id", (req, res) => {
    const { id } = req.params;
    const { project_name, project_room, project_money } = req.body;
    const sql = `UPDATE project_table SET project_name = ?, project_room = ?, project_money = ? WHERE project_id = ?`;
    connection.query(
      sql,
      [project_name, project_room, project_money, id],
      (error, results) => {
        if (error) {
          console.log("Error updating data:", error);
          res.status(500).send("Error updating data in database");
        } else {
          console.log("Updated data:", results);
          res.send("Data updated successfully");
        }
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
