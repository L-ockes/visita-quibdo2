const express = require('express');

module.exports = (conexion)=>{

const router =
express.Router();

/* =====================================
   EMPRENDIMIENTOS
===================================== */

router.get(

'/emprendimientos',

(req,res)=>{

const busqueda =
req.query.q || '';

const categoria =
req.query.categoria || '';

let sql = `

SELECT

e.*,

(
SELECT ROUND(
AVG(calificacion),
1
)

FROM resenas r

WHERE
r.tipo='emprendimiento'
AND
r.item_id = e.id

) AS promedio_resenas,

(
SELECT COUNT(*)

FROM resenas r2

WHERE
r2.tipo='emprendimiento'
AND
r2.item_id = e.id

) AS total_resenas

FROM emprendedores e

WHERE 1=1

AND estado='aprobado'

`;

let parametros = [];

/* BUSCADOR */
if(busqueda !== ''){

sql += `
AND nombre_emprendimiento LIKE ?
`;

const like =
`%${busqueda}%`;

parametros.push(
like
);

}

/* CATEGORIA */
if(categoria !== ''){

sql += `
AND LOWER(categoria)
LIKE LOWER(?)
`;

parametros.push(
`%${categoria}%`
);

}

/* ORDEN */
sql += `
ORDER BY

CASE

WHEN plan='premium'
THEN 1

ELSE 2

END,

id DESC
`;

/* CONSULTA */
conexion.query(

sql,

parametros,

(error,resultados)=>{

if(error){

console.log(error);

return res.json([]);

}

res.json(resultados);

}

);

}

);

/* =====================================
   EMPRENDIMIENTO
===================================== */

router.get(

'/emprendimiento/:id',

(req,res)=>{

const id =
req.params.id;

const sql = `

SELECT

e.*,

u.nombre AS usuario_nombre,
u.telefono AS usuario_telefono,
u.correo AS usuario_correo

FROM emprendedores e

JOIN usuarios u
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

/* IMAGENES */
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

emprendimiento.imagenes_extra =
imagenes;

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

/* =====================================
   IMAGENES EMPRENDIMIENTO
===================================== */

router.get(

'/imagenes-emprendimiento/:id',

(req,res)=>{

const id =
req.params.id;

conexion.query(

`
SELECT *

FROM imagenes_emprendedores

WHERE emprendimiento_id=?

ORDER BY id ASC
`,

[id],

(error,resultados)=>{

if(error){

console.log(error);

return res.json([]);

}

res.json(resultados);

}

);

}

);

return router;

};