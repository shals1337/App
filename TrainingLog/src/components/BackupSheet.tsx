import { useRef, useState } from 'react';
import { useApp } from '../state/AppContext';
import { exportAllData, parseImport } from '../storage';
import { DownloadIcon, XIcon } from './Icons';

export function BackupSheet({ onClose }: { onClose: () => void }) {
  const { importData, logs } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function exportData() {
    const blob = new Blob([exportAllData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `min-traening-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File) {
    try {
      const payload = parseImport(await file.text());
      const ok =
        logs.length === 0 ||
        window.confirm(
          `Erstat dine nuværende data (${logs.length} logs) med denne backup (${payload.logs.length} logs)?`,
        );
      if (!ok) return;
      importData(payload);
      setMessage(`Importerede ${payload.logs.length} logs.`);
    } catch {
      setMessage('Kunne ikke læse filen — er det en backup fra denne app?');
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Backup</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Luk">
            <XIcon size={20} />
          </button>
        </div>

        <div className="row">
          <button className="secondary-btn grow" onClick={exportData}>
            <DownloadIcon size={16} /> Eksportér
          </button>
          <button className="secondary-btn grow" onClick={() => fileRef.current?.click()}>
            Importér
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
          Alt gemmes kun på denne enhed. Eksportér en backup, før du skifter telefon
          eller rydder browserdata.
        </p>
      </div>
    </div>
  );
}
