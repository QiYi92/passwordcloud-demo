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

export const getAllContract = callback => {
  connection.query("SELECT * FROM contract_table", (error, results) => {
    if (error) {
      handleError(error, callback);
    } else {
      callback(null, results);
    }
  });
};

export const addContract = (contract, callback) => {
  const {
    contract_name,
    project_name,
    contract_member,
    contract_type,
    contract_money,
    contract_remark
  } = contract;
  const sql = `INSERT INTO contract_table ( contract_name, project_name, contract_member, contract_type, contract_money, contract_remark ) VALUES (?, ?, ?, ?, ?, ?)`;
  connection.query(
    sql,
    [
      contract_name,
      project_name,
      contract_member,
      contract_type,
      contract_money,
      contract_remark
    ],
    (error, results) => {
      if (error) {
        handleError(error, callback);
      } else {
        callback(null, { message: "Data inserted successfully", results });
      }
    }
  );
};

export const updateContract = (id, contract, callback) => {
  const {
    contract_name,
    project_name,
    contract_member,
    contract_type,
    contract_money,
    contract_remark
  } = contract;
  const sql = `UPDATE contract_table SET contract_name = ?, project_name = ?, contract_member = ?, contract_type = ?, contract_money = ?, contract_remark = ? WHERE contract_id = ?`;
  connection.query(
    sql,
    [
      contract_name,
      project_name,
      contract_member,
      contract_type,
      contract_money,
      contract_remark,
      id
    ],
    (error, results) => {
      if (error) {
        handleError(error, callback);
      } else {
        callback(null, { message: "Contract updated successfully", results });
      }
    }
  );
};

export const deleteContract = (id, callback) => {
  const sql = "DELETE FROM contract_table WHERE contract_id = ?";
  connection.query(sql, [id], (error, results) => {
    if (error) {
      handleError(error, callback);
    } else {
      if (results.affectedRows === 0) {
        callback({
          status: 404,
          message: "Contract not found or already deleted"
        });
      } else {
        callback(null, { message: "Contract deleted successfully", results });
      }
    }
  });
};
