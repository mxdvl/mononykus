export const getMimeType = (filename: string) => {
  if (filename.endsWith(".svg")) return "image/svg+xml";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg")) return "image/jpeg";
  if (filename.endsWith(".ico")) return "image/x-icon";

  if (filename.endsWith(".css")) return "text/css";

  if (filename.endsWith(".js")) return "application/javascript";

  return "text/plain";
};
