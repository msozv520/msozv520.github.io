/* Bewegung: weiches Scrollen (Lenis) und sanftes Einblenden der Abschnitte.
   Bei „Bewegung reduzieren“ bleibt alles ruhig und sofort sichtbar. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { root.classList.remove('motion'); return; }

  // Weiches Scrollen, mit dem GSAP-Takt gekoppelt (falls geladen)
  if (window.Lenis) {
    var lenis = new Lenis({ autoRaf: !window.gsap, duration: 1.1, smoothWheel: true });
    if (window.gsap) {
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var el = document.querySelector(id); if (!el) return;
        e.preventDefault(); var k = document.querySelector('.top'); lenis.scrollTo(el, { offset: -((k ? k.offsetHeight : 68) + 10), duration: 1.2 }); history.replaceState(null, '', id);
      });
    });
  }

  // Abschnitte und Karten einblenden, sobald sie ins Bild kommen
  var ziele = document.querySelectorAll('.saetze li, .sec-head, .ueber-text > *, .karte, .zitat blockquote, .zitat .wer, .reels figure, .list li, .card, .gallery figure, .kontakt .box');
  ziele.forEach(function (el) { el.classList.add('rein'); });
  if (!('IntersectionObserver' in window)) { root.classList.remove('motion'); return; }
  var io = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) {
      if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'none'; io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  ziele.forEach(function (el) { io.observe(el); });
})();
