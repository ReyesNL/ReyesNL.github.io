// Respuestas guardadas cifradas: solo hay "huellas", no el texto real.
// Cada grupo es una palabra aceptada (con sus variantes de una letra de menos).
const RESPUESTAS = {
  // Primera pregunta: basta con que aparezca una de estas palabras
  peluche: [
    ["27hwe5nyf6x", "1a26z54qsq5", "ii5p3wtrbm", "k1e4k4pey7", "1scheze2hfn", "26le1k39ic1", "25hh189elnl", "xs7zuzkoty", "4n9vqlubu1"],
    ["z3oae4got8", "17kx5of34s5", "qvhll4lmm4", "1uwfabcvcdd", "cbk9yxzzd2", "2b2gl2ugb75", "nk0u53v818", "ulq5q7rzg1", "1d1ksmobtzq", "1rifpn1x503"],
    ["meqdg33xgg", "mhmsbhaibi", "q3ad6ndrxn", "292da3z80o1", "1ck8bah3ajo", "1z4n4bot7jp", "zptq2twrc9", "z2wsnsffqs", "no19s88a0k"]
  ],
  // Segunda pregunta: tienen que aparecer al menos MINIMO_NOMBRE de estas palabras
  nombre: [
    ["ooqnjaxrfr", "22u5kozcnmt", "dy9vwykorg", "9hyzcmgkew", "c1fwlu4blz", "10jt6e26hhe", "1p5jb2ixtoo"],
    ["1a5v71mhxdt", "22hjb0gfej4", "20jkhbc6jkp", "bi30kl6r4f", "1bs5o79bnjy", "1i141pz5udv", "1flb2cmrgwf", "lcpqhbeulv"],
    ["8q3jt97s9n", "2a2ovcc6l6x", "1k4ofk1f273", "cd49p8jlop", "1jnnrap4fjo", "8mvb67tgzb"],
    ["dhnl1dbj0q", "zzhbvk1teg", "2apv2so6zt2", "1evygi7wp7k", "1uzu36zbzev", "1kw6ny0ena3", "1xx8buqdcv6", "rn1qfwixn", "15ot1jmcmvl"]
  ]
};
const MINIMO_NOMBRE = 3;

const form = document.getElementById("formAcceso");
const campoPeluche = document.getElementById("contrasena");
const campoNombre = document.getElementById("nombre");
const mensaje = document.getElementById("mensaje");
const contenedor = document.querySelector(".contenedor");
const tarjeta = document.querySelector(".tarjeta");
const icono = document.getElementById("icono");
const celebracion = document.getElementById("celebracion");
const imagen = document.getElementById("celebracionImg");
const lienzo = document.getElementById("confeti");
const capaGlobos = document.getElementById("globos");
const siguiente = document.getElementById("siguiente");

const COLORES = ["#f9a8d4", "#f472b6", "#c4b5fd", "#a78bfa", "#fde68a", "#facc15", "#93c5fd", "#86efac", "#fca5a5"];

// Deja el texto en una forma simple para poder comparar:
// sin tildes, sin espacios ni signos, letras que suenan igual unificadas
// (v=b, y=i, z=s, k=c) y sin letras repetidas seguidas.
function simplificar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/v/g, "b")
    .replace(/y/g, "i")
    .replace(/z/g, "s")
    .replace(/k/g, "c")
    .replace(/(.)\1+/g, "$1");
}

// Huella de un texto (hash cyrb53). No se puede volver atrás para leer el texto.
function huella(texto) {
  let h1 = 0xdeadbeef ^ 2024;
  let h2 = 0x41c6ce57 ^ 2024;
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// La palabra y todas las versiones con una letra de menos.
// Comparando estas variantes de los dos lados se acepta una letra mal, de más o de menos.
function variantes(palabra) {
  const lista = new Set([palabra]);
  for (let i = 0; i < palabra.length; i++) {
    lista.add(palabra.slice(0, i) + palabra.slice(i + 1));
  }
  return lista;
}

// Huellas de todos los pedazos del texto, así se encuentra la palabra
// aunque esté junta con otras ("capibaraconmochila") o escrita toda unida.
function huellasDelTexto(texto) {
  const resultado = new Set();
  const simple = simplificar(texto);
  for (let largo = 3; largo <= 12; largo++) {
    for (let i = 0; i + largo <= simple.length; i++) {
      for (const v of variantes(simple.slice(i, i + largo))) {
        resultado.add(huella(v));
      }
    }
  }
  return resultado;
}

function contarCoincidencias(texto, palabras) {
  const huellas = huellasDelTexto(texto);
  return palabras.filter((grupo) => grupo.some((h) => huellas.has(h))).length;
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const peluche = campoPeluche.value.trim();
  const nombre = campoNombre.value.trim();

  if (!peluche || !nombre) {
    campoPeluche.classList.toggle("invalido", !peluche);
    campoNombre.classList.toggle("invalido", !nombre);
    mostrarMensaje("Responde las dos preguntas.", "error");
    return;
  }

  const pelucheOk = contarCoincidencias(peluche, RESPUESTAS.peluche) >= 1;
  const nombreOk = contarCoincidencias(nombre, RESPUESTAS.nombre) >= MINIMO_NOMBRE;

  campoPeluche.classList.toggle("invalido", !pelucheOk);
  campoNombre.classList.toggle("invalido", !nombreOk);

  if (pelucheOk && nombreOk) {
    mostrarMensaje("¡Correcto! Eres tú.", "exito");
    desbloquear();
  } else {
    mostrarMensaje("Alguna respuesta no es correcta. Inténtalo de nuevo.", "error");
  }
});

// Quita el borde rojo en cuanto se vuelve a escribir
[campoPeluche, campoNombre].forEach((campo) => {
  campo.addEventListener("input", () => campo.classList.remove("invalido"));
});

// ---------- Desbloqueo y celebración ----------

const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));

async function desbloquear() {
  // Cierra el teclado del celular y bloquea el formulario
  document.activeElement.blur();
  form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));

  // 1. Se abre el candado
  icono.classList.add("abierto");
  await esperar(800);

  // 2. La tarjeta se va y el fondo pasa a blanco
  tarjeta.classList.add("saliendo");
  document.body.classList.add("desbloqueado");
  await esperar(600);

  // 3. La imagen aparece pequeña y crece hasta llenar la pantalla
  await imagen.decode().catch(() => {});
  contenedor.hidden = true;
  celebracion.hidden = false;
  imagen.classList.add("creciendo");
  await esperar(1400);

  // 4. Con la imagen ya grande: confeti y globos
  imagen.classList.replace("creciendo", "lista");
  lanzarConfeti(4500);
  lanzarGlobos();
  await esperar(5000);

  // 5. La imagen desaparece y da paso a lo siguiente
  celebracion.classList.add("terminando");
  await esperar(800);
  celebracion.hidden = true;
  siguiente.hidden = false;
}

function azar(min, max) {
  return min + Math.random() * (max - min);
}

function colorAlAzar() {
  return COLORES[Math.floor(Math.random() * COLORES.length)];
}

// Confeti que cae desde arriba, dibujado en un canvas
function lanzarConfeti(duracion) {
  const ctx = lienzo.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let ancho = 0;
  let alto = 0;

  function ajustar() {
    ancho = lienzo.clientWidth;
    alto = lienzo.clientHeight;
    lienzo.width = ancho * dpr;
    lienzo.height = alto * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  ajustar();
  window.addEventListener("resize", ajustar);

  // Menos papelitos en pantallas chicas para que el celular no se trabe
  const porSegundo = Math.min(150, ancho / 5);
  const piezas = [];

  function nuevaPieza(y) {
    return {
      x: azar(0, ancho),
      y: y,
      vx: azar(-30, 30),
      vy: azar(110, 260),
      giro: azar(0, Math.PI * 2),
      vgiro: azar(-6, 6),
      fase: azar(0, Math.PI * 2),
      w: azar(6, 11),
      h: azar(9, 16),
      color: colorAlAzar(),
      redondo: Math.random() < 0.25
    };
  }

  // Una primera tanda ya repartida arriba para que empiece con fuerza
  for (let i = 0; i < porSegundo * 0.8; i++) piezas.push(nuevaPieza(azar(-alto * 0.6, -10)));

  const fin = performance.now() + duracion;
  let anterior = performance.now();
  let pendientes = 0;

  function cuadro(ahora) {
    const dt = Math.min((ahora - anterior) / 1000, 0.05);
    anterior = ahora;

    if (ahora < fin) {
      pendientes += porSegundo * dt;
      for (; pendientes >= 1; pendientes--) piezas.push(nuevaPieza(-20));
    }

    ctx.clearRect(0, 0, ancho, alto);
    for (let i = piezas.length - 1; i >= 0; i--) {
      const p = piezas[i];
      p.fase += dt * 4;
      p.x += (p.vx + Math.sin(p.fase) * 35) * dt;
      p.y += p.vy * dt;
      p.giro += p.vgiro * dt;
      if (p.y > alto + 30) {
        piezas.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.color;
      if (p.redondo) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // El coseno hace que el papelito parezca dar vueltas
        const alturaVisible = p.h * Math.abs(Math.cos(p.fase));
        ctx.fillRect(-p.w / 2, -alturaVisible / 2, p.w, alturaVisible);
      }
      ctx.restore();
    }

    if (ahora < fin || piezas.length) {
      requestAnimationFrame(cuadro);
    } else {
      window.removeEventListener("resize", ajustar);
    }
  }
  requestAnimationFrame(cuadro);
}

// Globos (redondos y de corazón) que suben desde abajo
const FORMA_REDONDA = "M30 2C14 2 3 15 3 31c0 19 15 35 27 39 12-4 27-20 27-39C57 15 46 2 30 2z";
const FORMA_CORAZON = "M30 68C11 53 3 41 3 26 3 14 11 6 21 6c5 0 8 3 9 6 1-3 4-6 9-6 10 0 18 8 18 20 0 15-8 27-27 42z";

function lanzarGlobos() {
  const cantidad = Math.round(Math.min(16, Math.max(7, window.innerWidth / 90)));
  for (let i = 0; i < cantidad; i++) {
    const color = colorAlAzar();
    const forma = Math.random() < 0.35 ? FORMA_CORAZON : FORMA_REDONDA;
    const globo = document.createElement("div");
    globo.className = "globo";
    // Repartidos a lo ancho, con un poco de desorden
    globo.style.left = ((i + azar(0.1, 0.9)) / cantidad) * 100 + "%";
    globo.style.marginLeft = "calc(var(--tam) / -2)";
    globo.style.setProperty("--tam", "clamp(42px, " + azar(8, 11).toFixed(1) + "vw, 90px)");
    globo.style.setProperty("--duracion", azar(4.5, 6.5).toFixed(2) + "s");
    globo.style.setProperty("--retraso", azar(0, 2).toFixed(2) + "s");
    globo.innerHTML =
      '<svg viewBox="0 0 60 112">' +
      '<path d="' + forma + '" fill="' + color + '"/>' +
      '<path d="M26 74l4-5 4 5z" fill="' + color + '"/>' +
      '<path d="M30 74c-6 10 6 18 0 36" stroke="#b5b5b5" stroke-width="1.5" fill="none"/>' +
      '<ellipse cx="19" cy="22" rx="5" ry="9" fill="#fff" opacity=".45" transform="rotate(-25 19 22)"/>' +
      "</svg>";
    globo.querySelector("svg").style.animationDelay = azar(-1.8, 0).toFixed(2) + "s";
    capaGlobos.appendChild(globo);
  }
}

// ---------- Tarjeta: se quita la cinta y se abre la caja de flores ----------

const carta = document.getElementById("carta");
const cinta = document.getElementById("cinta");
const pistaCinta = document.getElementById("pistaCinta");
const capaFlores = document.getElementById("flores");
const capaCorazones = document.getElementById("corazones");

const CORAZON = "M50 88C22 68 8 52 8 34C8 20 19 10 32 10C40 10 46 14 50 21C54 14 60 10 68 10C81 10 92 20 92 34C92 52 78 68 50 88Z";
const ROSADOS = ["#f472b6", "#f9a8d4", "#ec4899", "#fda4af", "#c4b5fd"];

// Flores de papel: x en % del ancho de la caja; alto y tam en fracción del lado de la tarjeta
const FLORES = [
  { x: 42, alto: 0.33, tam: 0.13, giro: -4, color: "#c4b5fd", retraso: 2.45 },
  { x: 58, alto: 0.35, tam: 0.13, giro: 5, color: "#fda4af", retraso: 2.5 },
  { x: 16, alto: 0.38, tam: 0.16, giro: -16, color: "#f472b6", retraso: 2.0 },
  { x: 84, alto: 0.38, tam: 0.16, giro: 16, color: "#f9a8d4", retraso: 2.1 },
  { x: 30, alto: 0.5, tam: 0.19, giro: -8, color: "#f9a8d4", retraso: 2.2 },
  { x: 70, alto: 0.49, tam: 0.19, giro: 9, color: "#a78bfa", retraso: 2.3 },
  { x: 50, alto: 0.58, tam: 0.21, giro: 0, color: "#ec4899", retraso: 1.95 }
];

function svgFlor(color) {
  let petalos = "";
  let brillos = "";
  for (let i = 0; i < 6; i++) {
    petalos += `<ellipse cx="0" cy="-24" rx="15" ry="24" transform="rotate(${i * 60})"/>`;
    brillos += `<ellipse cx="0" cy="-27" rx="5" ry="12" transform="rotate(${i * 60})"/>`;
  }
  return `<svg viewBox="-50 -50 100 100">
    <g fill="${color}" stroke="rgba(0,0,0,.07)" stroke-width="1.5">${petalos}</g>
    <g fill="#fff" opacity=".3">${brillos}</g>
    <circle r="12" fill="#fcd34d" stroke="#f59e0b" stroke-width="2"/>
  </svg>`;
}

FLORES.forEach((f) => {
  const flor = document.createElement("div");
  flor.className = "flor";
  flor.style.cssText = `--x:${f.x}%;--alto:${f.alto};--tam:${f.tam};--giro:${f.giro}deg;--retraso:${f.retraso}s`;
  flor.innerHTML =
    '<div class="tallo"></div><div class="hoja der"></div><div class="hoja izq"></div>' +
    '<div class="cabeza">' + svgFlor(f.color) + "</div>";
  capaFlores.appendChild(flor);
});

// Arrastrar la cinta hacia arriba
let arrastre = null;
let cintaQuitada = false;

cinta.addEventListener("pointerdown", (e) => {
  if (cintaQuitada) return;
  // Evita que el navegador empiece a seleccionar o arrastrar por su cuenta
  e.preventDefault();
  arrastre = { inicio: e.clientY, desplazamiento: 0 };
  cinta.setPointerCapture(e.pointerId);
  cinta.classList.add("agarrada");
  pistaCinta.classList.add("oculta");
});

cinta.addEventListener("pointermove", (e) => {
  if (!arrastre) return;
  const lado = carta.offsetHeight;
  arrastre.desplazamiento = Math.min(lado, Math.max(0, arrastre.inicio - e.clientY));
  cinta.style.setProperty("--arrastre", -arrastre.desplazamiento + "px");
});

function soltarCinta() {
  if (!arrastre) return;
  // Si la subió lo suficiente se quita; si no, vuelve a su lugar
  const suficiente = arrastre.desplazamiento > carta.offsetHeight * 0.25;
  arrastre = null;
  cinta.classList.remove("agarrada");
  if (suficiente) {
    quitarCinta();
  } else {
    cinta.style.setProperty("--arrastre", "0px");
    pistaCinta.classList.remove("oculta");
  }
}

cinta.addEventListener("pointerup", soltarCinta);
cinta.addEventListener("pointercancel", soltarCinta);
cinta.addEventListener("dragstart", (e) => e.preventDefault());

// Con teclado también se puede abrir
cinta.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") {
    e.preventDefault();
    quitarCinta();
  }
});

async function quitarCinta() {
  if (cintaQuitada) return;
  cintaQuitada = true;
  cinta.classList.add("fuera");
  pistaCinta.classList.add("oculta");
  await esperar(350);

  // Se abren las solapas, se arma la caja y salen las flores (los tiempos están en el CSS)
  carta.classList.add("abierta");
  setTimeout(decorarCaja, 1600);
  await esperar(2700);
  soltarCorazones();

  // Ya se puede bajar al corazón de notas
  await esperar(600);
  seccionNotas.hidden = false;
  seccionLibro.hidden = false;
  seccionSobre.hidden = false;
  ajustarCarta();
  pistaBajar.hidden = false;
  actualizarArmado();
}

function soltarCorazones() {
  for (let i = 0; i < 16; i++) {
    const corazon = document.createElement("div");
    corazon.className = "corazon";
    corazon.style.left = azar(10, 90) + "%";
    corazon.style.setProperty("--dx", "calc(var(--s) * " + azar(-0.15, 0.15).toFixed(2) + ")");
    corazon.style.setProperty("--rot", azar(-30, 30).toFixed(0) + "deg");
    corazon.style.setProperty("--dur", azar(2.2, 3.6).toFixed(2) + "s");
    corazon.style.setProperty("--delay", azar(0, 1.6).toFixed(2) + "s");
    const color = ROSADOS[Math.floor(Math.random() * ROSADOS.length)];
    corazon.innerHTML = '<svg viewBox="0 0 100 100"><path d="' + CORAZON + '" fill="' + color + '"/></svg>';
    corazon.addEventListener("animationend", () => corazon.remove());
    capaCorazones.appendChild(corazon);
  }
}

// ---------- Corazón de notas: se arma al bajar y cada nota se abre con un clic ----------

const seccionNotas = document.getElementById("seccionNotas");
const corazonNotas = document.getElementById("corazonNotas");
const pistaBajar = document.getElementById("pistaBajar");
const notaAbierta = document.getElementById("notaAbierta");
const notaGrande = document.getElementById("notaGrande");
const frase = document.getElementById("frase");
const botonCerrarNota = document.getElementById("cerrarNota");

// Frases de cada nota (1 a 12). Si una queda vacía se muestra el espacio reservado.
const FRASES = [
  "Mira quien ya tiene 18",
  "Espero que hoy te salga todo bonito, así como tu",
  "Ten apartado un pedazo de torta para mi",
  "si encuentras esta notita quiero decirte que eres una persona muy especial para mi",
  "Animoooo tigresa tu podi con todo ✨✨",
  'De parte de mi madre "feliz cumpleaños mija Niurka"',
  "Te mando mi cariñoo aunque sea de esta forma",
  "Tu puedes con todo aunque en el camino sueltes lagrimas, recuerda eres toda una via po",
  "Para mi chica insana del free fire",
  "Eres el six de mi seven y yo soy el seven de tu six 👻",
  "Te amooo",
  "recuerda cuidarte mucho o te voy a jalar las patas"
];

// Medidas tomadas del dibujo de referencia: el corazón ocupa x 268–608, y 60–390
const ZONA = { x: 268, y: 60, ancho: 340, alto: 330 };
const CENTRO_CORAZON = { x: 440, y: 215 };
const TRAZO = 'stroke="#6b2f55" stroke-width="1.1" stroke-linejoin="round"';

// En orden de atrás hacia adelante. n = número de la nota (las que no tienen n son decoración)
const NOTAS = [
  { cx: 445, cy: 362, w: 75, h: 38, rot: -22, tipo: "papel", color: "#fcd3df" },
  { cx: 500, cy: 240, w: 80, h: 48, rot: 10, tipo: "papel", color: "#efa6e6" },
  { n: 12, cx: 497, cy: 288, w: 70, h: 62, rot: 6, tipo: "papel", color: "#f38fbf" },
  { n: 10, cx: 380, cy: 298, w: 80, h: 56, rot: 2, tipo: "corazones", color: "#f6a6c7" },
  { n: 2, cx: 326, cy: 156, w: 55, h: 95, rot: -22, tipo: "papel", color: "#f38dbe" },
  { n: 3, cx: 406, cy: 132, w: 50, h: 92, rot: -24, tipo: "papel", color: "#f6a3c6" },
  { n: 6, cx: 528, cy: 145, w: 100, h: 80, rot: 35, tipo: "sobre", color: "#f28bbd" },
  { n: 8, cx: 572, cy: 196, w: 50, h: 66, rot: 32, tipo: "papel", color: "#fcd2df", cintas: [{ x: 4, y: 28, rot: 60 }] },
  { n: 7, cx: 480, cy: 145, w: 96, h: 96, rot: -10, tipo: "estrella", color: "#f9b6cf" },
  { n: 9, cx: 438, cy: 268, w: 118, h: 58, rot: -4, tipo: "punteado", color: "#f7aecb" },
  { n: 4, cx: 350, cy: 232, w: 80, h: 62, rot: -27, tipo: "sobre", color: "#fcd0de", cintas: [{ x: 27, y: 58, rot: 84 }] },
  {
    n: 5, cx: 416, cy: 222, w: 88, h: 85, rot: -6, tipo: "corazon", color: "#f6a1c4",
    corazon: { x: 52, y: 38, tam: 34, color: "#f08ab6" }, cintas: [{ x: 90, y: 41, rot: -6 }]
  },
  {
    n: 1, cx: 366, cy: 129, w: 72, h: 103, rot: -20, tipo: "corazon", color: "#fcc6d8",
    corazon: { x: 36, y: 45, tam: 28, color: "#f38db8" }, cintas: [{ x: 4, y: 22, rot: 46 }, { x: 56, y: 104, rot: 72 }]
  },
  { n: 11, cx: 428, cy: 332, w: 82, h: 54, rot: 4, tipo: "papel", color: "#ee9fe6", cintas: [{ x: 60, y: 9, rot: -30 }] }
];

function svgCorazonEn(x, y, tam, color, extra = "") {
  return `<path d="${CORAZON}" fill="${color}" ${extra} transform="translate(${x - tam / 2} ${y - tam / 2}) scale(${tam / 100})"/>`;
}

function estrellaPath(cx, cy, radioFuera, radioDentro, puntas) {
  let d = "";
  for (let i = 0; i < puntas * 2; i++) {
    const angulo = (Math.PI * i) / puntas - Math.PI / 2;
    const radio = i % 2 ? radioDentro : radioFuera;
    d += (i ? "L" : "M") + (cx + radio * Math.cos(angulo)).toFixed(1) + " " + (cy + radio * Math.sin(angulo)).toFixed(1);
  }
  return d + "Z";
}

// Cinta adhesiva con los bordes en zigzag
function svgCinta(c) {
  const largo = c.largo || 34;
  const d = `M${-largo / 2} -6.5H${largo / 2}l-3 3.25 3 3.25-3 3.25 3 3.25H${-largo / 2}l3-3.25-3-3.25 3-3.25-3-3.25Z`;
  return `<g transform="translate(${c.x} ${c.y}) rotate(${c.rot})">
    <path d="${d}" fill="#cdd5f3" fill-opacity=".92" stroke="#5c5280" stroke-width="1"/>
    <path d="M${-largo / 2 + 4} -2H${largo / 2 - 4}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
  </g>`;
}

function svgNota(nota) {
  const { w, h } = nota;
  let sombra;
  let forma;

  if (nota.tipo === "estrella") {
    const borde = estrellaPath(w / 2, h / 2, w / 2, w * 0.41, 16);
    sombra = `<path d="${borde}" transform="translate(3 4)" fill="rgba(110,30,70,.25)"/>`;
    forma =
      `<path d="${borde}" fill="${nota.color}" ${TRAZO}/>` +
      `<path d="${estrellaPath(w / 2, h / 2, w * 0.31, w * 0.23, 12)}" fill="#fde3ec" stroke="#ea8bb4" stroke-width="1"/>`;
  } else {
    sombra = `<rect x="3" y="4" width="${w}" height="${h}" fill="rgba(110,30,70,.25)"/>`;
    forma = `<rect width="${w}" height="${h}" fill="${nota.color}" ${TRAZO}/>`;

    if (nota.tipo === "corazon") {
      const c = nota.corazon;
      forma += svgCorazonEn(c.x, c.y, c.tam, c.color);
    } else if (nota.tipo === "sobre") {
      forma +=
        `<path d="M0 0L${w / 2} ${h * 0.55}L${w} 0Z" fill="rgba(255,255,255,.22)" ${TRAZO}/>` +
        `<path d="M0 ${h}L${w * 0.4} ${h * 0.5}M${w} ${h}L${w * 0.6} ${h * 0.5}" fill="none" stroke="#6b2f55" stroke-width=".8" opacity=".5"/>`;
    } else if (nota.tipo === "punteado") {
      forma += `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="#6b2f55" stroke-width="1" stroke-dasharray="6 4" opacity=".7"/>`;
    } else if (nota.tipo === "corazones") {
      forma +=
        svgCorazonEn(w * 0.2, h * 0.3, 11, "#ee86b3") +
        svgCorazonEn(w * 0.47, h * 0.66, 13, "#ee86b3") +
        svgCorazonEn(w * 0.76, h * 0.34, 9, "#ee86b3") +
        svgCorazonEn(w * 0.14, h * 0.78, 8, "#ee86b3");
    }
  }

  const cintas = (nota.cintas || []).map(svgCinta).join("");
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${sombra}${forma}${cintas}</svg>`;
}

// Base del corazón con una blonda (encaje) asomando por la izquierda
function svgFondo() {
  const cx = 322;
  const cy = 172;
  const radio = 50;
  const ondas = 24;
  let blonda = "";
  for (let i = 0; i <= ondas; i++) {
    const angulo = (i / ondas) * Math.PI * 2;
    const x = (cx + radio * Math.cos(angulo)).toFixed(1);
    const y = (cy + radio * Math.sin(angulo)).toFixed(1);
    blonda += i === 0 ? `M${x} ${y}` : `A7 7 0 0 1 ${x} ${y}`;
  }
  return `<svg viewBox="${ZONA.x} ${ZONA.y} ${ZONA.ancho} ${ZONA.alto}" aria-hidden="true">
    <path d="${blonda}Z" fill="#fff" stroke="#6b2f55" stroke-width="1"/>
    <path d="M440 378C380 335 283 272 284 182C285 122 330 96 370 100C405 104 426 126 440 152C455 122 490 95 530 98C575 101 601 140 598 186C595 262 500 334 440 378Z" fill="#ee8fbf" stroke="#6b2f55" stroke-width="1.2"/>
  </svg>`;
}

const piezas = [];

function agregarPieza(el, datos) {
  // Cada pieza llega volando desde afuera, en la dirección contraria al centro del corazón
  const dx = datos.cx - CENTRO_CORAZON.x;
  const dy = datos.cy - CENTRO_CORAZON.y;
  const distancia = Math.hypot(dx, dy) || 1;
  const i = piezas.length;
  piezas.push({
    el,
    ...datos,
    desdeX: (dx / distancia) * 1.1,
    desdeY: (dy / distancia) * 1.1,
    giroExtra: (i % 2 ? 1 : -1) * (25 + ((i * 7) % 20))
  });
}

const fondoCorazon = document.createElement("div");
fondoCorazon.className = "nota";
fondoCorazon.style.cssText = "left:0;top:0;width:100%;height:100%";
fondoCorazon.innerHTML = svgFondo();
corazonNotas.appendChild(fondoCorazon);
piezas.push({ el: fondoCorazon, rot: 0, desdeX: 0, desdeY: 0.15, giroExtra: 0 });

NOTAS.forEach((nota) => {
  const el = document.createElement("div");
  el.className = "nota";
  el.style.left = ((nota.cx - nota.w / 2 - ZONA.x) / ZONA.ancho) * 100 + "%";
  el.style.top = ((nota.cy - nota.h / 2 - ZONA.y) / ZONA.alto) * 100 + "%";
  el.style.width = (nota.w / ZONA.ancho) * 100 + "%";
  el.style.height = (nota.h / ZONA.alto) * 100 + "%";
  el.innerHTML = svgNota(nota);
  corazonNotas.appendChild(el);
  agregarPieza(el, nota);

  if (nota.n) {
    el.classList.add("clic");
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "Abrir nota " + nota.n);
    el.addEventListener("click", () => abrirNota(piezas.find((p) => p.el === el)));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirNota(piezas.find((p) => p.el === el));
      }
    });
  }
});

function limitar(valor) {
  return Math.min(1, Math.max(0, valor));
}

// Mueve cada pieza según cuánto se ha bajado
function actualizarArmado() {
  if (seccionNotas.hidden) return;
  const r = seccionNotas.getBoundingClientRect();
  const alto = window.innerHeight;
  // 0 cuando la sección asoma por abajo, 1 cuando se termina su recorrido
  const progreso = limitar((alto * 0.6 - r.top) / (r.height - alto * 0.4));
  const ancho = corazonNotas.offsetWidth;

  piezas.forEach((pz, i) => {
    const t = limitar((progreso - i * 0.045) / 0.3);
    const llegada = 1 - Math.pow(1 - t, 3);
    const falta = 1 - llegada;
    pz.el.style.opacity = Math.min(1, t * 2.5);
    pz.el.style.transform =
      `translate(${pz.desdeX * ancho * falta}px, ${pz.desdeY * ancho * falta}px) ` +
      `rotate(${pz.rot + pz.giroExtra * falta}deg) scale(${0.75 + 0.25 * llegada})`;
  });

  corazonNotas.classList.toggle("armado", progreso >= 0.95);
  pistaBajar.classList.toggle("oculta", window.scrollY > 30);
}

let armadoPendiente = false;
function pedirArmado() {
  if (armadoPendiente) return;
  armadoPendiente = true;
  requestAnimationFrame(() => {
    armadoPendiente = false;
    actualizarArmado();
  });
}

window.addEventListener("scroll", pedirArmado, { passive: true });
window.addEventListener("resize", pedirArmado);

// ---------- Abrir y cerrar una nota ----------

let notaActual = null;

// Posición de la nota en el corazón, medida desde el centro de la pantalla
function transformEnCorazon(pz) {
  const r = pz.el.getBoundingClientRect();
  const x = r.left + r.width / 2 - window.innerWidth / 2;
  const y = r.top + r.height / 2 - window.innerHeight / 2;
  return `translate(${x}px, ${y}px) rotate(${pz.rot}deg) scale(1)`;
}

function abrirNota(pz) {
  if (!pz || notaActual || !corazonNotas.classList.contains("armado")) return;
  notaActual = pz;

  const w = pz.el.offsetWidth;
  const h = pz.el.offsetHeight;
  const escala = Math.min((window.innerWidth * 0.8) / w, (window.innerHeight * 0.62) / h);

  notaGrande.innerHTML = "";
  notaGrande.appendChild(pz.el.querySelector("svg").cloneNode(true));
  notaGrande.style.width = w + "px";
  notaGrande.style.height = h + "px";
  notaGrande.style.margin = -h / 2 + "px 0 0 " + -w / 2 + "px";
  notaGrande.style.transition = "none";
  notaGrande.style.transform = transformEnCorazon(pz);

  const texto = FRASES[pz.n - 1];
  frase.textContent = texto || "Aquí irá la frase n.º " + pz.n;
  frase.classList.toggle("vacia", !texto);
  frase.style.maxWidth = Math.min(w * escala * 0.8, 460) + "px";

  notaAbierta.hidden = false;
  pz.el.classList.add("oculta");
  notaGrande.getBoundingClientRect(); // fija el punto de partida antes de animar
  notaGrande.style.transition = "";
  notaGrande.style.transform = `translate(0px, 0px) rotate(0deg) scale(${escala})`;
  notaAbierta.classList.add("visible");
}

async function cerrarNota() {
  if (!notaActual) return;
  const pz = notaActual;
  notaAbierta.classList.remove("visible");
  notaGrande.style.transform = transformEnCorazon(pz);
  await esperar(700);
  notaAbierta.hidden = true;
  pz.el.classList.remove("oculta");
  notaActual = null;
}

notaAbierta.addEventListener("click", cerrarNota);
botonCerrarNota.addEventListener("click", (e) => {
  e.stopPropagation();
  cerrarNota();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarNota();
});

// Mientras una nota está abierta, la página de atrás no se mueve
["wheel", "touchmove"].forEach((tipo) => {
  notaAbierta.addEventListener(tipo, (e) => e.preventDefault(), { passive: false });
});

// ---------- Librito virtual ----------

// Contenido del librito.
// Portada: puede llevar una imagen (por ejemplo "img/portada.jpg"), un título, o las dos cosas.
//          Si no lleva imagen se usa el dibujo de la noche con la luna.
// Páginas: cada una puede llevar texto, una imagen (por ejemplo "img/foto1.jpg") o las dos cosas.
//          Si solo lleva imagen, la foto ocupa la página completa.
//          Con "imagenDoble" la imagen ocupa las dos hojas abiertas: la mitad izquierda va en la hoja
//          de la izquierda y la otra mitad en esa página (en celular, que se ve una hoja a la vez, va completa).
const LIBRO = {
  portada: { imagen: "", titulo: "Nuestro librito", subtitulo: "" },
  paginas: Array.from({ length: 48 }, () => ({ texto: "", imagen: "" }))
};

// Página 1: la presentación del álbum; con "textoGrande" la letra crece hasta llenar la hoja
LIBRO.paginas[0] = {
  texto: "Un pequeño álbum de los hermosos recuerdos, tanto bonitos como randoms",
  textoGrande: true
};

// Página 2: el dibujo de "Mi corazón hace tun tun cuando te veo" abierto en las dos hojas
LIBRO.paginas[1] = { imagenDoble: "img/libro-tuntun.png", descripcion: "Mi corazón hace tun tun cuando te veo" };

// Páginas 3 a 48: las fotos (en img/libro/), cada una abierta en las dos hojas.
// Casi todas son .webp; las que llegaron en PNG se guardaron como .jpg
const PAGINAS_JPG = [3, 40, 48];
for (let numero = 3; numero <= 48; numero++) {
  const extension = PAGINAS_JPG.includes(numero) ? ".jpg" : ".webp";
  const archivo = "img/libro/pagina-" + String(numero).padStart(2, "0") + extension;
  LIBRO.paginas[numero - 1] = { imagenDoble: archivo, descripcion: "Foto de la página " + numero };
}

const seccionLibro = document.getElementById("seccionLibro");
const libro = document.getElementById("libro");
const contenedorHojas = document.getElementById("hojas");
const pistaLibro = document.getElementById("pistaLibro");

// Números al azar pero siempre iguales, para que las estrellas no cambien de lugar
function azarFijo(semilla) {
  return () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
}

function estrellasSvg(cantidad, alto, semilla) {
  const azarEstrella = azarFijo(semilla);
  let estrellas = "";
  for (let i = 0; i < cantidad; i++) {
    const x = (azarEstrella() * 300).toFixed(1);
    const y = (azarEstrella() * alto).toFixed(1);
    const radio = (0.6 + azarEstrella() * 1.3).toFixed(2);
    const brillo = (0.5 + azarEstrella() * 0.5).toFixed(2);
    const titila = i % 4 === 0 ? ` class="estrella-titila" style="animation-delay:${(azarEstrella() * 2.4).toFixed(2)}s"` : "";
    estrellas += `<circle cx="${x}" cy="${y}" r="${radio}" fill="#fff" opacity="${brillo}"${titila}/>`;
  }
  return estrellas;
}

// Portada: cielo de noche, luna y dos gatitos de espaldas sobre una colina
function svgPortada() {
  const linea = 'stroke="#3a3156" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  const pelo = "#ebe5f4";
  const cola = (d) =>
    `<path d="${d}" fill="none" stroke="#3a3156" stroke-width="9" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${pelo}" stroke-width="4.5" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="cieloPortada" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7486dc"/>
        <stop offset=".45" stop-color="#9b9fe4"/>
        <stop offset=".68" stop-color="#c3a3e0"/>
        <stop offset="1" stop-color="#d7a6dc"/>
      </linearGradient>
      <radialGradient id="brilloLuna">
        <stop offset="0" stop-color="#fff6dc" stop-opacity=".5"/>
        <stop offset="1" stop-color="#fff6dc" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="colinaPortada" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#5a68dc"/>
        <stop offset="1" stop-color="#4350c2"/>
      </linearGradient>
      <mask id="mascaraLuna">
        <circle cx="228" cy="100" r="32" fill="#fff"/>
        <circle cx="212" cy="88" r="28" fill="#000"/>
      </mask>
    </defs>
    <rect width="300" height="420" fill="url(#cieloPortada)"/>
    ${estrellasSvg(48, 250, 7)}
    <circle cx="228" cy="100" r="62" fill="url(#brilloLuna)"/>
    <circle cx="228" cy="100" r="32" fill="#fdf1d6" mask="url(#mascaraLuna)"/>

    <path d="M0 300C60 270 120 262 170 266C220 270 265 285 300 300V420H0Z" fill="url(#colinaPortada)"/>
    <ellipse cx="232" cy="342" rx="62" ry="11" fill="#4a57cc" opacity=".7"/>
    <ellipse cx="150" cy="385" rx="52" ry="9" fill="#4a57cc" opacity=".7"/>
    <g fill="none" stroke="#2d3080" stroke-width="2" stroke-linecap="round">
      <path d="M72 322q3-6 6 0q3-6 6 0"/><path d="M206 312q3-6 6 0q3-6 6 0"/>
      <path d="M140 350q3-6 6 0q3-6 6 0"/><path d="M250 372q3-6 6 0q3-6 6 0"/>
    </g>
    <path d="M0 362Q18 346 34 360Q48 350 62 366Q78 360 86 382Q100 384 104 400Q110 410 108 420H0Z" fill="#2a1f3d"/>
    <path d="M300 352Q284 344 272 358Q258 352 248 370Q234 370 230 390Q222 404 226 420H300Z" fill="#2a1f3d"/>

    ${cola("M86 284C62 290 56 270 68 262")}
    ${cola("M170 287C192 291 198 272 187 263")}
    <path d="M80 292C76 262 88 246 108 246C128 246 138 262 134 292Z" fill="${pelo}" ${linea}/>
    <path d="M128 293C126 266 138 252 154 252C170 252 178 266 176 293Z" fill="${pelo}" ${linea}/>
    <path d="M124 264C138 255 151 257 161 266" fill="none" stroke="#3a3156" stroke-width="11" stroke-linecap="round"/>
    <path d="M124 264C138 255 151 257 161 266" fill="none" stroke="${pelo}" stroke-width="6" stroke-linecap="round"/>

    <path d="M80 214L84 186L101 200Z" fill="${pelo}" ${linea}/>
    <path d="M114 199L131 186L134 213Z" fill="${pelo}" ${linea}/>
    <ellipse cx="107" cy="222" rx="31" ry="26" fill="${pelo}" ${linea}/>
    <g transform="rotate(-12 152 232)">
      <path d="M128 226L131 201L146 213Z" fill="${pelo}" ${linea}/>
      <path d="M158 211L174 200L177 226Z" fill="${pelo}" ${linea}/>
      <ellipse cx="152" cy="234" rx="27" ry="23" fill="${pelo}" ${linea}/>
    </g>
    <g fill="#f7a8c8" stroke="#3a3156" stroke-width="1">
      <circle cx="167" cy="207" r="4"/><circle cx="175" cy="208" r="4"/><circle cx="176" cy="216" r="4"/>
      <circle cx="169" cy="220" r="4"/><circle cx="164" cy="214" r="4"/>
    </g>
    <circle cx="170" cy="213" r="2.6" fill="#fcd34d"/>
  </svg>`;
}

// Por dentro de la portada: papel lila con estrellitas
function svgGuarda() {
  return `<svg viewBox="0 0 300 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="300" height="420" fill="#d9d2f0"/>
    <g opacity=".7">${estrellasSvg(40, 420, 11).replace(/#fff/g, "#f4f0ff")}</g>
  </svg>`;
}

// Para que un texto escrito en LIBRO se muestre tal cual (aunque tenga < o comillas)
function escaparHtml(texto) {
  return String(texto).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function contenidoPortada(portada) {
  let html = portada.imagen ? `<img class="portada-imagen" src="${escaparHtml(portada.imagen)}" alt="">` : svgPortada();
  if (portada.titulo || portada.subtitulo) {
    html += `<div class="portada-textos${portada.imagen ? " sobre-imagen" : ""}">`;
    if (portada.titulo) html += `<h3>${escaparHtml(portada.titulo)}</h3>`;
    if (portada.subtitulo) html += `<p>${escaparHtml(portada.subtitulo)}</p>`;
    html += "</div>";
  }
  return html;
}

// Una mitad de la imagen que va abierta en las dos hojas: la imagen mide como las dos hojas juntas
// (se recorta sin deformarse si es más ancha) y cada hoja muestra su mitad
function mitadImagenDoble(pagina, lado) {
  return `<div class="pagina-doble ${lado}"><img src="${escaparHtml(pagina.imagenDoble)}" alt=""></div>`;
}

function contenidoPagina(pagina, numero) {
  if (pagina.textoGrande) {
    return `<div class="pagina pagina-texto-grande">
      <p class="texto-grande">${escaparHtml(pagina.texto)}</p>
      <svg class="adorno-texto-grande" viewBox="0 0 100 100" aria-hidden="true"><path d="${CORAZON}" fill="#e889a8"/></svg>
    </div>`;
  }
  if (pagina.imagenDoble) {
    return (
      mitadImagenDoble(pagina, "derecha") +
      `<img class="pagina-doble-completa" src="${escaparHtml(pagina.imagenDoble)}" alt="${escaparHtml(pagina.descripcion || "")}">`
    );
  }
  let html = "";
  if (pagina.imagen) html += `<img src="${escaparHtml(pagina.imagen)}" alt="">`;
  if (pagina.texto) html += `<p>${escaparHtml(pagina.texto)}</p>`;
  if (!html) html = `<div class="pagina-vacia">Página ${numero}<small>Aquí irá tu contenido</small></div>`;
  const soloImagen = pagina.imagen && !pagina.texto ? " solo-imagen" : "";
  return `<div class="pagina${soloImagen}">${html}</div><span class="numero-pagina">${numero}</span>`;
}

// Hojas: la portada y luego una hoja por página (contenido adelante, papel liso atrás)
const hojas = [];

function crearHoja(frente, atras, esPortada) {
  const hoja = document.createElement("div");
  hoja.className = "hoja-libro" + (esPortada ? " portada" : "");
  hoja.innerHTML = `<div class="cara-hoja frente">${frente}</div><div class="cara-hoja atras">${atras}</div>`;
  contenedorHojas.appendChild(hoja);
  hojas.push({ el: hoja, turno: 0 });
}

crearHoja(
  contenidoPortada(LIBRO.portada),
  LIBRO.paginas[0] && LIBRO.paginas[0].imagenDoble ? mitadImagenDoble(LIBRO.paginas[0], "izquierda") : svgGuarda(),
  true
);
// La parte de atrás de una hoja queda a la izquierda cuando se pasa: ahí va la mitad izquierda
// si la página siguiente lleva una imagen doble
LIBRO.paginas.forEach((pagina, i) => {
  const siguientePagina = LIBRO.paginas[i + 1];
  const atras = siguientePagina && siguientePagina.imagenDoble ? mitadImagenDoble(siguientePagina, "izquierda") : "";
  crearHoja(contenidoPagina(pagina, i + 1), atras, false);
});

let hojasVolteadas = 0;

// Las hojas sin pasar se apilan a la derecha (la primera arriba) y las pasadas a la izquierda (la última arriba)
function ordenarHoja(i) {
  const volteada = hojas[i].el.classList.contains("volteada");
  hojas[i].el.style.zIndex = volteada ? i + 1 : hojas.length - i;
}

hojas.forEach((_, i) => ordenarHoja(i));

function voltearHoja(i, volteada) {
  const h = hojas[i];
  const turno = ++h.turno;
  // Mientras gira va por encima de todo; al terminar vuelve a su pila
  h.el.style.zIndex = hojas.length * 2 + 1;
  h.el.classList.toggle("volteada", volteada);
  setTimeout(() => {
    if (h.turno === turno) ordenarHoja(i);
  }, 900);
}

function actualizarEstadoLibro() {
  libro.classList.toggle("abierto", hojasVolteadas > 0);
  pistaLibro.textContent =
    hojasVolteadas === 0 ? "Toca la portada para abrirla" : "Desliza o toca los lados para pasar las páginas";
}

function paginaSiguiente() {
  if (hojasVolteadas >= hojas.length) return;
  voltearHoja(hojasVolteadas, true);
  hojasVolteadas++;
  actualizarEstadoLibro();
}

function paginaAnterior() {
  if (hojasVolteadas <= 0) return;
  hojasVolteadas--;
  voltearHoja(hojasVolteadas, false);
  actualizarEstadoLibro();
}

// Ancho: si caben las dos páginas lado a lado se muestran; si no, solo la de la derecha
function revisarAnchoLibro() {
  libro.classList.toggle("ancho", window.innerWidth >= libro.offsetWidth * 1.84 + 48);
}

revisarAnchoLibro();
window.addEventListener("resize", revisarAnchoLibro);

// Los textos grandes crecen hasta llenar su hoja sin salirse (se busca el tamaño más grande que cabe)
function ajustarTextosGrandes() {
  libro.querySelectorAll(".pagina-texto-grande").forEach((caja) => {
    const texto = caja.querySelector(".texto-grande");
    const adorno = caja.querySelector(".adorno-texto-grande");
    const estilo = getComputedStyle(caja);
    const altoAdorno = adorno.getBoundingClientRect().height;
    const altoLibre = caja.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom) - altoAdorno - 12;
    if (altoLibre <= 0) return;
    let menor = 8;
    let mayor = 200;
    for (let vuelta = 0; vuelta < 14; vuelta++) {
      const medio = (menor + mayor) / 2;
      texto.style.fontSize = medio + "px";
      const cabe = texto.offsetHeight <= altoLibre && texto.scrollWidth <= texto.clientWidth;
      if (cabe) menor = medio;
      else mayor = medio;
    }
    texto.style.fontSize = menor + "px";
  });
}

window.addEventListener("resize", ajustarTextosGrandes);
if (document.fonts) document.fonts.ready.then(ajustarTextosGrandes);

// Arrastrar: la hoja sigue al dedo o al mouse; al soltar termina de pasar o vuelve a su lugar.
// Tocar: el lado izquierdo regresa una página y el derecho avanza.
let gestoLibro = null;

libro.addEventListener("pointerdown", (e) => {
  if (e.button > 0) return;
  gestoLibro = { x: e.clientX, y: e.clientY, inicio: performance.now(), hoja: -1, direccion: 0, avance: 0 };
  libro.setPointerCapture(e.pointerId);
});

libro.addEventListener("pointermove", (e) => {
  const g = gestoLibro;
  if (!g) return;
  const dx = e.clientX - g.x;

  if (!g.direccion) {
    if (Math.abs(dx) < 10) return;
    // Arrastrar a la izquierda pasa la hoja de arriba; a la derecha regresa la última pasada
    g.direccion = dx < 0 ? 1 : -1;
    const i = g.direccion === 1 ? hojasVolteadas : hojasVolteadas - 1;
    if (i < 0 || i >= hojas.length) return;
    g.hoja = i;
    hojas[i].turno++;
    hojas[i].el.classList.add("arrastrando");
    hojas[i].el.style.zIndex = hojas.length * 2 + 1;
  }
  if (g.hoja < 0) return;

  g.avance = Math.min(1, Math.max(0, (-dx * g.direccion) / (contenedorHojas.offsetWidth * 0.9)));
  const angulo = g.direccion === 1 ? -180 * g.avance : -180 + 180 * g.avance;
  hojas[g.hoja].el.style.transform = `perspective(2400px) rotateY(${angulo}deg)`;
});

function soltarLibro(e, cancelado) {
  const g = gestoLibro;
  if (!g) return;
  gestoLibro = null;

  if (g.hoja >= 0) {
    const i = g.hoja;
    const rapido = performance.now() - g.inicio < 300 && Math.abs(e.clientX - g.x) > 40;
    hojas[i].el.classList.remove("arrastrando");
    hojas[i].el.style.transform = "";
    if (!cancelado && (g.avance > 0.3 || rapido)) {
      if (g.direccion === 1) paginaSiguiente();
      else paginaAnterior();
    } else {
      // No llegó lejos: vuelve a su lugar y después a su pila
      const turno = ++hojas[i].turno;
      setTimeout(() => {
        if (hojas[i].turno === turno) ordenarHoja(i);
      }, 900);
    }
    return;
  }

  if (cancelado || g.direccion || Math.abs(e.clientY - g.y) > 10) return;

  // Toque: a la izquierda del lomo (o en el borde izquierdo de la página) regresa, si no avanza
  const r = contenedorHojas.getBoundingClientRect();
  const limite = libro.classList.contains("ancho") ? r.left : r.left + r.width * 0.3;
  if (hojasVolteadas > 0 && e.clientX < limite) paginaAnterior();
  else paginaSiguiente();
}

libro.addEventListener("pointerup", (e) => soltarLibro(e, false));
libro.addEventListener("pointercancel", (e) => soltarLibro(e, true));
libro.addEventListener("dragstart", (e) => e.preventDefault());

// Con las flechas del teclado, cuando el libro está en pantalla
let libroEnPantalla = false;

document.addEventListener("keydown", (e) => {
  if (!libroEnPantalla || notaActual) return;
  if (e.key === "ArrowRight") paginaSiguiente();
  if (e.key === "ArrowLeft") paginaAnterior();
});

// Aparece suavemente cuando se llega a él
new IntersectionObserver(
  (entradas) => {
    if (!entradas[0].isIntersecting) return;
    revisarAnchoLibro();
    ajustarTextosGrandes();
    seccionLibro.classList.add("visible");
  },
  { threshold: 0.25 }
).observe(seccionLibro);

new IntersectionObserver((entradas) => (libroEnPantalla = entradas[0].isIntersecting), { threshold: 0.4 }).observe(libro);

actualizarEstadoLibro();

// ---------- Carta en sobre: se desata el moño, se abre la solapa y sale la carta ----------

// Texto de la carta. Cada párrafo va en su propia línea de la lista; el saludo es opcional.
// En la despedida, "\n" es un salto de línea. La firma va grande al final, como un "fin".
const CARTA = {
  titulo: "Para ti",
  saludo: "",
  parrafos: [
    "Esta es mi primera vez escribiendo una carta a mano y se que te vas burlar por la letra toda rara con la que escribiré pero hare mi mejor esfuerzo para no cometer errores ortográficos",
    "Niurka se que las cosas no salieron bien y a pesar de todo quiero mandarte mi cariñito, esto sera una sorpresa para ti ya que no dije que escribiría una carta, te mande dos polerones, uno que lastimosamente un bolsillo esta dañado pero ese polerón representa mucho para mi y te lo quise enviar para cuando te sientas mal o me extrañes tengas algo mio en lo que puedas abrazar",
    "El otro poleron se que no lo has visto que lo use pero lo tenia guardado por que abriga un poco, y como se acerca el fenómeno del niño te lo mando para que estes calentita en tu casa y obvio bañado en perfume para que vayas sabiendo que aroma tengo",
    "Te preguntaras para que los 2 balsamos labial pues para esos labios hermoso que estén siempre relucientes, una princesa debe cuidarse mucho, envie dos para que duren ya que no se si se gasten muy rápido y una cadenita que deberías de tener muchas pero esa sera especial para ti",
    "Y como ultimo regalo un anillo que se que no es el mejor anillo pero simboliza que aunque este tan lejos de ti te haga sentir amada y apreciada pero luego te lo cambiare por uno de compromiso y no olvidar el capibara que espero que te cuide ya que tiene una camara escondida (mentiraa, dentro le quería meter dulces pero temia a que el calor los derritiera y se dañara por dentro)"
  ],
  despedida: "Espero que te guste mucho todo,\ncon mucho amor",
  firma: "tu rey"
};

const seccionSobre = document.getElementById("seccionSobre");
const escenaSobre = document.getElementById("escenaSobre");
const misiva = document.getElementById("misiva");
const lazoBoton = document.getElementById("lazoBoton");

function contenidoCarta() {
  const parrafos = CARTA.parrafos.map((p) => `<p class="misiva-parrafo">${escaparHtml(p)}</p>`).join("");
  return `<div class="misiva-contenido">
    <h3 class="misiva-titulo">${escaparHtml(CARTA.titulo)}<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${CORAZON}" fill="#d9677f"/></svg></h3>
    ${CARTA.saludo ? `<p>${escaparHtml(CARTA.saludo)}</p>` : ""}
    ${parrafos}
    <p class="misiva-despedida">${escaparHtml(CARTA.despedida).replace(/\n/g, "<br>")}</p>
    <p class="misiva-firma">${escaparHtml(CARTA.firma)}</p>
  </div>`;
}

// La carta va completa en las dos mitades; cada mitad muestra solo su parte
misiva.querySelectorAll(".misiva-papel").forEach((papel) => (papel.innerHTML = contenidoCarta()));

// Tamaño de la carta doblada cuando está dentro del sobre
function ajustarCarta() {
  const anchoSobre = escenaSobre.querySelector(".sobre-fondo").offsetWidth;
  if (!anchoSobre) return;
  escenaSobre.style.setProperty("--escala-dentro", ((0.62 * anchoSobre) / misiva.offsetWidth).toFixed(3));
}

// Ya abierta, la hoja se alarga lo necesario para que se lea todo el texto con letra cómoda
function extenderCarta() {
  seccionSobre.style.removeProperty("--mh");
  const contenido = misiva.querySelector(".misiva-cara.frente .misiva-contenido");
  const necesario = contenido.offsetHeight + misiva.offsetWidth * 0.12;
  if (necesario > misiva.offsetHeight) seccionSobre.style.setProperty("--mh", Math.ceil(necesario) + "px");
}

let sobreAbierto = false;

async function abrirSobre() {
  if (sobreAbierto) return;
  sobreAbierto = true;
  ajustarCarta();

  // 1. Se desata el moño
  escenaSobre.classList.add("desatado");
  await esperar(1100);

  // 2. La solapa se abre por su borde diagonal
  escenaSobre.classList.add("solapa-abierta");
  await esperar(950);

  // 3. La carta doblada sale del sobre
  escenaSobre.classList.add("carta-afuera");
  await esperar(900);

  // 4. Se pone delante, crece y el sobre se va
  escenaSobre.classList.add("carta-arriba");
  await esperar(1000);

  // 5. Se desdobla sola
  escenaSobre.classList.add("carta-abierta");
  await esperar(1200);

  // 6. Se alarga para mostrar todo el texto
  extenderCarta();
}

lazoBoton.addEventListener("click", abrirSobre);
escenaSobre.querySelector(".lazo-cinta").addEventListener("click", abrirSobre);
lazoBoton.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    abrirSobre();
  }
});

new IntersectionObserver((entradas) => {
  if (entradas[0].isIntersecting) ajustarCarta();
}).observe(seccionSobre);

window.addEventListener("resize", () => {
  if (seccionSobre.hidden) return;
  ajustarCarta();
  if (escenaSobre.classList.contains("carta-abierta")) extenderCarta();
});

if (document.fonts) document.fonts.ready.then(() => {
  if (!seccionSobre.hidden) ajustarCarta();
});

// ---------- Nubes detrás del libro ----------
// Cada nube se dibuja distinta y, cuando sale por la derecha, vuelve a entrar por la izquierda
// con otra forma, otro tamaño y otra altura: así el cielo nunca se repite.

const capaNubes = document.getElementById("capaNubes");
const nubes = [];
let idNube = 0;
let nubesCorriendo = false;
let tiempoNubes = 0;

// Bolitas más grandes al centro sobre una base plana; luz durazno arriba y sombra lila abajo
function svgNube(ancho, alto) {
  const id = "nube" + idNube++;
  const cantidad = 5 + Math.floor(Math.random() * 4);
  let bolitas = "";
  let luces = "";
  for (let i = 0; i < cantidad; i++) {
    const t = (i + 0.5) / cantidad;
    const r = alto * (0.16 + 0.22 * Math.sin(Math.PI * t)) * azar(0.85, 1.15);
    const cx = ancho * (0.1 + 0.8 * t) + azar(-0.03, 0.03) * ancho;
    const cy = alto * 0.86 - r * 0.75;
    bolitas += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"/>`;
    if (r > alto * 0.32) {
      bolitas += `<circle cx="${(cx + azar(-0.2, 0.2) * r).toFixed(1)}" cy="${(cy - r * 0.55).toFixed(1)}" r="${(r * 0.55).toFixed(1)}"/>`;
    }
    luces += `<circle cx="${(cx - r * 0.18).toFixed(1)}" cy="${(cy - r * 0.3).toFixed(1)}" r="${(r * 0.62).toFixed(1)}"/>`;
  }
  const base = `<ellipse cx="${ancho / 2}" cy="${alto * 0.82}" rx="${ancho * 0.44}" ry="${alto * 0.12}"/>`;
  return `<svg viewBox="0 0 ${ancho} ${alto}" aria-hidden="true">
    <defs>
      <clipPath id="${id}c">${bolitas}${base}</clipPath>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fde4d4"/>
        <stop offset=".45" stop-color="#f7c6cf"/>
        <stop offset=".8" stop-color="#e2c2dc"/>
        <stop offset="1" stop-color="#c4c7e8"/>
      </linearGradient>
      <filter id="${id}f" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="${(alto * 0.05).toFixed(1)}"/>
      </filter>
    </defs>
    <g clip-path="url(#${id}c)">
      <rect width="${ancho}" height="${alto}" fill="url(#${id}g)"/>
      <g fill="#fff2e8" opacity=".55" filter="url(#${id}f)">${luces}</g>
      <ellipse cx="${ancho * 0.55}" cy="${alto * 0.94}" rx="${ancho * 0.5}" ry="${alto * 0.2}" fill="#c3c6e8" opacity=".7" filter="url(#${id}f)"/>
    </g>
  </svg>`;
}

// Altura por donde pasan las nubes: a la altura del libro (y también encima si a los lados no hay espacio)
function franjaNubes() {
  const capa = capaNubes.getBoundingClientRect();
  const l = libro.getBoundingClientRect();
  let arriba = l.top - capa.top;
  const abajo = l.bottom - capa.top;
  if ((capa.width - l.width) / 2 < 70) arriba -= l.height * 0.6;
  return { arriba, abajo };
}

function colocarNube(nube, alInicio) {
  const cercania = Math.random(); // 0 = lejos (chica y lenta), 1 = cerca (grande y rápida)
  const altoDibujo = azar(140, 200);
  const ancho = (libro.offsetWidth || 300) * (0.6 + 0.9 * cercania);
  const alto = (ancho * altoDibujo) / 300;
  const { arriba, abajo } = franjaNubes();

  nube.el.innerHTML = svgNube(300, altoDibujo);
  nube.el.style.width = ancho + "px";
  nube.el.style.height = alto + "px";
  nube.el.style.opacity = (0.7 + 0.3 * cercania).toFixed(2);
  nube.el.style.zIndex = Math.round(cercania * 10);
  nube.velocidad = 8 + 22 * cercania;
  nube.y = azar(arriba - alto * 0.3, Math.max(arriba, abajo - alto * 0.7));
  nube.x = alInicio ? azar(-ancho, capaNubes.offsetWidth) : -ancho - azar(0, 200);
}

function crearNubes() {
  if (nubes.length) return;
  const cantidad = Math.round(Math.min(14, Math.max(6, capaNubes.offsetWidth / 110)));
  for (let i = 0; i < cantidad; i++) {
    const el = document.createElement("div");
    el.className = "nube";
    capaNubes.appendChild(el);
    const nube = { el };
    nubes.push(nube);
    colocarNube(nube, true);
  }
}

// Se desvanecen mientras se baja hacia la carta
function desvanecerNubes() {
  const r = seccionLibro.getBoundingClientRect();
  const altoVentana = window.innerHeight;
  capaNubes.style.opacity = limitar((r.bottom - altoVentana * 0.35) / (altoVentana * 0.45)).toFixed(3);
}

function moverNubes(ahora) {
  if (!nubesCorriendo) return;
  const dt = tiempoNubes ? Math.min(0.05, (ahora - tiempoNubes) / 1000) : 0;
  tiempoNubes = ahora;
  const anchoCapa = capaNubes.offsetWidth;

  nubes.forEach((nube) => {
    nube.x += nube.velocidad * dt;
    if (nube.x > anchoCapa + 10) colocarNube(nube, false);
    nube.el.style.transform = `translate3d(${nube.x.toFixed(1)}px, ${nube.y.toFixed(1)}px, 0)`;
  });
  requestAnimationFrame(moverNubes);
}

window.addEventListener(
  "scroll",
  () => {
    if (!seccionLibro.hidden) desvanecerNubes();
  },
  { passive: true }
);

// Solo se mueven mientras la sección del libro está en pantalla
new IntersectionObserver((entradas) => {
  if (entradas[0].isIntersecting) {
    crearNubes();
    if (!nubesCorriendo) {
      nubesCorriendo = true;
      tiempoNubes = 0;
      requestAnimationFrame(moverNubes);
    }
  } else {
    nubesCorriendo = false;
  }
}).observe(seccionLibro);

// ---------- Decoración de la caja: personajes colgando con física, flores y destellos ----------

const jardin = document.getElementById("jardin");
const capaDestellos = document.getElementById("destellos");
const capaColgantes = document.getElementById("colgantes");
const hilosSvg = document.getElementById("hilos");

// w/h: tamaño de la imagen; hx/hy: punto de la imagen donde se amarra el hilo.
// tam y hilo: tamaño y largo del hilo en fracción del lado de la tarjeta.
// lado/lugar: en qué espacio libre va (-1 izquierda, 1 derecha) y en qué parte de ese espacio.
// celular: posición (fracción del ancho) cuando no hay espacio a los lados.
// desplazar: corrimiento extra del ancla (en fracción del lado de la tarjeta).
// tamCelular / hiloCelular: tamaño y largo del hilo propios en celular (si no, se usan los de siempre).
const COLGANTES = [
  { src: "img/colgante-1.png", w: 242, h: 165, hx: 120, hy: 27, tam: 0.5, hilo: 0.38, lado: -1, lugar: 0.4, celular: 0.1, tamCelular: 0.2 },
  { src: "img/colgante-2.png", w: 148, h: 235, hx: 49, hy: 6, tam: 0.3, hilo: 0.3, lado: 1, lugar: 0.22, celular: 0.705 },
  { src: "img/colgante-3.png", w: 270, h: 194, hx: 75, hy: 15, tam: 0.55, hilo: 0.36, lado: 1, lugar: 0.58, celular: 0.855, tamCelular: 0.22 },
  // La pareja: cada uno con su hilo y el corazoncito colgando en medio, un poco más abajo
  { src: "img/colgante-ada.png", w: 224, h: 269, hx: 106, hy: 5, tam: 0.3, hilo: 0.18, lado: -1, lugar: 0.97, desplazar: -0.15, celular: 0.26 },
  {
    src: "img/colgante-corazon.png", w: 119, h: 90, hx: 59, hy: 14, tam: 0.087, hilo: 0.4, lado: -1, lugar: 0.97, desplazar: 0.08,
    celular: 0.355, tamCelular: 0.06, hiloCelular: 0.22
  },
  { src: "img/colgante-leon.png", w: 244, h: 271, hx: 126, hy: 7, tam: 0.33, hilo: 0.18, lado: -1, lugar: 0.97, desplazar: 0.31, celular: 0.46 },
  // El zorrito: a la derecha de la tarjeta, antes del gatito banana
  { src: "img/colgante-zorro.png", w: 242, h: 428, hx: 122, hy: 9, tam: 0.36, hilo: 0.08, lado: 1, lugar: 0, desplazar: -0.11, celular: 0.585, tamCelular: 0.12 }
];
const TRAMOS_HILO = 10;
const GRAVEDAD = 2200;

const colgantes = [];
let colgantesCorriendo = false;
let colgantesVisibles = false;
let tiempoColgantes = 0;
let relojColgantes = 0;

// Espacio libre a cada lado de la tarjeta abierta (en celular casi no hay)
function espacioLibre() {
  const ancho = siguiente.clientWidth;
  const libre = (ancho - 2 * carta.offsetWidth) / 2;
  return { ancho, libre, angosto: libre < 150 };
}

function medirColgante(c) {
  const { ancho, libre, angosto } = espacioLibre();
  const lado = carta.offsetWidth;
  const tam = angosto ? c.datos.tamCelular || c.datos.tam * 0.48 : c.datos.tam;
  const escala = (lado * tam) / c.datos.w;
  c.escala = escala;
  c.largo = lado * (angosto ? c.datos.hiloCelular || 0.13 : c.datos.hilo);
  c.anclaX = angosto ? ancho * c.datos.celular : c.datos.lado < 0 ? libre * c.datos.lugar : ancho - libre + libre * c.datos.lugar;
  if (!angosto) c.anclaX += (c.datos.desplazar || 0) * lado;
  c.img.style.width = c.datos.w * escala + "px";
  c.img.style.height = c.datos.h * escala + "px";
  c.img.style.transformOrigin = `${c.datos.hx * escala}px ${c.datos.hy * escala}px`;
}

function crearColgantes() {
  COLGANTES.forEach((datos, i) => {
    const img = new Image();
    img.src = datos.src;
    img.alt = "";
    img.className = "colgante";
    img.draggable = false;
    capaColgantes.appendChild(img);
    const hilo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hilosSvg.appendChild(hilo);
    const c = { datos, img, hilo, puntos: [], anteriores: [], fase: azar(0, 6.3), espera: i * 0.35, agarre: null };
    colgantes.push(c);

    // Se pueden agarrar y soltar para que se balanceen
    img.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      img.setPointerCapture(e.pointerId);
      img.classList.add("agarrado");
      const r = siguiente.getBoundingClientRect();
      const fin = c.puntos[TRAMOS_HILO];
      c.agarre = { dx: e.clientX - r.left - fin.x, dy: e.clientY - r.top - fin.y, x: fin.x, y: fin.y };
    });
    img.addEventListener("pointermove", (e) => {
      if (!c.agarre) return;
      const r = siguiente.getBoundingClientRect();
      c.agarre.x = e.clientX - r.left - c.agarre.dx;
      c.agarre.y = e.clientY - r.top - c.agarre.dy;
    });
    const soltar = () => {
      c.agarre = null;
      img.classList.remove("agarrado");
    };
    img.addEventListener("pointerup", soltar);
    img.addEventListener("pointercancel", soltar);
  });
}

// Empiezan amontonados arriba de la pantalla y caen; el hilo se estira y quedan balanceándose
function soltarColgantes() {
  if (!colgantes.length) crearColgantes();
  colgantes.forEach((c, i) => {
    medirColgante(c);
    const tramo = c.largo / TRAMOS_HILO;
    // Caen un poco corridos hacia un lado para que, al tensarse el hilo, se columpien
    const corrimiento = (i % 2 ? 1 : -1) * c.largo * azar(0.3, 0.5);
    const empujon = azar(-3, 3);
    for (let k = 0; k <= TRAMOS_HILO; k++) {
      const y = k === 0 ? -4 : -70 - i * 30 - k * tramo * 0.35;
      c.puntos[k] = { x: c.anclaX + corrimiento * (k / TRAMOS_HILO), y };
      c.anteriores[k] = { x: c.puntos[k].x - empujon * (k / TRAMOS_HILO), y };
    }
  });
  relojColgantes = 0;
  colgantesVisibles = true;
  if (!colgantesCorriendo) {
    colgantesCorriendo = true;
    tiempoColgantes = 0;
    requestAnimationFrame(moverColgantes);
  }
}

function pasoColgante(c, dt) {
  const n = TRAMOS_HILO;
  const tramo = c.largo / n;
  // Un poquito de brisa para que nunca queden quietos del todo
  const brisa = 70 * Math.sin(relojColgantes * 0.9 + c.fase);

  for (let k = 1; k <= n; k++) {
    const p = c.puntos[k];
    const q = c.anteriores[k];
    const vx = (p.x - q.x) * 0.997;
    const vy = (p.y - q.y) * 0.997;
    q.x = p.x;
    q.y = p.y;
    p.x += vx + (k === n ? brisa : brisa * 0.2) * dt * dt;
    p.y += vy + GRAVEDAD * dt * dt;
  }

  c.puntos[0].x = c.anclaX;
  c.puntos[0].y = -4;

  // Si lo están arrastrando, el final del hilo va donde está el dedo (sin pasarse del largo del hilo)
  const fin = c.puntos[n];
  if (c.agarre) {
    let dx = c.agarre.x - c.anclaX;
    let dy = c.agarre.y + 4;
    const d = Math.hypot(dx, dy);
    if (d > c.largo) {
      dx *= c.largo / d;
      dy *= c.largo / d;
    }
    fin.x = c.anclaX + dx;
    fin.y = -4 + dy;
  }

  // El hilo no se estira: cada tramo mide como máximo "tramo" (sí puede quedar flojo)
  for (let vuelta = 0; vuelta < 14; vuelta++) {
    for (let k = 0; k < n; k++) {
      const a = c.puntos[k];
      const b = c.puntos[k + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d <= tramo || d === 0) continue;
      const exceso = (d - tramo) / d;
      // El ancla no se mueve y el personaje pesa más que el hilo
      let pesoA = k === 0 ? 0 : k + 1 === n ? 0.8 : 0.5;
      if (k + 1 === n && c.agarre) pesoA = 1;
      const pesoB = 1 - pesoA;
      a.x += dx * exceso * pesoA;
      a.y += dy * exceso * pesoA;
      b.x -= dx * exceso * pesoB;
      b.y -= dy * exceso * pesoB;
    }
  }
}

function dibujarColgante(c) {
  const n = TRAMOS_HILO;
  const fin = c.puntos[n];
  const antes = c.puntos[n - 1];
  // El personaje se inclina siguiendo la dirección del último tramo del hilo
  const angulo = Math.atan2(fin.x - antes.x, fin.y - antes.y);
  c.hilo.setAttribute("d", "M" + c.puntos.map((p) => p.x.toFixed(1) + " " + p.y.toFixed(1)).join("L"));
  const x = fin.x - c.datos.hx * c.escala;
  const y = fin.y - c.datos.hy * c.escala;
  c.img.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(-angulo).toFixed(3)}rad)`;
}

function moverColgantes(ahora) {
  if (!colgantesCorriendo) return;
  const dt = tiempoColgantes ? Math.min(0.05, (ahora - tiempoColgantes) / 1000) : 0;
  tiempoColgantes = ahora;
  relojColgantes += dt;

  // Pasos fijos y cortos para que la física sea estable
  const pasos = Math.max(1, Math.round(dt / (1 / 120)));
  colgantes.forEach((c) => {
    if (relojColgantes < c.espera) return;
    for (let i = 0; i < pasos; i++) pasoColgante(c, dt / pasos);
    c.img.style.visibility = "visible";
    dibujarColgante(c);
  });
  requestAnimationFrame(moverColgantes);
}

// Flores de papel en las esquinas de abajo, iguales a las de la caja
function plantarJardin() {
  jardin.innerHTML = "";
  const { ancho, libre, angosto } = espacioLibre();
  const porLado = angosto ? 3 : 6;
  const colores = ["#f472b6", "#f9a8d4", "#ec4899", "#fda4af", "#c4b5fd", "#a78bfa"];
  [-1, 1].forEach((lado) => {
    for (let i = 0; i < porLado; i++) {
      const t = (i + 0.5) / porLado;
      let x;
      if (angosto) x = lado < 0 ? ancho * (0.03 + 0.16 * t) : ancho * (0.81 + 0.16 * t);
      else x = lado < 0 ? libre * (0.06 + 0.82 * t) : ancho - libre + libre * (0.12 + 0.82 * t);
      const alto = angosto ? azar(0.07, 0.13) : azar(0.18, 0.42);
      const tam = angosto ? azar(0.07, 0.09) : azar(0.11, 0.16);
      const flor = document.createElement("div");
      flor.className = "flor";
      flor.style.cssText =
        `left:${((x / ancho) * 100).toFixed(2)}%;bottom:0;--alto:${alto.toFixed(2)};--tam:${tam.toFixed(2)};` +
        `--giro:${azar(-12, 12).toFixed(0)}deg;--retraso:${(0.3 + i * 0.15 + (lado > 0 ? 0.08 : 0)).toFixed(2)}s`;
      flor.innerHTML =
        '<div class="tallo"></div><div class="hoja der"></div><div class="hoja izq"></div>' +
        '<div class="cabeza">' + svgFlor(colores[(i * 2 + (lado > 0 ? 1 : 0)) % colores.length]) + "</div>";
      jardin.appendChild(flor);
    }
  });
}

// Destellos que titilan en los espacios de los lados
function ponerDestellos() {
  capaDestellos.innerHTML = "";
  const { ancho, libre, angosto } = espacioLibre();
  if (angosto) return;
  const estrella = '<svg viewBox="0 0 16 16"><path d="M8 0C9 5 11 7 16 8C11 9 9 11 8 16C7 11 5 9 0 8C5 7 7 5 8 0Z" fill="#f7a8c4"/></svg>';
  for (let i = 0; i < 12; i++) {
    const lado = i % 2 ? 1 : -1;
    const x = lado < 0 ? azar(0.08, 0.85) * libre : ancho - libre + azar(0.15, 0.92) * libre;
    const destello = document.createElement("div");
    destello.className = "destello";
    destello.style.cssText = `left:${((x / ancho) * 100).toFixed(2)}%;top:${azar(38, 70).toFixed(1)}%;--d:${azar(0, 2.8).toFixed(2)}s`;
    destello.innerHTML = estrella;
    capaDestellos.appendChild(destello);
  }
}

function decorarCaja() {
  plantarJardin();
  ponerDestellos();
  siguiente.classList.add("decorada");
  jardin.classList.add("abierta");
  soltarColgantes();
}

window.addEventListener("resize", () => {
  if (colgantes.length) colgantes.forEach(medirColgante);
});

// La física solo corre mientras la caja está en pantalla
new IntersectionObserver((entradas) => {
  if (!colgantesVisibles) return;
  if (entradas[0].isIntersecting && !colgantesCorriendo) {
    colgantesCorriendo = true;
    tiempoColgantes = 0;
    requestAnimationFrame(moverColgantes);
  } else if (!entradas[0].isIntersecting) {
    colgantesCorriendo = false;
  }
}).observe(siguiente);
