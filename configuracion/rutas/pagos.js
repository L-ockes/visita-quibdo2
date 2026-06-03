const express = require('express');
const router = express.Router();

const conexion =
require('../configuracion/conexion');

const paypal = require(
'@paypal/checkout-server-sdk'
);

const clientId =
'AZFsrtB0mkm6jpjQZoOrP6Fz8XSMfE336G5tfKg5v5VNLNY5AaLYBSSQ3kTd-PmSoqYzN48_kWEDJxOS';

const clientSecret =
'EIo4dJJTc_eJ-fEGC7WWX_OkFY2rmlcrvgkB6w5ZSG6Rhe1-6Ujgbi0vAYt29e-2KIB4gEsTvzirJ7vr';

const environment =
new paypal.core.SandboxEnvironment(
clientId,
clientSecret
);

const client =
new paypal.core.PayPalHttpClient(
environment
);

router.post(

'/activar-premium',

(req,res)=>{

    if(!req.session.usuario){

        return res.json({

            ok:false,

            mensaje:
            'No autorizado'

        });

    }

    conexion.query(

        `
       UPDATE usuarios
       SET
       plan='premium',
       estado_pago='activo',
       fecha_vencimiento=DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       WHERE id=?
        `,

        [req.session.usuario.id],

        (error)=>{

            if(error){

                console.log(error);

                return res.json({

                    ok:false,

                    mensaje:
                    'Error servidor'

                });

            }

            conexion.query(

`
INSERT INTO pagos
(
usuario_id,
plan,
monto,
moneda,
paypal_order_id,
estado
)
VALUES
(
?,
?,
?,
?,
?,
?
)
`,

[
req.session.usuario.id,
'premium',
25000,
'COP',
req.session.paypalOrderId,
'completado'
],

(errorPago,resultados)=>{

if(errorPago){

console.log(errorPago);

return res.json({

ok:false,

mensaje:
'Error guardando pago'

});

}

res.json({

ok:true,

idPago:
resultados.insertId

});
}

);

        }

    );

}

);

router.post(

'/crear-orden-paypal',


async (req,res)=>{

try{

if(!req.session.usuario){

return res.json({

ok:false,

mensaje:'No autorizado'

});

}

const { plan } = req.body;

let valorUSD;

switch(plan){

case 'premium':

valorUSD = '6.00';
break;

case 'super_premium':

valorUSD = '11.00';
break;

default:

return res.json({

ok:false,

mensaje:'Plan inválido'

});

}

const request =
new paypal.orders.OrdersCreateRequest();

request.prefer(
'return=representation'
);

request.requestBody({

intent:'CAPTURE',

application_context:{

return_url:
'http://localhost:3000/pago-exitoso.html',

cancel_url:
'http://localhost:3000/pago-cancelado.html'

},

purchase_units:[

{

amount:{

currency_code:'USD',

value:valorUSD

},

description:
'Plan Premium Visita Quibdó'

}

]

});

const orden =
await client.execute(
request
);

req.session.paypalOrderId =
orden.result.id;

res.json({

ok:true,

id:orden.result.id,

links:orden.result.links

});
}

catch(error){

console.log(error);

res.json({

ok:false,

mensaje:'Error PayPal'

});

}

}

);

const PDFDocument = require('pdfkit');

router.get(

'/recibo-pdf/:id',

(req,res)=>{

const idPago =
req.params.id;

conexion.query(

`
SELECT
p.*,
u.nombre,
u.correo,
u.telefono
FROM pagos p
INNER JOIN usuarios u
ON p.usuario_id = u.id
WHERE p.id = ?
`,

[idPago],

(error,resultados)=>{

if(error){

console.log(error);

return res.status(500).send(
'Error servidor'
);

}

if(resultados.length === 0){

return res.status(404).send(
'Pago no encontrado'
);

}

const pago =
resultados[0];

const doc =
new PDFDocument();

doc.image(

'publico/fotos/mascota visita quibdó.png',

40,

25,

{

width:80

}

);

res.setHeader(
'Content-Type',
'application/pdf'
);

res.setHeader(

'Content-Disposition',

`attachment; filename=Recibo_${pago.id}.pdf`

);

doc.pipe(res);

doc.moveDown(1);

doc.fontSize(24);

doc.text(
'VISITA QUIBDÓ',
140,
45
);

doc.moveDown();

doc.fontSize(18);

doc.text(
'COMPROBANTE DE PAGO',
140,
80
);

doc.moveDown(4);

doc.fontSize(12);

doc.text(
`Recibo N.º ${pago.id}`
);

const fecha = new Date(pago.fecha_pago);

let fechaFormateada =
fecha.toLocaleString(
'es-CO',
{
weekday:'long',
year:'numeric',
month:'long',
day:'numeric',
hour:'numeric',
minute:'2-digit',
second:'2-digit'
}
);

fechaFormateada =
fechaFormateada.charAt(0).toUpperCase() +
fechaFormateada.slice(1);

doc.text(
`Fecha de pago: ${fechaFormateada}`
);

doc.moveDown();

doc.text(
'----------------------------------------'
);

doc.moveDown();

doc.fontSize(14);

doc.text(
'DATOS DEL CLIENTE'
);

doc.moveDown();

doc.fontSize(12);

doc.text(
`Nombre: ${pago.nombre}`
);

doc.text(
`Correo: ${pago.correo}`
);

doc.text(
`Teléfono: ${pago.telefono || 'No registrado'}`
);

doc.moveDown();

doc.text(
'----------------------------------------'
);

doc.moveDown();

doc.fontSize(14);

doc.text(
'DETALLE DEL PAGO'
);

doc.moveDown();

doc.fontSize(12);

doc.text(
`Plan adquirido: ${pago.plan}`
);

doc.text(
`Valor pagado: $${Number(pago.monto).toLocaleString('es-CO')} ${pago.moneda}`
);

doc.text(
`Estado: ${pago.estado.toUpperCase()}`
);

doc.text(
`Referencia PayPal: ${pago.paypal_order_id}`
);

doc.moveDown();

doc.text(
'----------------------------------------'
);

doc.moveDown(2);

doc.fontSize(11);

doc.text(
'Gracias por utilizar Visita Quibdó',
{
align:'center'
}
);

doc.text(
'Sistema turístico y de emprendimientos',
{
align:'center'
}
);

doc.end();

}

);

}

);

module.exports = router;