import * as THREE from 'three';
import { ModelLoader } from './ModelLoader.js';
import { NavigationManager } from './NavigationManager.js';
import { CameraManager } from './CameraManager.js';
import { ViewerUI } from './ViewerUI.js';

export class PropertyViewer {
  constructor({ container, uiContainer, modelSource, propertyTitle = 'Property Viewer', navigationGraph } = {}) {
    this.container = container;
    this.modelSource = modelSource;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#c6d0ca');
    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    this.navigation = new NavigationManager(navigationGraph);
    this.ui = new ViewerUI(uiContainer);
    this.ui.setTitle(propertyTitle);
    this.cameraManager = new CameraManager(this.camera, this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.model = null;
    this.currentNode = null;
    this.boundResize = () => this.resize();
    this.animate = this.animate.bind(this);
    this.configureScene();
  }

  configureScene() {
    this.scene.add(new THREE.HemisphereLight('#f4f1e8', '#596762', 2.4));
    const keyLight = new THREE.DirectionalLight('#fff4df', 3.2);
    keyLight.position.set(8, 14, 6);
    keyLight.castShadow = true;
    this.scene.add(keyLight);
    this.ui.onNavigate = (nodeName) => this.navigateTo(nodeName);
    this.ui.onReset = () => this.cameraManager.resetView();
    this.ui.onFullscreen = () => this.container.parentElement.requestFullscreen?.();
  }

  async start() {
    if (!this.renderer.capabilities.isWebGL2 && !this.renderer.capabilities.isWebGL1) {
      this.ui.showError('WebGL is not available in this browser. Please enable hardware acceleration or try another browser.');
      return;
    }
    window.addEventListener('resize', this.boundResize);
    this.resize();
    this.animate();
    const loader = new ModelLoader({ onProgress: (progress) => this.ui.setLoading(progress) });
    try {
      const gltf = await loader.load(this.modelSource);
      this.model = gltf.scene;
      this.model.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      this.scene.add(this.model);
      const nodes = this.navigation.discover(this.model);
      const nodeNames = Object.keys(nodes);
      if (!nodeNames.length) {
        this.ui.showError('This property model has no navigation points. Add named NAV_ objects inside the GLB.');
        return;
      }
      this.currentNode = this.navigation.getInitialNode();
      this.cameraManager.setNode(this.currentNode, true);
      this.updateNavigationUI();
      this.ui.setReady();
    } catch (error) {
      this.ui.showError(`${error.message}. Add the requested GLB to public/models and reload.`);
    }
  }

  navigateTo(destinationName) {
    if (!this.currentNode || this.cameraManager.isTransitioning()) return;
    if (!this.navigation.canNavigate(this.currentNode.name, destinationName)) {
      this.ui.showError('That location is not available from here.');
      return;
    }
    const destination = this.navigation.getNavigationNode(destinationName);
    if (!destination) {
      this.ui.showError(`Navigation point ${destinationName} is missing from the model.`);
      return;
    }
    this.currentNode = destination;
    this.cameraManager.setNode(destination);
    this.updateNavigationUI();
  }

  updateNavigationUI() {
    this.ui.setLocation(this.navigation.labelFor(this.currentNode.name));
    this.ui.renderDestinations(this.navigation.getDestinations(this.currentNode.name), this.currentNode.name, (name) => this.navigation.labelFor(name));
  }

  resize() {
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / Math.max(clientHeight, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.cameraManager.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this.boundResize);
    this.cameraManager.dispose();
    this.renderer.dispose();
  }
}
