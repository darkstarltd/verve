import React, { useState, useEffect, FC, KeyboardEvent, useRef } from 'react';
import { 
    Code, Smartphone, Terminal as TerminalIcon, Hammer, Wrench, Activity, Cpu, Database, Shield,
    Power, AlertTriangle, Download, RefreshCw, Filter, Trash2, Pause, ArrowDown, Play, Save, Eye, Package, Lock, FileText, Folder, File, Wifi, BarChart, Server, Rocket
} from 'lucide-react';
import { ApkInfo, BuildTool, DeviceInfo, FileNode, LogEntry, BuildTarget, BuildStatus } from '../types';
import MonacoEditor from 'react-monaco-editor';
import { StateInspector } from './StateInspector';
import { MockApiEditor } from './MockApiEditor';
import { useAppContext } from '../context/AppContext';

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
                { name: 'com', type: 'folder', children: [{ name: 'proverve', type: 'folder', children: [{ name: 'MainActivity.java', type: 'file', content: 'public class MainActivity extends Activity {\n  // ...\n}' }]}] }
            ]},
            { name: 'res', type: 'folder', children: [
                { name: 'layout', type: 'folder', children: [{ name: 'activity_main.xml', type: 'file', content: '<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent"\n    android:orientation="vertical" />' }] },
                { name: 'drawable', type: 'folder', children: [{ name: 'ic_launcher.png', type: 'file' }] }
            ]},
            { name: 'AndroidManifest.xml', type: 'file', content: '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application\n        android:label="@string/app_name">\n    </application>\n</manifest>' }
        ]}
    ]},
    { name: 'build.gradle', type: 'file', content: 'apply plugin: "com.android.application"' },
    { name: 'preview.html', type: 'file', content: '<h1>Live Preview</h1><p>This is a sample HTML preview.</p><button>Click me!</button>' }
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

const generateLog = (): LogEntry => {
    const levels: LogEntry['level'][] = ['info', 'debug', 'warn', 'error'];
    const sources = ['MainActivity', 'NetworkService', 'GLSUser', 'HttpTransport', 'RenderThread'];
    const messages = ['Request successful', 'User logged in', 'Permission denied', 'Failed to allocate memory', 'UI Updated'];
    return {
        level: levels[Math.floor(Math.random() * levels.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        message: messages[Math.floor(Math.random() * messages.length)],
    }
}


// --- Sub-component: File Explorer ---
const FileExplorer: FC<{ files: readonly FileNode[], onSelect: (file: FileNode) => void, selectedFile: FileNode | null }> = ({ files, onSelect, selectedFile }) => {
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
    
    const currentValue = data[data.length - 1];
    const gradientId = `gradient-${title.replace(' ', '')}`;
    const generatePath = (d: number[]) => `M 0 ${100 - (d[0]/max*100)} ` + d.map((p, i) => `L ${i * (300 / 29)} ${100 - (p/max*100)}`).join(' ');
    const pathForFill = generatePath(data) + ` L 300 100 L 0 100 Z`;

    return (
        <div className="bg-[var(--color-surface)] p-4 rounded-lg flex-1">
            <div className="flex justify-between items-center text-[var(--color-text-secondary)] mb-2">
                <div className="flex items-center gap-2 text-sm">{icon} {title}</div>
                <div className="font-mono text-lg text-white">{currentValue.toFixed(title === 'CPU' ? 1: 0)} <span className="text-xs">{unit}</span></div>
            </div>
            <svg viewBox="0 0 300 100" className="w-full h-24">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.05}/>
                    </linearGradient>
                </defs>
                <path d={pathForFill} fill={`url(#${gradientId})`} />
                <path d={generatePath(data)} fill="none" stroke={color} strokeWidth="2" />
            </svg>
        </div>
    );
};

// --- Sub-component: Development View ---
const DevelopmentView = () => {
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(MOCK_FILE_TREE.find(f => f.name === 'preview.html') as FileNode);
    const [code, setCode] = useState(selectedFile?.content || '');
    useEffect(() => setCode(selectedFile?.content || ''), [selectedFile]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
            <div className="md:col-span-1 h-full"><FileExplorer files={MOCK_FILE_TREE} onSelect={setSelectedFile} selectedFile={selectedFile} /></div>
            <div className="md:col-span-2 h-full bg-[var(--color-surface)] rounded-lg overflow-hidden">
                <MonacoEditor
                    height="100%"
                    language={selectedFile?.name.endsWith('.java') ? 'java' : selectedFile?.name.endsWith('.xml') ? 'xml' : 'html'}
                    theme="vs-dark"
                    value={code}
                    onChange={setCode}
                    options={{ minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false }}
                />
            </div>
            <div className="md:col-span-1 h-full bg-white rounded-lg overflow-hidden">
                {selectedFile?.name.endsWith('.html') ? (
                    <iframe srcDoc={code} title="Preview" className="w-full h-full border-0" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 bg-gray-100">
                        <p>No preview available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-component: APK Analyzer ---
const APKAnalyzer = () => {
    type ApkTab = 'overview' | 'permissions' | 'scan' | 'manifest';
    const [activeTab, setActiveTab] = useState<ApkTab>('overview');
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        setIsScanning(true);
        const timer = setTimeout(() => setIsScanning(false), 3000);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const tabs: {id: ApkTab, label: string, icon: React.ReactNode}[] = [
        {id: 'overview', label: 'Overview', icon: <Eye size={16}/>},
        {id: 'permissions', label: 'Permissions', icon: <Lock size={16}/>},
        {id: 'scan', label: 'Security Scan', icon: <Shield size={16}/>},
        {id: 'manifest', label: 'Manifest', icon: <FileText size={16}/>}
    ];

    const renderContent = () => {
        if (isScanning && activeTab==='scan') return <div className="flex items-center justify-center h-48"><RefreshCw className="animate-spin mr-2"/> Scanning...</div>;

        switch(activeTab) {
            case 'overview': return (
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>App Name:</strong> {MOCK_APK_INFO.name}</div>
                    <div><strong>Package Name:</strong> {MOCK_APK_INFO.packageName}</div>
                    <div><strong>Version:</strong> {MOCK_APK_INFO.version}</div>
                    <div><strong>Size:</strong> {MOCK_APK_INFO.size}</div>
                    <div><strong>Min SDK:</strong> {MOCK_APK_INFO.minSdk}</div>
                    <div><strong>Target SDK:</strong> {MOCK_APK_INFO.targetSdk}</div>
                </div>
            );
            case 'permissions': return (
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {MOCK_APK_INFO.permissions.map(p => <div key={p} className="bg-[var(--color-surface)] p-2 rounded-md">android.permission.{p}</div>)}
                </div>
            );
            case 'scan': return (
                 <div className="text-center">
                    <Shield size={48} className="mx-auto text-green-400 mb-4"/>
                    <h3 className="text-lg font-bold">No Security Issues Found</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">Scanned 143 files. 0 vulnerabilities detected.</p>
                </div>
            );
            case 'manifest': return (
                <pre className="text-xs bg-[var(--color-surface)] p-2 rounded-md max-h-48 overflow-auto"><code>{MOCK_FILE_TREE.find(f=>f.name==='src')?.children?.[0].children?.[2].content}</code></pre>
            );
        }
    };

    return (
        <div className="bg-[var(--color-surface)] p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Package size={24} className="text-[var(--color-primary)]"/>
                    <div>
                        <h3 className="font-bold">APK Analysis</h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">{MOCK_APK_INFO.name}</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-sm px-3 py-1.5 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-md"><Download size={14}/> Upload APK</button>
            </div>
            <div className="flex border-b border-[var(--color-border)] mb-4">
                {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 text-sm ${activeTab === t.id ? 'text-white border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}>{t.icon}{t.label}</button>)}
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};

// --- Sub-component: Device Manager ---
const DeviceManager = () => (
    <div className="bg-[var(--color-surface)] p-4 rounded-lg">
        <h3 className="font-bold mb-4">Devices</h3>
        <div className="space-y-2">
            {MOCK_DEVICES.map(d => (
                <div key={d.id} className="flex items-center justify-between p-2 bg-[var(--color-surface-light)] rounded-md">
                    <div className="flex items-center gap-3">
                        <Smartphone className={`w-6 h-6 ${d.status === 'connected' ? 'text-green-400' : 'text-gray-500'}`} />
                        <div>
                            <p className="font-semibold">{d.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{d.platform} {d.apiLevel}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{d.status}</span>
                         <button disabled={d.status !== 'connected'} className="p-1 hover:bg-[var(--color-border)] rounded-md disabled:opacity-50"><RefreshCw size={14}/></button>
                         <button disabled={d.status !== 'connected'} className="p-1 hover:bg-[var(--color-border)] rounded-md disabled:opacity-50"><Power size={14}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- Sub-component: Logcat Viewer ---
const LogcatViewer = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(isPaused) return;
        const interval = setInterval(() => {
            setLogs(prev => [...prev, generateLog()].slice(-200)); // Keep last 200 logs
        }, 1500);
        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        if(!isPaused) endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs, isPaused]);

    const levelColors: {[key in LogEntry['level']]: string} = { info: 'text-blue-400', debug: 'text-gray-400', warn: 'text-yellow-400', error: 'text-red-500' };

    return (
        <div className="bg-[var(--color-surface)] rounded-lg flex flex-col h-full">
            <div className="flex-shrink-0 p-2 border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="font-bold text-sm">Logcat</h3>
                <div className="flex items-center gap-2">
                    <input type="text" placeholder="Filter logs..." className="bg-[var(--color-background)] text-xs px-2 py-1 rounded-md border border-[var(--color-border)]" />
                    <button onClick={() => setIsPaused(!isPaused)} className="p-1 hover:bg-[var(--color-border)] rounded-md">{isPaused ? <Play size={14}/> : <Pause size={14}/>}</button>
                    <button onClick={() => setLogs([])} className="p-1 hover:bg-[var(--color-border)] rounded-md"><Trash2 size={14}/></button>
                </div>
            </div>
            <div className="flex-1 p-2 overflow-y-auto font-mono text-xs">
                {logs.map((log, i) => (
                    <div key={i} className="flex">
                        <span className="text-gray-500 mr-2">{log.timestamp}</span>
                        <span className={`${levelColors[log.level]} w-12 flex-shrink-0`}>{log.level.toUpperCase()}</span>
                        <span className="text-purple-400 w-28 flex-shrink-0">{log.source}</span>
                        <span className="text-white flex-1 whitespace-pre-wrap">{log.message}</span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};

// --- Sub-component: Build Tools Manager ---
const BuildToolsManager = () => {
    const statusInfo: {[key in BuildTool['status']]: {color: string, icon: React.ReactNode}} = {
        installed: { color: 'text-green-400', icon: <Wrench size={16}/> },
        outdated: { color: 'text-yellow-400', icon: <AlertTriangle size={16}/> },
        missing: { color: 'text-red-500', icon: <Download size={16}/> },
    };

    return (
        <div className="bg-[var(--color-surface)] p-4 rounded-lg">
            <h3 className="font-bold mb-4">Build Toolchain</h3>
            <div className="space-y-2">
                {MOCK_BUILD_TOOLS.map(tool => (
                    <div key={tool.name} className="flex items-center justify-between p-2 bg-[var(--color-surface-light)] rounded-md text-sm">
                         <div className="flex items-center gap-3">
                            <span className={statusInfo[tool.status].color}>{statusInfo[tool.status].icon}</span>
                            <div>
                                <p>{tool.name}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{tool.version}</p>
                            </div>
                        </div>
                        <span className={`font-semibold ${statusInfo[tool.status].color}`}>{tool.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Sub-component: Build & Deploy ---
const BuildDeploy = () => {
    const { state: { buildState }, dispatch } = useAppContext();
    const logEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [buildState.log]);

    const handleBuild = () => {
        dispatch({ type: 'SET_BUILD_STATE', payload: { status: 'building', log: ['Build process started...'], startTime: Date.now(), endTime: undefined, outputUrl: undefined } });

        const mockLog: string[] = [
            'vite v5.2.0 building for production...',
            '✓ 24 modules transformed (24 ops, 0.21s)',
            'rendering chunks...',
            'computing gzip size...',
            'dist/index.html   0.48 kB │ gzip: 0.31 kB',
            'dist/assets/index-3f8c8b1a.css   2.11 kB │ gzip: 0.84 kB',
            'dist/assets/index-8a6b4c2d.js   52.49 kB │ gzip: 19.33 kB'
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            if (i < mockLog.length) {
                dispatch({ type: 'SET_BUILD_STATE', payload: { log: [...buildState.log, mockLog[i]] } });
                i++;
            } else {
                clearInterval(interval);
                dispatch({ type: 'SET_BUILD_STATE', payload: { status: 'success', endTime: Date.now(), outputUrl: `https://pro-verve-preview-1a2b3c.vercel.app` }});
            }
        }, 500);
    };

    const statusColors: Record<BuildStatus, string> = {
        idle: 'text-gray-400',
        building: 'text-blue-400 animate-pulse',
        success: 'text-green-400',
        failed: 'text-red-400',
    };

    return (
        <div className="grid grid-cols-3 gap-4 h-full">
            <div className="col-span-1 bg-[var(--color-surface)] p-4 rounded-lg flex flex-col">
                <h3 className="font-bold mb-4">Configuration</h3>
                <div className="space-y-4">
                     <div>
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Build Target</label>
                        <select className="w-full bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)]">
                            <option value="web">Web (Vercel)</option>
                            <option value="android">Android (APK)</option>
                            <option value="ios">iOS (IPA)</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">Environment</label>
                        <select className="w-full bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)]">
                            <option value="production">Production</option>
                            <option value="preview">Preview</option>
                            <option value="development">Development</option>
                        </select>
                     </div>
                </div>
                <div className="mt-auto">
                    <button onClick={handleBuild} disabled={buildState.status === 'building'} className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                        {buildState.status === 'building' ? <RefreshCw className="animate-spin" /> : <Rocket />}
                        Build & Deploy
                    </button>
                </div>
            </div>
            <div className="col-span-2 bg-[var(--color-surface)] p-4 rounded-lg flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Build Log</h3>
                    <p className={`font-mono text-sm uppercase ${statusColors[buildState.status]}`}>{buildState.status}</p>
                </div>
                <div className="flex-1 bg-black rounded-md p-2 font-mono text-xs overflow-y-auto">
                    {buildState.log.map((line, i) => <p key={i}>{line}</p>)}
                    <div ref={logEndRef} />
                </div>
                {buildState.status === 'success' && (
                    <div className="mt-2 text-center bg-green-500/10 p-2 rounded-md">
                        <p className="text-green-400">Deployment successful!</p>
                        <a href={buildState.outputUrl} target="_blank" rel="noreferrer" className="text-sm text-cyan-400 hover:underline">{buildState.outputUrl}</a>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main DevTools Component ---
type TabId = 'dev' | 'apk' | 'devices' | 'perf' | 'build' | 'state' | 'api';
export const DevTools: FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('build');

    const tabs: { id: TabId, name: string, icon: React.ReactNode }[] = [
        { id: 'build', name: 'Build', icon: <Rocket size={20} /> },
        { id: 'dev', name: 'Development', icon: <Code size={20} /> },
        { id: 'apk', name: 'APK Analysis', icon: <Package size={20} /> },
        { id: 'devices', name: 'Devices & Logs', icon: <Smartphone size={20} /> },
        { id: 'perf', name: 'Performance', icon: <Activity size={20} /> },
        { id: 'build', name: 'Build Tools', icon: <Hammer size={20} /> },
        { id: 'state', name: 'State', icon: <BarChart size={20} /> },
        { id: 'api', name: 'Mock API', icon: <Server size={20} /> },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'build': return <BuildDeploy />;
            case 'dev': return <DevelopmentView />;
            case 'apk': return <APKAnalyzer />;
            case 'devices': return (
                <div className="flex flex-col gap-4 h-full">
                    <div className="flex-1"><DeviceManager/></div>
                    <div className="flex-[2] min-h-0"><LogcatViewer/></div>
                </div>
            );
            case 'perf': return (
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <PerformanceChart title="CPU" icon={<Cpu size={16}/>} color="#8A42F4" unit="%" max={100} />
                        <PerformanceChart title="Memory" icon={<Database size={16}/>} color="#00E0FF" unit="MB" max={4096} />
                    </div>
                    <div className="flex gap-4">
                         <PerformanceChart title="Network" icon={<Wifi size={16}/>} color="#F44336" unit="kb/s" max={2000} />
                         <PerformanceChart title="Disk I/O" icon={<Save size={16}/>} color="#4CAF50" unit="mb/s" max={50} />
                    </div>
                </div>
            );
            case 'build': return <BuildToolsManager />;
            case 'state': return <StateInspector />;
            case 'api': return <MockApiEditor />;
        }
    }

    return (
        <div className="flex-1 flex bg-[var(--color-background)] overflow-hidden">
            <nav className="w-20 bg-[var(--color-surface)] flex flex-col items-center py-4 gap-2">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.name}
                        className={`w-full p-3 flex flex-col items-center justify-center gap-1 text-xs transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-light)]'}`}
                    >
                        {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] rounded-r-full"/>}
                        {tab.icon}
                        <span className="truncate">{tab.name}</span>
                    </button>
                ))}
            </nav>
            <main className="flex-1 p-4 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};