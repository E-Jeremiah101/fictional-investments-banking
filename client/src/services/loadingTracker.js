let activeRequests = 0;
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const beginLoading = () => {
  activeRequests += 1;
  notify();
};

export const endLoading = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  notify();
};

export const subscribeToLoading = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getIsLoading = () => activeRequests > 0;
