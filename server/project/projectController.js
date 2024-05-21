// server/project/projectController.js
import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "passwordcloud"
});

const handleError = (error, callback) => {
  console.error("Error in database operation:", error);
  callback({
    status: 500,
    message: "Database operation failed",
    detail: error.message
  });
};

export const getAllProjects = callback => {
  connection.query("SELECT * FROM project_table", (error, results) => {
    if (error) {
      handleError(error, callback);
    } else {
      callback(null, results);
    }
  });
};

export const addProject = (project, callback) => {
  const {
    project_name,
    project_room,
    project_money,
    project_type,
    project_remark
  } = project;
  const sql = `INSERT INTO project_table (project_name, project_room, project_money, project_type, project_remark) VALUES (?, ?, ?, ?, ?)`;
  connection.query(
    sql,
    [project_name, project_room, project_money, project_type, project_remark],
    (error, results) => {
      if (error) {
        handleError(error, callback);
      } else {
        callback(null, { message: "Data inserted successfully", results });
      }
    }
  );
};

export const updateProject = (id, project, callback) => {
  const {
    project_name,
    project_room,
    project_money,
    project_type,
    project_remark
  } = project;
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
        handleError(error, callback);
      } else {
        callback(null, { message: "Data updated successfully", results });
      }
    }
  );
};

export const deleteProject = (id, callback) => {
  const sql = "DELETE FROM project_table WHERE project_id = ?";
  connection.query(sql, [id], (error, results) => {
    if (error) {
      handleError(error, callback);
    } else {
      if (results.affectedRows === 0) {
        callback({
          status: 404,
          message: "Project not found or already deleted"
        });
      } else {
        callback(null, { message: "Project deleted successfully", results });
      }
    }
  });
};
