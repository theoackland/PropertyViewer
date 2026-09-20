import { PropertyViewer } from './viewer/PropertyViewer.js';
import './styles/viewer.css';

class PropertyViewerElement extends HTMLElement {
  connectedCallback() {
    if (this.viewer) return;

    this.innerHTML = `
      <div class="viewer-root"></div>
      <section class="viewer-ui" aria-label="Property tour controls"></section>
    `;

    const modelId = this.getAttribute('model');
    if (!modelId) {
      this.setAttribute('aria-label', 'Property viewer error');
      this.textContent = 'A property model ID is required.';
      return;
    }

    this.viewer = new PropertyViewer({
      container: this.querySelector('.viewer-root'),
      uiContainer: this.querySelector('.viewer-ui'),
      modelSource: this.resolveModelSource(modelId),
      propertyTitle: this.getAttribute('title') || 'Property Viewer',
    });
    this.viewer.start();
  }

  disconnectedCallback() {
    this.viewer?.dispose();
    this.viewer = null;
  }

  resolveModelSource(modelId) {
    return modelId.endsWith('.glb') ? `/models/${modelId}` : `/models/${modelId}.glb`;
  }
}

customElements.define('property-viewer', PropertyViewerElement);
