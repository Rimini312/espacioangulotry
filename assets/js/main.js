(function () {
  const cfg = window.ESPACIO_ANGULO_CONFIG || {};
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const priceNodes = document.querySelectorAll('[data-price]');
  priceNodes.forEach((node) => (node.textContent = cfg.sessionPrice || '60 €'));

  const durationNodes = document.querySelectorAll('[data-duration]');
  durationNodes.forEach((node) => (node.textContent = cfg.sessionDuration || '60 minutos'));

  const form = document.querySelector('#booking-form');
  const status = document.querySelector('#form-status');

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status ' + (type || '');
  }

  function isPlaceholder(value) {
    return !value || value.includes('TU_ENDPOINT') || value.includes('TU_PAYMENT_LINK');
  }

  function buildPayload(formData) {
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    data._subject = 'Nueva solicitud — Espacio Ángulo';
    data._language = 'es';
    return data;
  }

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const payload = buildPayload(formData);
      const endpoint = cfg.formEndpoint;
      const paymentLink = cfg.stripePaymentLink;

      if (isPlaceholder(endpoint) || isPlaceholder(paymentLink)) {
        setStatus('Falta configurar Formspree o Stripe en assets/js/config.js. La web está lista, pero aún no puede enviar ni cobrar.', 'error');
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando solicitud…';
      setStatus('Registrando la solicitud antes del pago…', 'muted');

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('No se pudo enviar el formulario');

        sessionStorage.setItem('espacio_angulo_solicitud', JSON.stringify(payload));
        setStatus('Solicitud registrada. Redirigiendo al pago seguro…', 'success');
        window.location.href = paymentLink;
      } catch (err) {
        submitButton.disabled = false;
        submitButton.textContent = 'Continuar al pago';
        setStatus('No se pudo enviar la solicitud. Revisa la configuración del formulario o inténtalo de nuevo.', 'error');
      }
    });
  }
})();
