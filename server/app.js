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
    const {
      project_name,
      project_room,
      project_money,
      project_type,
      project_remark
    } = req.body;

    // 更新 SQL 语句以包含新字段
    const sql = `UPDATE project_table SET project_name = ?, project_room = ?, project_money = ?, project_type = ?, project_remark = ? WHERE project_id = ?`;

    connection.query(
      sql,
      [
        project_name,
        project_room,
        project_money,
        project_type,
        project_remark,
        id
      ],
      (error, results) => {
        if (error) {
          console.error("Error updating data:", error);
          res
            .status(500)
            .send("Error updating data in database: " + error.message);
        } else {
          console.log("Updated data:", results);
          res.send("Data updated successfully");
        }
      }
    );
  });

  //
  // 项目表添加新数据
  app.post("/api/projects", (req, res) => {
    const {
      project_name,
      project_room,
      project_money,
      project_type,
      project_remark
    } = req.body;
    const sql = `INSERT INTO project_table (project_name, project_room, project_money, project_type, project_remark) VALUES (?, ?, ?, ?, ?)`;
    connection.query(
      sql,
      [project_name, project_room, project_money, project_type, project_remark],
      (error, results) => {
        if (error) {
          console.error("Error inserting data:", error);
          res
            .status(500)
            .send("Error inserting data into database: " + error.message);
        } else {
          console.log("Data inserted successfully:", results);
          res.status(201).send("Data inserted successfully");
        }
      }
    );
  });
  // 项目表删除数据
  app.delete("/api/projects/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM project_table WHERE project_id = ?";
    connection.query(sql, [id], (error, results) => {
      if (error) {
        console.error("Error deleting project:", error);
        res
          .status(500)
          .send("Error deleting project from database: " + error.message);
      } else {
        console.log("Deleted data:", results);
        if (results.affectedRows === 0) {
          res.status(404).send("Project not found or already deleted");
        } else {
          res.send("Project deleted successfully");
        }
      }
    });
  });

  // 获取合同表
  app.get("/api/contracts", (req, res) => {
    connection.query("SELECT * FROM contract_table", (error, results) => {
      console.log("Error:", error); // 输出错误信息
      console.log("Data:", results); // 输出查询结果
      if (error) {
        res.status(500).send("Error fetching data from database");
      } else {
        res.json(results);
      }
    });
  });
  // 合同表更新项目数据
  app.put("/api/contracts/:id", (req, res) => {
    const { id } = req.params;
    const {
      project_id,
      contract_member: contract_member,
      contract_money
    } = req.body;
    const sql = `UPDATE contract_table SET project_id = ?, contract_member = ?, contract_money = ? WHERE contract_id = ?`;
    connection.query(
      sql,
      [project_id, contract_member, contract_money, id],
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
  // 获取项目表的单个项目的详细信息
  app.get("/api/projects/:id", (req, res) => {
    const { id } = req.params;
    connection.query(
      "SELECT * FROM project_table WHERE project_id = ?",
      [id],
      (error, results) => {
        if (error) {
          console.error("Error fetching project:", error);
          res.status(500).send("Error fetching project data from database");
        } else {
          if (results.length > 0) {
            res.json(results[0]); // 发送单个项目数据
          } else {
            res.status(404).send("Project not found");
          }
        }
      }
    );
  });

  // 获取支付表
  app.get("/api/payments", (req, res) => {
    connection.query("SELECT * FROM pay_table", (error, results) => {
      console.log("Error:", error); // 输出错误信息
      console.log("Data:", results); // 输出查询结果
      if (error) {
        res.status(500).send("Error fetching data from database");
      } else {
        res.json(results);
      }
    });
  });
  // 支付表更新项目数据

  app.put("/api/payments/:id", (req, res) => {
    const { id } = req.params;
    const { contract_id, pay_money, pay_time, pay_state } = req.body;

    console.log("Received update for:", id);
    console.log("New pay_state:", pay_state);

    const sql = `UPDATE pay_table SET contract_id = ?, pay_money = ?, pay_time = ?, pay_state = ? WHERE pay_id = ?`;
    connection.query(
      sql,
      [contract_id, pay_money, pay_time, pay_state, id],
      (error, results) => {
        if (error) {
          console.error("Error updating payment data:", error);
          res
            .status(500)
            .send("Error updating payment data in database: " + error.message);
        } else {
          console.log("Update results:", results);
          if (results.affectedRows === 0) {
            res.status(404).send("No payment found with that ID.");
          } else {
            res.send("Payment data updated successfully");
          }
        }
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
