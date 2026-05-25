document.getElementById(
'navbar'
).innerHTML = `

<nav class="
navbar
navbar-expand-lg
navbar-dark
bg-primary
shadow-sm
py-2
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

src="http://localhost:3000/fotos/logo.png"

width="45"

height="45"

class="rounded-circle"

style="
object-fit:cover;
border:2px solid white;
background:white;
padding:2px;
"

onerror="
this.src='https://cdn-icons-png.flaticon.com/512/25/25694.png'
"

>

<span style="
font-size:2rem;
font-weight:700;
letter-spacing:.5px;
color:white;
">

Visita Quibdó

</span>

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

style="
font-size:1rem;
"

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

style="
font-size:1rem;
"

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

style="
font-size:1rem;
"

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

style="
font-size:1rem;
"

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

style="
font-size:1rem;
"

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

'http://localhost:3000/usuario',

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

'http://localhost:3000/' + datos.usuario.foto

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

<li><hr class="dropdown-divider"></li>

<li>

<a class="
dropdown-item
text-danger
"

href="http://localhost:3000/logout">

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