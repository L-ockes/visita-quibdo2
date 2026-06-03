const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const router = express.Router();
const almacenamiento = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,'publico/fotos');
},

filename:(req,file,cb)=>{
cb(
null,
Date.now() + '_' + file.originalname
);
}

});

const subirFoto = multer({

storage:almacenamiento

});

module.exports = (
conexion)=>{

/* =====================================
   USUARIOS ADMIN
===================================== */

router.get(

'/usuarios-admin',

(req,res)=>{

if(!req.session.usuario){

return res.json({
ok:false
});

}

if(
req.session.usuario.rol !== 'superadmin'
&&
req.session.usuario.rol !== 'admin'
){

return res.json({
ok:false
});

}

conexion.query(

`
SELECT
id,
nombre,
correo,
rol
FROM usuarios
ORDER BY id DESC
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({

ok:true,

usuarios:resultados

});

}

);

}

);

router.get(

'/pagos-admin',

(req,res)=>{

if(
!req.session.usuario
){

return res.json({
ok:false
});

}

if(
req.session.usuario.rol !== 'superadmin'
){

return res.json({
ok:false
});

}

conexion.query(

`

SELECT

p.id,
p.plan,
p.monto,
p.moneda,
p.fecha_pago,
p.estado,

u.nombre,
u.correo

FROM pagos p

INNER JOIN usuarios u

ON p.usuario_id = u.id

ORDER BY p.id DESC

`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

res.json({

ok:true,

pagos:resultados

});

}

);

}

);

/* =====================================
   CAMBIAR ROL
===================================== */

router.post(

'/cambiar-rol',

(req,res)=>{

if(!req.session.usuario){

return res.json({
ok:false
});

}

if(
req.session.usuario.rol !== 'superadmin'
&&
req.session.usuario.rol !== 'admin'
){

return res.json({
ok:false
});

}

const { id, rol } = req.body;

conexion.query(

`
UPDATE usuarios
SET rol=?
WHERE id=?
`,

[
rol,
id
],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}

);

/* =====================================
   ELIMINAR USUARIO
===================================== */

router.post(

'/eliminar-usuario',

(req,res)=>{

if(!req.session.usuario){

return res.json({
ok:false
});

}

if(
req.session.usuario.rol !== 'superadmin'
){

return res.json({
ok:false
});

}

const id = req.body.id;

conexion.query(

`
DELETE FROM usuarios
WHERE id=?
`,

[id],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}

);

/* =====================================
   EMPRENDIMIENTOS ADMIN
===================================== */

router.get(

'/emprendimientos-admin',

(req,res)=>{

if(!req.session.usuario){

return res.json({
ok:false
});

}

if(
req.session.usuario.rol !== 'superadmin'
&&
req.session.usuario.rol !== 'admin'
){

return res.json({
ok:false
});

}

const sql = `

SELECT

e.id,
e.nombre_emprendimiento,
e.categoria,
e.descripcion,
e.estado,
e.plan,
e.foto,

u.nombre AS propietario,
u.correo

FROM emprendedores e

JOIN usuarios u
ON e.usuario_id = u.id

ORDER BY e.id DESC

`;

conexion.query(

sql,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({

ok:true,

emprendimientos:resultados

});

}

);

}

);

/* =====================================
   APROBAR EMPRENDIMIENTO
===================================== */

router.post(

'/aprobar-emprendimiento',

(req,res)=>{

const id = req.body.id;

conexion.query(

`
UPDATE emprendedores
SET estado='aprobado'
WHERE id=?
`,

[id],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}

);

/* =====================================
   RECHAZAR EMPRENDIMIENTO
===================================== */

router.post(

'/rechazar-emprendimiento',

(req,res)=>{

const id = req.body.id;

conexion.query(

`
UPDATE emprendedores
SET estado='rechazado'
WHERE id=?
`,

[id],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}

);

/* =====================================
   ELIMINAR EMPRENDIMIENTO
===================================== */

router.post(

'/eliminar-emprendimiento',

(req,res)=>{

const id = req.body.id;

conexion.query(

`
DELETE FROM emprendedores
WHERE id=?
`,

[id],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}

);

/* =====================================
   HOTELES ADMIN
===================================== */

router.get(

'/hoteles-admin',

(req,res)=>{

if(
!req.session.usuario
){

return res.json({
ok:false
});

}

if(
req.session.usuario.rol !== 'superadmin'
&&
req.session.usuario.rol !== 'admin'
){

return res.json({
ok:false
});

}

conexion.query(

`
SELECT

id,
nombre,
descripcion,
direccion,
telefono,
indicaciones,
estrellas,
imagen

FROM hoteles

ORDER BY id DESC
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({

ok:true,

hoteles:resultados

});

}

);

}

);

/* =====================================
   CREAR HOTEL
===================================== */

router.post(
'/crear-hotel',

subirFoto.single('imagen'),

(req,res)=>{

if(
!req.session.usuario
){

return res.json({
ok:false
});

}

if(
req.session.usuario.rol !== 'superadmin'
&&
req.session.usuario.rol !== 'admin'
){

return res.json({
ok:false
});

}

const {

nombre,
descripcion,
direccion,
latitud,
longitud,
telefono,
sitio_web,
indicaciones,
estrellas

} = req.body;

let imagen = '';

if(req.file){

imagen =
'fotos/' + req.file.filename;

}

conexion.query(

`
INSERT INTO hoteles(

nombre,
descripcion,
direccion,
latitud,
longitud,
telefono,
sitio_web,
indicaciones,
estrellas,
imagen

)

VALUES(?,?,?,?,?,?,?,?,?,?)
`,

[
nombre,
descripcion,
direccion,
latitud,
longitud,
telefono,
sitio_web,
indicaciones,
estrellas,
imagen
],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false,
mensaje:error.sqlMessage
});

}

res.json({
ok:true
});

}

);

}

);

/* =====================================
   EDITAR HOTEL
===================================== */

router.post(

'/editar-hotel',

subirFoto.fields([
{ name:'imagen', maxCount:1 },
{ name:'imagen1', maxCount:1 },
{ name:'imagen2', maxCount:1 },
{ name:'imagen3', maxCount:1 },
{ name:'imagen4', maxCount:1 }
]),

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* VALIDAR ROL */
if(

req.session.usuario.rol !== 'superadmin'
&&

req.session.usuario.rol !== 'admin'

){

return res.json({

ok:false

});

}

const {

id,
nombre,
descripcion,
direccion,
latitud,
longitud,
telefono,
sitio_web,
indicaciones,
estrellas

} = req.body;

/* IMAGEN */
let sql = `

UPDATE hoteles
SET

nombre=?,
descripcion=?,
direccion=?,
latitud=?,
longitud=?,
telefono=?,
sitio_web=?,
indicaciones=?,
estrellas=?

`;

let valores = [

nombre,
descripcion,
direccion,
latitud,
longitud,
telefono,
sitio_web,
indicaciones,
estrellas

];

/* NUEVA FOTO */
if(
req.files &&
req.files.imagen
){

sql += `,
imagen=?
`;

valores.push(
'fotos/' +
req.files.imagen[0].filename
);

}


/* WHERE */
sql += `
WHERE id=?
`;

valores.push(id);

/* UPDATE */
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

if(req.files){

const imagenes = [

req.files.imagen1?.[0],
req.files.imagen2?.[0],
req.files.imagen3?.[0],
req.files.imagen4?.[0]

].filter(Boolean);

imagenes.forEach(img=>{

conexion.query(

`
INSERT INTO imagenes_hoteles(
hotel_id,
imagen
)
VALUES(?,?)
`,

[
id,
'fotos/' + img.filename
]

);

});

}

res.json({

ok:true

});

}

);

}
);

/* =====================================
   ELIMINAR HOTEL
===================================== */

router.post(

'/eliminar-hotel',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* VALIDAR ROL */
if(

req.session.usuario.rol !== 'superadmin'
&&

req.session.usuario.rol !== 'admin'

){

return res.json({

ok:false

});

}

const {

id,
tipo

} = req.body;

/* DELETE */
conexion.query(

`
DELETE FROM hoteles
WHERE id=?
`,

[id],

(error)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:error.sqlMessage

});

}

res.json({

ok:true

});

}

);

}
);

/* =====================================
   AGREGAR RESTAURANTE
===================================== */

router.post(

'/agregar-restaurante',

subirFoto.single('imagen'),

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* ADMIN */
if(
req.session.usuario.rol !== 'superadmin'
&&
req.session.usuario.rol !== 'admin'
){

return res.json({

ok:false

});

}

/* DATOS */
const {

nombre,
descripcion,
direccion,
latitud,
longitud

} = req.body;

/* FOTO */
let imagen = '';

if(req.file){

imagen =
'fotos/' + req.file.filename;

}

/* INSERT */
const sql = `

INSERT INTO restaurantes(

nombre,
descripcion,
direccion,
latitud,
longitud,
imagen

)

VALUES(?,?,?,?,?,?)

`;

conexion.query(

sql,

[
nombre,
descripcion,
direccion,
latitud,
longitud,
imagen
],

(error)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:error.sqlMessage

});

}

res.json({

ok:true

});

}

);

}

);

/* =====================================
   EDITAR RESTAURANTE
===================================== */

router.post(

'/editar-restaurante',

subirFoto.fields([
{ name:'imagen', maxCount:1 },
{ name:'imagen1', maxCount:1 },
{ name:'imagen2', maxCount:1 },
{ name:'imagen3', maxCount:1 },
{ name:'imagen4', maxCount:1 }
]),

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* ADMIN */
if(
req.session.usuario.rol !== 'superadmin'
&&
req.session.usuario.rol !== 'admin'
){

return res.json({

ok:false

});

}

const {

id,
nombre,
descripcion,
direccion,
latitud,
longitud

} = req.body;

/* FOTO */
let sql = `
UPDATE restaurantes
SET
nombre=?,
descripcion=?,
direccion=?,
latitud=?,
longitud=?
`;

const valores = [

nombre,
descripcion,
direccion,
latitud,
longitud

];

/* NUEVA FOTO */
if(
req.files &&
req.files.imagen
){

sql += `,
imagen=?
`;

valores.push(
'fotos/' +
req.files.imagen[0].filename
);

}

/* WHERE */
sql += `
WHERE id=?
`;

valores.push(id);

/* UPDATE */
conexion.query(

sql,

valores,

(error)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

if(req.files){

const imagenes = [

req.files.imagen1?.[0],
req.files.imagen2?.[0],
req.files.imagen3?.[0],
req.files.imagen4?.[0]

].filter(Boolean);

imagenes.forEach(img=>{

conexion.query(

`
INSERT INTO imagenes_restaurantes(
restaurante_id,
imagen
)
VALUES(?,?)
`,

[
id,
'fotos/' + img.filename
]

);

});

}

res.json({

ok:true

});

}

);

}
);

/* =====================================
   ELIMINAR RESTAURANTE
===================================== */

router.post(

'/eliminar-restaurante',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* ADMIN */
if(
req.session.usuario.rol !== 'superadmin'
&&
req.session.usuario.rol !== 'admin'
){

return res.json({

ok:false

});

}

const {

id,
tipo

} = req.body;

/* DELETE */
conexion.query(

`
DELETE FROM restaurantes
WHERE id=?
`,

[id],

(error)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

res.json({

ok:true

});

}

);

}

);

/* =====================================
   TOTAL USUARIOS
===================================== */

router.get(

'/total-usuarios',

(req,res)=>{

conexion.query(

`
SELECT COUNT(*) AS total
FROM usuarios
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

total:0

});

}

res.json({

total:
resultados[0].total

});

}

);

}
);

/* =====================================
   TOTAL HOTELES
===================================== */

router.get(

'/total-hoteles',

(req,res)=>{

conexion.query(

`
SELECT COUNT(*) AS total
FROM hoteles
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

total:0

});

}

res.json({

total:
resultados[0].total

});

}

);

}

);

/* =====================================
   TOTAL RESTAURANTES
===================================== */

router.get(

'/total-restaurantes',

(req,res)=>{

conexion.query(

`
SELECT COUNT(*) AS total
FROM restaurantes
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

total:0

});

}

res.json({

total:
resultados[0].total

});

}

);

}

);

/* =====================================
   TOTAL EVENTOS
===================================== */

router.get(

'/total-eventos',

(req,res)=>{

conexion.query(

`
SELECT COUNT(*) AS total
FROM eventos_culturales
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

total:0

});

}

res.json({

total:
resultados[0].total

});

}

);

}

);

/* =====================================
   TOTAL LUGARES
===================================== */

router.get(

'/total-lugares',

(req,res)=>{

conexion.query(

`
SELECT COUNT(*) AS total
FROM lugares_turisticos
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({
total:0
});

}

res.json({
total:
resultados[0].total
});

}

);

}
);

/* =====================================
   TOTAL EMPRENDIMIENTOS
===================================== */

router.get(

'/total-emprendimientos',

(req,res)=>{

conexion.query(

`
SELECT COUNT(*) AS total
FROM emprendedores
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

total:0

});

}

res.json({

total:
resultados[0].total

});

}

);

}

);


/* =====================================
   ACTIVIDAD RECIENTE
===================================== */

router.get(

'/actividad-reciente',

(req,res)=>{

const actividades = [

{
texto:
'Nuevo usuario registrado'
},

{
texto:
'Nuevo emprendimiento creado'
},

{
texto:
'Nuevo hotel agregado'
},

{
texto:
'Evento cultural publicado'
},

{
texto:
'Rol actualizado'
}

];

res.json({

ok:true,

actividades

});

}
);

/* =====================================
   RESTAURANTES ADMIN
===================================== */

router.get(

'/restaurantes-admin',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* VALIDAR ROL */
if(

req.session.usuario.rol !== 'superadmin'
&&

req.session.usuario.rol !== 'admin'

){

return res.json({

ok:false

});

}

/* CONSULTA */
conexion.query(

`
SELECT
id,
nombre,
direccion,
imagen
FROM restaurantes
ORDER BY id DESC
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

res.json({

ok:true,

restaurantes:
resultados

});

}

);

}
);


/* =====================================
   EVENTOS ADMIN
===================================== */

router.get(

'/eventos-admin',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* VALIDAR ROL */
if(

req.session.usuario.rol !== 'superadmin'
&&

req.session.usuario.rol !== 'admin'

){

return res.json({

ok:false

});

}

/* CONSULTA */
conexion.query(

`
SELECT
id,
titulo,
fecha,
imagen
FROM eventos_culturales
ORDER BY id DESC
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

res.json({

ok:true,

eventos:
resultados

});

}

);

}
);

/* =====================================
   LUGARES ADMIN
===================================== */

router.get(

'/lugares-admin',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* VALIDAR ROL */
if(

req.session.usuario.rol !== 'superadmin'
&&

req.session.usuario.rol !== 'admin'

){

return res.json({

ok:false

});

}

/* CONSULTA */
conexion.query(

`
SELECT
id,
nombre,
direccion,
imagen
FROM lugares_turisticos
ORDER BY id DESC
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

res.json({

ok:true,

lugares:
resultados

});

}

);

}
);

/* =====================================
   AGREGAR EVENTO
===================================== */

router.post(

'/agregar-evento',

subirFoto.single('imagen'),

(req,res)=>{

if(
!req.session.usuario
){

return res.json({
ok:false
});

}

const {

titulo,
descripcion,
fecha,
hora,
lugar

} = req.body;

let imagen = '';

if(req.file){

imagen =
'fotos/' + req.file.filename;

}

conexion.query(

`
INSERT INTO eventos_culturales(

titulo,
descripcion,
fecha,
hora,
lugar,
imagen

)

VALUES(?,?,?,?,?,?)
`,

[
titulo,
descripcion,
fecha,
hora,
lugar,
imagen
],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}
);

/* =====================================
   EDITAR EVENTO
===================================== */

router.post(

'/editar-evento',

subirFoto.fields([
{ name:'imagen', maxCount:1 },
{ name:'imagen1', maxCount:1 },
{ name:'imagen2', maxCount:1 },
{ name:'imagen3', maxCount:1 },
{ name:'imagen4', maxCount:1 }
]),

(req,res)=>{

const {

id,
titulo,
descripcion,
fecha,
hora,
lugar

} = req.body;

let sql = `
UPDATE eventos_culturales
SET
titulo=?,
descripcion=?,
fecha=?,
hora=?,
lugar=?
`;

let valores = [

titulo,
descripcion,
fecha,
hora,
lugar

];

if(
req.files &&
req.files.imagen
){

sql += `,
imagen=?
`;

valores.push(
'fotos/' +
req.files.imagen[0].filename
);

}

sql += `
WHERE id=?
`;

valores.push(id);

conexion.query(

sql,

valores,

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

if(req.files){

const imagenes = [

req.files.imagen1?.[0],
req.files.imagen2?.[0],
req.files.imagen3?.[0],
req.files.imagen4?.[0]

].filter(Boolean);

imagenes.forEach(img=>{

conexion.query(

`
INSERT INTO imagenes_eventos(
evento_id,
imagen
)
VALUES(?,?)
`,

[
id,
'fotos/' + img.filename
]

);

});

}

res.json({
ok:true
});

}

);

}
);

/* =====================================
   ELIMINAR EVENTO
===================================== */

router.post(

'/eliminar-evento',

(req,res)=>{

const { id } =
req.body;

conexion.query(

`
DELETE FROM eventos_culturales
WHERE id=?
`,

[id],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}
);

/* =====================================
   AGREGAR LUGAR
===================================== */

router.post(

'/agregar-lugar',

subirFoto.single('imagen'),

(req,res)=>{

const {

nombre,
descripcion,
direccion,
latitud,
longitud

} = req.body;

let imagen = '';

if(req.file){

imagen =
'fotos/' + req.file.filename;

}

conexion.query(

`
INSERT INTO lugares_turisticos(

nombre,
descripcion,
direccion,
latitud,
longitud,
imagen

)

VALUES(?,?,?,?,?,?)
`,

[
nombre,
descripcion,
direccion,
latitud,
longitud,
imagen
],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}
);

/* =====================================
   EDITAR LUGAR
===================================== */

router.post(

'/editar-lugar',

subirFoto.fields([
{ name:'imagen', maxCount:1 },
{ name:'imagen1', maxCount:1 },
{ name:'imagen2', maxCount:1 },
{ name:'imagen3', maxCount:1 },
{ name:'imagen4', maxCount:1 }
]),

(req,res)=>{

const {

id,
nombre,
descripcion,
direccion,
latitud,
longitud

} = req.body;

let sql = `
UPDATE lugares_turisticos
SET
nombre=?,
descripcion=?,
direccion=?,
latitud=?,
longitud=?
`;

let valores = [

nombre,
descripcion,
direccion,
latitud,
longitud

];

if(
req.files &&
req.files.imagen
){

sql += `,
imagen=?
`;

valores.push(
'fotos/' +
req.files.imagen[0].filename
);

}

sql += `
WHERE id=?
`;

valores.push(id);

conexion.query(

sql,

valores,

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

if(req.files){

const imagenes = [

req.files.imagen1?.[0],
req.files.imagen2?.[0],
req.files.imagen3?.[0],
req.files.imagen4?.[0]

].filter(Boolean);

imagenes.forEach(img=>{

conexion.query(

`
INSERT INTO imagenes_lugares(
lugar_id,
imagen
)
VALUES(?,?)
`,

[
id,
'fotos/' + img.filename
]

);

});

}

res.json({
ok:true
});

}

);

}
);

/* =====================================
   ELIMINAR LUGAR
===================================== */

router.post(

'/eliminar-lugar',

(req,res)=>{

const { id } =
req.body;

conexion.query(

`
DELETE FROM lugares_turisticos
WHERE id=?
`,

[id],

(error)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

res.json({
ok:true
});

}

);

}
);

/* =====================================
   ACTIVIDADES RECIENTES
===================================== */

router.get(

'/actividades-recientes',

(req,res)=>{

let actividades = [];

/* USUARIO */
conexion.query(

`
SELECT nombre
FROM usuarios
ORDER BY id DESC
LIMIT 1
`,

(error,usuarios)=>{

if(!error && usuarios.length > 0){

actividades.push({

titulo:
'Nuevo usuario registrado',

descripcion:
usuarios[0].nombre

});

}

/* HOTEL */
conexion.query(

`
SELECT nombre
FROM hoteles
ORDER BY id DESC
LIMIT 1
`,

(error,hoteles)=>{

if(!error && hoteles.length > 0){

actividades.push({

titulo:
'Nuevo hotel agregado',

descripcion:
hoteles[0].nombre

});

}

/* EVENTO */
conexion.query(

`
SELECT titulo
FROM eventos_culturales
ORDER BY id DESC
LIMIT 1
`,

(error,eventos)=>{

if(!error && eventos.length > 0){

actividades.push({

titulo:
'Evento cultural publicado',

descripcion:
eventos[0].titulo

});

}

/* RESTAURANTE */
conexion.query(

`
SELECT nombre
FROM restaurantes
ORDER BY id DESC
LIMIT 1
`,

(error,restaurantes)=>{

if(
!error &&
restaurantes.length > 0
){

actividades.push({

titulo:
'Nuevo restaurante agregado',

descripcion:
restaurantes[0].nombre

});

}

/* LUGAR */
conexion.query(

`
SELECT nombre
FROM lugares_turisticos
ORDER BY id DESC
LIMIT 1
`,

(error,lugares)=>{

if(
!error &&
lugares.length > 0
){

actividades.push({

titulo:
'Nuevo lugar turístico agregado',

descripcion:
lugares[0].nombre

});

}

/* EMPRENDIMIENTO */
conexion.query(

`
SELECT nombre_emprendimiento
FROM emprendedores
ORDER BY id DESC

`,

(error,emprendimientos)=>{

if(
!error &&
emprendimientos.length > 0
){

actividades.push({

titulo:
'Nuevo emprendimiento creado',

descripcion:
emprendimientos[0]
.nombre_emprendimiento

});

}

res.json({

ok:true,

actividades

});

});

});

});

});

});

});

}
);

/* =====================================
   RESEÑAS ADMIN
===================================== */

router.get(

'/resenas-admin',

(req,res)=>{

conexion.query(

`
SELECT *

FROM resenas

ORDER BY creado_en DESC
`,

(err,resultados)=>{

if(err){

return res.json({

ok:false

});

}

res.json({

ok:true,
resenas:resultados

});

}

);

}

);

/* =====================================
   ELIMINAR RESEÑA ADMIN
===================================== */

router.post(

'/eliminar-resena-admin',

(req,res)=>{

const {id} = req.body;

conexion.query(

`
DELETE FROM resenas
WHERE id=?
`,

[id],

(err)=>{

if(err){

return res.json({

ok:false

});

}

res.json({

ok:true

});

}

);

}
);

/* =====================================
   NOTIFICACIONES ADMIN
===================================== */

router.get(

'/notificaciones-admin',

(req,res)=>{

let notificaciones = [];

/* EMPRENDIMIENTOS PENDIENTES */
conexion.query(

`
SELECT COUNT(*) AS total
FROM emprendedores
WHERE estado='pendiente'
`,

(error,resultados)=>{

if(
!error &&
resultados[0].total > 0
){

notificaciones.push({

mensaje:
'Tienes ' +

resultados[0].total +

' emprendimientos pendientes de aprobación'

});

}

/* EVENTOS */
conexion.query(

`
SELECT COUNT(*) AS total
FROM eventos_culturales
`,

(error,eventos)=>{

if(
!error &&
eventos[0].total > 0
){

notificaciones.push({

mensaje:
'Eventos registrados: ' +

eventos[0].total

});

}

/* LUGARES */
conexion.query(

`
SELECT COUNT(*) AS total
FROM lugares_turisticos
`,

(error,lugares)=>{

if(
!error &&
lugares[0].total > 0
){

notificaciones.push({

mensaje:
'Lugares turísticos registrados: ' +

lugares[0].total

});

}

/* RESTAURANTES */
conexion.query(

`
SELECT COUNT(*) AS total
FROM restaurantes
`,

(error,restaurantes)=>{

if(
!error &&
restaurantes[0].total > 0
){

notificaciones.push({

mensaje:
'Restaurantes registrados: ' +

restaurantes[0].total

});

}

res.json({

ok:true,

notificaciones

});

});

});

});

});

}
);


/* =====================================
   CREAR ADMIN
===================================== */

router.post(

'/crear-admin',

async (req,res)=>{

const {

nombre,
correo,
contrasena

} = req.body;

/* VALIDAR */
if(
!nombre ||
!correo ||
!contrasena
){

return res.json({

ok:false,

mensaje:
'Todos los campos son obligatorios'

});

}

/* VERIFICAR */
conexion.query(

`
SELECT id
FROM usuarios
WHERE correo=?
LIMIT 1
`,

[correo],

async (error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:'Error servidor'

});

}

if(resultados.length > 0){

return res.json({

ok:false,

mensaje:
'Ese correo ya existe'

});

}

/* HASH */
const hash =
await bcrypt.hash(
contrasena,
10
);

/* INSERT */
const sql = `

INSERT INTO usuarios (

nombre,
correo,
contrasena,
rol

)

VALUES (?,?,?,?)

`;

conexion.query(

sql,

[
nombre,
correo,
hash,
'admin'
],

(error)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:error.sqlMessage

});

}

res.json({

ok:true,

mensaje:
'Administrador creado correctamente'

});

}

);

}

);

}

);

/* =====================================
   BANNERS
===================================== */

router.get(

'/banners-admin',

(req,res)=>{

conexion.query(

`
SELECT *
FROM banners_sitio
ORDER BY pagina
`,

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

res.json({

ok:true,

banners:resultados

});

}

);

}

);

router.post(

'/editar-banner',

subirFoto.single('imagen'),

(req,res)=>{

const id =
req.body.id;

if(
!req.file
){

return res.json({

ok:false,

mensaje:
'Debes seleccionar una imagen'

});

}

const imagen =
'fotos/' + req.file.filename;

conexion.query(

`
UPDATE banners_sitio
SET imagen=?
WHERE id=?
`,

[
imagen,
id
],

(error)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

res.json({

ok:true

});

}

);

}

);

/* =====================================
   OBTENER BANNER
===================================== */

router.get(

'/banner/:pagina',

(req,res)=>{

const pagina =
req.params.pagina;

conexion.query(

`
SELECT imagen
FROM banners_sitio
WHERE pagina=?
LIMIT 1
`,

[pagina],

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false

});

}

if(
resultados.length === 0
){

return res.json({

ok:false

});

}

res.json({

ok:true,

imagen:
resultados[0].imagen

});

}

);

}

);

router.get(

'/imagenes-hotel/:id',

(req,res)=>{

conexion.query(

`
SELECT *
FROM imagenes_hoteles
WHERE hotel_id=?
ORDER BY id ASC
`,

[
req.params.id
],

(error,resultados)=>{

if(error){

return res.json({
ok:false
});

}

res.json({

ok:true,

imagenes:resultados

});

}

);

}

);

router.get(

'/imagenes-lugar/:id',

(req,res)=>{

conexion.query(

`
SELECT *
FROM imagenes_lugares
WHERE lugar_id=?
ORDER BY id ASC
`,

[
req.params.id
],

(error,resultados)=>{

if(error){

return res.json({
ok:false
});

}

res.json({

ok:true,

imagenes:resultados

});

}

);

}

);

router.get(

'/imagenes-restaurante/:id',

(req,res)=>{

conexion.query(

`
SELECT *
FROM imagenes_restaurantes
WHERE restaurante_id=?
ORDER BY id ASC
`,

[
req.params.id
],

(error,resultados)=>{

if(error){

return res.json({
ok:false
});

}

res.json({

ok:true,

imagenes:resultados

});

}

);

}

);



return router;

};