const express = require('express');
const multer = require('multer');

module.exports = (conexion)=>{

const router =
express.Router();

/* =====================================
   MULTER
===================================== */

const almacenamiento =
multer.diskStorage({

destination:(req,file,cb)=>{

cb(
null,
'publico/fotos'
);

},

filename:(req,file,cb)=>{

cb(

null,

Date.now() +
'_' +
file.originalname

);

}

});

const subirFoto =
multer({

storage:almacenamiento

});

/* =====================================
   CATEGORIAS
===================================== */

router.get(

'/categorias',

(req,res)=>{

const sql = `

SELECT *

FROM categorias

ORDER BY nombre_categoria ASC

`;

conexion.query(

sql,

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
   SERVICIOS
===================================== */

router.get(

'/servicios',

(req,res)=>{

const sql = `

SELECT *

FROM servicios

ORDER BY nombre_servicio ASC

`;

conexion.query(

sql,

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
   CREAR EMPRENDIMIENTO
===================================== */

router.post(

'/crear-emprendimiento',

subirFoto.fields([

{
name:'foto',
maxCount:1
},

{
name:'imagenes_extra',
maxCount:5
}

]),

(req,res)=>{

/* LOGIN */
if(!req.session.usuario){

return res.status(401).json({

ok:false,

mensaje:
'No autorizado'

});

}

const {

nombre_emprendimiento = '',
categoria = '',
descripcion = '',
ubicacion = '',
horarios = '',
servicios = '',
telefono = ''

} = req.body;

/* FOTO */
let foto = '';

if(
req.files
&&
req.files.foto
&&
req.files.foto[0]
){

foto =
'fotos/' + req.files.foto[0].filename

}

/* SQL */
const sql = `

INSERT INTO emprendedores(

usuario_id,
nombre_emprendimiento,
categoria,
descripcion,
ubicacion,
horarios,
servicios,
telefono,
foto,
rol,
estado

)

VALUES(

?,?,?,?,?,?,?,?,?,?,?

)

`;

conexion.query(

sql,

[
req.session.usuario.id,
nombre_emprendimiento,
categoria,
descripcion,
ubicacion,
horarios,
servicios,
telefono,
foto,
'emprendedor',
'pendiente'
],

(error,resultado)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:error.sqlMessage

});

}

/* =====================================
   IMAGENES EXTRA
===================================== */

const imagenesExtra =

req.files
&&
req.files['imagenes_extra']

?

req.files['imagenes_extra']

:

[];

/* INSERTAR */
imagenesExtra.forEach(imagen=>{

conexion.query(

`
INSERT INTO imagenes_emprendedores(

emprendimiento_id,
imagen

)

VALUES(?,?)
`,

[
resultado.insertId,
'fotos/' + imagen.filename
]

);

});

/* =====================================
   CAMBIAR ROL
===================================== */

conexion.query(

`
UPDATE usuarios
SET rol='emprendedor'
WHERE id=?
`,

[req.session.usuario.id],

(error)=>{

if(error){

console.log(
'ERROR CAMBIAR ROL:',
error
);

}

}

/* SESION */
);

req.session.usuario.rol =
'emprendedor';

/* RESPUESTA */
res.json({

ok:true,

mensaje:
'Emprendimiento registrado'

});

}

);

}

);

/* =====================================
   ELIMINAR IMAGEN
===================================== */

router.delete(

'/eliminar-imagen-emprendimiento/:id',

(req,res)=>{

if(
!req.session.usuario
){

return res.json({
ok:false
});

}

const id =
req.params.id;

/* BUSCAR IMAGEN */
conexion.query(

`
SELECT *

FROM imagenes_emprendedores

WHERE id=?
LIMIT 1
`,

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

const imagen =
resultados[0];

/* ELIMINAR MYSQL */
conexion.query(

`
DELETE FROM imagenes_emprendedores

WHERE id=?
`,

[id],

(error2)=>{

if(error2){

console.log(error2);

return res.json({
ok:false
});

}

/* ARCHIVO */
const fs =
require('fs');

const ruta =
'publico/' + imagen.imagen;

fs.unlink(

ruta,

(err)=>{

if(err){

console.log(
'ERROR BORRANDO ARCHIVO:',
err
);

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

}
);

return router;

};