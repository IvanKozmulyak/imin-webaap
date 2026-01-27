function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      <button className="text-white">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/assets/logo.svg" 
          alt="IM IN" 
          className="h-8 w-auto"
        />
      </div>
      <div className="text-white">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 640 480"
        >
          <rect width="640" height="480" fill="#012169"/>
          <path d="M0 0l320 240L0 480zm640 0L320 240l320 240z" fill="#FFF"/>
          <path d="M0 180l320-120v240L0 300zm640-60L320 240l320 120V120z" fill="#C8102E"/>
          <path d="M0 0l320 240L640 0zm0 480l320-240 320 240z" fill="#FFF"/>
          <path d="M0 0l320 240L640 0zm0 480l320-240 320 240z" fill="#C8102E"/>
        </svg>
      </div>
    </header>
  )
}

export default Header

