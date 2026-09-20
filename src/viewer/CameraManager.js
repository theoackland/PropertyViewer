import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const DEFAULT_CAMERA_SETTINGS = {
  transitionDuration: 1100,
  lookDistance: 4,
  minPolarAngle: 0.55,
  maxPolarAngle: 1.35,
  minAzimuthAngle: -Math.PI,
  maxAzimuthAngle: Math.PI,
};

export class CameraManager {
  constructor(camera, canvas, settings = {}) {
    this.camera = camera;
    this.settings = { ...DEFAULT_CAMERA_SETTINGS, ...settings };
    this.controls = new OrbitControls(camera, canvas);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = this.settings.lookDistance;
    this.controls.maxDistance = this.settings.lookDistance;
    this.controls.minPolarAngle = this.settings.minPolarAngle;
    this.controls.maxPolarAngle = this.settings.maxPolarAngle;
    this.controls.minAzimuthAngle = this.settings.minAzimuthAngle;
    this.controls.maxAzimuthAngle = this.settings.maxAzimuthAngle;
    this.controls.enableZoom = false;
    this.controls.saveState();
    this.activeNode = null;
    this.transition = null;
    this.currentTarget = new THREE.Vector3();
    this.destinationPosition = new THREE.Vector3();
    this.destinationQuaternion = new THREE.Quaternion();
    this.forward = new THREE.Vector3(0, 0, -1);
    this.up = new THREE.Vector3(0, 1, 0);
  }

  setNode(node, immediate = false) {
    if (!node) return;
    node.updateWorldMatrix(true, false);
    const position = node.getWorldPosition(new THREE.Vector3());
    const orientation = node.getWorldQuaternion(new THREE.Quaternion());
    const target = position.clone().add(this.forward.clone().applyQuaternion(orientation).multiplyScalar(this.settings.lookDistance));
    const cameraPosition = position.clone().add(this.forward.clone().applyQuaternion(orientation).multiplyScalar(-this.settings.lookDistance));
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(cameraPosition, target, this.up));

    this.activeNode = node;
    this.currentTarget.copy(target);
    this.controls.target.copy(target);
    this.controls.enableRotate = true;
    if (immediate) {
      this.camera.position.copy(cameraPosition);
      this.camera.quaternion.copy(quaternion);
      this.controls.update();
    } else {
      this.transition = {
        elapsed: 0,
        startPosition: this.camera.position.clone(),
        startQuaternion: this.camera.quaternion.clone(),
        startTarget: this.controls.target.clone(),
        endPosition: cameraPosition,
        endQuaternion: quaternion,
        endTarget: target,
      };
      this.controls.enabled = false;
    }
  }

  update(deltaSeconds) {
    if (this.transition) {
      const transition = this.transition;
      transition.elapsed += deltaSeconds * 1000;
      const progress = Math.min(transition.elapsed / this.settings.transitionDuration, 1);
      const eased = progress * progress * (3 - 2 * progress);
      this.camera.position.lerpVectors(transition.startPosition, transition.endPosition, eased);
      this.camera.quaternion.slerpQuaternions(transition.startQuaternion, transition.endQuaternion, eased);
      this.controls.target.lerpVectors(transition.startTarget, transition.endTarget, eased);
      if (progress === 1) {
        this.transition = null;
        this.controls.enabled = true;
        this.controls.update();
      }
    } else {
      this.controls.update();
    }
  }

  resetView() {
    if (!this.activeNode || this.transition) return;
    this.setNode(this.activeNode, false);
  }

  isTransitioning() {
    return Boolean(this.transition);
  }

  dispose() {
    this.controls.dispose();
  }
}
