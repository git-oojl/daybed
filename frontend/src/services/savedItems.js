const SAVED_ITEMS_KEY = "daybed:saved-product-ids";
const SAVED_ITEMS_EVENT = "daybed:saved-items-changed";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getSavedProductIds() {
  if (!canUseStorage()) return [];

  try {
    const storedValue = window.localStorage.getItem(SAVED_ITEMS_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue)
      ? parsedValue.map(String).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function isProductSaved(productId) {
  return getSavedProductIds().includes(String(productId));
}

export function setSavedProductIds(productIds) {
  const nextIds = [...new Set(productIds.map(String).filter(Boolean))];

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(nextIds));
      window.dispatchEvent(
        new CustomEvent(SAVED_ITEMS_EVENT, { detail: { productIds: nextIds } }),
      );
    } catch {
      // Ignore storage failures; the caller will still receive the calculated IDs.
    }
  }

  return nextIds;
}

export function toggleSavedProduct(productId) {
  const id = String(productId);
  const currentIds = getSavedProductIds();
  const nextIds = currentIds.includes(id)
    ? currentIds.filter((currentId) => currentId !== id)
    : [...currentIds, id];

  return setSavedProductIds(nextIds);
}

export function subscribeToSavedItems(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = (event) => {
    callback(event.detail?.productIds ?? getSavedProductIds());
  };
  const handleStorage = (event) => {
    if (event.key === SAVED_ITEMS_KEY) callback(getSavedProductIds());
  };

  window.addEventListener(SAVED_ITEMS_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(SAVED_ITEMS_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}
