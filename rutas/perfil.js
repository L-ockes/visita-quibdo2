const express = require('express');
const router = express.Router();

const conexion =
require('../configuracion/conexion');

router.get(

'/perfil',

(req,res)=>{

    if(!req.session.usuario){

        return res.json({
            plan:'gratis',
            estado_pago:'activo'
        });

    }

    conexion.query(

        `
        SELECT
        plan,
        estado_pago,
        fecha_vencimiento
        FROM usuarios
        WHERE id=?
        LIMIT 1
        `,

        [req.session.usuario.id],

        (error,resultados)=>{

            if(error || resultados.length === 0){

                return res.json({
                    plan:'gratis',
                    estado_pago:'activo'
                });

            }

            const usuario =
resultados[0];

if(

usuario.fecha_vencimiento

&&

new Date(
usuario.fecha_vencimiento
)

<

new Date()

){

    conexion.query(

    `
    UPDATE usuarios
    SET
    plan='gratis',
    estado_pago='vencido'
    WHERE id=?
    `,

    [req.session.usuario.id]

);

conexion.query(

    `
    UPDATE emprendedores
    SET
    plan='gratis',
    estado_pago='vencido'
    WHERE usuario_id=?
    `,

    [req.session.usuario.id]

);

    return res.json({

        plan:'gratis',

        estado_pago:'vencido',

        fecha_vencimiento:null

    });

}

res.json(usuario);

        }

    );

}

);

module.exports = router;