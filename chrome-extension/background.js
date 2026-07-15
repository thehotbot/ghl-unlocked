// Service worker that intercepts requests to backend.leadconnectorhq.com
// and extracts the GHL JWT from the Authorization header.

let capturedJwt = null;
let capturedAt = null;
let capturedExpiresAt = null;

function decodeJwtExp(jwt) {
  try {
    const payload = jwt.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.exp ? decoded.exp * 1000 : null; // convert to ms
  } catch {
    return null;
  }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const authHeader = details.requestHeaders?.find(
      (h) => h.name.toLowerCase() === 'authorization'
    );
    if (authHeader && authHeader.value.startsWith('Bearer ')) {
      capturedJwt = authHeader.value.slice(7);
      capturedAt = Date.now();
      capturedExpiresAt = decodeJwtExp(capturedJwt);
    }
  },
  { urls: ['*://*.leadconnectorhq.com/*'] },
  ['requestHeaders', 'extraHeaders']
);

// Respond to popup requests for the captured JWT
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getGhlJwt') {
    sendResponse({
      ghl_jwt: capturedJwt,
      ghl_jwt_expires_at: capturedExpiresAt,
      captured_at: capturedAt,
    });
  }
  return false;
});
