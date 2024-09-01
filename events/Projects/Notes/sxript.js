// JS for content editable trick from Chris Coyier

var h1 = document.querySelector("h1");

h1.addEventListener("input", function() {
  this.setAttribute("data-heading", this.innerText);
});