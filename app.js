/* ============================================
   COSMOS — NASA Space Explorer
   Shared Application JavaScript
   ============================================ */

'use strict';

/* ─── Config ─── */
const NASA_KEY = 'DEMO_KEY'; // Replace with your NASA API key
const NASA_BASE = 'https://api.nasa.gov';

/* ─────────────────────────────────────────────
   STARFIELD (runs on every page)
───────────────────────────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], nebulae = [];
  let mouseX = 0, mouseY = 0;
  let scrollY = 0;

  const STAR_COUNT   = 280;
  const NEBULA_COUNT = 5;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
    buildNebulae();
  }

  function buildStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.6 + 0.2,
      base: Math.random() * 0.7 + 0.3,
      speed:Math.random() * 0.012 + 0.005,
      phase:Math.random() * Math.PI * 2,
      parallax: Math.random() * 0.06 + 0.01,
      color: pickStarColor(),
    }));
  }

  function buildNebulae() {
    nebulae = Array.from({ length: NEBULA_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 220 + 100,
      color: pickNebulaColor(),
      opacity: Math.random() * 0.04 + 0.02,
    }));
  }

  function pickStarColor() {
    const isHome = document.body.classList.contains('home-page');
    const palette = isHome
      ? ['#ffffff','#ffe0e0','#ffcccc','#ff9999','#ffdddd','#ffe8e8','#ffd0d0']
      : ['#ffffff','#cce4ff','#dde8ff','#b0ccff','#99d6ff','#ffeedd'];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  function pickNebulaColor() {
    const isHome = document.body.classList.contains('home-page');
    if (isHome) {
      const rPalette = [
        'rgba(180,20,20,0.35)',
        'rgba(140,10,10,0.28)',
        'rgba(220,40,40,0.22)',
        'rgba(100,0,0,0.3)',
        'rgba(200,30,30,0.18)',
      ];
      return rPalette[Math.floor(Math.random() * rPalette.length)];
    }
    const palette = [
      'rgba(79,142,247,0.3)',
      'rgba(0,212,255,0.25)',
      'rgba(124,108,247,0.25)',
      'rgba(247,95,126,0.2)',
      'rgba(0,229,155,0.2)',
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // Nebulae background blobs
    nebulae.forEach(n => {
      const px = n.x + (mouseX - W / 2) * 0.012;
      const py = n.y + (mouseY - H / 2) * 0.012 - scrollY * 0.04;
      const g = ctx.createRadialGradient(px, py, 0, px, py, n.r);
      g.addColorStop(0, n.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.globalAlpha = n.opacity;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.globalAlpha = 1;

    // Stars
    stars.forEach(s => {
      const flicker = s.base + Math.sin(t * s.speed + s.phase) * 0.3;
      const px = s.x + (mouseX - W / 2) * s.parallax;
      const py = s.y + (mouseY - H / 2) * s.parallax - scrollY * s.parallax * 1.5;

      ctx.globalAlpha = Math.max(0, Math.min(1, flicker));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Glow halo for bright stars
      if (s.r > 1.2 && flicker > 0.7) {
        const g = ctx.createRadialGradient(px, py, 0, px, py, s.r * 5);
        g.addColorStop(0, s.color.replace(')', ',0.25)').replace('rgb', 'rgba'));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.globalAlpha = flicker * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, s.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;
  }

  let raf;
  function loop(t = 0) {
    draw(t * 0.001);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  resize();
  loop();
})();

/* ─────────────────────────────────────────────
   PRELOADER
───────────────────────────────────────────── */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  function hidePreloader() {
    preloader.classList.add('hidden');
  }

  // Hide after page loads + small delay
  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 800);
  } else {
    window.addEventListener('load', () => setTimeout(hidePreloader, 800));
  }
})();

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
(function initNav() {
  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Hamburger toggle
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });

    // Close on link click (mobile)
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }
})();

/* ─────────────────────────────────────────────
   UTILITY HELPERS
───────────────────────────────────────────── */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatNumber(n, decimals = 0) {
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

function showSpinner(container) {
  container.innerHTML = '<div class="spinner"></div>';
}

function showError(container, msg = 'Failed to load data. Please try again.') {
  container.innerHTML = `
    <div class="state-error">
      <div class="state-icon">⚠️</div>
      <div class="state-title">Oops! Something went wrong</div>
      <div class="state-msg">${msg}</div>
    </div>`;
}

function showEmpty(container, msg = 'No data available.') {
  container.innerHTML = `
    <div class="state-empty">
      <div class="state-icon">🔭</div>
      <div class="state-title">Nothing to show</div>
      <div class="state-msg">${msg}</div>
    </div>`;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function staggerIn(elements, baseDelay = 0, step = 80) {
  elements.forEach((el, i) => {
    el.style.animationDelay = `${baseDelay + i * step}ms`;
    el.classList.add('animate-fadeInUp');
  });
}

/* ═══════════════════════════════════════════════
   PAGE: APOD (index.html)
═══════════════════════════════════════════════ */
async function initAPOD() {
  const wrapper = document.getElementById('apod-wrapper');
  if (!wrapper) return;

  showSpinner(wrapper);

  try {
    const data = await fetchJSON(`${NASA_BASE}/planetary/apod?api_key=${NASA_KEY}`);
    renderAPOD(data, wrapper);
  } catch (err) {
    console.error('APOD error:', err);
    showError(wrapper, 'Could not fetch today\'s Astronomy Picture of the Day. The API may be temporarily unavailable.');
  }
}

function renderAPOD(data, wrapper) {
  const isVideo = data.media_type === 'video';

  const mediaHTML = isVideo
    ? `<iframe
        src="${data.url}"
        title="${data.title}"
        allow="autoplay; encrypted-media"
        allowfullscreen
      ></iframe>`
    : `<img
        src="${data.hdurl || data.url}"
        alt="${data.title}"
        loading="lazy"
      />
      <span class="apod-date-badge">${formatDate(data.date)}</span>`;

  wrapper.innerHTML = `
    <div class="apod-grid">
      <div class="apod-media-wrap">${mediaHTML}</div>
      <div class="apod-info glass-card" style="padding:36px">
        <p class="eyebrow">📡 Astronomy Picture of the Day</p>
        <h1 class="apod-title">${data.title}</h1>
        <p class="apod-description">${data.explanation}</p>
        <div class="apod-meta-grid">
          <div class="apod-meta-item">
            <div class="apod-meta-label">Date</div>
            <div class="apod-meta-value">${formatDate(data.date)}</div>
          </div>
          <div class="apod-meta-item">
            <div class="apod-meta-label">Media Type</div>
            <div class="apod-meta-value" style="text-transform:capitalize">${data.media_type}</div>
          </div>
          ${data.copyright ? `
          <div class="apod-meta-item" style="grid-column:1/-1">
            <div class="apod-meta-label">Copyright</div>
            <div class="apod-meta-value">© ${data.copyright}</div>
          </div>` : ''}
        </div>
      </div>
    </div>`;

  wrapper.querySelector('.apod-info').style.animation = 'fadeInUp 0.8s 0.15s ease both';
}

/* ═══════════════════════════════════════════════
   PAGE: MARS (mars.html)
═══════════════════════════════════════════════ */
function initMars() {
  const roverSelect  = document.getElementById('rover-select');
  const solInput     = document.getElementById('sol-input');
  const fetchBtn     = document.getElementById('fetch-mars-btn');
  const marsGrid     = document.getElementById('mars-grid');
  const marsCount    = document.getElementById('mars-count');
  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lightbox-img');
  const lbCaption    = document.getElementById('lightbox-caption');
  const lbClose      = document.getElementById('lightbox-close');

  if (!roverSelect) return;

  // Fetch on button click
  fetchBtn.addEventListener('click', fetchMarsPhotos);

  // Fetch on Enter key in sol input
  solInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchMarsPhotos();
  });

  // Lightbox close
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Load default
  fetchMarsPhotos();

  async function fetchMarsPhotos() {
    const rover = roverSelect.value;
    const sol   = parseInt(solInput.value) || 1000;

    fetchBtn.disabled = true;
    fetchBtn.textContent = '⏳ Loading…';
    showSpinner(marsGrid);
    if (marsCount) marsCount.style.display = 'none';

    try {
      const data = await fetchJSON(
        `${NASA_BASE}/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${NASA_KEY}&page=1`
      );
      const photos = data.photos || [];

      if (photos.length === 0) {
        showEmpty(marsGrid, `No photos found for ${capitalize(rover)} on Sol ${sol}. Try a different Sol (e.g. 1000, 500, 200).`);
      } else {
        renderMarsPhotos(photos.slice(0, 48), rover, sol);
      }

      if (marsCount) {
        marsCount.style.display = 'inline-flex';
        marsCount.innerHTML = `🛸 &nbsp;Showing <strong>${Math.min(photos.length, 48)}</strong> of <strong>${photos.length}</strong> photos — Sol ${sol}`;
      }
    } catch (err) {
      console.error('Mars error:', err);
      showError(marsGrid, `Could not fetch photos from ${capitalize(rover)}. Check your API key or try again.`);
    } finally {
      fetchBtn.disabled = false;
      fetchBtn.textContent = '🔍 Fetch Photos';
    }
  }

  function renderMarsPhotos(photos, rover, sol) {
    marsGrid.innerHTML = '';
    photos.forEach((photo, i) => {
      const card = el(`
        <div class="mars-card glass-card" tabindex="0" role="button"
          aria-label="View photo from ${photo.camera.full_name}">
          <img
            src="${photo.img_src}"
            alt="Mars photo by ${photo.camera.name}"
            loading="lazy"
          />
          <div class="mars-card-info">
            <div class="mars-card-rover">${capitalize(rover)}</div>
            <div class="mars-card-camera">${photo.camera.full_name}</div>
            <div class="mars-card-sol">Sol ${photo.sol} &nbsp;·&nbsp; ${formatDate(photo.earth_date)}</div>
          </div>
        </div>`);

      card.style.animationDelay = `${i * 55}ms`;
      card.classList.add('animate-scaleIn');

      const openLightbox = () => {
        lbImg.src = photo.img_src;
        lbCaption.textContent = `${capitalize(rover)} · ${photo.camera.full_name} · Sol ${photo.sol}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      };

      card.addEventListener('click', openLightbox);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
      });

      marsGrid.appendChild(card);
    });
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/* ═══════════════════════════════════════════════
   PAGE: ASTEROIDS (asteroids.html)
═══════════════════════════════════════════════ */
async function initAsteroids() {
  const grid      = document.getElementById('asteroid-grid');
  const statTotal = document.getElementById('stat-total');
  const statSafe  = document.getElementById('stat-safe');
  const statHaz   = document.getElementById('stat-hazard');

  if (!grid) return;

  showSpinner(grid);

  try {
    const today = new Date().toISOString().slice(0, 10);
    const data = await fetchJSON(
      `${NASA_BASE}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_KEY}`
    );

    const neoObj = data.near_earth_objects || {};
    const dayKey = Object.keys(neoObj)[0];
    const neos   = neoObj[dayKey] || [];

    if (neos.length === 0) {
      showEmpty(grid, 'No near-Earth objects found for today.');
      return;
    }

    // Sort: hazardous first
    neos.sort((a, b) => (b.is_potentially_hazardous_asteroid ? 1 : 0)
                       - (a.is_potentially_hazardous_asteroid ? 1 : 0));

    const hazCount  = neos.filter(n => n.is_potentially_hazardous_asteroid).length;
    const safeCount = neos.length - hazCount;

    if (statTotal) statTotal.textContent = neos.length;
    if (statSafe)  statSafe.textContent  = safeCount;
    if (statHaz)   statHaz.textContent   = hazCount;

    renderAsteroids(neos, grid);
  } catch (err) {
    console.error('Asteroid error:', err);
    showError(grid, 'Could not fetch near-Earth object data. Please try again later.');
  }
}

function renderAsteroids(neos, grid) {
  grid.innerHTML = '';
  neos.forEach((neo, i) => {
    const hazardous = neo.is_potentially_hazardous_asteroid;
    const cls       = hazardous ? 'hazardous' : 'safe-asteroid';
    const label     = hazardous ? '⚠ Hazardous' : '✓ Safe';

    const dMin = neo.estimated_diameter?.meters?.estimated_diameter_min;
    const dMax = neo.estimated_diameter?.meters?.estimated_diameter_max;
    const diamStr = (dMin != null && dMax != null)
      ? `${formatNumber(dMin, 1)} – ${formatNumber(dMax, 1)} m`
      : 'N/A';

    const approach = neo.close_approach_data?.[0];
    const velocity = approach?.relative_velocity?.kilometers_per_hour
      ? `${formatNumber(parseFloat(approach.relative_velocity.kilometers_per_hour), 0)} km/h`
      : 'N/A';

    const missDistance = approach?.miss_distance?.kilometers
      ? `${formatNumber(parseFloat(approach.miss_distance.kilometers), 0)} km`
      : 'N/A';

    const card = el(`
      <div class="asteroid-card glass-card ${cls}" style="animation-delay:${i * 60}ms">
        <span class="asteroid-badge ${cls}">${label}</span>
        <div class="asteroid-name">${neo.name.replace(/[()]/g, '')}</div>
        <div class="asteroid-data-row">
          <span class="asteroid-data-label">Est. Diameter</span>
          <span class="asteroid-data-value">${diamStr}</span>
        </div>
        <div class="asteroid-data-row">
          <span class="asteroid-data-label">Relative Velocity</span>
          <span class="asteroid-data-value">${velocity}</span>
        </div>
        <div class="asteroid-data-row">
          <span class="asteroid-data-label">Miss Distance</span>
          <span class="asteroid-data-value">${missDistance}</span>
        </div>
        <div class="asteroid-vis ${cls}"></div>
      </div>`);

    card.classList.add('animate-fadeInUp');
    grid.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════
   PAGE: ISS (iss.html)
═══════════════════════════════════════════════ */
function initISS() {
  const latEl  = document.getElementById('iss-lat');
  const lonEl  = document.getElementById('iss-lon');
  const newsFeed       = document.getElementById('news-feed');
  const readingListEl  = document.getElementById('reading-list');

  if (!latEl) return;

  // ─── Map setup ───
  let map, issMarker;

  try {
    map = L.map('iss-map', {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    const issIcon = L.divIcon({
      html: '<div class="iss-marker">🛸</div>',
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    issMarker = L.marker([0, 0], { icon: issIcon }).addTo(map);
  } catch (e) {
    console.error('Leaflet init error:', e);
  }

  // ─── ISS Position polling ───
  async function updateISS() {
    try {
      const data = await fetchJSON('https://api.wheretheiss.at/v1/satellites/25544');
      const lat = parseFloat(data.latitude).toFixed(4);
      const lon = parseFloat(data.longitude).toFixed(4);

      if (latEl) latEl.textContent = lat + '°';
      if (lonEl) lonEl.textContent = lon + '°';

      if (issMarker) {
        issMarker.setLatLng([lat, lon]);
      }
    } catch (err) {
      console.error('ISS position error:', err);
    }
  }

  updateISS();
  const issInterval = setInterval(updateISS, 5000);

  // Cleanup on page leave
  window.addEventListener('pagehide', () => clearInterval(issInterval));

  // ─── Space News ───
  async function loadNews() {
    if (!newsFeed) return;
    showSpinner(newsFeed);
    try {
      const data = await fetchJSON('https://api.spaceflightnewsapi.net/v4/articles/?limit=15&ordering=-published_at');
      const articles = data.results || [];
      if (articles.length === 0) {
        showEmpty(newsFeed, 'No news articles available right now.');
        return;
      }
      renderNews(articles);
    } catch (err) {
      console.error('News error:', err);
      showError(newsFeed, 'Could not load space news. Please try again later.');
    }
  }

  function renderNews(articles) {
    newsFeed.innerHTML = '';
    articles.forEach((article, i) => {
      const pubDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';

      const isSaved = isArticleSaved(article.id);

      const card = el(`
        <div class="news-article" data-id="${article.id}">
          <div class="news-source-date">
            <span class="news-source">${article.news_site || 'Space News'}</span>
            <span>·</span>
            <span>${pubDate}</span>
          </div>
          <div class="news-title">
            <a href="${article.url}" target="_blank" rel="noopener">${article.title}</a>
          </div>
          ${article.summary ? `<div class="news-summary">${article.summary}</div>` : ''}
          <div class="news-actions">
            <a href="${article.url}" target="_blank" rel="noopener"
              style="font-size:0.78rem;color:var(--accent-blue)">Read more →</a>
            <button class="btn-save ${isSaved ? 'saved' : ''}" data-id="${article.id}">
              ${isSaved ? '✓ Saved' : '🔖 Save'}
            </button>
          </div>
        </div>`);

      card.style.animationDelay = `${i * 50}ms`;

      card.querySelector('.btn-save').addEventListener('click', function () {
        const id = this.dataset.id;
        if (isArticleSaved(id)) {
          removeSavedArticle(id);
          this.textContent = '🔖 Save';
          this.classList.remove('saved');
        } else {
          saveArticle({ id: article.id, title: article.title, url: article.url, source: article.news_site });
          this.textContent = '✓ Saved';
          this.classList.add('saved');
        }
        renderReadingList();
      });

      newsFeed.appendChild(card);
    });
  }

  // ─── Reading List (localStorage) ───
  const LS_KEY = 'cosmos_reading_list';

  function getSavedArticles() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  }

  function isArticleSaved(id) {
    return getSavedArticles().some(a => String(a.id) === String(id));
  }

  function saveArticle(article) {
    const saved = getSavedArticles();
    if (!isArticleSaved(article.id)) {
      saved.unshift(article);
      localStorage.setItem(LS_KEY, JSON.stringify(saved));
    }
  }

  function removeSavedArticle(id) {
    const updated = getSavedArticles().filter(a => String(a.id) !== String(id));
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    // Update save button in feed if visible
    const feedBtn = newsFeed?.querySelector(`.btn-save[data-id="${id}"]`);
    if (feedBtn) {
      feedBtn.textContent = '🔖 Save';
      feedBtn.classList.remove('saved');
    }
  }

  function renderReadingList() {
    if (!readingListEl) return;
    const saved = getSavedArticles();

    if (saved.length === 0) {
      readingListEl.innerHTML = '<div class="reading-list-empty">📚 Your reading list is empty. Save articles to find them here.</div>';
      return;
    }

    readingListEl.innerHTML = '';
    saved.forEach(article => {
      const item = el(`
        <div class="saved-article" data-id="${article.id}">
          <div class="saved-article-title">
            <a href="${article.url}" target="_blank" rel="noopener">${article.title}</a>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:3px">${article.source || ''}</div>
          </div>
          <button class="btn btn-danger" style="flex-shrink:0">✕ Remove</button>
        </div>`);

      item.querySelector('.btn-danger').addEventListener('click', () => {
        removeSavedArticle(article.id);
        renderReadingList();
      });

      readingListEl.appendChild(item);
    });
  }

  loadNews();
  renderReadingList();
}

/* ═══════════════════════════════════════════════
   PAGE: CONNECT (connect.html)
═══════════════════════════════════════════════ */
function initConnect() {
  // Newsletter form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const success = this.querySelector('.form-success');
      success.classList.add('show');
      success.textContent = '✓ You\'re subscribed! Welcome to Cosmos.';
      this.querySelector('input[type="email"]').value = '';
      setTimeout(() => success.classList.remove('show'), 5000);
    });
  }

  // Feedback form
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const success = this.querySelector('.form-success');
      const rating  = this.querySelector('input[name="rating"]:checked');
      success.textContent = `✓ Thanks for your ${rating ? rating.value + '-star ' : ''}feedback! We appreciate it.`;
      success.classList.add('show');
      this.reset();
      setTimeout(() => success.classList.remove('show'), 5000);
    });
  }
}

/* ─────────────────────────────────────────────
   HOME PAGE INIT — red starfield tint
───────────────────────────────────────────── */
function initHome() {
  // Nothing additional needed — the starfield red tint
  // is handled by body.home-page check inside the IIFE above.
}

/* ─────────────────────────────────────────────
   PAGE ROUTER — run the right init function
───────────────────────────────────────────── */
(function router() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const map = {
    'index.html':     initHome,
    '':               initHome,
    'apod.html':      initAPOD,
    'mars.html':      initMars,
    'asteroids.html': initAsteroids,
    'iss.html':       initISS,
    'connect.html':   initConnect,
  };

  const init = map[page];
  if (init) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
