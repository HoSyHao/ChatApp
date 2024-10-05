import React from 'react'

const Logo = () => {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="flex p-5 justify-start items-center gap-4">
          <svg
            width="60"
            height="60"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="80" y2="80">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>
            </defs>
            <rect width="80" height="80" rx="16" fill="url(#logoGradient)" />
            <path
              d="M60 24H20C17.7909 24 16 25.7909 16 28V52C16 54.2091 17.7909 56 20 56H60C62.2091 56 64 54.2091 64 52V28C64 25.7909 62.2091 24 60 24Z"
              fill="white"
            />
            <path
              d="M20 32H60"
              stroke="#8B5CF6"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="24" cy="28" r="2" fill="#8B5CF6" />
            <circle cx="30" cy="28" r="2" fill="#8B5CF6" />
            <circle cx="36" cy="28" r="2" fill="#8B5CF6" />
            <path
              d="M28 40H52"
              stroke="#8B5CF6"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M28 40H52; M28 40H44; M28 40H52"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M28 48H44"
              stroke="#8B5CF6"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M28 48H44; M28 48H36; M28 48H44"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
          <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Buzz</span>
        </div>
      </div>
    )
  }
  

export default Logo