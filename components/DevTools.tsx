import React, { useState, useEffect, FC, KeyboardEvent, useRef } from 'react';
import { 
    Code, Smartphone, Terminal as TerminalIcon, Hammer, Wrench, Activity, Cpu, Database, Shield,
    Power, AlertTriangle, Download, RefreshCw, Filter, Trash2, Pause, ArrowDown, Play, Save, Eye, Package, Lock, FileText, Folder, File, Wifi
} from 'lucide-react';
import { ApkInfo, BuildTool, DeviceInfo, FileNode, LogEntry } from '../types';
import MonacoEditor from 'react-monaco-editor';

// --- MOCK DATA ---
const MOCK_APK_INFO: ApkInfo = {
  name: "Pro-Verve Companion",
  packageName: "com.proverve.app",
  version: "1.2.3",
  size: "24.5 MB",
  minSdk: "21",
  targetSdk: "33",
  permissions: ["INTERNET", "ACCESS_FINE_LOCATION", "CAMERA", "READ_EXTERNAL_STORAGE"],
  activities: ["MainActivity", "SettingsActivity", "LoginActivity"],
  services: ["BackgroundSyncService"],
  receivers: ["BootCompletedReceiver"],
  features: ["android.hardware.camera", "android.hardware.location.gps"],
};

const MOCK_FILE_TREE: FileNode[] = [
    { name: 'src', type: 'folder', children: [
        { name: 'main', type: 'folder', children: [
            { name: 'java', type: 'folder', children: [
                { name: 'com', type: 'folder', children: [{ name: 'proverve', type: 'folder', children: [{ name: 'MainActivity.java', type: 'file', content: 'public class MainActivity { ... }' }]}] }
            ]},
            { name: 'res', type: 'folder', children: [
                { name: 'layout', type: 'folder', children: [{ name: 'activity_main.xml', type: 'file', content: '<LinearLayout ... />' }] },
                { name: 'drawable', type: 'folder', children: [{ name: 'ic_launcher.png', type: 'file' }] }
            ]},
            { name: 'AndroidManifest.xml', type: 'file', content: '<manifest ...><application ... /></manifest>' }
        ]}
    ]},
    { name: 'build.gradle', type: 'file', content: 'apply plugin: "com.android.application"' },
    { name: 'preview.html', type: 'file', content: '<h1>Live Preview</h1><p>This is a sample HTML preview.</p>' }
];

const MOCK_DEVICES: DeviceInfo[] = [
  { id: 'emulator-5554', name: 'Pixel 7 Pro (Emulator)', platform: 'Android', status: 'connected', apiLevel: '33' },
  { id: 'asdf12345ghjk', name: 'Samsung Galaxy S22', platform: 'Android', status: 'disconnected', apiLevel: '31' },
  { id: 'iPhone14Pro_1', name: 'iPhone 14 Pro', platform: 'iOS', status: 'connected', apiLevel: '16.1' }
];

const MOCK_BUILD_TOOLS: BuildTool[] = [
  { name: 'Android SDK Platform 34', version: '2', status: 'installed' },
  { name: 'Android SDK Build-Tools', version: '34.0.0', status: 'installed' },
  { name: 'Flutter SDK', version: '3.13.0', status: 'outdated' },
  { name: 'Xcode', version: '14.1', status: 'installed' },
  { name: 'Gradle', version: '8.2', status: 'missing' },
  { name: 'React Native CLI', version: '11.3.6', status: 'installed' },
];

const MOCK_LOGS: LogEntry[] = [
    { level: 'info', source: 'MainActivity', timestamp: '10:30:01.123', message: 'onCreate called' },
    { level: 'debug', source: 'NetworkService', timestamp: '10:30:02.456', message: 'Fetching user data from API...' },
    { level: 'warn', source: 'GLSUser', timestamp: '10:30:03.789', message: 'Location permission not granted. Defaulting to coarse location.' },
    { level: 'error', source: 'HttpTransport', timestamp: '10:30:05.012', message: 'Request failed: java.net.UnknownHostException' },
];


// --- Sub-component: File Explorer ---
const FileExplorer: FC<{ files: FileNode[], onSelect: (file: FileNode) => void, selectedFile: FileNode | null }> = ({ files, onSelect, selectedFile }) => {
    const renderNode = (node: FileNode, level = 0) => (
        <div key={node.name} style={{ paddingLeft: `${level * 16}px` }} className="text-sm">
            <div
                onClick={() => node.type === 'file' && onSelect(node)}
                className={`flex items-center gap-2 p-1 rounded-md cursor-pointer ${selectedFile?.name === node.name ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-light)]'}`}
            >
                {node.type === 'folder' ? <Folder className="w-4 h-4 text-yellow-400"/> : <File className="w-4 h-4 text-gray-400"/>}
                <span>{node.name}</span>
            </div>
            {node.children && <div className="pl-2 border-l border-gray-700">{node.children.map(child => renderNode(child, level + 1))}</div>}
        </div>
    );
    return <div className="bg-[var(--color-surface)] rounded-lg p-2 h-full overflow-y-auto">{files.map(node => renderNode(node))}</div>;
};

// --- Sub-component: Performance Chart ---
const PerformanceChart: FC<{ title: string; icon: React.ReactNode; color: string; unit: string; max: number }> = ({ title, icon, color, unit, max }) => {
    const [data, setData] = useState<number[]>(Array(30).fill(0));
    useEffect(() => { const i = setInterval(() => setData(p => [...p.slice(1), Math.random() * (max * 0.8) + (max * 0.1)]), 1000); return () => clearInterval(i); }, [max]);
    const generatePath = (d: number[]) => `M 0 ${100 - (d[0]/max*100)} ` + d.map((p, i) => `L ${i * (300 / 29)} ${100 - (p/max*100)}`).join(' ');
    
    return (
        <div className="flex-1 bg-[var(--color-surface-light)] p-3 rounded-lg flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2">{icon}{title}</h4>
                <span className="font-mono text-lg" style={{color}}>{data[data.length - 1].toFixed(1)}{unit}</span>
            </div>
            <div className="flex-1">
                <svg viewBox="0 0 300 100" className="w-full h-full"><path d={generatePath(data)} fill="none" stroke={color} strokeWidth="2" /></svg>
            </div>
        </div>
    );
};

// --- Main Views for Tabs ---
const DevelopmentView = () => {
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(MOCK_FILE_TREE[2]);
    return (
        <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-3 h-full"><FileExplorer files={MOCK_FILE_TREE} onSelect={setSelectedFile} selectedFile={selectedFile} /></div>
            <div className="col-span-6 h-full bg-[var(--color-surface)] rounded-lg p-2">
                <MonacoEditor language={selectedFile?.name.split('.').pop() || 'text'} theme="vs-dark" value={selectedFile?.content || '// Select a file to view its content'} options={{ minimap: { enabled: false } }} />
            </div>
            <div className="col-span-3 h-full bg-[var(--color-surface)] rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Live Preview</h3>
                <div className="bg-white rounded-md h-[calc(100%-40px)] w-full">
                    {selectedFile?.name.endsWith('.html') ? <iframe srcDoc={selectedFile.content} className="w-full h-full border-none"/> : <div className="w-full h-full flex items-center justify-center text-gray-500">Preview not available</div>}
                </div>
            </div>
        </div>
    )
};

const ApkAnalysisView = () => {
    const [apkInfo, setApkInfo] = useState<ApkInfo | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    return (
        <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-4 h-full bg-[var(--color-surface)] rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">APK Analyzer</h3>
                {!apkInfo ? (
                    <button onClick={() => setApkInfo(MOCK_APK_INFO)} className="w-full p-4 border-2 border-dashed border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center hover:border-[var(--color-primary)]">
                        <Package size={48} className="text-[var(--color-primary)] mb-2"/>
                        <span className="font-semibold">Select APK File</span>
                        <span className="text-xs text-[var(--color-text-secondary)]">Click to analyze</span>
                    </button>
                ) : (
                    <div className="space-y-2 text-sm">
                        <p><strong>App Name:</strong> {apkInfo.name}</p>
                        <p><strong>Package:</strong> {apkInfo.packageName}</p>
                        <p><strong>Version:</strong> {apkInfo.version}</p>
                        <p><strong>Size:</strong> {apkInfo.size}</p>
                        <p><strong>Target SDK:</strong> {apkInfo.targetSdk}</p>
                        <button onClick={() => setApkInfo(null)} className="w-full mt-4 p-2 bg-[var(--color-danger)] rounded-md">Clear</button>
                    </div>
                )}
            </div>
            {apkInfo && (
            <div className="col-span-8 h-full bg-[var(--color-surface)] rounded-lg p-4">
                <div className="flex border-b border-[var(--color-border)] mb-4">
                    <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm ${activeTab==='overview' ? 'border-b-2 border-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'}`}>Overview</button>
                    <button onClick={() => setActiveTab('permissions')} className={`px-4 py-2 text-sm ${activeTab==='permissions' ? 'border-b-2 border-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'}`}>Permissions</button>
                    <button onClick={() => setActiveTab('security')} className={`px-4 py-2 text-sm ${activeTab==='security' ? 'border-b-2 border-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'}`}>Security Scan</button>
                    <button onClick={() => setActiveTab('manifest')} className={`px-4 py-2 text-sm ${activeTab==='manifest' ? 'border-b-2 border-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'}`}>Manifest</button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-50px)] text-sm">
                    {activeTab === 'permissions' && <ul className="list-disc pl-5 space-y-1">{apkInfo.permissions.map(p => <li key={p}>{p}</li>)}</ul>}
                    {activeTab === 'security' && <div className="flex items-center gap-2 text-green-400"><Shield/> No critical vulnerabilities found.</div>}
                    {activeTab === 'manifest' && <pre className="font-mono text-xs bg-black p-2 rounded-md whitespace-pre-wrap">{`<manifest package="${apkInfo.packageName}">\n  ...\n</manifest>`}</pre>}
                </div>
            </div>
            )}
        </div>
    )
};

const DevicesAndLogsView = () => {
    const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
    const logLevels = { 'info': 'text-gray-400', 'debug': 'text-blue-400', 'warn': 'text-yellow-400', 'error': 'text-red-400' };
    const endOfLogsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {endOfLogsRef.current?.scrollIntoView({ behavior: "smooth" })}, [logs]);

    return (
        <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-4 h-full bg-[var(--color-surface)] rounded-lg p-4 flex flex-col">
                <h3 className="font-semibold mb-4 text-lg">Device Manager</h3>
                <div className="space-y-3 flex-1 overflow-y-auto">
                    {MOCK_DEVICES.map(device => (
                        <div key={device.id} className="bg-[var(--color-surface-light)] rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3"><Smartphone className={`w-6 h-6 ${device.status === 'connected' ? 'text-green-400' : 'text-gray-500'}`} /><div><p className="font-medium text-sm">{device.name}</p><p className="text-xs text-[var(--color-text-secondary)]">{device.platform} {device.apiLevel}</p></div></div>
                                <span className={`text-xs px-2 py-1 rounded-full ${device.status === 'connected' ? 'bg-green-600/50 text-green-300' : 'bg-gray-600/50 text-gray-400'}`}>{device.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-span-8 h-full bg-[var(--color-surface)] rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">Logcat</h3>
                    <div className="flex items-center gap-2">
                        <input type="text" placeholder="Filter logs..." className="bg-[var(--color-background)] px-2 py-1 text-xs rounded-md border border-[var(--color-border)]"/>
                        <button className="p-2 hover:bg-[var(--color-surface-light)] rounded-md"><Pause size={14}/></button>
                        <button onClick={() => setLogs([])} className="p-2 hover:bg-[var(--color-surface-light)] rounded-md"><Trash2 size={14}/></button>
                    </div>
                </div>
                <div className="font-mono text-xs flex-1 overflow-y-auto bg-black p-2 rounded-md">
                    {logs.map((log, i) => (<div key={i} className="flex gap-2"><span className="text-gray-500">{log.timestamp}</span><span className={`${logLevels[log.level]} w-12`}>{log.level.toUpperCase()}</span><span className="text-cyan-400 w-28 truncate">{log.source}</span><span className="text-gray-300 flex-1">{log.message}</span></div>))}
                    <div ref={endOfLogsRef}/>
                </div>
            </div>
        </div>
    )
};

const PerformanceView = () => (
    <div className="flex gap-4 h-full">
        <div className="flex-1 bg-[var(--color-surface)] rounded-lg p-4 flex flex-col"><h3 className="font-semibold text-lg mb-4">CPU Profiler</h3><PerformanceChart title="CPU Usage" icon={<Cpu className="w-4 h-4"/>} color="#22c55e" unit="%" max={100}/></div>
        <div className="flex-1 bg-[var(--color-surface)] rounded-lg p-4 flex flex-col"><h3 className="font-semibold text-lg mb-4">Memory Profiler</h3><PerformanceChart title="Memory" icon={<Database className="w-4 h-4"/>} color="#3b82f6" unit="MB" max={2048}/></div>
        <div className="flex-1 bg-[var(--color-surface)] rounded-lg p-4 flex flex-col"><h3 className="font-semibold text-lg mb-4">Network Profiler</h3><PerformanceChart title="Network" icon={<Wifi className="w-4 h-4"/>} color="#eab308" unit="kb/s" max={1000}/></div>
    </div>
);

const BuildToolsView = () => {
    const statusStyles = { installed: 'bg-green-600/50 text-green-300', outdated: 'bg-yellow-600/50 text-yellow-300', missing: 'bg-red-600/50 text-red-300' };
    return (
        <div className="bg-[var(--color-surface)] rounded-lg p-4 h-full flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Build Tools & SDKs</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
                {MOCK_BUILD_TOOLS.map(tool => (
                    <div key={tool.name} className="bg-[var(--color-surface-light)] rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3"><Wrench className="w-5 h-5 text-[var(--color-primary)]" /><div><p className="font-medium text-sm">{tool.name}</p><p className="text-xs text-[var(--color-text-secondary)]">v{tool.version}</p></div></div>
                        <div className="flex items-center gap-2"><span className={`text-xs px-2 py-1 rounded-full ${statusStyles[tool.status]}`}>{tool.status}</span>{tool.status !== 'installed' && <button className="p-2 rounded bg-blue-500 hover:bg-blue-400"><Download className="w-3 h-3"/></button>}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DevTools: FC = () => {
    type Tab = 'development' | 'apk' | 'devices' | 'performance' | 'build';
    const [activeTab, setActiveTab] = useState<Tab>('development');
    
    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'development', label: 'Development', icon: <Code size={16}/> },
        { id: 'apk', label: 'APK Analysis', icon: <Package size={16}/> },
        { id: 'devices', label: 'Devices & Logs', icon: <Smartphone size={16}/> },
        { id: 'performance', label: 'Performance', icon: <Activity size={16}/> },
        { id: 'build', label: 'Build Tools', icon: <Wrench size={16}/> },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'development': return <DevelopmentView />;
            case 'apk': return <ApkAnalysisView />;
            case 'devices': return <DevicesAndLogsView />;
            case 'performance': return <PerformanceView />;
            case 'build': return <BuildToolsView />;
            default: return null;
        }
    }

    return (
        <div className="flex-1 flex flex-col bg-[var(--color-background)] p-4 gap-4 text-white">
            <div className="flex-shrink-0 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3"><Hammer className="text-[var(--color-primary)]"/>Dev Tools Dashboard</h2>
                <div className="bg-[var(--color-surface)] p-1 rounded-lg flex items-center gap-1">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${activeTab === tab.id ? 'bg-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-light)]'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 h-[calc(100vh-150px)]">
                {renderContent()}
            </div>
        </div>
    );
};
