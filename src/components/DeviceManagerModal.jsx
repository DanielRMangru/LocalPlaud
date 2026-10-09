import React, { useState, useEffect } from 'react';
import { 
  Usb, 
  Smartphone, 
  Radio, 
  Bluetooth, 
  HardDrive, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileAudio, 
  Download, 
  Sparkles, 
  Layers, 
  Info,
  X,
  ExternalLink,
  Battery,
  Shield,
  Zap,
  Check,
  Trash2,
  Edit3,
  Clock,
  Sliders
} from 'lucide-react';
import { Button } from './ui/Button';
import { plaudController } from '../utils/plaudBle';

export const DeviceManagerModal = ({ isOpen, onClose, onSelectRecording, onRecordingAdded }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extractingFile, setExtractingFile] = useState(null);
  const [selectedTab, setSelectedTab] = useState('usb'); // 'usb', 'ble', 'guide'

  // Device manipulation inline state
  const [editingFileId, setEditingFileId] = useState(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [syncingClock, setSyncingClock] = useState(false);

  // Direct Web Bluetooth Hardware State
  const [bleConnected, setBleConnected] = useState(false);
  const [bleDevice, setBleDevice] = useState(null);
  const [bleLogs, setBleLogs] = useState([]);
  const [bleProgress, setBleProgress] = useState(null);
  const [bleConnecting, setBleConnecting] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/devices/scan');
      const data = await res.json();
      if (data.success) {
        setDevices(data.devices || []);
      }
    } catch (err) {
      console.error('Error scanning devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDevices();

      plaudController.onLog = (msg) => {
        setBleLogs((prev) => [msg, ...prev].slice(0, 10));
      };

      plaudController.onStatusChange = (status, info) => {
        setBleConnected(status);
        if (info) setBleDevice(info);
      };

      plaudController.onProgress = (percent, current, total) => {
        setBleProgress((prev) => ({
          ...prev,
          percent,
          current: (current / 1024 / 1024).toFixed(1) + ' MB',
          total: (total / 1024 / 1024).toFixed(1) + ' MB'
        }));
      };
    }
  }, [isOpen]);

  // Extract from Plaud Hardware Vault / Pixel
  const handleExtractMTP = async (file, device) => {
    setExtractingFile(file.path);
    try {
      const res = await fetch('/api/devices/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: file.path,
          deviceSource: device.name,
          title: file.name.replace(/\.[^/.]+$/, ''),
          mode: /call|vcs/i.test(file.name) ? 'Call' : 'Note'
        })
      });
      const data = await res.json();
      if (data.success) {
        onRecordingAdded(data.recording);
        onSelectRecording(data.recording);
        onClose();
      } else {
        alert('Extraction failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Extraction error:', err);
      alert('Error communicating with device');
    } finally {
      setExtractingFile(null);
    }
  };

  // Delete recording directly from device storage
  const handleDeleteFromDevice = async (file) => {
    if (!confirm(`Are you sure you want to permanently delete "${file.name}" from your Plaud hardware storage? This will free up flash memory.`)) {
      return;
    }

    try {
      const res = await fetch('/api/devices/file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: file.path })
      });
      const data = await res.json();
      if (data.success) {
        fetchDevices();
      } else {
        alert('Delete failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Error communicating with device storage');
    }
  };

  // Rename recording directly on device storage
  const handleRenameOnDevice = async (file) => {
    if (!editNameValue.trim()) return;

    try {
      const res = await fetch('/api/devices/file', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: file.path, newName: editNameValue.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setEditingFileId(null);
        setEditNameValue('');
        fetchDevices();
      } else {
        alert('Rename failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Error renaming on device');
    }
  };

  // Direct Web Bluetooth Connect
  const handleConnectBLE = async () => {
    setBleConnecting(true);
    try {
      const info = await plaudController.connect();
      setBleDevice(info);
      setBleConnected(true);
    } catch (err) {
      console.error('BLE connection error:', err);
      if (err.name !== 'NotFoundError') {
        alert('Bluetooth error: ' + err.message);
      }
    } finally {
      setBleConnecting(false);
    }
  };

  // Sync Hardware RTC Time
  const handleSyncClock = async () => {
    setSyncingClock(true);
    try {
      await plaudController.syncHardwareTime();
      alert('Plaud device hardware RTC clock synchronized with host PC time!');
    } catch (e) {
      alert('Could not sync clock over Bluetooth');
    } finally {
      setSyncingClock(false);
    }
  };

  // Direct Audio Stream Extraction over BLE
  const handleDownloadBleFile = async (rec) => {
    setExtractingFile(rec.id);
    setBleProgress({ percent: 0, current: '0 MB', total: rec.size, filename: rec.name });

    try {
      const audioBlob = await plaudController.downloadRecording(rec);

      const formData = new FormData();
      formData.append('audio', audioBlob, rec.name);
      formData.append('title', rec.name.replace(/\.[^/.]+$/, '').replace(/PLD_/g, ''));
      formData.append('mode', rec.mode || 'Note');
      formData.append('deviceSource', 'PLAUD Direct BLE Hardware');

      const res = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        onRecordingAdded(data.recording);
        onSelectRecording(data.recording);
        onClose();
      } else {
        alert('Processing error: ' + data.error);
      }
    } catch (err) {
      console.error('BLE download error:', err);
      alert('Failed to stream audio file over Bluetooth');
    } finally {
      setExtractingFile(null);
      setBleProgress(null);
    }
  };

  // Delete over BLE directly
  const handleDeleteBleFile = async (rec) => {
    if (!confirm(`Delete "${rec.name}" directly from Plaud flash memory?`)) return;
    const updated = await plaudController.deleteRecordingFromDevice(rec.id);
    setBleDevice((prev) => ({ ...prev, recordings: updated }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-plaud-surface border border-plaud-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-plaud-border flex items-center justify-between bg-plaud-card/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-plaud-cyan to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Plaud Device Hardware Manager
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Direct Control & Manipulation
                </span>
              </h2>
              <p className="text-xs text-plaud-muted">
                Extract, rename, delete files, and sync hardware clock directly on your Plaud device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-plaud-border bg-plaud-card/20 px-6 gap-6 text-xs font-medium">
          <button
            onClick={() => setSelectedTab('usb')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              selectedTab === 'usb'
                ? 'border-plaud-accent text-plaud-accent font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-4 h-4" />
            Device Storage Vault ({devices[0]?.files?.length || 0} Recordings)
          </button>
          <button
            onClick={() => setSelectedTab('ble')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              selectedTab === 'ble'
                ? 'border-plaud-cyan text-plaud-cyan font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            Direct Bluetooth BLE {bleConnected && '• Connected'}
          </button>
          <button
            onClick={() => setSelectedTab('guide')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all ${
              selectedTab === 'guide'
                ? 'border-plaud-emerald text-plaud-emerald font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            Hardware Capabilities
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {selectedTab === 'usb' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Manage recordings directly inside Plaud Hardware Flash Storage:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={fetchDevices}
                  disabled={loading}
                >
                  {loading ? 'Scanning...' : 'Refresh Devices'}
                </Button>
              </div>

              {devices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-4 rounded-xl bg-plaud-card/80 border border-plaud-border hover:border-slate-600 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        {dev.id.includes('hardware') ? (
                          <HardDrive className="w-6 h-6 text-plaud-cyan" />
                        ) : (
                          <Smartphone className="w-6 h-6 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-100">
                            {dev.name}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {dev.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {dev.type} • {dev.storage || 'Active'} • Battery: {dev.battery}%
                        </p>
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Ready
                    </span>
                  </div>

                  {/* Audio files list on device with Manipulation Controls */}
                  {dev.files && dev.files.length > 0 ? (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
                        <span>Recordings on Device ({dev.files.length})</span>
                        <span className="text-[11px] text-plaud-cyan">Extract, Rename or Delete</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {dev.files.map((file, i) => (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs gap-2"
                          >
                            {/* File Info / Rename form */}
                            <div className="flex items-center gap-2.5 truncate w-full sm:w-auto flex-1">
                              <FileAudio className="w-4 h-4 text-indigo-400 shrink-0" />
                              {editingFileId === file.path ? (
                                <div className="flex items-center gap-1.5 flex-1">
                                  <input
                                    type="text"
                                    defaultValue={file.name}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    className="px-2 py-0.5 text-xs bg-slate-800 border border-indigo-500 rounded text-white focus:outline-none flex-1"
                                    autoFocus
                                  />
                                  <Button variant="cyan" size="sm" onClick={() => handleRenameOnDevice(file)}>Save</Button>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingFileId(null)}>Cancel</Button>
                                </div>
                              ) : (
                                <div className="truncate">
                                  <div className="text-slate-200 font-semibold truncate">{file.name}</div>
                                  <div className="text-[10px] text-slate-400">{file.size} • {file.folder || 'Vault'}</div>
                                </div>
                              )}
                            </div>

                            {/* Manipulation Actions */}
                            {editingFileId !== file.path && (
                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                <button
                                  onClick={() => {
                                    setEditingFileId(file.path);
                                    setEditNameValue(file.name);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                                  title="Rename on device storage"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteFromDevice(file)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                                  title="Permanently delete from device"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <Button
                                  variant="cyan"
                                  size="sm"
                                  icon={Download}
                                  disabled={extractingFile === file.path}
                                  onClick={() => handleExtractMTP(file, dev)}
                                >
                                  {extractingFile === file.path ? 'Diarizing...' : 'Extract'}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'ble' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-plaud-card via-slate-900 to-plaud-card border border-plaud-border space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border ${
                      bleConnected
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-plaud-cyan/15 border-plaud-cyan/30 text-plaud-cyan'
                    }`}>
                      <Radio className={`w-6 h-6 ${bleConnected ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">
                          {bleDevice ? bleDevice.name : 'PLAUD NOTE PRO (Nordic BLE)'}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          bleConnected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {bleConnected ? 'GATT Connected' : 'Ready for Direct Pairing'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {bleConnected
                          ? `Serial: ${bleDevice?.serial} • Battery: ${bleDevice?.battery}% • ${bleDevice?.storage}`
                          : 'Nordic UART & Plaud GATT service listener'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {bleConnected && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Clock}
                        disabled={syncingClock}
                        onClick={handleSyncClock}
                        title="Sync Hardware RTC Clock"
                      >
                        {syncingClock ? 'Syncing...' : 'Sync RTC Clock'}
                      </Button>
                    )}

                    {!bleConnected ? (
                      <Button
                        variant="cyan"
                        size="md"
                        icon={Bluetooth}
                        disabled={bleConnecting}
                        onClick={handleConnectBLE}
                      >
                        {bleConnecting ? 'Searching BLE...' : 'Pair Plaud Device'}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => plaudController.disconnect()}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar during direct download */}
                {bleProgress && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200 truncate flex items-center gap-2">
                        <Download className="w-3.5 h-3.5 text-plaud-cyan animate-bounce" />
                        Streaming {bleProgress.filename}...
                      </span>
                      <span className="text-plaud-cyan font-mono">{bleProgress.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-plaud-accent to-plaud-cyan transition-all duration-150"
                        style={{ width: `${bleProgress.percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Direct flash stream via Nordic UART</span>
                      <span>{bleProgress.current} / {bleProgress.total}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Onboard Flash Recordings Catalogue */}
              {bleConnected && bleDevice?.recordings && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span>Recordings on Plaud Device Flash ({bleDevice.recordings.length})</span>
                    <span className="text-plaud-cyan text-[11px]">Direct Wireless Stream & Manipulation</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {bleDevice.recordings.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-plaud-card/90 border border-plaud-border hover:border-slate-600 text-xs transition-all"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            rec.mode === 'Call' ? 'bg-rose-500/15 text-rose-400' : 'bg-indigo-500/15 text-indigo-400'
                          }`}>
                            <FileAudio className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="text-slate-100 font-semibold truncate">{rec.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{rec.size}</span>
                              <span>•</span>
                              <span>{rec.sensor}</span>
                              <span>•</span>
                              <span>{Math.floor(rec.duration / 60)}m {rec.duration % 60}s</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <button
                            onClick={() => handleDeleteBleFile(rec)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Erase from hardware flash memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <Button
                            variant="cyan"
                            size="sm"
                            icon={Download}
                            disabled={extractingFile === rec.id}
                            onClick={() => handleDownloadBleFile(rec)}
                          >
                            {extractingFile === rec.id ? 'Streaming...' : 'Stream & Diarize'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Terminal Protocol Logs */}
              {bleLogs.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Live Protocol Telemetry:
                  </div>
                  {bleLogs.map((log, i) => (
                    <div key={i} className="truncate">
                      <span className="text-slate-600">›</span> {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-plaud-card/80 border border-plaud-border space-y-2.5">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-plaud-cyan" />
                  Direct Hardware Manipulation Features:
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                  <li><strong className="text-rose-400">Delete Recordings:</strong> Click the trash icon to permanently remove recordings from the device storage vault and free up onboard flash memory.</li>
                  <li><strong className="text-amber-400">Rename Recordings:</strong> Click the pencil icon to rename files directly on the storage table.</li>
                  <li><strong className="text-indigo-400">Sync RTC Clock:</strong> Calibrate the Plaud hardware real-time clock chip to match your computer's exact atomic time.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-plaud-border bg-plaud-card/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-plaud-cyan" />
            <span>Direct hardware manipulation active</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
