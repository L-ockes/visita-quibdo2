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
   EDITAR EMPRENDIMIENTO
===================================== */

module.exports = function(
conexion
){

router.post(

'/editar-emprendimiento',

upload.fields([

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

try{

/* =====================================
   USUARIO
===================================== */

if(
!req.session
||
!req.session.usuario
){

return res.json({

ok:false,

mensaje:
'Sesión no iniciada'

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

req.files['imagenes_extra']

?

req.files['imagenes_extra']

:

[];

/* SQL */
let sql = `

UPDATE emprendedores

SET

nombre_emprendimiento=?,
categoria=?,
ubicacion=?,
horarios=?,
servicios=?,
descripcion=?

`;

let valores = [

nombre_emprendimiento,   
categoria,
ubicacion,
horarios,
servicios,
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
`;

valores.push(
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

/* =====================================
   TELEFONO USUARIO
===================================== */

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

/* =====================================
   IMAGENES EXTRA
===================================== */

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
idUsuario,
'fotos/' + imagen.filename
]

);

});

/* RESPUESTA */
res.json({

ok:true,

mensaje:
'Emprendimiento actualizado'

});

}

);

}catch(error){

console.log(error);

res.json({

ok:false,

mensaje:
'Error del servidor'

});

}

}

);

return router;

};