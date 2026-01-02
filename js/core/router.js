// Simple Client-Side Router (optional, for SPA behavior)

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
  }

  // Add route
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  // Navigate to route
  navigate(path) {
    if (this.routes[path]) {
      this.currentRoute = path;
      this.routes[path]();
      window.history.pushState({}, '', path);
    }
  }

  // Handle back button
  init() {
    window.addEventListener('popstate', () => {
      const path = window.location.pathname;
      if (this.routes[path]) {
        this.routes[path]();
      }
    });
  }
}

// Export
window.Router = Router;