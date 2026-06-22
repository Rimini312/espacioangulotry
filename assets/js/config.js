// CONFIGURACIÓN RÁPIDA
// 1) Crea un endpoint en Formspree: https://formspree.io/
// 2) Pega aquí tu endpoint, por ejemplo: https://formspree.io/f/abcdwxyz
// 3) Crea un Payment Link en Stripe de 60 € y pégalo abajo.
//    Stripe Payment Links puede mostrar métodos como tarjeta y Apple Pay si están activados en Stripe.

window.ESPACIO_ANGULO_CONFIG = {
  formEndpoint: "https://formspree.io/f/TU_ENDPOINT",
  stripePaymentLink: "https://buy.stripe.com/TU_PAYMENT_LINK",
  sessionPrice: "60 €",
  sessionDuration: "60 minutos",
  siteName: "Espacio Ángulo"
};
