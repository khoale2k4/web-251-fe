export function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCounterElement = document.getElementById('cart-counter');
    if (cartCounterElement) {
      cartCounterElement.innerText = totalItems;
    }
  }

  updateCartCounter();

  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const keyword = searchInput.value.trim();

      if (keyword) {
        window.location.href = `products.html?search=${encodeURIComponent(keyword)}`;
      }
    });
  }

  window.updateCartCounter = updateCartCounter;
});