/* Bewegung für die persönliche Seite – GSAP + ScrollTrigger + SplitText + Lenis (alles lokal, kein CDN).
   Effekte nach dem Vorbild von React Bits, mit GSAP nachgebaut:
   SplitText (Name), BlurText/FadeContent (Texte), ScrollReveal (Überschriften), TiltedCard (Medien-Karten),
   Magnet (Symbole oben), Bild-Enthüllung (Galerien) und eine rote Lese-Fortschrittsleiste.
   Bei „Bewegung reduzieren“ (Systemeinstellung) bleibt alles ruhig und sofort sichtbar. */
(function () {
  var root = document.documentElement;
  if (!window.gsap) { root.classList.remove('motion'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (reduce) { root.classList.remove('motion'); return; }

  /* ---------- Weiches Scrollen (Lenis), mit dem GSAP-Takt gekoppelt ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ autoRaf: false, duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // Sprungmarken im Menü sanft anfahren (Kopfleiste ist ~64 px hoch)
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -72, duration: 1.2 });
        history.replaceState(null, '', id);
      });
    });
  }

  /* ---------- Rote Lese-Fortschrittsleiste oben ---------- */
  var bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- Einstieg: Leitsatz Wort für Wort, dann Text, Knöpfe und Porträt ---------- */
  var tag = document.querySelector('.hero .tagline');
  var intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (tag) {
    var split = new SplitText(tag, { type: 'words', wordsClass: 'w' });
    intro.from(split.words, { yPercent: 105, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.25);
  }
  intro
    .from('.hero .badge', { y: 12, opacity: 0, duration: 0.6 }, 0.1)
    .from('.hero h1', { y: 14, opacity: 0, duration: 0.6 }, 0.18)
    .from('.hero .role', { y: 18, opacity: 0, filter: 'blur(6px)', duration: 0.7 }, 0.7)
    .from('.hero .btn', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.85)
    .from('.photo', { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.3, ease: 'expo.inOut' }, 0)
    .from('.photo img', { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.2)
    .from('.top .wrap > *', { y: -12, opacity: 0, duration: 0.6, stagger: 0.06 }, 0.1)
    .from('.marquee', { opacity: 0, duration: 0.8 }, 0.9);
  root.classList.remove('motion');   // Ausgangszustände setzt jetzt GSAP – CSS-Schutz gegen Aufblitzen aufheben

  // Porträt: leichte Parallaxe beim Scrollen
  gsap.to('.photo img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- Kacheln: nacheinander einblenden ---------- */
  gsap.from('.tile', {
    y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    scrollTrigger: { trigger: '.bento', start: 'top 88%' }
  });
  gsap.utils.toArray('.about p').forEach(function (p) {
    gsap.from(p, { y: 20, opacity: 0, filter: 'blur(6px)', duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 88%' } });
  });

  /* ---------- Abschnitts-Überschriften: Wörter tauchen nacheinander auf ---------- */
  document.querySelectorAll('.sec-head h2').forEach(function (h) {
    var s = new SplitText(h, { type: 'words' });
    gsap.from(s.words, {
      y: 26, opacity: 0, filter: 'blur(8px)', duration: 0.7, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: h, start: 'top 85%' }
    });
  });
  gsap.utils.toArray('.sec-head .more, .two h3').forEach(function (el) {
    gsap.from(el, { opacity: 0, x: 12, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- Listen (Ämter, Werdegang): Zeilen nacheinander ---------- */
  gsap.utils.toArray('.list').forEach(function (list) {
    gsap.from(list.children, {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.07, ease: 'power2.out',
      scrollTrigger: { trigger: list, start: 'top 85%' }
    });
  });

  /* ---------- Medien-Karten: einblenden + 3D-Kippen beim Überfahren ---------- */
  gsap.from('.card', {
    y: 22, opacity: 0, duration: 0.8, stagger: { each: 0.08, grid: 'auto', from: 'start' }, ease: 'power3.out',
    scrollTrigger: { trigger: '.cards', start: 'top 82%' }
  });
  if (finePointer) {
    document.querySelectorAll('.card').forEach(function (card) {
      gsap.set(card, { transformPerspective: 800 });
      var img = card.querySelector('img');
      var rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      var iz = img ? gsap.quickTo(img, 'scale', { duration: 0.6, ease: 'power3.out' }) : null;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 8); rx(-py * 8); if (iz) iz(1.06);
      });
      card.addEventListener('pointerleave', function () { rx(0); ry(0); if (iz) iz(1); });
    });
  }

  /* ---------- Galerien: Bilder werden von unten „aufgezogen“ ---------- */
  gsap.utils.toArray('.gallery figure').forEach(function (fig, i) {
    var img = fig.querySelector('img');
    var tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 88%' } });
    tl.from(fig, { clipPath: 'inset(100% 0% 0% 0% round 8px)', duration: 1, ease: 'expo.out', delay: (i % 3) * 0.08 })
      .from(img, { scale: 1.15, duration: 1.3, ease: 'expo.out' }, '<')
      .from(fig.querySelector('figcaption'), { opacity: 0, y: 6, duration: 0.5 }, '-=0.6');
  });

  /* ---------- Schwerpunkte: Schlagworte ploppen nacheinander auf ---------- */
  gsap.from('.tags span', {
    scale: 0.6, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'back.out(2)',
    scrollTrigger: { trigger: '.tags', start: 'top 88%' }
  });

  /* ---------- Symbole oben: magnetisch (folgen leicht der Maus) ---------- */
  if (finePointer) {
    document.querySelectorAll('.social a').forEach(function (a) {
      var mx = gsap.quickTo(a, 'x', { duration: 0.4, ease: 'power3.out' });
      var my = gsap.quickTo(a, 'y', { duration: 0.4, ease: 'power3.out' });
      a.addEventListener('pointermove', function (e) {
        var r = a.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35); my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      a.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  }

  // Sobald Bilder nachladen, verschiebt sich die Seite – Positionen dann neu berechnen (gebündelt)
  var refreshTimer = null;
  function refreshSoon() { clearTimeout(refreshTimer); refreshTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 120); }
  document.querySelectorAll('img').forEach(function (img) { if (!img.complete) img.addEventListener('load', refreshSoon, { once: true }); });
  window.addEventListener('load', refreshSoon);
  // Sicherheitsnetz: Alles, was schon oberhalb des sichtbaren Bereichs liegt, sofort fertig zeigen
  ScrollTrigger.addEventListener('refresh', function () {
    ScrollTrigger.getAll().forEach(function (st) { if (st.animation && st.end < window.scrollY && st.animation.progress() < 1) st.animation.progress(1); });
  });
})();
