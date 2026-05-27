const express = require('express');

module.exports = (conexion)=>{

const router =
express.Router();

/* =====================================
   PANEL DATOS
===================================== */

router.get(

'/panel-datos',

(req,res)=>{

/* LOGIN */
if(!req.session.usuario){

return res.json({

ok:false,

mensaje:
'Debes iniciar sesión'

});

}

const idUsuario =
req.session.usuario.id;

/* SQL */
const sql = `

SELECT *

FROM emprendedores

WHERE usuario_id = ?

ORDER BY id DESC

`;

conexion.query(

sql,

[idUsuario],

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:
'Error servidor'

});

}

/* NO TIENE */
if(resultados.length === 0){

return res.json({

ok:true,

tieneDatos:false,

emprendimientos:[]

});

}

/* RESPUESTA */
res.json({

ok:true,

tieneDatos:true,

emprendimientos:
resultados

});

}

);

}

);

/* =====================================
   EMPRENDIMIENTO ACTUAL
===================================== */

router.get(

'/emprendimiento',

(req,res)=>{

if(!req.session.usuario){

return res.status(401).json({
ok:false
});

}

const sql = `

SELECT *

FROM emprendedores

WHERE usuario_id = ?

`;

conexion.query(

sql,

[req.session.usuario.id],

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

res.json({

ok:true,

datos:
resultados[0]

});

}

);

}

);

/* =====================================
   ELIMINAR EMPRENDIMIENTO
===================================== */

router.delete(

'/eliminar-emprendimiento/:id',

(req,res)=>{

if(!req.session.usuario){

return res.json({

ok:false,

mensaje:
'No autorizado'

});

}

const id =
req.params.id;

/* ELIMINAR IMAGENES */
conexion.query(

`
DELETE FROM imagenes_emprendedores

WHERE emprendimiento_id=?
`,

[id],

(errorImagenes)=>{

if(errorImagenes){

console.log(
'ERROR IMAGENES:',
errorImagenes
);

}

/* ELIMINAR EMPRENDIMIENTO */
conexion.query(

`
DELETE FROM emprendedores

WHERE id=?
AND usuario_id=?
`,

[
id,
req.session.usuario.id
],

(error)=>{

if(error){

console.log(
'ERROR EMPRENDIMIENTO:',
error
);

return res.json({

ok:false,

mensaje:
'Error servidor'

});

}

res.json({

ok:true

});

}

);

}

);

}
);

return router;

};