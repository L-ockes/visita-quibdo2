const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
    origin:'http://127.0.0.1:5500',
    credentials:true
}));
const editarEmprendimiento =
require(
'./rutas/editarEmprendimiento'
);
const emprendimientos =
require(
'./rutas/emprendimientos'
);
const verEmprendimiento =
require(
'./rutas/verEmprendimiento'
);
const panel =
require(
'./rutas/panel'
);
const editarUsuario =
require(
'./rutas/editarUsuario'
);
const crearEmprendimiento =
require(
'./rutas/crearEmprendimiento'
);
const pagos =
require('./rutas/pagos');
const perfil =
require('./rutas/perfil');
const planes = require('./rutas/planes');
const admin =
require('./rutas/admin');

const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const session = require('express-session');
app.use(express.json());

app.use(express.urlencoded({

extended:true

}));
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

app.use(

editarEmprendimiento(
conexion
)

);

app.use(

emprendimientos(
conexion
)

);
app.use(

verEmprendimiento(
conexion
)

);
app.use(

panel(
conexion
)


);
app.use(

editarUsuario(
conexion
)

);
app.use(

crearEmprendimiento(
conexion
)

);
app.use(

'/fotos',

express.static(
'publico/fotos'
)

);
app.use('/',planes);
app.use(pagos);
app.use(perfil);
app.use(
admin(
conexion
)
);

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

app.locals.subirFoto = subirFoto;

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

WHERE usuario_id = ?

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
        `;

        const like = `%${terminoBusqueda}%`;

        parametros = [like];

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

usuario_id,
tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

?,
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
req.session.usuario.id,
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

usuario_id,
tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

?,
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
req.session.usuario.id,
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

usuario_id,
tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

?,
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
req.session.usuario.id,
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

usuario_id,
tipo,
item_id,
nombre,
calificacion,
comentario

)

VALUES(

?,
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
req.session.usuario.id,
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
usuario_id,
nombre,
calificacion,
comentario

)

VALUES(

'emprendimiento',
?,
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
req.session.usuario.id,
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
   ELIMINAR RESEÑA EMPRENDIMIENTO
===================================== */

app.post(

'/eliminar-resena',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
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
DELETE FROM resenas

WHERE id=?
AND usuario_id=?
AND tipo=?
`,

[
id,
req.session.usuario.id,
tipo
],

(error,resultado)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

/* NO ELIMINÓ */
if(
resultado.affectedRows === 0
){

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
   EDITAR RESEÑA EMPRENDIMIENTO
===================================== */

app.post(

'/editar-resena',

(req,res)=>{

/* LOGIN */
if(
!req.session.usuario
){

return res.json({
ok:false
});

}

const {

id,
tipo,
calificacion,
comentario

} = req.body;

/* UPDATE */
conexion.query(

`
UPDATE resenas

SET
calificacion=?,
comentario=?

WHERE id=?
AND usuario_id=?
AND tipo=?
`,

[
calificacion,
comentario,
id,
req.session.usuario.id,
tipo
],

(error,resultado)=>{

if(error){

console.log(error);

return res.json({
ok:false
});

}

if(
resultado.affectedRows === 0
){

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
   RECUPERAR PASSWORD
===================================== */

app.post(

'/recuperar-password',

async (req,res)=>{

const correo =
req.body.correo;

const nueva =
req.body.nueva;

/* ENCRIPTAR */
const hash =
await bcrypt.hash(
nueva,
10
);

/* SQL */
const sql = `

UPDATE usuarios

SET contrasena = ?

WHERE correo = ?

`;

/* CONSULTA */
conexion.query(

sql,

[
hash,
correo
],

(error,resultado)=>{

if(error){

return res.json({

ok:false,

mensaje:
'Error servidor'

});

}

if(
resultado.affectedRows === 0
){

return res.json({

ok:false,

mensaje:
'Correo no encontrado'

});

}

res.json({

ok:true

});

}

);

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

app.use((error,req,res,next)=>{

console.log('ERROR GENERAL:', error);

res.status(500).json({
    ok:false,
    mensaje:'Error interno servidor'
});

});
