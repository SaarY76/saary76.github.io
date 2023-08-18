/**
 * the function returns if an element is in viewport or not
 * @param {} el - an element in the HTML document
 * @returns - true if the element is in the view port and else false
 */
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * the function checks all of the elelements in the HTML document
 * that have the class : "fade-in" and if the element is in a viewport
 * it will add to it a css class that will show this element in transition
 */
function checkVisibility() {
  const elements = document.querySelectorAll(".fade-in");
  elements.forEach((el) => {
    if (isInViewport(el)) {
      el.classList.add("visible");
    } else {
      el.classList.remove("visible"); // Remove the class if it's out of viewport
    }
  });
}

// Initial check
checkVisibility();

// Check again when scrolling or resizing
window.addEventListener("scroll", checkVisibility);
window.addEventListener("resize", checkVisibility);
