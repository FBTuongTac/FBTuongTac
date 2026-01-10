const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '#Trang21012022',
    database: 'fbtuongtac',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
