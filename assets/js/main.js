(function () {
  const cfg = window.ESPACIO_ANGULO_CONFIG || {};
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const priceNodes = document.querySelectorAll('[data-price]');
  priceNodes.forEach((node) => (node.textContent = cfg.sessionPrice || '60 €'));

  const durationNodes = document.querySelectorAll('[data-duration]');
  durationNodes.forEach((node) => (node.textContent = cfg.sessionDuration || 'una hora'));

  const form = document.querySelector('#booking-form');
  const status = document.querySelector('#form-status');
  const tagTrack = document.querySelector('#tag-track');
  let agenda = { ocupados: [], etiquetas: [] };

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status ' + (type || '');
  }

  function isPlaceholder(value) {
    return !value || value.includes('TU_ENDPOINT') || value.includes('TU_PAYMENT_LINK');
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function requestCode(date, time) {
    const cleanDate = String(date || '').replaceAll('-', '');
    const cleanTime = String(time || '').replace(':', '');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `EA-${cleanDate}-${cleanTime}-${rand}`;
  }

  function normalizeSlot(date, time) {
    if (!date || !time) return '';
    return `${date}T${time}`;
  }

  function slotOccupied(date, time) {
    const slot = normalizeSlot(date, time);
    return Boolean(slot && Array.isArray(agenda.ocupados) && agenda.ocupados.includes(slot));
  }

  function appendStripeParams(link, params) {
    const url = new URL(link);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  }

  function buildPayload(formData, id) {
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    data.codigo_solicitud = id;
    data._subject = `Nueva solicitud — Espacio Ángulo — ${id}`;
    data._language = 'es';
    return data;
  }

  async function loadAgenda() {
    const path = cfg.agendaPath || 'data/agenda.json';
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (res.ok) agenda = await res.json();
    } catch (err) {
      agenda = { ocupados: [], etiquetas: [] };
    }
    renderTags();
  }

  function renderTags() {
    if (!tagTrack) return;
    const fallback = [
      'traer el bucle', 'ordenar una decisión', 'afinar la sensibilidad',
      'pensar el aburrimiento', 'aumentar creatividad', 'poner lenguaje'
    ];
    const tags = Array.isArray(agenda.etiquetas) && agenda.etiquetas.length ? agenda.etiquetas : fallback;
    const full = tags.concat(tags);
    tagTrack.innerHTML = full.map((tag) => `<span class="tag-pill">${tag}</span>`).join('');
  }

  function setupModals() {
    const modal = document.querySelector('#legal-modal');
    if (!modal) return;
    const title = modal.querySelector('#legal-modal-title');
    const body = modal.querySelector('#legal-modal-body');
    const closeButtons = modal.querySelectorAll('[data-modal-close]');
    const triggers = document.querySelectorAll('[data-modal-target]');

    function openModal(id) {
      const content = document.querySelector(`#${id}`);
      if (!content) return;
      title.textContent = content.dataset.title || 'Información';
      body.innerHTML = content.innerHTML;
      modal.classList.add('is-open');
      document.body.classList.add('modal-open');
      const close = modal.querySelector('[data-modal-close]');
      if (close) close.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open');
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        openModal(trigger.dataset.modalTarget);
      });
    });
    closeButtons.forEach((button) => button.addEventListener('click', closeModal));
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const date = formData.get('dia_preferido');
      const time = formData.get('hora_preferida');
      const email = formData.get('email');

      if (slotOccupied(date, time)) {
        setStatus('Ese horario no está disponible. Elige otro horario o indica una alternativa.', 'error');
        return;
      }

      const endpoint = cfg.formEndpoint;
      const paymentLink = cfg.stripePaymentLink;

      if (isPlaceholder(endpoint) || isPlaceholder(paymentLink)) {
        setStatus('Falta configurar Formspree o Stripe en assets/js/config.js. La web está lista, pero aún no puede enviar ni cobrar.', 'error');
        return;
      }

      const id = requestCode(date, time);
      const payload = buildPayload(formData, id);
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Preparando pago…';
      setStatus('Registrando la solicitud…', 'muted');

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
        window.location.href = appendStripeParams(paymentLink, {
          client_reference_id: id,
          prefilled_email: email
        });
      } catch (err) {
        submitButton.disabled = false;
        submitButton.textContent = 'Continuar al pago';
        setStatus('No se pudo enviar la solicitud. Revisa la configuración del formulario o inténtalo de nuevo.', 'error');
      }
    });
  }

  setupModals();
  loadAgenda();
})();
