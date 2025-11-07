(() => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-error') {
        const element = mutation.target as HTMLElement;
        const error = element.getAttribute('data-error');
        if (error) {
          element.textContent = error;
          element.classList.remove('hidden');
        } else {
          element.classList.add('hidden');
        }
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      observer.observe(errorElement, { attributes: true });
    }
  });
})();