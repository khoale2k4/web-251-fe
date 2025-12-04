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
          
          <div class="popup-actions"></div> 
          
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);

    this.overlay = document.querySelector('.popup-overlay');
    this.titleEl = this.overlay.querySelector('.popup-title');
    this.contentEl = this.overlay.querySelector('.popup-content');
    this.closeBtn = this.overlay.querySelector('.btn-close');

    this.actionsEl = this.overlay.querySelector('.popup-actions');

    this.closeBtn.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.hide();
    });
  }

  show({ title = 'Thông tin', content = '', actions = [] }) {
    this.titleEl.textContent = title;
    this.contentEl.innerHTML = content;

    this.actionsEl.innerHTML = '';
    if (actions.length === 0) {
      this.actionsEl.style.display = 'none';
    } else {
      this.actionsEl.style.display = 'flex';

      actions.forEach(action => {
        const button = document.createElement('button');

        button.textContent = action.label;
        button.className = 'btn';
        if (action.type) {
          action.type.split(' ').forEach(cls => button.classList.add(cls));
        }

        button.addEventListener('click', () => {
          if (action.onClick) {
            action.onClick();
          }

          if (action.close !== false) {
            this.hide();
          }
        });

        this.actionsEl.appendChild(button);
      });
    }
    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }
}