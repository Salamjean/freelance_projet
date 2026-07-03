const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'freelance_db'
  });

  const [rows] = await connection.execute('SELECT * FROM Project');
  console.log("Projects in DB:");
  console.log(rows);

  await connection.end();
}

main().catch(console.error);
