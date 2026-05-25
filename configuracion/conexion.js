const mysql = require('mysql2');

/* CONEXIÓN MYSQL */
const conexion = mysql.createConnection({

    host: 'localhost',

    user: 'root',

    password: 'Visita+2026',

    database: 'visita_quibdo'

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