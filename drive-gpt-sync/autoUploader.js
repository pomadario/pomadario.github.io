
// autoUploader.js

async function handleGoogleAuth() {
  return gapi.auth2.getAuthInstance().signIn().then(() => {
    log("✅ Autenticato con Google");
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/drive/v3/rest")
      .then(() => log("📦 API Drive caricata"));
  });
}

function getAccessToken() {
  return gapi.auth.getToken().access_token;
}

async function uploadSelectedFile() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Seleziona un file prima.");
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream'
  };

  const accessToken = getAccessToken();
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
    method: "POST",
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form
  })
    .then(res => res.json())
    .then(val => log("📁 File caricato con ID: " + val.id))
    .catch(err => log("❌ Errore: " + err.message));
}

function log(msg) {
  const el = document.getElementById("log");
  if (el) el.textContent += "\n" + msg;
}

function initGapi() {
  gapi.load("client:auth2", () => {
    gapi.auth2.init({ client_id: "306170806464-rk4a666mos7itqf4kdooqg55l8me6b49.apps.googleusercontent.com" });
    log("🔄 Libreria Google API pronta");
  });
}

window.onload = initGapi;
