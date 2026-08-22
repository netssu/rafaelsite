(function () {
  var imagePaths = Array.isArray(window.__approvedImages) ? window.__approvedImages.slice() : [];
  if (!imagePaths.length) return;

  if (Array.isArray(window.__heroSlides)) {
    var heroPath = imagePaths.find(function (path) {
      return path.indexOf('20.43.36') !== -1;
    }) || imagePaths[0];
    window.__heroSlides[0] = Object.assign({}, window.__heroSlides[0], {
      src: './' + encodeURI(heroPath),
      portrait: true
    });
  }

  if (!document.getElementById('approved-gallery-styles')) {
    var style = document.createElement('style');
    style.id = 'approved-gallery-styles';
    style.textContent = [
    '.approved-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}',
    '.approved-gallery-grid--full{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}',
    '.approved-gallery-card{display:block;position:relative;overflow:hidden;aspect-ratio:3/4;border-radius:14px;background:#ece9e4;box-shadow:0 2px 8px rgba(20,20,32,.08);text-decoration:none}',
    '.approved-gallery-card img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .35s ease,filter .35s ease}',
    '.approved-gallery-card:hover img{transform:scale(1.05);filter:saturate(1.05)}',
    '.approved-gallery-card--more{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;text-align:center;padding:16px;background:#141420;color:#fff}',
    '.approved-gallery-card--more strong{font-size:1.7rem;line-height:1;color:#E8620A}',
    '.approved-gallery-card--more span{font-size:.72rem;color:rgba(255,255,255,.52);text-transform:uppercase;letter-spacing:.08em}',
    '.approved-gallery-card--more em{font-size:.78rem;font-style:normal;font-weight:700;color:#fff;border-bottom:1px solid rgba(232,98,10,.55);padding-bottom:2px}',
      '.review-extra{display:none}.review-extra.is-visible{display:block}',
      '#reviews-toggle{display:flex;align-items:center;justify-content:center;gap:10px;margin:28px auto 0;padding:11px 20px;border:1px solid rgba(232,98,10,.25);border-radius:999px;background:#fff;color:#E8620A;font:700 .86rem Inter,sans-serif;cursor:pointer;transition:all .2s}',
      '#reviews-toggle:hover{background:#FFF7F1;border-color:#E8620A;transform:translateY(-1px)}',
      '#reviews-toggle .review-arrow{font-size:1.05rem;line-height:1;transition:transform .2s}',
      '#reviews-toggle.is-open .review-arrow{transform:rotate(180deg)}',
      '@media(max-width:560px){.approved-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.approved-gallery-grid--full{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    ].join('');
    document.head.appendChild(style);
  }

  function shuffle(items) {
    for (var i = items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = items[i];
      items[i] = items[j];
      items[j] = temp;
    }
    return items;
  }

  function imageUrl(path) {
    return './' + encodeURI(path);
  }

  function getPreviewImages() {
    var previous = [];
    try {
      previous = JSON.parse(window.localStorage.getItem('approvedPreviewSelection') || '[]');
    } catch (e) {}

    var selected = [];
    for (var attempt = 0; attempt < 8; attempt++) {
      selected = shuffle(imagePaths.slice()).slice(0, Math.min(5, imagePaths.length));
      if (selected.join('|') !== previous.join('|') || imagePaths.length < 6) break;
    }

    try {
      window.localStorage.setItem('approvedPreviewSelection', JSON.stringify(selected));
    } catch (e) {}
    return selected;
  }

  function createImageCard(path, index, eager) {
    var card = document.createElement('a');
    card.className = 'approved-gallery-card';
    card.href = imageUrl(path);
    card.target = '_blank';
    card.rel = 'noopener';
    card.setAttribute('aria-label', 'Abrir foto de aluno aprovado ' + (index + 1));

    var image = document.createElement('img');
    image.src = imageUrl(path);
    image.alt = 'Aluno aprovado';
    image.loading = eager ? 'eager' : 'lazy';
    image.decoding = 'async';
    card.appendChild(image);
    return card;
  }

  function createMoreCard() {
    var card = document.createElement('a');
    card.className = 'approved-gallery-card approved-gallery-card--more';
    card.href = 'Aprovados.dc.html';
    card.setAttribute('aria-label', 'Ver todas as fotos de aprovados');
    card.innerHTML = '<strong>+100</strong><span>aprovados</span><em>ver todos →</em>';
    return card;
  }

  function renderPreview() {
    var target = document.getElementById('approved-home-gallery');
    if (!target || target.getAttribute('data-approved-gallery-rendered') === 'true') return !!target;
    target.setAttribute('data-approved-gallery-rendered', 'true');
    target.innerHTML = '';
    target.className = 'approved-gallery-grid approved-gallery-grid--preview';
    getPreviewImages().forEach(function (path, index) {
      target.appendChild(createImageCard(path, index, true));
    });
    target.appendChild(createMoreCard());
    return true;
  }

  function renderFull() {
    var target = document.getElementById('approved-full-gallery');
    if (!target || target.getAttribute('data-approved-gallery-rendered') === 'true') return !!target;
    target.setAttribute('data-approved-gallery-rendered', 'true');
    target.innerHTML = '';
    target.className = 'approved-gallery-grid approved-gallery-grid--full';
    imagePaths.forEach(function (path, index) {
      target.appendChild(createImageCard(path, index, false));
    });
    return true;
  }

  function setupReviews() {
    var section = document.getElementById('avaliacoes');
    if (!section) return false;
    var cards = Array.prototype.slice.call(section.querySelectorAll('article'));
    if (!cards.length) return false;
    if (cards.length <= 6) return false;

    cards.slice(6).forEach(function (card) {
      card.classList.add('review-extra');
    });

    var button = section.querySelector('#reviews-toggle');
    if (!button) return false;
    if (button.getAttribute('data-review-toggle-bound') === 'true') return true;
    button.setAttribute('data-review-toggle-bound', 'true');
    button.addEventListener('click', function () {
      var isOpen = button.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      cards.slice(6).forEach(function (card) {
        card.classList.toggle('is-visible', isOpen);
      });
      button.innerHTML = (isOpen ? 'Mostrar menos avaliações ' : 'Mostrar mais avaliações ') +
        '<span class="review-arrow" aria-hidden="true">⌄</span>';
    });
    return true;
  }

  function setupGalleriesWhenReady() {
    var attempts = 0;
    function trySetup() {
      var homeTarget = document.getElementById('approved-home-gallery');
      var fullTarget = document.getElementById('approved-full-gallery');
      var homeReady = !homeTarget || renderPreview();
      var fullReady = !fullTarget || renderFull();
      if (homeReady && fullReady) return;
      if (attempts++ >= 60) return;
      window.setTimeout(trySetup, 100);
    }
    window.setTimeout(trySetup, 150);
  }

  function setupReviewsWhenReady() {
    var attempts = 0;
    function trySetup() {
      if (setupReviews() || attempts++ >= 60) return;
      window.setTimeout(trySetup, 100);
    }
    trySetup();
  }

  function init() {
    setupGalleriesWhenReady();
    setupReviewsWhenReady();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
