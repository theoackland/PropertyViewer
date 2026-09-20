# Property Viewer

A local Three.js prototype for guided, interactive residential property tours. It loads a GLB model, discovers navigation points authored in Blender, and constrains the camera to those points.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The example page uses `<property-viewer model="house123">`, which loads `public/models/house123.glb`.

The custom element is the public integration API:

```html
<property-viewer model="house123" title="Willow House"></property-viewer>
```

The `model` value is resolved to `/models/{model}.glb`. A value that already ends in `.glb` is also supported. This keeps the page independent from the viewer internals and leaves room for resolving model IDs through an API later.

## Blender model convention

Create empty objects (or other `Object3D` nodes) whose names begin with `NAV_`, for example:

- `NAV_ENTRANCE`
- `NAV_HALLWAY`
- `NAV_LIVING`
- `NAV_KITCHEN`
- `NAV_STAIRS`
- `NAV_MASTER_BEDROOM`

Place each object where the camera should be located. Its local forward direction (negative Z in Blender/Three.js) defines the initial view direction. The viewer works with any number of nodes and does not depend on their order in the GLB.

## Navigation graph

The prototype graph lives in `src/viewer/NavigationManager.js`. It maps a node ID to allowed destination IDs. The UI only shows destinations that both exist in the loaded model and are allowed by the current graph entry. A later metadata adapter can replace this graph without changing the viewer or camera APIs.

## Camera restrictions

The camera uses `OrbitControls` as a fixed-radius look-around rig centered on the active navigation point. Panning and zoom are disabled, vertical rotation is limited, and navigation transitions disable input while position and orientation ease to the next point.

## Structure

- `src/main.js` boots the viewer.
- `src/viewer/PropertyViewer.js` coordinates the application.
- `ModelLoader.js` owns GLB loading and progress reporting.
- `NavigationManager.js` discovers nodes and resolves the prototype graph.
- `CameraManager.js` owns constrained look-around and transitions.
- `ViewerUI.js` owns the property-tour controls and status messages.
- `src/styles/viewer.css` contains the responsive visual layer.

## Embedding and future data sources

The component currently runs locally, but it is designed to become a standalone viewer element in a larger website. The next step is to add an optional metadata source for titles, room labels, graph connections, floors, viewpoints, and camera settings. The model resolver can then change from `/models/{model}.glb` to a remote property service without changing the camera or navigation classes.

