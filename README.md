# Espacio Ángulo — landing para GitHub Pages

Web estática responsive para GitHub Pages.

## Archivos importantes

- `index.html`: landing principal y formulario.
- `assets/css/style.css`: estética, responsive móvil/escritorio.
- `assets/js/config.js`: pega aquí tus enlaces reales de Formspree y Stripe.
- `assets/js/main.js`: envío del formulario y redirección al pago.
- `aviso-legal.html`, `privacidad.html`, `condiciones.html`, `desistimiento.html`, `cookies.html`: textos legales base.

## Configuración rápida

### 1. Formulario

Crea una cuenta/proyecto en Formspree y copia tu endpoint, por ejemplo:

```js
formEndpoint: "https://formspree.io/f/abcdwxyz"
```

Pégalo en `assets/js/config.js`.

### 2. Pago Stripe / Apple Pay

Crea un Payment Link en Stripe con importe 60 €. Si tienes Apple Pay activado y Stripe lo permite en tu cuenta/dispositivo/navegador, aparecerá como método disponible.

Pega el enlace en `assets/js/config.js`:

```js
stripePaymentLink: "https://buy.stripe.com/..."
```

### 3. Datos legales

Antes de publicar, sustituye en las páginas legales:

- `[NOMBRE COMPLETO / RAZÓN SOCIAL]`
- `[NIF/CIF]`
- `[DOMICILIO FISCAL]`
- `[EMAIL DE CONTACTO]`

Revisa especialmente la parte de facturación y desistimiento con un gestor si vas a cobrar desde el primer día.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `espacio-angulo`.
2. Sube todos estos archivos a la raíz del repositorio.
3. Ve a `Settings > Pages`.
4. En `Build and deployment`, elige `Deploy from a branch`.
5. Rama: `main`, carpeta: `/root`.
6. Guarda. GitHub generará una URL pública.

## Flujo actual de la web

1. La persona rellena el formulario.
2. El formulario se envía a Formspree.
3. Si se envía bien, la web redirige a Stripe.
4. Tú recibes la solicitud por email y compruebas el pago en Stripe.
5. Confirmas manualmente la cita y envías el enlace de audio.

## Nota

La web no usa calendario visible ni servidor propio. Es deliberadamente sencilla para validar el proyecto sin montar una máquina demasiado grande desde el primer día.
