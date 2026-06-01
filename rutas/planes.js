const express = require('express');
const router = express.Router();

const conexion = require('../configuracion/conexion');

router.post('/seleccionar-plan',(req,res)=>{

    if(!req.session.usuario){

        return res.json({
            success:false,
            message:'Debes iniciar sesión'
        });

    }

    const usuario_id = req.session.usuario.id;
const { plan } = req.body;

let estadoPago =
plan === 'premium'
? 'pendiente'
: 'activo';

const sql = `
UPDATE usuarios
SET
plan=?,
estado_pago=?
WHERE id=?
`;

conexion.query(

    sql,

    [
        plan,
        estadoPago,
        usuario_id
    ],

    (error)=>{

        if(error){

            console.log(error);

            return res.json({
                success:false,
                message:'Error servidor'
            });

        }

        res.json({
            success:true
        });

    }

);

});

module.exports = router;