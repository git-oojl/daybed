/**
 * Deduplicates concurrent refresh attempts without coupling them to Axios.
 * Request/session generation checks remain the responsibility of the caller.
 */
export function createSingleFlightCoordinator() {
  let activePromise = null;

  return {
    run(factory) {
      if (!activePromise) {
        const currentPromise = Promise.resolve()
          .then(factory)
          .finally(() => {
            if (activePromise === currentPromise) activePromise = null;
          });
        activePromise = currentPromise;
      }
      return activePromise;
    },
    reset() {
      activePromise = null;
    },
    get active() {
      return Boolean(activePromise);
    },
  };
}
