const waterLevel = document.getElementById('water-level');

const animateWaterLevel = () => {
  waterLevel.style.animationPlayState = 'running';
};

window.addEventListener('scroll', () => {
  if (window.scrollY >= document.documentElement.scrollHeight - window.innerHeight) {
    animateWaterLevel();
  }
});
