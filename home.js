// Cursor shadow script
const cursorShadow = document.querySelector('.cursor-shadow');

document.addEventListener('mousemove', (event) => {
    cursorShadow.style.left = event.clientX + 'px';
    cursorShadow.style.top = event.clientY + 'px';
});

window.addEventListener('scroll', () => {
    const scrollTexts = document.querySelectorAll('.scroll-text');
    const triggerPoint = window.innerHeight / 1.2;
  
    scrollTexts.forEach(text => {
      const textTop = text.getBoundingClientRect().top;
  
      if (textTop < triggerPoint) {
        text.classList.add('show', 'no-glow'); // Add 'show' and 'no-glow' classes when scrolled into view
      }
    });
  });

  const lenis = new Lenis()

lenis.on('scroll', (e) => {
  console.log(e)
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

