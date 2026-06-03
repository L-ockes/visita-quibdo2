/* =====================================
   FAVICON
===================================== */

const favicon =
document.createElement('link');

favicon.rel = 'icon';

favicon.type = 'image/png';

favicon.href =
'/fotos/Mascota.png';

document.head.appendChild(
favicon
);

/* =====================================
   ESTILOS LOGO
===================================== */

const estilos =
document.createElement('style');

estilos.innerHTML = `

/* =====================================
   NAVBAR
===================================== */


.navbar-custom{

background:#ffffff;

border-bottom:1px solid #e5e7eb;

box-shadow:
0 4px 20px
rgba(0,0,0,.08);

}

.navbar-toggler{

border:none !important;

box-shadow:none !important;

}

.navbar-toggler-icon{

filter:none;

}

@media (max-width: 991px){

.navbar-collapse{

margin-top:15px;

padding-top:15px;

border-top:1px solid #e5e7eb;

max-height:70vh;
overflow-y:auto;

}

.navbar-nav{

gap:8px;

}

.nav-link{

padding:12px !important;

border-radius:10px;

}

.nav-link:hover{

background:#f8fafc;

}

}

/* =====================================
   LOGO
===================================== */

@media (max-width: 991px){

.navbar-brand{

margin:0 auto;

}

}

@media (max-width: 991px){

.logo-navbar{

display:none;

object-fit:cover;

border-radius:50%;

background:white;

padding:3px;

width:60px;

height:60px;

transition:.3s;

}
}

/* =====================================
   LINKS NAVBAR
===================================== */


/* =====================================
   MENU
===================================== */

.navbar-nav{

gap:35px;

}

.navbar-brand{

min-width:auto;

}

#usuarioNavbar{

min-width:auto;

display:flex;

justify-content:flex-end;

}

@media (max-width:991px){

.navbar-brand{

margin:0;

}

#usuarioNavbar{

min-width:0;

}

}

/* LINKS */

.nav-link{

font-size:1rem !important;

font-weight:600;

padding:8px 14px !important;

border-radius:10px;

transition:all 0.22s ease;

white-space:nowrap;

line-height:1 !important;

display:inline-flex;

align-items:center;

}

.nav-link{

position:relative;

}

.nav-link::after{

content:'';

position:absolute;

left:0;

bottom:-5px;

width:0;

height:2px;

background:#000;

transition:.3s;

}

.nav-link:hover::after{

width:100%;

}

.nav-item{

display:flex;
align-items:center;

}

/* LINEAS */

.nav-item{

position:relative;

}

/* HOVER */

.nav-link{

color:#6b7280 !important;

transition:all .3s ease;

}

.nav-link:hover{

color:#000 !important;

background:transparent;

transform:none;

}

html,
body{

overflow-x:hidden;
max-width:100%;

}

`;

document.head.appendChild(
estilos
);

document.getElementById(
'navbar'
).innerHTML = `

<nav class="
navbar
navbar-expand-lg
navbar-light
shadow-sm
py-2
navbar-custom
">

<div class="
container-fluid
px-4
">

<!-- LOGO -->
<a class="
navbar-brand
fw-bold
d-flex
align-items-center
gap-3
"
href="index.html">

<img
src="/fotos/Mascota.png"
width="50"
height="50"
class="logo-navbar"
>

<div>

<div
style="
font-size:1.2rem;
font-weight:800;
color:#0f172a;
line-height:1;
"
>

VISITA QUIBDÓ

</div>

<div
style="
font-size:.75rem;
color:#64748b;
"
class="d-none d-lg-block"
>

Turismo y emprendimientos

</div>

</div>

</a>

<!-- MOVIL -->
<button

class="
navbar-toggler
"

type="button"

data-bs-toggle="collapse"

data-bs-target="#menuNavbar"

>

<i
class="fa-solid fa-bars"
style="
font-size:1.8rem;
color:#0f172a;
"
></i>

</button>

<!-- MENU -->
<div
class="
collapse
navbar-collapse
justify-content-between
"
id="menuNavbar"
>

<ul
class="
navbar-nav
mx-auto
mb-2
mb-lg-0
"
>

<li class="nav-item">

<a class="
nav-link
fw-semibold
"

href="emprendimientos.html"

>

Emprendimientos

</a>

</li>

<li class="nav-item">

<a class="
nav-link
fw-semibold
"

href="lugares_turisticos.html"



>

Lugares Turísticos

</a>

</li>

<li class="nav-item">

<a class="
nav-link
fw-semibold
"

href="hoteles.html"


>

Hoteles

</a>

</li>

<li class="nav-item">

<a class="
nav-link
fw-semibold
"

href="restaurantes.html"



>

Restaurantes

</a>

</li>

<li class="nav-item">

<a class="
nav-link
fw-semibold
"

href="eventos.html"


>

Eventos

</a>

</li>

</ul>

<!-- USUARIO -->
<div id="usuarioNavbar"></div>


</div>

</div>

</nav>


`;



/* USUARIO */
async function cargarUsuarioNavbar(){

const usuarioNavbar =
document.getElementById(
'usuarioNavbar'
);

try{

const respuesta =
await fetch(

'https://visita-quibdo2.onrender.com/usuario',

{

credentials:'include'

}

);

const datos =
await respuesta.json();

let tieneEmprendimiento = false;

try{

const respuestaPanel =
await fetch(

'https://visita-quibdo2.onrender.com/panel-datos',

{

credentials:'include'

}

);

const datosPanel =
await respuestaPanel.json();

tieneEmprendimiento =
datosPanel.tieneDatos === true;

}
catch(error){

console.log(error);

}

/* LOGIN */
if(datos.ok){

usuarioNavbar.innerHTML = `

<div class="dropdown">

<button

class="
btn
dropdown-toggle
d-flex
align-items-center
gap-2
fw-semibold
"

data-bs-toggle="dropdown"

style="
border:none;
"

>

<img

src="
${
datos.usuario.foto

?

'https://visita-quibdo2.onrender.com/' + datos.usuario.foto

:

'https://cdn-icons-png.flaticon.com/512/149/149071.png'
}
"

width="40"

height="40"

class="rounded-circle"

style="
object-fit:cover;
border:2px solid white;
"

onerror="
this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'
"

>

${datos.usuario.nombre}

</button>

<ul class="
dropdown-menu
dropdown-menu-end
shadow
">

<li>

<a class="
dropdown-item
"

href="panel.html">

Mi emprendimiento

</a>

</li>

${
!tieneEmprendimiento

?

`

<li>

<a class="
dropdown-item
"

href="planes.html">

Registrar emprendimiento

</a>

</li>

`

:

''

}

<li>

<a class="
dropdown-item
"

href="editar_usuario.html">

Editar perfil

</a>

</li>

${
datos.usuario.rol === 'superadmin'

?

`

<li>

<a class="
dropdown-item
"

href="Panel_Superadmin.html">

Panel SuperAdmin

</a>

</li>

`

:

''
}

<li><hr class="dropdown-divider"></li>

<li>

<a class="
dropdown-item
text-danger
"

href="https://visita-quibdo2.onrender.com/logout">

Cerrar sesión

</a>

</li>

</ul>

</div>

`;

}

/* SIN LOGIN */
else{

usuarioNavbar.innerHTML = `

<div
class="
d-flex
gap-2
"
>

<a
href="login.html"
class="
btn
fw-semibold
"
style="
background:white;
color:#0f172a;
border:1.5px solid #0f172a;
padding:10px 22px;
border-radius:999px;
"
>
Iniciar sesión
</a>

<a
href="registro.html"
class="
btn
fw-semibold
"
style="
background:#0f172a;
color:white;
padding:10px 22px;
border-radius:999px;
border:none;
"
>
Registrarse
</a>

</div>

`;

}

}

catch(error){

console.log(error);

usuarioNavbar.innerHTML = `

<div class="
d-flex
gap-2
">

<a

href="login.html"

class="
btn
btn-light
fw-semibold
"

>

Iniciar sesión

</a>

<a

href="registro.html"

class="
btn
btn-outline-light
fw-semibold
"

>

Registrarse

</a>

</div>

`;

}

}

cargarUsuarioNavbar();