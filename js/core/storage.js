// LocalStorage Wrapper (Safe, JSON-aware, Production-ready)

const storage = {
  /* =========================
     CHECK AVAILABILITY
  ========================== */
  isAvailable() {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /* =========================
     SET ITEM
  ========================== */
  set(key, value) {
    if (!this.isAvailable()) {
      console.warn("⚠️ localStorage not available");
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  },

  /* =========================
     GET ITEM
  ========================== */
  get(key, defaultValue = null) {
    if (!this.isAvailable()) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error("Storage get error:", error);
      return defaultValue;
    }
  },

  /* =========================
     REMOVE ITEM
  ========================== */
  remove(key) {
    if (!this.isAvailable()) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage remove error:", error);
      return false;
    }
  },

  /* =========================
     CLEAR ALL
  ========================== */
  clear() {
    if (!this.isAvailable()) return false;

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  },

  /* =========================
     HAS KEY
  ========================== */
  has(key) {
    if (!this.isAvailable()) return false;
    return localStorage.getItem(key) !== null;
  }
};

// Export (protect from overwrite)
if (!window.storage) {
  window.storage = storage;
}
