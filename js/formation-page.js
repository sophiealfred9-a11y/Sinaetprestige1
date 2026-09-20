(function () {
  "use strict";

  if (window.location.pathname.toLowerCase().endsWith('/formation.html') || window.location.pathname.toLowerCase().endsWith('/formation')) {
    window.location.replace('formations.html');
    return;
  }

  const data = window.SINA_DATA || {};
  const forms = data.formations || [];
  const allSessions = data.sessions || {};

  // 1. Recuperer le code de la formation depuis l URL (?id=F21 ou ?code=f21)
  const params = new URLSearchParams(window.location.search);
  let reqCode = (params.get("id") || params.get("code") || "").trim().toUpperCase();

  // Trouver la formation correspondante, sinon premiere par defaut (F01)
  let formation = forms.find(f => f.code.toUpperCase() === reqCode);
  if (!formation && forms.length > 0) {
    formation = forms[0];
  }
  if (!formation) return;

  const code = formation.code;
  const title = formation.title;
  const family = formation.family;
  const duration = formation.duration || "35 h - 5 jours";
  const price = formation.price || "700 € HT / participant";
  const isConventionne = Boolean(formation.conventionne);
  const pdfUrl = "pdfs/" + code.toLowerCase() + ".pdf";

  // Sessions de cette formation
  const sessions = allSessions[code] || [];

  function getPublic(fam) {
    if (/management|manager/i.test(fam)) return "Managers, dirigeants, chefs de projet";
    if (/commerce|vente|prospection/i.test(fam)) return "Commerciaux, business developers, indépendants";
    if (/rh|recrut|cse|qvct|prévention/i.test(fam)) return "Professionnels RH, référents, managers";
    return "Tout public, salariés, demandeurs d'emploi, indépendants";
  }

  function getModes() {
    if (sessions.length === 0) return "Distanciel & Présentiel";
    const hasDist = sessions.some(s => /distanciel/i.test(s[1]));
    const hasPres = sessions.some(s => /présentiel/i.test(s[1]));
    if (hasDist && hasPres) return "Distanciel & Présentiel";
    if (hasPres) return "Présentiel (Normandie & sur site)";
    return "Distanciel (Classe virtuelle interactive)";
  }

  // 2. Mettre a jour les meta SEO et le titre du document
  document.title = title + " | Formation Sina & Prestige";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", "Formation " + title + " par Sina & Prestige. " + duration + ", " + price + ". Programme complet, dates et inscription en ligne.");
  }

  // 3. Injecter les donnees dans le DOM
  // Breadcrumb
  const elBreadcrumbTitle = document.getElementById("fd-crumb-title");
  if (elBreadcrumbTitle) elBreadcrumbTitle.textContent = title;

  // Badges
  const elCodeBadge = document.getElementById("fd-badge-code");
  if (elCodeBadge) elCodeBadge.textContent = code;

  const elDomainBadge = document.getElementById("fd-badge-domain");
  if (elDomainBadge) elDomainBadge.textContent = family;

  const elDokelioBadge = document.getElementById("fd-badge-dokelio");
  if (elDokelioBadge) {
    if (isConventionne) {
      elDokelioBadge.hidden = false;
      elDokelioBadge.textContent = "Conventionné Dokelio IDF (Région Île-de-France)";
    } else {
      elDokelioBadge.hidden = true;
    }
  }

  // Titre & Sous-titre
  const elTitle = document.getElementById("fd-title");
  if (elTitle) elTitle.textContent = title;

  const elSub = document.getElementById("fd-sub");
  if (elSub) {
    elSub.textContent = "Session officielle Sina & Prestige — Organisme de formation certifié Qualiopi. Accompagnement opérationnel, cas réels d'application et mise en pratique immédiate.";
  }

  // Chiffres cles
  const elDuration = document.getElementById("fd-stat-duration");
  if (elDuration) elDuration.textContent = duration;

  const elPrice = document.getElementById("fd-stat-price");
  if (elPrice) elPrice.textContent = price;

  const elMode = document.getElementById("fd-stat-mode");
  if (elMode) elMode.textContent = getModes();

  const elPublic = document.getElementById("fd-stat-public");
  if (elPublic) elPublic.textContent = getPublic(family);

  // Bouton PDF
  const elBtnPdf = document.getElementById("fd-btn-pdf");
  if (elBtnPdf) {
    elBtnPdf.setAttribute("href", pdfUrl);
    elBtnPdf.setAttribute("download", code.toLowerCase() + "-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".pdf");
  }
  const elPdfName = document.getElementById("fd-pdf-name");
  if (elPdfName) elPdfName.textContent = "Programme officiel " + code + " (PDF)";

  // Objectifs adaptes
  const elObjGrid = document.getElementById("fd-objectives-grid");
  if (elObjGrid) {
    let objs = [
      { t: "Maîtriser les fondamentaux et outils", d: "Acquérir les concepts clés, méthodes de travail et technologies adaptées au contexte professionnel actuel." },
      { t: "Mettre en pratique sur des cas réels", d: "S'exercer sur des situations concrètes et produire des livrables directement mobilisables en entreprise." },
      { t: "Optimiser son organisation et son efficacité", d: "Adopter les bonnes pratiques pour gagner en autonomie, en rapidité d'exécution et en qualité de restitution." },
      { t: "Sécuriser ses compétences et son positionnement", d: "Valider ses acquis, mesurer ses progrès et disposer d'un plan d'action clair pour la suite de son parcours." }
    ];

    if (/ia|codage|data|technologie/i.test(family + " " + title)) {
      objs = [
        { t: "Intégrer les outils d'IA dans son flux de travail", d: "Maîtriser le prompt engineering et l'automatisation des tâches quotidiennes de manière éthique et rigoureuse." },
        { t: "Analyser et exploiter la data métier", d: "Interpréter des données, concevoir des rapports synthétiques et fiabiliser les prises de décision stratégiques." },
        { t: "Générer du code et accélérer le développement", d: "Utiliser les assistants d'IA pour concevoir, refactorer, tester et documenter efficacement des composants logiciels." },
        { t: "Sécuriser la conformité et la confidentialité", d: "Respecter le cadre du RGPD, de l'IA Act européen et la protection du patrimoine informationnel de l'entreprise." }
      ];
    } else if (/commerce|vente|prospection/i.test(family + " " + title)) {
      objs = [
        { t: "Cibler et qualifier les opportunités", d: "Structurer son fichier de prospection avec des outils d'intelligence artificielle et d'automatisation B2B." },
        { t: "Personnaliser ses approches multicanales", d: "Rédiger des séquences d'accroche à fort impact sur LinkedIn, e-mail et téléphone pour maximiser la conversion." },
        { t: "Conduire des entretiens à forte valeur ajoutée", d: "Découvrir les besoins réels du prospect, traiter les objections avec aisance et sécuriser les closing." },
        { t: "Piloter sa performance commerciale", d: "Mesurer les KPIs clés du cycle de vente et ajuster son plan d'action de façon méthodique." }
      ];
    } else if (/emploi|recrut|rh|carriere/i.test(family + " " + title)) {
      objs = [
        { t: "Valoriser son profil et ses compétences", d: "Concevoir des candidatures ciblées (CV, lettre, profil LinkedIn) alignées avec les exigences des recruteurs et des ATS." },
        { t: "Préparer et réussir ses entretiens", d: "S'entraîner aux mises en situation professionnelles, pitcher son parcours avec clarté et conviction." },
        { t: "Activer les leviers de recherche cachés", d: "Développer son réseau, identifier les opportunités non publiées et mobiliser les plateformes spécialisées." },
        { t: "Construire une stratégie de rebond durable", d: "Bâtir un plan d'action structuré avec des étapes jalonnées pour accélérer le retour à l'emploi." }
      ];
    }

    elObjGrid.innerHTML = objs.map(o => `
      <div class="fd-objective-item">
        <strong>${o.t}</strong>
        <p>${o.d}</p>
      </div>
    `).join("");
  }

  // 4. Inscription et Calendrier des Sessions
  const elSessionsList = document.getElementById("fd-sessions-container");
  const elSelectSession = document.getElementById("fd-select-session");
  const elHiddenFormation = document.getElementById("fd-hidden-formation");
  const elHiddenCode = document.getElementById("fd-hidden-code");

  if (elHiddenFormation) elHiddenFormation.value = code + " - " + title;
  if (elHiddenCode) elHiddenCode.value = code;

  if (sessions.length > 0) {
    if (elSessionsList) {
      elSessionsList.innerHTML = sessions.map((s, idx) => `
        <div class="fd-session-item" data-session-index="${idx}">
          <div>
            <span class="fd-session-date">${s[0]}</span>
            <span class="fd-session-mode">${s[1]}</span>
          </div>
          <button type="button" class="fd-btn-pick" data-session-date="${s[0]}" data-session-mode="${s[1]}">Choisir cette date</button>
        </div>
      `).join("");
    }

    if (elSelectSession) {
      elSelectSession.innerHTML = `<option value="">Sélectionner une date programmée</option>` +
        sessions.map(s => `<option value="${s[0]} (${s[1]})">${s[0]} — ${s[1]}</option>`).join("") +
        `<option value="Autre / Demande intra-entreprise">Autre date / Session sur mesure (Intra)</option>`;
    }

    // Gestion du clic sur "Choisir cette date"
    document.querySelectorAll(".fd-btn-pick").forEach(btn => {
      btn.addEventListener("click", function () {
        const dateVal = this.getAttribute("data-session-date");
        const modeVal = this.getAttribute("data-session-mode");
        if (elSelectSession) {
          const match = Array.from(elSelectSession.options).find(opt => opt.value.includes(dateVal));
          if (match) elSelectSession.value = match.value;
        }
        document.querySelectorAll(".fd-session-item").forEach(item => item.classList.remove("selected"));
        const parentItem = this.closest(".fd-session-item");
        if (parentItem) parentItem.classList.add("selected");
        // Faire defiler doucement vers le formulaire
        const formCard = document.getElementById("fd-form-card");
        if (formCard) formCard.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  } else {
    if (elSessionsList) {
      elSessionsList.innerHTML = `
        <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px dashed #cbd5e1;font-size:13px;color:#64748b;">
          <strong>Sessions sur mesure disponibles</strong><br>
          Cette formation est proposée en intra-entreprise ou sur demande de session dédiée. Remplissez le formulaire ci-dessous pour planifier vos dates.
        </div>
      `;
    }
    if (elSelectSession) {
      elSelectSession.innerHTML = `<option value="Session sur mesure / À convenir">Session sur mesure / À convenir avec notre équipe</option>`;
    }
  }

  // 5. Formations Similaires Recommandees
  const elRelatedGrid = document.getElementById("fd-related-grid");
  if (elRelatedGrid) {
    let related = forms.filter(f => f.code !== code && f.family === family);
    if (related.length < 3) {
      const others = forms.filter(f => f.code !== code && f.family !== family);
      related = related.concat(others);
    }
    related = related.slice(0, 3);

    elRelatedGrid.innerHTML = related.map(r => `
      <article class="fd-related-card">
        <div>
          <span style="font-size:11px;font-weight:800;color:#09235d;background:#f5b51b;padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:8px;">${r.code}</span>
          <h4>${r.title}</h4>
          <div class="meta">${r.duration || "7 h - 1 jour"} · ${r.price || "600 € HT"}</div>
        </div>
        <a class="btn-link" href="formations.html">Voir toutes les formations →</a>
      </article>
    `).join("");
  }

})();
