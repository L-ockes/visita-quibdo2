const express =
require('express');

const router =
express.Router();

const multer =
require('multer');

const path =
require('path');

/* =====================================
   MULTER
===================================== */

const storage =
multer.diskStorage({

destination:
function(req,file,cb){

cb(
null,
'publico/fotos'
);

},

filename:
function(req,file,cb){

cb(

null,

Date.now()

+

path.extname(
file.originalname
)

);

}

});

const upload =
multer({

storage

});

/* =====================================
   EXPORTAR
===================================== */

module.exports = function(
conexion
){

/* =====================================
   OBTENER EMPRENDIMIENTO
===================================== */

router.get(

'/editar-emprendimiento/:id',

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

/* SQL */
conexion.query(

`
SELECT *

FROM emprendedores

WHERE id=?
AND usuario_id=?
`,

[
id,
req.session.usuario.id
],

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

tieneDatos:true,

emprendimiento:
resultados[0]

});

}

);

}

/* =====================================
   EDITAR EMPRENDIMIENTO
===================================== */

);

router.post(

'/editar-emprendimiento',

upload.fields([

{
name:'foto',
maxCount:1
},

{
name:'imagenes_extra',
maxCount:15
}

]),

(req,res)=>{

try{

if(
!req.session.usuario
){

return res.json({
ok:false
});

}

const idUsuario =
req.session.usuario.id;

/* CAMPOS */
const {

nombre_emprendimiento,
categoria,
ubicacion,
horarios,
servicios,
telefono,
descripcion

} = req.body;

/* FOTO */
let foto = null;

if(

req.files
&&
req.files['foto']
&&
req.files['foto'][0]

){

foto =
'fotos/' +

req.files['foto'][0]
.filename;

}

/* EXTRA */
const imagenesExtra =

req.files
&&
req.files['imagenes_extra']

?

req.files['imagenes_extra']

:

[];

/* ID */
const id =
req.body.id;

/* SQL */
let sql = `

UPDATE emprendedores

SET

nombre_emprendimiento=?,
categoria=?,
ubicacion=?,
horarios=?,
servicios=?,
telefono=?,
descripcion=?

`;

let valores = [

nombre_emprendimiento,
categoria,
ubicacion,
horarios,
servicios,
telefono,
descripcion

];

/* FOTO */
if(foto){

sql += `,
foto=?
`;

valores.push(
foto
);

}

/* WHERE */
sql += `
WHERE id=?
AND usuario_id=?
`;

valores.push(
id,
idUsuario
);

/* UPDATE */
conexion.query(

sql,

valores,

(error)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:
'Error al actualizar'

});

}

/* TELEFONO */
conexion.query(

`
UPDATE usuarios
SET telefono=?
WHERE id=?
`,

[
telefono,
idUsuario
]

);

/* IMAGENES EXTRA */
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
id,
'fotos/' + imagen.filename
]

);

});

/* RESPUESTA */
res.json({

ok:true,

mensaje:
'Actualizado'

});

}

);

}catch(error){

console.log(error);

res.json({

ok:false,

mensaje:
'Error servidor'

});

}

}

);

return router;

};

