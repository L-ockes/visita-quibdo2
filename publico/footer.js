/* =====================================
   ESTILOS FOOTER
===================================== */

const estilosFooter =
document.createElement('style');

estilosFooter.innerHTML = `

footer{

margin-top:auto;

}

body{

min-height:100vh;

display:flex;

flex-direction:column;

}

`;

document.head.appendChild(
estilosFooter
);

document.head.appendChild(
estilosFooter
);

document.getElementById(
'footer'
).innerHTML = `

<footer class="
bg-primary
text-white
text-center
py-4
mt-auto
">

<div class="container">

<p class="mb-3">

© 2024 Visita Quibdó
-
Todos los derechos reservados

</p>

<div class="
d-flex
justify-content-center
gap-4
fs-3
">

<a

href="#"

class="text-white"

>

<i class="
fab
fa-facebook
"></i>

</a>

<a

href="#"

class="text-white"

>

<i class="
fab
fa-instagram
"></i>

</a>

<a

href="#"

class="text-white"

>

<i class="
fab
fa-twitter
"></i>

</a>

<a

href="#"

class="text-white"

>

<i class="
fab
fa-youtube
"></i>

</a>

</div>

</div>

</footer>

`;