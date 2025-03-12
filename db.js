const mysql = require("mysql2/promise");

module.exports = async function sqlConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASENAME,
    });

    return connection;
  } catch (e) {
    console.error("e", e);
  }
};
