/* Fahnen-Hintergrund: läuft nur, solange die Seite sichtbar ist; bei „Bewegung reduzieren“ bleibt das Standbild. */
(function () {
  var v = document.getElementById('fahne');
  if (!v) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); return; }
  function play() { var p = v.play(); if (p) p.catch(function () {}); }
  play();
  document.addEventListener('visibilitychange', function () { document.hidden ? v.pause() : play(); });
  // Wenn ein anderes Video mit Ton startet, Hintergrund weiterlaufen lassen, aber nur eins mit Ton gleichzeitig
  document.querySelectorAll('.reels video').forEach(function (r) {
    r.addEventListener('play', function () { document.querySelectorAll('.reels video').forEach(function (o) { if (o !== r) o.pause(); }); });
  });
})();
