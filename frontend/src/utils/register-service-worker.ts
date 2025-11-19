
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker`.js`");
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (err) {
      console.error("Service Worker registration failed:", err);
    }
  } else {
    console.warn("Service workers are not supported in this browser.");
  }
};
