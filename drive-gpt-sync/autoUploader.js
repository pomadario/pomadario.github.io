
// autoUploader.js - Web App Potenziata

let selectedFolderId = null;

function log(msg) {
  document.getElementById("log").textContent += "\n" + msg;
}

function handleGoogleAuth() {
  gapi.load("client:auth2", () => {
    gapi.auth2.init({
      client_id: "306170806464-rk4a666mos7itqf4kdooqg55l8me6b49.apps.googleusercontent.com"
    }).then(() => {
      gapi.auth2.getAuthInstance().signIn().then(() => {
        log("✅ Autenticato con Google");
      });
    });
  });
}

function handleGoogleLogout() {
  const auth = gapi.auth2.getAuthInstance();
  if (auth && auth.isSignedIn.get()) {
    auth.signOut().then(() => log("🚪 Logout effettuato"));
  }
}

function chooseDriveFolder() {
  const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
    .setIncludeFolders(true)
    .setSelectFolderEnabled(true);
  const picker = new google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(gapi.auth.getToken().access_token)
    .setDeveloperKey('AIzaSyC-JSostituisci-con-una-chiave-valida')
    .setCallback((data) => {
      if (data.action === google.picker.Action.PICKED) {
        selectedFolderId = data.docs[0].id;
        document.getElementById("folderStatus").textContent = "Cartella selezionata: " + data.docs[0].name;
        log("📁 Cartella selezionata: " + data.docs[0].name);
      }
    }).build();
  picker.setVisible(true);
}

function uploadToSelectedFolder() {
  const file = document.getElementById("fileInput").files[0];
  if (!file || !selectedFolderId) return alert("Seleziona un file e una cartella Drive.");

  const metadata = {
    name: file.name,
    parents: [selectedFolderId]
  };

  const accessToken = gapi.auth.getToken().access_token;
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
    method: "POST",
    headers: new Headers({ "Authorization": "Bearer " + accessToken }),
    body: form
  }).then(res => res.json())
    .then(val => {
      const entry = document.createElement("li");
      entry.textContent = `${file.name} (ID: ${val.id})`;
      document.getElementById("fileList").appendChild(entry);
      log("✅ File caricato con ID: " + val.id);
    }).catch(err => log("❌ Errore: " + err.message));
}
