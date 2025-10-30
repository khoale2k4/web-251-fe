export class Popup {
    constructor() {
        this.createPopup();
    }

    createPopup() {
        if (document.querySelector('.popup-overlay')) return;

        const popupHTML = `
      <div class="popup-overlay hidden">
        <div class="popup">
          <div class="popup-header">
            <h3 class="popup-title">Thông tin</h3>
            <button class="btn-close">&times;</button>
          </div>
          <div class="popup-content"></div>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);

        this.overlay = document.querySelector('.popup-overlay');
        this.titleEl = this.overlay.querySelector('.popup-title');
        this.contentEl = this.overlay.querySelector('.popup-content');
        this.closeBtn = this.overlay.querySelector('.btn-close');

        this.closeBtn.addEventListener('click', () => this.hide());
        this.overlay.addEventListener('click', e => {
            if (e.target === this.overlay) this.hide();
        });
    }

    show({ title = 'Thông tin', content = '' }) {
        this.titleEl.textContent = title;
        this.contentEl.innerHTML = content;
        this.overlay.classList.remove('hidden');
    }

    hide() {
        this.overlay.classList.add('hidden');
    }
}
