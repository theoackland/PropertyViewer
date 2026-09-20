export class ViewerUI {
  constructor(container) {
    this.container = container;
    this.onNavigate = null;
    this.onReset = null;
    this.onFullscreen = null;
    this.renderShell();
  }

  renderShell() {
    this.container.innerHTML = `
      <div class="brand-lockup"><span class="brand-mark">W</span><span>Willow & Co.</span></div>
      <div class="tour-panel">
        <div class="tour-heading"><span class="eyebrow">Virtual tour</span><h1 data-title>Property Viewer</h1><p data-location>Preparing your tour</p></div>
        <div class="tour-actions"><button class="icon-button" type="button" data-reset aria-label="Reset view" title="Reset view">↺</button><button class="icon-button" type="button" data-fullscreen aria-label="Fullscreen" title="Fullscreen">⛶</button></div>
        <div class="divider"></div>
        <nav class="location-list" data-locations aria-label="Available locations"></nav>
      </div>
      <div class="status-pill" data-status><span class="status-dot"></span><span data-status-text>Loading model</span></div>
      <div class="error-banner" data-error hidden></div>
    `;
    this.titleElement = this.container.querySelector('[data-title]');
    this.locationElement = this.container.querySelector('[data-location]');
    this.locationsElement = this.container.querySelector('[data-locations]');
    this.statusElement = this.container.querySelector('[data-status]');
    this.statusText = this.container.querySelector('[data-status-text]');
    this.errorElement = this.container.querySelector('[data-error]');
    this.container.querySelector('[data-reset]').addEventListener('click', () => this.onReset?.());
    this.container.querySelector('[data-fullscreen]').addEventListener('click', () => this.onFullscreen?.());
  }

  setTitle(title) { this.titleElement.textContent = title; }

  setLoading(progress) {
    this.statusElement.hidden = false;
    this.statusText.textContent = progress === 1 ? 'Ready to explore' : `Loading model ${Math.round(progress * 100)}%`;
  }

  setReady() {
    this.statusElement.hidden = false;
    this.statusText.textContent = 'Ready to explore';
  }

  setLocation(name) {
    this.locationElement.textContent = name;
  }

  renderDestinations(destinations, currentName, labelFor) {
    this.locationsElement.innerHTML = destinations.length ? destinations.map((name) => `<button type="button" class="location-button" data-node="${name}"><span>${labelFor(name)}</span><span class="arrow">↗</span></button>`).join('') : '<p class="no-destinations">You have reached the end of this route.</p>';
    this.locationsElement.querySelectorAll('[data-node]').forEach((button) => {
      button.addEventListener('click', () => this.onNavigate?.(button.dataset.node));
    });
    this.locationsElement.querySelector(`[data-node="${currentName}"]`)?.classList.add('current');
  }

  showError(message) {
    this.statusElement.hidden = true;
    this.errorElement.hidden = false;
    this.errorElement.textContent = message;
  }

  async requestFullscreen(element) {
    this.onFullscreen = () => element.requestFullscreen?.();
  }
}
