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

<footer
style="
background:#052f4f;
color:white;
padding:60px 0 25px;
"
>

<div class="container">

<div class="row">

<div class="col-lg-5 mb-4">

<h3
style="
font-weight:700;
margin-bottom:15px;
"
>
VISITA QUIBDÓ
</h3>

<p
style="
color:#dbeafe;
max-width:500px;
"
>

Explora los mejores lugares
turísticos, hoteles,
restaurantes, eventos y
emprendimientos del Chocó.

</p>

<div
class="
d-flex
gap-4
fs-4
mt-4
"
>

<a href="#" class="text-white">
<i class="fab fa-facebook"></i>
</a>

<a href="#" class="text-white">
<i class="fab fa-instagram"></i>
</a>

<a href="#" class="text-white">
<i class="fab fa-tiktok"></i>
</a>

<a href="#" class="text-white">
<i class="fab fa-youtube"></i>
</a>

</div>

</div>

<div class="col-lg-3 mb-4">

<h5
style="
font-weight:600;
margin-bottom:15px;
"
>
Contacto
</h5>

<p>
<i class="fas fa-envelope me-2"></i>
contacto@visitaquibdo.com
</p>

<p>
<i class="fas fa-phone me-2"></i>
+57 300 000 0000
</p>

<p>
<i class="fas fa-location-dot me-2"></i>
Quibdó, Chocó
</p>

</div>

<div class="col-lg-4 mb-4">

<h5
style="
font-weight:600;
margin-bottom:15px;
"
>
Visita Quibdó
</h5>

<p
style="
color:#dbeafe;
"
>

Promovemos el turismo,
la cultura y el crecimiento
de los emprendimientos
locales del departamento
del Chocó.

</p>

</div>

</div>

<hr
style="
border-color:
rgba(255,255,255,.2);
"
>

<div
class="
text-center
pt-2
"
>

© 2026 Visita Quibdó
- Todos los derechos reservados

</div>

</div>

</footer>

`;