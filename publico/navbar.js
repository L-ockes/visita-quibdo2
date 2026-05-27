/* =====================================
   FAVICON
===================================== */

const favicon =
document.createElement('link');

favicon.rel = 'icon';

favicon.type = 'image/png';

favicon.href =
'/fotos/mascota.png';

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

background:
linear-gradient(

90deg,

#2563eb,

#1d4ed8

);

}

/* =====================================
   LOGO
===================================== */

.logo-navbar{

object-fit:cover;

border-radius:50%;

border:2px solid white;

background:white;

padding:2px;

}

/* =====================================
   LINKS NAVBAR
===================================== */


/* =====================================
   MENU
===================================== */

.navbar-nav{

display:flex;

align-items:center;

gap:4px;

margin-left:18px;

}

/* LINKS */

.nav-link{

font-size:1.05rem !important;

font-weight:700;

padding:8px 14px !important;

border-radius:10px;

transition:all 0.22s ease;

white-space:nowrap;

position:relative;

}

/* LINEAS */

.nav-item{

position:relative;

}

.nav-item:not(:last-child)::after{

content:'';

position:absolute;

right:-2px;

top:50%;

transform:translateY(-50%);

width:1px;

height:22px;

background:rgba(
255,
255,
255,
0.35
);

}

/* HOVER */

.nav-link:hover{

background:rgba(
255,
255,
255,
0.14
);

transform:translateY(-2px);

}

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
navbar-dark
shadow-sm
py-2
navbar-custom
">

<div class="container">

<!-- LOGO -->
<a class="
navbar-brand
fw-bold
d-flex
align-items-center
gap-2
"
href="index.html">

<img

src="/fotos/mascota.png"

width="50"

height="50"

class="logo-navbar"

>

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

<span class="
navbar-toggler-icon
"></span>

</button>

<!-- MENU -->
<div class="
collapse
navbar-collapse
"

id="menuNavbar"

>

<ul class="
navbar-nav
me-auto
mb-2
mb-lg-0
ms-4
">

<li class="nav-item">

<a class="
nav-link
fw-semibold
text-white
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
text-white
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
text-white
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
text-white
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
text-white
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
text-white
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

<li>

<a class="
dropdown-item
"

href="crear_emprendimiento.html">

Registrar emprendimiento

</a>

</li>

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

href="panel_superadmin.html">

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