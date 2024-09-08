// Cursor shadow script
const cursorShadow = document.querySelector('.cursor-shadow');

document.addEventListener('mousemove', (event) => {
    cursorShadow.style.left = event.clientX + 'px';
    cursorShadow.style.top = event.clientY + 'px';
});
