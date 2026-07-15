const copyBtn = document.getElementById('copyBtn');
const statusEl = document.getElementById('status');
const infoEl = document.getElementById('info');
const jwtStatusEl = document.getElementById('jwt-status');
const firebaseStatusEl = document.getElementById('firebase-status');
const previewEl = document.getElementById('preview');

let tokenBlob = {};

// 1. Ask background.js for the intercepted GHL JWT
chrome.runtime.sendMessage({ action: 'getGhlJwt' }, (response) => {
  if (response?.ghl_jwt) {
    tokenBlob.ghl_jwt = response.ghl_jwt;
    if (response.ghl_jwt_expires_at) {
      tokenBlob.ghl_jwt_expires_at = response.ghl_jwt_expires_at;
    }
    const age = Math.round((Date.now() - response.captured_at) / 60000);
    const expiresIn = response.ghl_jwt_expires_at
      ? Math.round((response.ghl_jwt_expires_at - Date.now()) / 60000)
      : null;
    const expiryInfo = expiresIn ? `, expires in ${expiresIn}m` : '';
    jwtStatusEl.textContent = `GHL JWT captured (${age}m ago${expiryInfo})`;
    jwtStatusEl.className = 'token-status valid';
  } else {
    jwtStatusEl.textContent = 'No GHL JWT captured yet — navigate GHL to trigger a request';
    jwtStatusEl.className = 'token-status missing';
  }
  updateButton();
});

// 2. Ask content.js for Firebase refresh token + metadata
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab?.url?.includes('gohighlevel.com') && !tab?.url?.includes('leadconnectorhq.com')) {
    firebaseStatusEl.textContent = 'Not on GHL — navigate to app.gohighlevel.com';
    firebaseStatusEl.className = 'token-status expired';
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: 'getFirebaseToken' }, (response) => {
    if (chrome.runtime.lastError) {
      firebaseStatusEl.textContent = 'Content script not loaded — refresh the GHL page';
      firebaseStatusEl.className = 'token-status expired';
      return;
    }

    if (response?.error) {
      firebaseStatusEl.textContent = response.error;
      firebaseStatusEl.className = 'token-status expired';
      return;
    }

    tokenBlob.firebase_refresh_token = response.firebase_refresh_token;
    if (response.location_id) tokenBlob.location_id = response.location_id;

    firebaseStatusEl.textContent = 'Firebase refresh token found';
    firebaseStatusEl.className = 'token-status valid';

    if (response.email) {
      const emailDiv = document.createElement('div');
      emailDiv.className = 'info';
      emailDiv.textContent = `Account: ${response.email}`;
      infoEl.appendChild(emailDiv);
    }
    if (response.location_id) {
      const locDiv = document.createElement('div');
      locDiv.className = 'info';
      locDiv.textContent = `Location: ${response.location_id}`;
      infoEl.appendChild(locDiv);
    }

    updateButton();
  });
});

function updateButton() {
  if (tokenBlob.ghl_jwt || tokenBlob.firebase_refresh_token) {
    copyBtn.textContent = 'Copy Tokens';
    copyBtn.disabled = false;
  }
}

copyBtn.addEventListener('click', async () => {
  if (!tokenBlob.ghl_jwt && !tokenBlob.firebase_refresh_token) return;

  try {
    const json = JSON.stringify(tokenBlob, null, 2);
    await navigator.clipboard.writeText(json);
    statusEl.textContent = 'Copied! Paste into: ghl-unlocked auth add --tokens \'...\'';
    statusEl.className = 'status success';
    previewEl.textContent = json;
    previewEl.style.display = 'block';
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy Tokens';
      statusEl.textContent = '';
    }, 5000);
  } catch (err) {
    statusEl.textContent = 'Clipboard failed: ' + err.message;
    statusEl.className = 'status error';
  }
});
