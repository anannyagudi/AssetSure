import React from 'react';

/**
 * AuthBackground — pure decorative layer for Login & Register pages.
 * Renders two SVG layers: flowing waves + faint technology network.
 * All colours come from CSS custom properties so both themes work automatically.
 * aria-hidden + pointer-events:none — never interferes with form interactions.
 */
const AuthBackground = () => (
    <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
        {/* ── Layer 1: Flowing waves ── */}
        <svg
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 1,
            }}
        >
            {/* Top-left wave */}
            <path
                d="M-80,180 C120,80 320,260 520,160 C720,60 860,200 1040,140 C1220,80 1360,180 1520,120 L1520,-40 L-80,-40 Z"
                fill="var(--auth-wave-color)"
            />
            {/* Bottom-right wave */}
            <path
                d="M-80,760 C160,820 380,680 600,760 C820,840 1020,700 1220,780 C1360,830 1440,780 1520,800 L1520,940 L-80,940 Z"
                fill="var(--auth-wave-color)"
                style={{ opacity: 0.7 }}
            />
            {/* Mid accent wave */}
            <path
                d="M-80,440 C200,380 440,500 660,440 C880,380 1100,460 1360,420 C1420,412 1480,424 1520,430 L1520,480 C1480,474 1420,462 1360,470 C1100,510 880,430 660,490 C440,550 200,430 -80,490 Z"
                fill="var(--auth-wave-color)"
                style={{ opacity: 0.45 }}
            />
        </svg>

        {/* ── Layer 2: Technology network (nodes + lines) ── */}
        <svg
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
            }}
        >
            {/* Network connection lines */}
            {[
                [60,  60,  180, 140],
                [180, 140, 320,  90],
                [320,  90, 420, 200],
                [60,  60,  420, 200],
                [180, 140, 540, 180],

                [1380, 80,  1260, 160],
                [1260, 160, 1120, 100],
                [1120, 100, 1020, 220],
                [1380, 80,  1020, 220],
                [1260, 160,  900, 190],

                [80,  820, 200, 750],
                [200, 750, 360, 800],
                [360, 800, 480, 720],
                [80,  820, 480, 720],
                [200, 750, 560, 740],

                [1360, 840, 1220, 760],
                [1220, 760, 1080, 820],
                [1080, 820,  960, 740],
                [1360, 840,  960, 740],
                [1220, 760,  880, 750],

                [700, 30, 820, 90],
                [820, 90, 720, 160],
                [720, 160, 600, 100],
                [600, 100, 700, 30],
            ].map(([x1, y1, x2, y2], i) => (
                <line
                    key={`l${i}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="var(--auth-line-color)"
                    strokeWidth="0.7"
                />
            ))}

            {/* Network nodes */}
            {[
                [60,  60,  2.5],
                [180, 140, 2],
                [320,  90, 1.5],
                [420, 200, 2],
                [540, 180, 1.5],

                [1380, 80,  2.5],
                [1260, 160, 2],
                [1120, 100, 1.5],
                [1020, 220, 2],
                [900, 190,  1.5],

                [80,  820, 2.5],
                [200, 750, 2],
                [360, 800, 1.5],
                [480, 720, 2],
                [560, 740, 1.5],

                [1360, 840, 2.5],
                [1220, 760, 2],
                [1080, 820, 1.5],
                [960,  740, 2],
                [880,  750, 1.5],

                [700, 30,  2.5],
                [820, 90,  2],
                [720, 160, 1.5],
                [600, 100, 2],

                /* Scattered mid-edge nodes */
                [0,   380, 1.5],
                [1440, 420, 1.5],
                [380,  0,  1.5],
                [1060,  0, 1.5],
                [260,  900, 1.5],
                [1180, 900, 1.5],
            ].map(([cx, cy, r], i) => (
                <circle
                    key={`n${i}`}
                    cx={cx} cy={cy} r={r}
                    fill="var(--auth-node-color)"
                />
            ))}

            {/* Larger "hub" nodes with a subtle ring */}
            {[
                [60,  60],
                [1380, 80],
                [80,  820],
                [1360, 840],
                [720, 30],
            ].map(([cx, cy], i) => (
                <circle
                    key={`h${i}`}
                    cx={cx} cy={cy} r={5}
                    fill="none"
                    stroke="var(--auth-node-color)"
                    strokeWidth="0.8"
                    style={{ opacity: 0.6 }}
                />
            ))}
        </svg>
    </div>
);

export default AuthBackground;
