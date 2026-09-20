import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelLoader {
  constructor({ onProgress, onError } = {}) {
    this.loader = new GLTFLoader();
    this.onProgress = onProgress;
    this.onError = onError;
  }

  load(source) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        source,
        (gltf) => resolve(gltf),
        (event) => {
          if (this.onProgress && event.total > 0) {
            this.onProgress(event.loaded / event.total);
          }
        },
        (error) => {
          this.onError?.(error);
          reject(new Error(`Unable to load property model: ${error.message || 'invalid GLB file'}`));
        },
      );
    });
  }
}
