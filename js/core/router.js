// Simple Client-Side Router (GitHub Pages Safe)

class Router {
  constructor(basePath = "") {
    this.basePath = basePath;
    this.routes = {};
    this.notFoundHandler = null;
  }

  /* =========================
     ADD ROUTE (relative path)
     e.g. "/", "/login"
  ========================== */
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  /* =========================
     404 HANDLER
  ========================== */
  setNotFound(handler) {
    this.notFoundHandler = handler;
  }

  /* =========================
     NORMALIZE PATH
  ========================== */
  getCurrentPath() {
    let path = window.location.pathname;

    // Remove base path
    if (path.startsWith(this.basePath)) {
      path = path.slice(this.basePath.length);
    }

    return path || "/";
  }

  /* =========================
     NAVIGATE
  ========================== */
  navigate(path, replace = false) {
    const fullPath = this.basePath + path;

    if (this.routes[path]) {
      if (replace) {
        window.history.replaceState({}, "", fullPath);
      } else {
        window.history.pushState({}, "", fullPath);
      }
      this.routes[path]();
    } else {
      this.handleNotFound();
    }
  }

  /* =========================
     HANDLE ROUTE
  ========================== */
  handleRoute() {
    const path = this.getCurrentPath();

    if (this.routes[path]) {
      this.routes[path]();
    } else {
      this.handleNotFound();
    }
  }

  handleNotFound() {
    if (this.notFoundHandler) {
      this.notFoundHandler();
    } else {
      console.warn("404 - Route not found");
    }
  }

  /* =========================
     INIT
  ========================== */
  init() {
    // Initial load
    this.handleRoute();

    // Back / forward
    window.addEventListener("popstate", () => {
      this.handleRoute();
    });
  }
}

// Export globally
window.Router = Router;
