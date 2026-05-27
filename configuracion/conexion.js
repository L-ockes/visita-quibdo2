const mysql = require('mysql2');

/* CONEXIÓN MYSQL */
const conexion = mysql.createPool({

host: process.env.DB_HOST,

user: process.env.DB_USER,

password: process.env.DB_PASSWORD,

database: process.env.DB_NAME,

port: process.env.DB_PORT,

waitForConnections: true,

connectionLimit: 10,

queueLimit: 0

});

/* VERIFICAR */
conexion.connect((error)=>{

    if(error){

        console.log(
            'Error de conexión',
            error
        );

        return;
    }

    console.log(
        'Conexión exitosa a MySQL'
    );

});

module.exports = conexion;