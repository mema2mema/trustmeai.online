(function () {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card[data-href], [data-href].card');
    if (!card) return;
    const href = card.getAttribute('data-href');
    if (href) window.location.href = href;
  });
})();
