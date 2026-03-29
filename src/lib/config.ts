export const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (typeof url === "string" && url.length > 0) {
    return url.replace(/\/$/, "");
  }
  return "http://localhost:5000";
};
