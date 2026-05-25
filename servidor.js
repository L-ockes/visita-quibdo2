const express = require('express');
const app = express();
app.use(express.json());

app.use(express.urlencoded({

extended:true

}));
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const session = require('express-session');

const conexion = require('./configuracion/conexion');



/* =========================
   CONFIGURACION
========================= */

app.use(express.static(path.join(__dirname, 'publico')));

app.use(express.urlencoded({ extended:true }));
app.use(express.json());

app.use(session({
    secret:'visitaquibdo',
    resave:false,
    saveUninitialized:false
}));

/* =========================
   MULTER
========================= */

const almacenamiento = multer.diskStorage({

    destination:(req,file,cb)=>{
        cb(null,'publico/fotos');
    },

    filename:(req,file,cb)=>{
        cb(null,Date.now() + '_' + file.originalname);
    }

});

const subirFoto = multer({
    storage:almacenamiento
});

/* =========================
   RUTA PRINCIPAL
========================= */

app.get('/',(req,res)=>{
    res.send('Servidor funcionando');
});

/* =========================
   LOGIN
========================= */

app.post('/login', async (req,res)=>{

    const correo = req.body.correo.trim().toLowerCase();
    const contrasena = req.body.contrasena;

    const sql = `
        SELECT *
        FROM usuarios
        WHERE correo = ?
        LIMIT 1
    `;

    conexion.query(sql,[correo], async (error,resultados)=>{

        if(error){
            return res.status(500).json({
                ok:false,
                mensaje:'Error del servidor'
            });
        }

        if(resultados.length === 0){
            return res.json({
                ok:false,
                mensaje:'Usuario no encontrado'
            });
        }

        const usuario = resultados[0];

        const coincide = await bcrypt.compare(
            contrasena,
            usuario.contrasena
        );

        if(!coincide){
            return res.json({
                ok:false,
                mensaje:'Contraseña incorrecta'
            });
        }

        req.session.usuario = {
            id:usuario.id,
            nombre:usuario.nombre,
            rol:usuario.rol,
            foto:usuario.foto
        };

        res.json({
            ok:true,
            usuario:req.session.usuario
        });

    });

});

/* =========================
   REGISTRO
========================= */

app.post('/registro', subirFoto.single('foto'), async (req,res)=>{

    const {
        nombre,
        correo,
        telefono,
        contrasena,
        contrasena2
    } = req.body;

    if(contrasena !== contrasena2){
        return res.json({
            ok:false,
            mensaje:'Las contraseñas no coinciden'
        });
    }

    const verificar = `
        SELECT id
        FROM usuarios
        WHERE correo = ?
    `;

    conexion.query(verificar,[correo], async (error,resultados)=>{

        if(error){
            return res.json({
                ok:false,
                mensaje:'Error del servidor'
            });
        }

        if(resultados.length > 0){
            return res.json({
                ok:false,
                mensaje:'Correo ya registrado'
            });
        }

        const hash = await bcrypt.hash(contrasena,10);

        let foto = '';

        if(req.file){
            foto = 'fotos/' + req.file.filename;
        }

        const sql = `
            INSERT INTO usuarios(
                nombre,
                correo,
                telefono,
                contrasena,
                foto,
                rol
            )
            VALUES(?,?,?,?,?,?)
        `;

        conexion.query(sql,[
            nombre,
            correo,
            telefono,
            hash,
            foto,
            'usuario'
        ],(error)=>{

            if(error){
                return res.json({
                    ok:false,
                    mensaje:'Error al registrar'
                });
            }

            res.json({
                ok:true,
                mensaje:'Usuario registrado'
            });

        });

    });

});

/* =====================================
   USUARIO SESION
===================================== */

app.get(

'/usuario',

(req,res)=>{

/* NO LOGIN */
if(!req.session.usuario){

return res.json({

ok:false

});

}

/* LOGIN */
res.json({

ok:true,

usuario:req.session.usuario

});

}

);

/* =========================
   SESION
========================= */

app.get('/sesion',(req,res)=>{

    if(req.session.usuario){

        return res.json({
            logueado:true,
            usuario:req.session.usuario
        });

    }

    res.json({
        logueado:false
    });

});

/* =====================================
   LOGOUT
===================================== */

app.get(

'/logout',

(req,res)=>{

req.session.destroy(()=>{

res.redirect(
'/login.html'
);

});

}

);

/* =====================================
   PANEL EMPRENDIMIENTO
===================================== */

app.get(

'/panel-datos',

(req,res)=>{

/* SESION */
if(!req.session.usuario){

return res.json({

ok:false,

mensaje:'Debes iniciar sesión'

});

}

const idUsuario =
req.session.usuario.id;

/* EMPRENDIMIENTO */
const sql = `

SELECT *

FROM emprendedores

WHERE id = ?

LIMIT 1

`;

conexion.query(

sql,

[idUsuario],

(error,resultados)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:'Error servidor'

});

}

/* NO TIENE */
if(resultados.length === 0){

return res.json({

ok:true,

tieneDatos:false

});

}

/* TIENE */
res.json({

ok:true,

tieneDatos:true,

emprendimiento:
resultados[0]

});

}

);

}

);

/* =====================================
   EDITAR USUARIO
===================================== */

app.post(

'/editar-usuario',

subirFoto.single('foto'),

async (req,res)=>{

/* LOGIN */
if(!req.session.usuario){

return res.json({

ok:false,

mensaje:'Debes iniciar sesión'

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

mensaje:'Error servidor'

});

}

if(resultados.length === 0){

return res.json({

ok:false,

mensaje:'Usuario no encontrado'

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

/* VALIDAR SEGURIDAD */
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
   EDITAR EMPRENDIMIENTO
===================================== */

app.post(

'/editar-emprendimiento',

subirFoto.single('foto'),

(req,res)=>{

/* LOGIN */
if(!req.session.usuario){

return res.json({

ok:false,

mensaje:'Debes iniciar sesión'

});

}

const idUsuario =
req.session.usuario.id;

/* DATOS */
const {

nombre_emprendimiento,
categoria,
categoria_nueva,
descripcion,
ubicacion,
horarios,
servicios,
servicio_nuevo,
servicios_extra

} = req.body;

/* CATEGORIA */
const categoriaFinal =

categoria === 'Otro'

?

categoria_nueva

:

categoria;

/* SERVICIO */
const servicioFinal =

servicios === 'Otro'

?

servicio_nuevo

:

servicios;

/* FOTO */
let foto = null;

if(req.file){

foto =
'fotos/' + req.file.filename;

}

/* SQL */
let sql = `
UPDATE emprendedores
SET

nombre_emprendimiento=?,
categoria=?,
descripcion=?,
ubicacion=?,
horarios=?,
servicios=?,
servicios_extra=?
`;

let valores = [

nombre_emprendimiento,
categoriaFinal,
descripcion,
ubicacion,
horarios,
servicioFinal,
servicios_extra

];

/* FOTO */
if(foto){

sql += `,
foto=?
`;

valores.push(foto);

}

/* WHERE */
sql += `
WHERE id=?
`;

valores.push(idUsuario);

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

res.json({

ok:true,

mensaje:
'Emprendimiento actualizado'

});

}

);

}

);

/* =====================================
   DATOS USUARIO
===================================== */

app.get(

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

LIMIT 1

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

/* =========================
   CATEGORIAS
========================= */

app.get('/categorias',(req,res)=>{

    const sql = `
        SELECT *
        FROM categorias
        ORDER BY nombre_categoria ASC
    `;

    conexion.query(sql,(error,resultados)=>{

        if(error){
            return res.json([]);
        }

        res.json(resultados);

    });

});

/* =========================
   SERVICIOS
========================= */

app.get('/servicios',(req,res)=>{

    const sql = `
        SELECT *
        FROM servicios
        ORDER BY nombre_servicio ASC
    `;

    conexion.query(sql,(error,resultados)=>{

        if(error){
            return res.json([]);
        }

        res.json(resultados);

    });

});

/* =========================
   CREAR EMPRENDIMIENTO
========================= */

app.post('/crear-emprendimiento', subirFoto.single('foto'), (req,res)=>{

    if(!req.session.usuario){

        return res.status(401).json({
            ok:false,
            mensaje:'No autorizado'
        });

    }

    const {
        nombre_emprendimiento,
        categoria,
        categoria_nueva,
        descripcion,
        ubicacion,
        horarios,
        servicios,
        servicio_nuevo,
        servicios_extra
    } = req.body;

    const categoriaFinal =
        categoria === 'Otro'
        ? categoria_nueva
        : categoria;

    const servicioFinal =
        servicios === 'Otro'
        ? servicio_nuevo
        : servicios;

    let foto = '';

    if(req.file){
        foto = 'fotos/' + req.file.filename;
    }

    const sql = `
        INSERT INTO emprendedores(
            id,
            nombre_emprendimiento,
            categoria,
            descripcion,
            ubicacion,
            horarios,
            servicios,
            servicios_extra,
            foto,
            rol,
            estado
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?)
    `;

    conexion.query(sql,[
        req.session.usuario.id,
        nombre_emprendimiento,
        categoriaFinal,
        descripcion,
        ubicacion,
        horarios,
        servicioFinal,
        servicios_extra,
        foto,
        'emprendedor',
        'pendiente'
    ],(error)=>{

        if(error){
            console.log(error);

            return res.json({
                ok:false,
                mensaje:error.sqlMessage
            });
        }

        /* CAMBIAR ROL */
           conexion.query(

           `
           UPDATE usuarios
           SET rol='emprendedor'
           WHERE id=?
            `,

           [req.session.usuario.id]

        );

        res.json({
            ok:true,
            mensaje:'Emprendimiento registrado'
        });

    });

});

/* =========================
   EMPRENDIMIENTOS
========================= */

app.get('/emprendimientos',(req,res)=>{

    const busqueda = req.query.q || '';
    const categoria = req.query.categoria || '';

    let sql = `
        SELECT *
       FROM emprendedores

       WHERE 1=1
       AND estado='aprobado'
    `;

    let parametros = [];

    if(busqueda !== ''){

        sql += `
            WHERE
                nombre_emprendimiento LIKE ?
                OR descripcion LIKE ?
        `;

        const like = `%${busqueda}%`;

        parametros.push(like);
        parametros.push(like);

    }

    if(categoria !== ''){

        if(busqueda !== ''){

            sql += `
                AND categoria = ?
            `;

        }else{

            sql += `
                WHERE categoria = ?
            `;

        }

        parametros.push(categoria);

    }

    sql += `
        ORDER BY id DESC
    `;

    conexion.query(sql,parametros,(error,resultados)=>{

        if(error){
            console.log(error);
            return res.json([]);
        }

        res.json(resultados);

    });

});

/* =========================
   EMPRENDIMIENTO ACTUAL
========================= */

app.get('/emprendimiento',(req,res)=>{

    if(!req.session.usuario){

        return res.status(401).json({
            ok:false
        });

    }

    const sql = `
        SELECT *
        FROM emprendedores
        WHERE id = ?
        LIMIT 1
    `;

    conexion.query(sql,[req.session.usuario.id],(error,resultados)=>{

        if(error){
            return res.json({ ok:false });
        }

        if(resultados.length === 0){
            return res.json({ ok:false });
        }

        res.json({
            ok:true,
            datos:resultados[0]
        });

    });

});

/* =========================
   VER EMPRENDIMIENTO
========================= */

app.get('/emprendimiento/:id',(req,res)=>{

    const id = req.params.id;

    const sql = `
        SELECT
            e.*,
            u.nombre AS usuario_nombre,
            u.telefono AS usuario_telefono,
            u.correo AS usuario_correo
        FROM emprendedores e
        JOIN usuarios u
            ON e.id = u.id
        WHERE e.id = ?
    `;

    conexion.query(sql,[id],(error,resultados)=>{

        if(error){
            return res.json({ ok:false });
        }

        if(resultados.length === 0){
            return res.json({ ok:false });
        }

        res.json({
            ok:true,
            emprendimiento:resultados[0]
        });

    });

});



/* =========================
   HOTELES
========================= */

app.get('/hoteles',(req,res)=>{

    const terminoBusqueda = req.query.q || '';

    let sql = `
        SELECT *
        FROM hoteles
    `;

    let parametros = [];

    if(terminoBusqueda !== ''){

        sql += `
            WHERE
                nombre LIKE ?
                OR descripcion LIKE ?
                OR direccion LIKE ?
        `;

        const like = `%${terminoBusqueda}%`;

        parametros = [like,like,like];

    }

    sql += `
        ORDER BY id DESC
    `;

    conexion.query(sql,parametros,(error,resultados)=>{

        if(error){
            return res.status(500).json({
                mensaje:'Error'
            });
        }

        res.json(resultados);

    });

});

/* =====================================
   VER HOTEL
===================================== */

app.get(

    '/hotel/:id',

    (req,res)=>{

        const id =
            req.params.id;

        const sql = `

           SELECT

             id,
             nombre,
             descripcion,
             direccion,
             telefono,
             sitio_web,
             indicaciones,
             estrellas,
             latitud,
             longitud,
             imagen

          FROM hoteles
             
            WHERE id = ?

            LIMIT 1

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

                if(
                    resultados.length === 0
                ){

                    return res.json({

                        ok:false

                    });

                }

                res.json({

                    ok:true,

                    hotel:
                        resultados[0]

                });

            }

        );

    }

);



/* RESTAURANTES */
app.get('/restaurantes',(req,res)=>{

    const terminoBusqueda =
        req.query.q || '';

    let sql = `
        SELECT
            r.id,
            r.nombre,
            r.descripcion,
            r.direccion,
            r.imagen,

            (
                SELECT ROUND(
                    AVG(calificacion),
                    1
                )

                FROM resenas re

                WHERE re.tipo='restaurante'
                AND re.item_id=r.id

            ) AS promedio_resenas,

            (
                SELECT COUNT(*)

                FROM resenas re2

                WHERE re2.tipo='restaurante'
                AND re2.item_id=r.id

            ) AS total_resenas

        FROM restaurantes r
    `;

    let parametros = [];

    if(terminoBusqueda !== ''){

        sql += `
            WHERE
                nombre LIKE ?
                OR descripcion LIKE ?
                OR direccion LIKE ?
        `;

        const like =
            '%' + terminoBusqueda + '%';

        parametros = [
            like,
            like,
            like
        ];

    }

    sql += `
        ORDER BY nombre ASC
    `;

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

});

/* VER RESTAURANTE */
app.get(

    '/restaurante/:id',

    (req,res)=>{

        const id =
            req.params.id;

        const sql = `

            SELECT
                id,
                nombre,
                descripcion,
                direccion,
                latitud,
                longitud,
                imagen

            FROM restaurantes

            WHERE id = ?

            LIMIT 1

        `;

        conexion.query(

            sql,

            [id],

            (error,resultados)=>{

                if(error){

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

                    restaurante:
                        resultados[0]

                });

            }

        );

    }

);



/* LUGARES TURISTICOS */
app.get('/lugares',(req,res)=>{

    const terminoBusqueda =
        req.query.q || '';

    let sql = `
        SELECT
            l.id,
            l.nombre,
            l.descripcion,
            l.direccion,
            l.imagen,

            (
                SELECT ROUND(
                    AVG(calificacion),
                    1
                )

                FROM resenas r

                WHERE r.tipo='lugar'
                AND r.item_id=l.id

            ) AS promedio_resenas,

            (
                SELECT COUNT(*)

                FROM resenas r2

                WHERE r2.tipo='lugar'
                AND r2.item_id=l.id

            ) AS total_resenas

        FROM lugares_turisticos l
    `;

    let parametros = [];

    if(terminoBusqueda !== ''){

        sql += `
            WHERE
                nombre LIKE ?
                OR descripcion LIKE ?
                OR direccion LIKE ?
        `;

        const like =
            '%' + terminoBusqueda + '%';

        parametros = [
            like,
            like,
            like
        ];

    }

    sql += `
        ORDER BY id DESC
    `;

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

});

/* =====================================
   VER LUGAR
===================================== */

app.get(

    '/lugar/:id',

    (req,res)=>{

        const id =
            req.params.id;

        const sql = `

            SELECT *

            FROM lugares_turisticos

            WHERE id = ?

            LIMIT 1

        `;

        conexion.query(

            sql,

            [id],

            (error,resultados)=>{

                if(error){

                    console.log(error);

                    return res.json({

                        ok:false,

                        error:error

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

                    lugar:
                        resultados[0]

                });

            }

        );

    }

);

/* EVENTOS */
app.get('/eventos',(req,res)=>{

    const terminoBusqueda =
        req.query.q || '';

    const fechaDesde =
        req.query.desde || '';

    const fechaHasta =
        req.query.hasta || '';

    let sql = `
        SELECT
            e.id,
            e.titulo,
            e.descripcion,
            e.fecha,
            e.hora,
            e.lugar,
            e.imagen,

            (
                SELECT ROUND(
                    AVG(calificacion),
                    1
                )

                FROM resenas r

                WHERE r.tipo='evento'
                AND r.item_id=e.id

            ) AS promedio_resenas,

            (
                SELECT COUNT(*)

                FROM resenas r2

                WHERE r2.tipo='evento'
                AND r2.item_id=e.id

            ) AS total_resenas

        FROM eventos_culturales e

        WHERE 1=1
    `;

    let parametros = [];

    if(terminoBusqueda !== ''){

        sql += `
            AND (
                titulo LIKE ?
                OR descripcion LIKE ?
                OR lugar LIKE ?
            )
        `;

        const like =
            '%' + terminoBusqueda + '%';

        parametros.push(
            like,
            like,
            like
        );

    }

    if(fechaDesde !== ''){

        sql += `
            AND fecha >= ?
        `;

        parametros.push(
            fechaDesde
        );

    }

    if(fechaHasta !== ''){

        sql += `
            AND fecha <= ?
        `;

        parametros.push(
            fechaHasta
        );

    }

    sql += `
        ORDER BY fecha ASC, hora ASC
    `;

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

});

/* =====================================
   VER EVENTO
===================================== */

app.get(

    '/evento/:id',

    (req,res)=>{

        const id =
            req.params.id;

        const sql = `

            SELECT *

            FROM eventos_culturales

            WHERE id = ?

            LIMIT 1

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

                if(
                    resultados.length === 0
                ){

                    return res.json({

                        ok:false

                    });

                }

                res.json({

                    ok:true,

                    evento:
                        resultados[0]

                });

            }

        );

    }

);

/* =====================================
   RESEÑAS HOTEL
===================================== */

app.get(

'/resenas-hotel/:id',

(req,res)=>{

const id =
req.params.id;

const sql = `

SELECT *

FROM resenas

WHERE tipo='hotel'

AND item_id=?

ORDER BY creado_en DESC

`;

conexion.query(

sql,

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

/* =====================================
   CREAR RESEÑA HOTEL
===================================== */

app.post(

'/crear-resena-hotel',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false,

mensaje:
'Debes iniciar sesión'

});

}

const {

item_id,
calificacion,
comentario

} = req.body;

const nombre =
req.session.usuario.nombre;

/* VALIDAR */
if(
!calificacion ||
!comentario
){

return res.json({

ok:false

});

}

/* INSERT */
const sql = `

INSERT INTO resenas(

tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

'hotel',
?,
?,
?,
?

)

`;

conexion.query(

sql,

[
item_id,
nombre,
calificacion,
comentario
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
   RESEÑAS RESTAURANTE
===================================== */

app.get(

'/resenas-restaurante/:id',

(req,res)=>{

const id =
req.params.id;

const sql = `

SELECT *

FROM resenas

WHERE tipo='restaurante'

AND item_id=?

ORDER BY creado_en DESC

`;

conexion.query(

sql,

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

/* =====================================
   CREAR RESEÑA RESTAURANTE
===================================== */

app.post(

'/crear-resena-restaurante',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false,

mensaje:
'Debes iniciar sesión'

});

}

const {

item_id,
calificacion,
comentario

} = req.body;

const nombre =
req.session.usuario.nombre;

/* VALIDAR */
if(
!calificacion ||
!comentario
){

return res.json({

ok:false

});

}

/* INSERT */
const sql = `

INSERT INTO resenas(

tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

'restaurante',
?,
?,
?,
?

)

`;

conexion.query(

sql,

[
item_id,
nombre,
calificacion,
comentario
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
   RESEÑAS EVENTO
===================================== */

app.get(

'/resenas-evento/:id',

(req,res)=>{

const id =
req.params.id;

const sql = `

SELECT *

FROM resenas

WHERE tipo='evento'

AND item_id=?

ORDER BY creado_en DESC

`;

conexion.query(

sql,

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

/* =====================================
   CREAR RESEÑA EVENTO
===================================== */

app.post(

'/crear-resena-evento',

(req,res)=>{

if(
!req.session.usuario
){

return res.json({

ok:false,

mensaje:
'Debes iniciar sesión'

});

}

const {

item_id,
calificacion,
comentario

} = req.body;

const nombre =
req.session.usuario.nombre;

if(
!calificacion ||
!comentario
){

return res.json({

ok:false

});

}

const sql = `

INSERT INTO resenas(

tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

'evento',
?,
?,
?,
?

)

`;

conexion.query(

sql,

[
item_id,
nombre,
calificacion,
comentario
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
   RESEÑAS LUGAR
===================================== */

app.get(

'/resenas-lugar/:id',

(req,res)=>{

const id =
req.params.id;

const sql = `

SELECT *

FROM resenas

WHERE tipo='lugar'

AND item_id=?

ORDER BY creado_en DESC

`;

conexion.query(

sql,

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

/* =====================================
   CREAR RESEÑA LUGAR
===================================== */

app.post(

'/crear-resena-lugar',

(req,res)=>{

if(
!req.session.usuario
){

return res.json({

ok:false,

mensaje:
'Debes iniciar sesión'

});

}

const {

item_id,
calificacion,
comentario

} = req.body;

const nombre =
req.session.usuario.nombre;

if(
!calificacion ||
!comentario
){

return res.json({

ok:false

});

}

const sql = `

INSERT INTO resenas(

tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

'lugar',
?,
?,
?,
?

)

`;

conexion.query(

sql,

[
item_id,
nombre,
calificacion,
comentario
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
   RESEÑAS EMPRENDIMIENTO
===================================== */

app.get(

'/resenas-emprendimiento/:id',

(req,res)=>{

const id =
req.params.id;

const sql = `

SELECT *

FROM resenas

WHERE tipo='emprendimiento'

AND item_id=?

ORDER BY creado_en DESC

`;

conexion.query(

sql,

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

/* =====================================
   CREAR RESEÑA EMPRENDIMIENTO
===================================== */

app.post(

'/crear-resena-emprendimiento',

(req,res)=>{

if(
!req.session.usuario
){

return res.json({

ok:false,

mensaje:
'Debes iniciar sesión'

});

}

const {

item_id,
calificacion,
comentario

} = req.body;

const nombre =
req.session.usuario.nombre;

if(
!calificacion ||
!comentario
){

return res.json({

ok:false

});

}

const sql = `

INSERT INTO resenas(

tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

'emprendimiento',
?,
?,
?,
?

)

`;

conexion.query(

sql,

[
item_id,
nombre,
calificacion,
comentario
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
   CREAR ADMIN
===================================== */

app.post(

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
   TOTAL USUARIOS
===================================== */

app.get(

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

app.get(

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

app.get(

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

app.get(

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

app.get(

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

app.get(

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
   OBTENER USUARIOS
===================================== */

app.get(

'/usuarios-admin',

(req,res)=>{

/* VALIDAR LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* VALIDAR SUPERADMIN */
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

usuarios:
resultados

});

}

);

}
);

/* =====================================
   CAMBIAR ROL
===================================== */

app.post(

'/cambiar-rol',

(req,res)=>{

/* VALIDAR LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* VALIDAR SUPERADMIN */
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

id,
rol

} = req.body;

/* VALIDAR */
if(
!id ||
!rol
){

return res.json({

ok:false

});

}

/* UPDATE */
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

console.log(
'ERROR MYSQL:',
error
);

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

app.post(

'/eliminar-usuario',

(req,res)=>{

if(!req.session.usuario){
return res.json({ok:false});
}

if(
req.session.usuario.rol !== 'superadmin'
){
return res.json({ok:false});
}

console.log(
'BODY:',
req.body
);

const id =
req.body.id;

console.log(
'ID:',
id
);

/* ELIMINAR EMPRENDIMIENTO DEL USUARIO */
conexion.query(

`
DELETE FROM emprendedores
WHERE id=?
`,

[id]

);

/* QUERY */
conexion.query(

`
DELETE FROM usuarios
WHERE id=?
`,

[id],

(error,resultado)=>{

if(error){

console.log(error);

return res.json({

ok:false,

mensaje:error.sqlMessage

});

}

console.log(
'RESULTADO:',
resultado
);

res.json({

ok:true,

resultado

});

}

);

}

);

/* =====================================
   EMPRENDIMIENTOS ADMIN
===================================== */

app.get(

'/emprendimientos-admin',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* SUPERADMIN */
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
const sql = `

SELECT

e.id,
e.nombre_emprendimiento,
e.categoria,
e.descripcion,
e.estado,
e.foto,

u.nombre AS propietario,
u.correo

FROM emprendedores e

JOIN usuarios u
ON e.id = u.id

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

emprendimientos:
resultados

});

}

);

}
);

/* =====================================
   ELIMINAR EMPRENDIMIENTO
===================================== */

app.post(

'/eliminar-emprendimiento',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({

ok:false

});

}

/* SUPERADMIN */
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

id

} = req.body;

/* DELETE */
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

/* CAMBIAR ROL */
conexion.query(

`
UPDATE usuarios
SET rol='usuario'
WHERE id=?
`,

[id]

);

res.json({

ok:true

});

}

);

}

);

/* =====================================
   APROBAR EMPRENDIMIENTO
===================================== */

app.post(

'/aprobar-emprendimiento',

(req,res)=>{

const { id } = req.body;

conexion.query(

`
UPDATE emprendedores
SET estado='aprobado'
WHERE id=?
`,

[id],

(error)=>{

if(error){

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

app.post(

'/rechazar-emprendimiento',

(req,res)=>{

const { id } = req.body;

conexion.query(

`
UPDATE emprendedores
SET estado='rechazado'
WHERE id=?
`,

[id],

(error)=>{

if(error){

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
   ACTIVIDAD RECIENTE
===================================== */

app.get(

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
   HOTELES ADMIN
===================================== */

app.get(

'/hoteles-admin',

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

hoteles:
resultados

});

}

);

}
);

/* =====================================
   RESTAURANTES ADMIN
===================================== */

app.get(

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
   AGREGAR RESTAURANTE
===================================== */

app.post(

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
   ELIMINAR RESTAURANTE
===================================== */

app.post(

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

id

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
   EVENTOS ADMIN
===================================== */

app.get(

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

app.get(

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
   CREAR HOTEL
===================================== */

app.post(

'/crear-hotel',

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
let imagen = '';

if(req.file){

imagen =
'fotos/' + req.file.filename;

}

/* INSERT */
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
   EDITAR HOTEL
===================================== */

app.post(

'/editar-hotel',

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
if(req.file){

sql += `,
imagen=?
`;

valores.push(
'fotos/' + req.file.filename
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

app.post(

'/editar-restaurante',

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
if(req.file){

sql += `,
imagen=?
`;

valores.push(
'fotos/' + req.file.filename
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

app.post(

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

id

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
   AGREGAR EVENTO
===================================== */

app.post(

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

app.post(

'/editar-evento',

subirFoto.single('imagen'),

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

if(req.file){

sql += `,
imagen=?
`;

valores.push(
'fotos/' + req.file.filename
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

app.post(

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

app.post(

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

app.post(

'/editar-lugar',

subirFoto.single('imagen'),

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

if(req.file){

sql += `,
imagen=?
`;

valores.push(
'fotos/' + req.file.filename
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

app.post(

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

app.get(

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
LIMIT 1
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
   SESION ACTUAL
===================================== */

app.get(

'/sesion-actual',

(req,res)=>{

if(!req.session.usuario){

return res.json({

logueado:false

});

}

res.json({

logueado:true,

usuario:
req.session.usuario

});

}
);

/* =====================================
   NOTIFICACIONES ADMIN
===================================== */

app.get(

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



/* =========================
   SERVIDOR
========================= */

app.listen(3000,()=>{

    console.log(
        'Servidor corriendo en puerto 3000'
    );

});


