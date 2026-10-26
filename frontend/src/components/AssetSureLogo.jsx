
import React from 'react';

const AssetSureLogo = ({ size = 88, className = '' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 300 300"
            width={size}
            height={size}
            className={className}
            role="img"
            aria-label="AssetSure logo"
        >
            <style>{`
                .assetsure-shield {
                    fill: #0b1f36;
                    transition: fill 0.3s ease;
                }

                .assetsure-cyan-main {
                    fill: #0098a6;
                    transition: fill 0.3s ease;
                }

                .assetsure-cyan-light {
                    fill: #22c7cb;
                    transition: fill 0.3s ease;
                }

                .assetsure-cyan-pale {
                    fill: #52dedb;
                    transition: fill 0.3s ease;
                }

                html.dark .assetsure-shield {
                    fill: #8ac6ff;
                }

                html.dark .assetsure-cyan-main {
                    fill: #22c7cb;
                }

                html.dark .assetsure-cyan-light {
                    fill: #52dedb;
                }

                html.dark .assetsure-cyan-pale {
                    fill: #82ece8;
                }

                @media (prefers-reduced-motion: reduce) {
                    .assetsure-shield,
                    .assetsure-cyan-main,
                    .assetsure-cyan-light,
                    .assetsure-cyan-pale {
                        transition: none;
                    }
                }
            `}</style>

            {/* Wi-Fi Waves */}
            <path
                className="assetsure-cyan-pale"
                d="M 190 60 A 85 85 0 0 1 245 115 L 225 130 A 65 65 0 0 0 180 80 Z"
            />
            <path
                className="assetsure-cyan-light"
                d="M 195 85 A 55 55 0 0 1 220 110 L 200 125 A 35 35 0 0 0 180 100 Z"
            />
            <path
                className="assetsure-cyan-main"
                d="M 195 110 A 25 25 0 0 1 205 120 L 190 130 A 10 10 0 0 0 185 125 Z"
            />

            {/* Shield */}
            <path
                className="assetsure-shield"
                fillRule="evenodd"
                d="M 130 30 C 130 30 75 35 50 45 C 50 110 55 170 130 220 C 205 170 210 110 210 45 C 185 35 130 30 130 30 Z M 130 50 C 160 53 183 58 190 62 C 190 105 186 150 130 196 C 74 150 70 105 70 62 C 97 53 110 50 130 50 Z"
            />

            {/* Checkmark / Signal Stem */}
            <path
                className="assetsure-cyan-main"
                d="M 135 135 L 185 85 C 191 79 201 79 207 85 C 213 91 213 101 207 107 L 157 157 Z"
            />
            <path
                className="assetsure-cyan-main"
                d="M 115 135 L 137 157 C 143 163 153 163 159 157 C 159 157 143 140 137 135 C 131 129 121 129 115 135 Z"
            />
        </svg>
    );
};

export default AssetSureLogo;
