// Client-side IndexedDB helper for Offline Workout Logging & Automatic Background Sync

const DB_NAME = 'IronForgePwaDb';
const DB_VERSION = 1;
const WORKOUT_STORE = 'offline_workouts';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WORKOUT_STORE)) {
        db.createObjectStore(WORKOUT_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveWorkoutOffline(workoutData: any): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKOUT_STORE, 'readwrite');
    const store = tx.objectStore(WORKOUT_STORE);
    const request = store.add({
      ...workoutData,
      savedOfflineAt: new Date().toISOString(),
    });
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineWorkouts(): Promise<any[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKOUT_STORE, 'readonly');
    const store = tx.objectStore(WORKOUT_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function removeOfflineWorkout(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORKOUT_STORE, 'readwrite');
    const store = tx.objectStore(WORKOUT_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Attempts to sync all locally queued workouts to the server
 */
export async function syncOfflineWorkouts(): Promise<{ syncedCount: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) return { syncedCount: 0 };
  const queued = await getOfflineWorkouts();
  if (queued.length === 0) return { syncedCount: 0 };

  let synced = 0;
  for (const item of queued) {
    try {
      const res = await fetch('/api/member/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        await removeOfflineWorkout(item.id);
        synced++;
      }
    } catch (e) {
      console.warn('[PWA Sync] Failed to sync workout item:', e);
    }
  }

  return { syncedCount: synced };
}

// Audio Beep helper using HTML5 Web Audio API
export function playRestTimerBeep() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // High pitch alert tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);

    // Vibrate phone if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch (e) {
    console.warn('Audio feedback failed:', e);
  }
}
