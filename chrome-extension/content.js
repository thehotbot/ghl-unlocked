// Reads Firebase auth data from IndexedDB when requested by popup.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== 'getFirebaseToken') return false;

  (async () => {
    try {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('firebaseLocalStorageDb');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      const tx = db.transaction('firebaseLocalStorage', 'readonly');
      const store = tx.objectStore('firebaseLocalStorage');

      const allKeys = await new Promise((resolve, reject) => {
        const req = store.getAllKeys();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      const authKey = allKeys.find(k =>
        String(k).includes('firebase:authUser:AIzaSyB_w3vXmsI7WeQtrIOkjR6xTRVN5uOieiE')
      );
      if (!authKey) {
        sendResponse({ error: 'No Firebase auth found. Are you logged into GHL?' });
        return;
      }

      const authData = await new Promise((resolve, reject) => {
        const req = store.get(authKey);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      const value = authData?.value || authData;
      const refreshToken = value?.stsTokenManager?.refreshToken;
      const email = value?.email;

      if (!refreshToken) {
        sendResponse({ error: 'Refresh token not found in Firebase data.' });
        return;
      }

      const urlMatch = window.location.href.match(/location\/([A-Za-z0-9]+)/);
      const locationId = urlMatch ? urlMatch[1] : null;

      sendResponse({ firebase_refresh_token: refreshToken, email, location_id: locationId });
    } catch (err) {
      sendResponse({ error: err.message });
    }
  })();

  return true;
});
