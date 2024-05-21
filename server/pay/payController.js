// server/pay/payController.js
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

export const getAllPayments = callback => {
  connection.query("SELECT * FROM pay_table", (error, results) => {
    if (error) {
      handleError(error, callback);
    } else {
      callback(null, results);
    }
  });
};

export const addPayment = (payment, callback) => {
  const {
    pay_name,
    contract_name,
    pay_type,
    pay_money,
    pay_time,
    pay_state,
    pay_remark
  } = payment;
  const sql = `INSERT INTO pay_table (pay_name ,contract_name, pay_type, pay_money, pay_time, pay_state, pay_remark) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  connection.query(
    sql,
    [
      pay_name,
      contract_name,
      pay_type,
      pay_money,
      pay_time,
      pay_state,
      pay_remark
    ],
    (error, results) => {
      if (error) {
        handleError(error, callback);
      } else {
        callback(null, { message: "Payment inserted successfully", results });
      }
    }
  );
};

export const updatePayment = (id, payment, callback) => {
  const {
    pay_name,
    contract_name,
    pay_type,
    pay_money,
    pay_time,
    pay_state,
    pay_remark
  } = payment;
  const sql = `UPDATE pay_table SET pay_name = ?, contract_name = ?, pay_type = ?, pay_money = ?, pay_time = ?, pay_state = ?, pay_remark = ? WHERE pay_id = ?`;
  connection.query(
    sql,
    [
      pay_name,
      contract_name,
      pay_type,
      pay_money,
      pay_time,
      pay_state,
      pay_remark,
      id
    ],
    (error, results) => {
      if (error) {
        handleError(error, callback);
      } else {
        callback(null, { message: "Payment updated successfully", results });
      }
    }
  );
};

export const deletePayment = (id, callback) => {
  const sql = "DELETE FROM pay_table WHERE pay_id = ?";
  connection.query(sql, [id], (error, results) => {
    if (error) {
      handleError(error, callback);
    } else {
      if (results.affectedRows === 0) {
        callback({
          status: 404,
          message: "Payment not found or already deleted"
        });
      } else {
        callback(null, { message: "Payment deleted successfully", results });
      }
    }
  });
};
