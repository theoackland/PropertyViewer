const DEFAULT_GRAPH = {
  NAV_ENTRANCE: ['NAV_HALLWAY'],
  NAV_HALLWAY: ['NAV_ENTRANCE', 'NAV_LIVING', 'NAV_KITCHEN', 'NAV_STAIRS'],
  NAV_LIVING: ['NAV_HALLWAY'],
  NAV_KITCHEN: ['NAV_HALLWAY'],
  NAV_STAIRS: ['NAV_HALLWAY', 'NAV_MASTER_BEDROOM'],
  NAV_MASTER_BEDROOM: ['NAV_STAIRS'],
};

export class NavigationManager {
  constructor(graph = DEFAULT_GRAPH) {
    this.graph = graph;
    this.nodes = new Map();
  }

  discover(scene) {
    this.nodes.clear();
    scene.traverse((object) => {
      if (object.name?.startsWith('NAV_')) {
        this.nodes.set(object.name, object);
      }
    });
    return this.getNavigationNodes();
  }

  getNavigationNodes() {
    return Object.fromEntries(this.nodes);
  }

  getNavigationNode(name) {
    return this.nodes.get(name);
  }

  getInitialNode() {
    return this.getNavigationNode('NAV_ENTRANCE') || this.nodes.values().next().value;
  }

  getDestinations(fromName) {
    const destinations = this.graph[fromName] || [];
    return destinations.filter((name) => this.nodes.has(name));
  }

  canNavigate(fromName, toName) {
    return this.getDestinations(fromName).includes(toName);
  }

  labelFor(name) {
    return name.replace(/^NAV_/, '').split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  }
}

export { DEFAULT_GRAPH };
