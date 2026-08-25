(function () {
  'use strict';

  const ENDPOINTS = Object.freeze({
    contact: 'https://formspree.io/f/xeewqerw',
    preinscription: 'https://formspree.io/f/xaewgogy',
    recrutement: 'https://formspree.io/f/mljrybyg',
    entreprise: 'https://formspree.io/f/myegqwqe',
    prescripteurFinancement: 'https://formspree.io/f/mzeplrlr'
  });

  window.SinaPrestigeFormspree = { ENDPOINTS };

  function getMessage(form) {
    let el = form.querySelector('[data-form-message]');
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('data-form-message', '');
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.hidden = true;
      el.style.cssText = 'padding:1rem;margin:0 0 1rem;border-radius:4px;font-weight:500;';
      form.insertBefore(el, form.firstChild);
    }
    return el;
  }

  function showMessage(form, text, success) {
    const el = getMessage(form);
    el.hidden = false;
    el.textContent = text;
    el.style.backgroundColor = success ? '#d4edda' : '#f8d7da';
    el.style.color = success ? '#155724' : '#721c24';
    el.style.borderLeft = success ? '4px solid #28a745' : '4px solid #dc3545';
  }

  async function submitForm(form) {
    const endpoint = form.dataset.formspreeEndpoint;
    if (!endpoint) return;

    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalLabel = submitButton ? submitButton.textContent : '';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours…';
    }

    const formData = new FormData(form);
    if (!formData.has('_subject')) {
      formData.append('_subject', form.dataset.formspreeSubject || 'Demande Sina & Prestige');
    }
    if (!formData.has('_replyto')) {
      const email = form.querySelector('input[type="email"]');
      if (email && email.value) formData.append('_replyto', email.value);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      let data = {};
      try { data = await response.json(); } catch (_) {}

      if (!response.ok) {
        const detail = data.errors?.map(error => error.message).filter(Boolean).join(' ') || 'Impossible d’envoyer le formulaire.';
        throw new Error(detail);
      }

      showMessage(form, form.dataset.formspreeSuccess || 'Votre demande a bien été envoyée. Nous vous recontacterons prochainement.', true);
      form.reset();

      if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', {
          value: 1,
          currency: 'EUR',
          form_type: form.dataset.formspreeType || 'formulaire'
        });
      }
    } catch (error) {
      showMessage(form, error.message || 'Une erreur est survenue. Veuillez réessayer plus tard.', false);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel || 'Envoyer';
      }
    }
  }

  function applyContactContext(form) {
    if (!form || !form.id || form.id !== 'contactForm') return;
    const params = new URLSearchParams(window.location.search);
    const context = (params.get('type') || '').toLowerCase();
    const formation = params.get('formation');
    const routes = {
      recruitment: { endpoint: ENDPOINTS.recrutement, subject: 'BESOIN RECRUTEMENT | [organisation] | [nom]', type: 'recrutement' },
      entreprise: { endpoint: ENDPOINTS.entreprise, subject: 'PROJET ENTREPRISE | [organisation] | [thématique]', type: 'entreprise' },
      prescripteur: { endpoint: ENDPOINTS.prescripteurFinancement, subject: 'PRESCRIPTEUR | [structure] | [territoire]', type: 'prescripteur' },
      financement: { endpoint: ENDPOINTS.prescripteurFinancement, subject: 'ORIENTATION FINANCEMENT | [nom] | [statut]', type: 'financement' }
    };
    if (formation || context === 'formation' || context === 'preinscription') {
      form.dataset.formspreeEndpoint = ENDPOINTS.preinscription;
      form.dataset.formspreeSubject = 'PREINSCRIPTION FORMATION | [formation] | [date] | [nom]';
      form.dataset.formspreeType = 'preinscription';
      const input = form.querySelector('[name="formation"]');
      if (input) input.value = formation || input.value;
      return;
    }
    const route = routes[context];
    if (route) {
      form.dataset.formspreeEndpoint = route.endpoint;
      form.dataset.formspreeSubject = route.subject;
      form.dataset.formspreeType = route.type;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[data-formspree-endpoint]').forEach(function (form) {
      applyContactContext(form);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm(form);
      });
    });
  });
})();
