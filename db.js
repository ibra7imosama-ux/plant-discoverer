(function(){
  const DB_NAME = 'PlantDiagnosisDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'diagnoses';
  let db;
  function openDB(){
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function(e){
        const db = e.target.result;
        if(!db.objectStoreNames.contains(STORE_NAME)){
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      request.onsuccess = function(e){
        db = e.target.result;
        resolve(db);
      };
      request.onerror = function(e){
        reject(e.target.error);
      };
    });
  }
  async function saveDiagnosis(record){
    if(!db) await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const data = Object.assign({ timestamp: Date.now() }, record);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = e => reject(e.target.error);
    });
  }
  async function getAllDiagnoses(){
    if(!db) await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = e => reject(e.target.error);
    });
  }
  async function deleteDiagnosis(id){
    if(!db) await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = e => reject(e.target.error);
    });
  }
  async function clearAllDiagnoses(){
    if(!db) await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = e => reject(e.target.error);
    });
  }
  // expose globally for other scripts
  window.DiagnosisDB = { saveDiagnosis, getAllDiagnoses, deleteDiagnosis, clearAllDiagnoses };
})();
