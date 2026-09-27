const sql = require("mssql/msnodesqlv8");
require("dotenv").config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        trustedConnection: true,
        trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERTIFICATE || "true").toLowerCase() === "true",
        encrypt: String(process.env.DB_ENCRYPT || "false").toLowerCase() === "true"
    },
    driver: process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server"
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
        console.log("✅ Connected to SQL Server");
        console.log(`📦 Database: ${process.env.DB_DATABASE}`);
        return pool;
    })
    .catch((error) => {
        console.error("❌ Database connection failed:");
        console.error(error);
        throw error;
    });

module.exports = { sql, poolPromise };
