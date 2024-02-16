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

document.addEventListener("DOMContentLoaded", function () {
  // Get the modal
  var modal = document.getElementById("imgModal");

  // Get the images within the div_diploma container
  var images = document.querySelectorAll("#div_diploma .education_img");
  var modalImg = document.getElementById("enlargedImage");

  images.forEach(function (img) {
    img.addEventListener("click", function () {
      modal.style.display = "block";
      modalImg.src = this.src;
      // If you have a caption element, you can set its content here
      // captionText.innerHTML = this.alt;
    });
  });

  // Get the <span> element that closes the modal
  var closeModal = document.getElementById("closeModal");

  // When the user clicks on <span> (x), close the modal
  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Optionally, close the modal if the user clicks anywhere outside the image
  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
});

// Initial check
checkVisibility();

// Check again when scrolling or resizing
window.addEventListener("scroll", checkVisibility);
window.addEventListener("resize", checkVisibility);
