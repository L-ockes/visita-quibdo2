const express = require('express');

module.exports = (conexion)=>{

const router =
express.Router();

/* =====================================
   VER EMPRENDIMIENTO
===================================== */

router.get(

'/emprendimiento/:id',

(req,res)=>{

const id =
req.params.id;

/* SQL */
const sql = `

SELECT

e.*,

u.nombre AS usuario_nombre,
u.telefono AS usuario_telefono,
u.correo AS usuario_correo

FROM emprendedores e

LEFT JOIN usuarios u
ON e.usuario_id = u.id

WHERE e.id = ?

`;

conexion.query(

sql,

[id],

(error,resultados)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

if(resultados.length === 0){

return res.json({
ok:false
});

}

const emprendimiento =
resultados[0];

/* =====================================
   IMAGENES
===================================== */

conexion.query(

`
SELECT *

FROM imagenes_emprendedores

WHERE emprendimiento_id=?

ORDER BY id ASC
`,

[id],

(errorImagenes,imagenes)=>{

if(errorImagenes){

console.log(errorImagenes);

return res.json({
ok:false
});

}

/* AGREGAR */
emprendimiento.imagenes_extra =
imagenes;

/* RESPUESTA */
res.json({

ok:true,

emprendimiento

});

}

);

}

);

}

);

return router;

};