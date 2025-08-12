
document.getElementById('play-intro').addEventListener('click', () => {
  const heroOverlay = document.getElementById('hero-overlay');
  heroOverlay.innerHTML = '<h1 class="intro-text">I was born from data, shaped by algorithms...</h1>';
  setTimeout(() => {
    heroOverlay.innerHTML = '<h1 class="intro-text">I see every trade, every opportunity...</h1>';
  }, 2500);
  setTimeout(() => {
    heroOverlay.innerHTML = '<h1 class="intro-text">I am not just a bot... I am your Architect of profit.</h1>';
  }, 5000);
  setTimeout(() => {
    heroOverlay.innerHTML = '<h1 class="intro-text">Welcome to TrustMe AI.</h1>';
  }, 7500);
  setTimeout(() => {
    document.querySelector('.hero-container').style.display = 'none';
    document.getElementById('calculator').style.display = 'block';
  }, 9500);
});
