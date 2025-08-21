import React, { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';

const TerminalOutput: React.FC<{ line: string }> = ({ line }) => {
    return <div dangerouslySetInnerHTML={{ __html: line.replace(/ /g, '&nbsp;') }} />;
};

export const TerminalPanel: React.FC = () => {
    const [history, setHistory] = useState<string[]>(['Pro-Verve Terminal v2.0. Type `help` for commands.']);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const endOfTerminalRef = useRef<HTMLDivElement>(null);

    const executeCommand = (command: string) => {
        const [cmd, ...args] = command.split(' ');
        let output: string | string[] = `<span class="text-red-500">command not found: ${cmd}</span>`;
        switch (cmd.toLowerCase()) {
            case 'help':
                output = [
                    'Available commands:',
                    '> <span class="text-cyan-400">help</span>              - Shows this help message.',
                    '> <span class="text-cyan-400">clear</span>             - Clears the terminal screen.',
                    '> <span class="text-cyan-400">date</span>              - Displays the current date and time.',
                    '> <span class="text-cyan-400">proverve</span>          - Displays system information.',
                    '> <span class="text-cyan-400">ls</span>                - Lists mock project files.',
                    '> <span class="text-cyan-400">flutter doctor</span>    - Checks Flutter installation status.',
                    '> <span class="text-cyan-400">npm install</span>       - Simulates installing a package.',
                ];
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'date':
                output = `Current time: ${new Date().toLocaleString()}`;
                break;
            case 'proverve':
                output = [
                    '<span class="text-cyan-400"> ____  ____   ___  ____  ____  __    ____</span>',
                    '<span class="text-cyan-400">(  _ \\(  _ \\ / __)(  _ \\(  _ \\(  )  (  _ \\</span>',
                    '<span class="text-cyan-400"> ) __/ )   / \\__ \\ ) __/ )   // (_/\\ ) _ <</span>',
                    '<span class="text-cyan-400">(__)  (__\\_) (___/(__)  (__\\_) \\____/(____/</span>',
                    ' ',
                    'Pro-Verve Visual Development Environment',
                    '<span class="text-gray-500">Version:</span> 2.0.1',
                    '<span class="text-gray-500">AI Core:</span> Gemini 2.5 Flash',
                    '<span class="text-gray-500">Status:</span> <span class="text-green-400">All systems operational</span>'
                ];
                break;
            case 'ls':
                output = [
                    '<span class="text-blue-400">src/</span>    <span class="text-blue-400">public/</span>   package.json',
                    'README.md  vite.config.ts'
                ];
                break;
            case 'flutter':
                if (args[0]?.toLowerCase() === 'doctor') {
                     output = [
                        '[<span class="text-green-400">✓</span>] Flutter (Channel stable, 3.13.0)',
                        '[<span class="text-green-400">✓</span>] Android toolchain - develop for Android devices',
                        '[<span class="text-yellow-400">!</span>] Xcode - develop for iOS and macOS (Xcode not installed)',
                        '[<span class="text-green-400">✓</span>] Connected device (1 available)',
                        '',
                        '• No issues found!'
                     ];
                }
                break;
            case 'npm':
                 if (args[0]?.toLowerCase() === 'install') {
                    const pkg = args[1] || 'react';
                     output = [
                        `+ ${pkg}@latest`,
                        'added 1 package from 1 contributor in 0.5s'
                     ];
                }
                break;
        }
        setHistory(prev => [...prev, `<span class="text-green-400">$</span> ${command}`, ...(Array.isArray(output) ? output : [output])]);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            const trimmedInput = input.trim();
            executeCommand(trimmedInput);
            if (trimmedInput) {
                setCommandHistory(prev => [trimmedInput, ...prev.filter(c => c !== trimmedInput)]);
            }
            setInput('');
            setHistoryIndex(-1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex >= 0) {
                const newIndex = Math.max(-1, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(newIndex === -1 ? '' : commandHistory[newIndex]);
            }
        }
    };

    useEffect(() => {
        endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="bg-black text-white font-mono text-sm h-full flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto" onClick={() => document.getElementById('terminal-input')?.focus()}>
                {history.map((line, i) => <TerminalOutput key={i} line={line} />)}
                <div className="flex items-center">
                    <span className="text-green-400">$</span>
                    <input
                        id="terminal-input"
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none outline-none text-white flex-1 ml-2"
                        autoFocus
                        autoComplete="off"
                    />
                </div>
                <div ref={endOfTerminalRef} />
            </div>
        </div>
    );
};