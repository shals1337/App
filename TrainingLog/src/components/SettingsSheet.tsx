import { useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { exportAllData, parseImport } from '../storage';
import { DownloadIcon, XIcon } from './Icons';

const REST_PRESETS = [30, 60, 90, 120, 150, 180];

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { settings, setSettings, importData, sessions } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function exportData() {
    const blob = new Blob([exportAllData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-log-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File) {
    try {
      const payload = parseImport(await file.text());
      const ok =
        sessions.length === 0 ||
        window.confirm(
          `Replace your current data (${sessions.length} workouts) with this backup (${payload.sessions.length} workouts)?`,
        );
      if (!ok) return;
      importData(payload);
      setMessage(`Imported ${payload.sessions.length} workouts.`);
    } catch {
      setMessage("Couldn't read that file — is it a Training Log backup?");
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <XIcon size={20} />
          </button>
        </div>

        <section className="settings-group">
          <h3 className="section-title">Rest timer</h3>
          <div className="chip-row">
            {REST_PRESETS.map((sec) => (
              <button
                key={sec}
                className={sec === settings.restSec ? 'chip active' : 'chip'}
                onClick={() => setSettings({ ...settings, restSec: sec })}
              >
                {sec >= 60 ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : `${sec}s`}
              </button>
            ))}
          </div>
          <label className="switch-row">
            <span>Sound when rest ends</span>
            <input
              type="checkbox"
              className="switch"
              checked={settings.restSound}
              onChange={(e) => setSettings({ ...settings, restSound: e.target.checked })}
            />
          </label>
        </section>

        <section className="settings-group">
          <h3 className="section-title">Data</h3>
          <div className="row">
            <button className="secondary-btn grow" onClick={exportData}>
              <DownloadIcon size={16} /> Export backup
            </button>
            <button className="secondary-btn grow" onClick={() => fileRef.current?.click()}>
              Import backup
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importFile(f);
              e.target.value = '';
            }}
          />
          {message && <p className="muted small">{message}</p>}
          <p className="muted small">
            Everything is stored on this device only. Export a backup before switching
            phones or clearing browser data.
          </p>
        </section>
      </div>
    </div>
  );
}
