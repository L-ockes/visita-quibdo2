const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

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
   EDITAR USUARIO
===================================== */

router.post(

'/editar-usuario',

subirFoto.single('foto'),

async (req,res)=>{

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

/* DATOS */
const nombre =
req.body.nombre;

const telefono =
req.body.telefono;

/* FOTO ACTUAL */
conexion.query(

`
SELECT foto
FROM usuarios
WHERE id=?
LIMIT 1
`,

[idUsuario],

async (error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:
'Error servidor'

});

}

if(resultados.length === 0){

return res.json({

ok:false,

mensaje:
'Usuario no encontrado'

});

}

let nuevaFoto =
resultados[0].foto;

/* NUEVA FOTO */
if(req.file){

nuevaFoto =
'fotos/' + req.file.filename;

}

/* PASSWORD */
const pass1 =
req.body.pass1;

const pass2 =
req.body.pass2;

let sqlPassword = '';
let valoresPassword = [];

/* VALIDAR */
if(
pass1 !== '' ||
pass2 !== ''
){

if(pass1 !== pass2){

return res.json({

ok:false,

mensaje:
'Las contraseñas no coinciden'

});

}

/* SEGURIDAD */
const regex =
/^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

if(!regex.test(pass1)){

return res.json({

ok:false,

mensaje:
'La contraseña debe tener mínimo 6 caracteres, una letra y un número'

});

}

/* HASH */
const hash =
await bcrypt.hash(
pass1,
10
);

sqlPassword =
`, contrasena=?`;

valoresPassword.push(hash);

}

/* UPDATE */
const sql = `

UPDATE usuarios
SET

nombre=?,
telefono=?,
foto=?

${sqlPassword}

WHERE id=?

`;

const valores = [

nombre,
telefono,
nuevaFoto,

...valoresPassword,

idUsuario

];

/* GUARDAR */
conexion.query(

sql,

valores,

(error)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:error.sqlMessage

});

}

/* SESION */
req.session.usuario.nombre =
nombre;

req.session.usuario.foto =
nuevaFoto;

/* RESPUESTA */
res.json({

ok:true,

mensaje:
'Perfil actualizado correctamente'

});

}

);

}

);

}

);

/* =====================================
   DATOS USUARIO
===================================== */

router.get(

'/datos-usuario',

(req,res)=>{

/* LOGIN */
if(!req.session.usuario){

return res.json({

ok:false

});

}

const idUsuario =
req.session.usuario.id;

/* SQL */
const sql = `

SELECT

id,
nombre,
correo,
telefono,
foto,
rol

FROM usuarios

WHERE id = ?

`;

conexion.query(

sql,

[idUsuario],

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

usuario:
resultados[0]

});

}

);

}

);

return router;

};