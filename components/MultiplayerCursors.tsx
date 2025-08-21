import React from 'react';
import { MultiplayerCursor } from '../types';

export const MultiplayerCursors: React.FC<{ cursors: MultiplayerCursor[] }> = ({ cursors }) => {
    return (
        <>
            {cursors.map(cursor => (
                <div
                    key={cursor.id}
                    className="multiplayer-cursor"
                    style={{
                        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                        color: cursor.color,
                    }}
                >
                    <svg
                        className="cursor-svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}
                    >
                        <path d="M5.65,2.05C5.43,1.83 5.17,1.74 4.9,1.74C4.38,1.74 3.95,2.17 3.95,2.69C3.95,2.96 4.04,3.22 4.25,3.43L11.83,11L5.65,17.17C5.43,17.39 5.34,17.65 5.34,17.92C5.34,18.44 5.77,18.87 6.29,18.87C6.56,18.87 6.82,18.78 7.03,18.57L13.22,12.39L18.57,17.74C18.79,17.96 19.05,18.05 19.32,18.05C19.84,18.05 20.27,17.62 20.27,17.1C20.27,16.83 20.18,16.57 19.97,16.36L14.62,11L19.97,5.65C20.19,5.43 20.28,5.17 20.28,4.9C20.28,4.38 19.85,3.95 19.33,3.95C19.06,3.95 18.8,4.04 18.59,4.25L13.24,9.6L7.05,3.41C6.84,3.2 6.58,3.11 6.31,3.11C5.79,3.11 5.36,3.54 5.36,4.06C5.36,4.33 5.45,4.59 5.66,4.8L10.8,9.95L5.65,2.05Z" />
                    </svg>
                    <div className="cursor-name" style={{ backgroundColor: cursor.color }}>
                        {cursor.name}
                    </div>
                </div>
            ))}
        </>
    );
};
