'use client';

import { useState, useEffect } from 'react';

interface EventsSplashScreenProps {
  onAgree: () => void;
  isFestivalStyle?: boolean;
}

export default function EventsSplashScreen({ onAgree, isFestivalStyle = false }: EventsSplashScreenProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsScreen, setShowTermsScreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Register for an Event',
      description: 'Fill out a simple form with your details and the languages you speak.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H7V10H17V12ZM15 16H7V14H15V16ZM17 8H7V6H17V8Z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      title: 'Get Matched',
      description: 'We match you with up to 4 other people who speak the same languages.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4C18.21 4 20 5.79 20 8C20 10.21 18.21 12 16 12C13.79 12 12 10.21 12 8C12 5.79 13.79 4 16 4ZM16 6C14.9 6 14 6.9 14 8C14 9.1 14.9 10 16 10C17.1 10 18 9.1 18 8C18 6.9 17.1 6 16 6ZM8 4C10.21 4 12 5.79 12 8C12 10.21 10.21 12 8 12C5.79 12 4 10.21 4 8C4 5.79 5.79 4 8 4ZM8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6ZM16 14C18.67 14 22 15.33 22 18V20H10V18C10 15.33 13.33 14 16 14ZM16 15.9C13.03 15.9 11.9 17.36 11.9 18V18.1H20.1V18C20.1 17.36 18.97 15.9 16 15.9ZM8 14C10.67 14 14 15.33 14 18V20H2V18C2 15.33 5.33 14 8 14ZM8 15.9C5.03 15.9 3.9 17.36 3.9 18V18.1H12.1V18C12.1 17.36 10.97 15.9 8 15.9Z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      title: 'Join Telegram Group',
      description: 'Get an invite link to join your group on Telegram and start chatting.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      title: 'Meet Your Squad',
      description: 'Connect with your group, plan together, and enjoy the event!',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
        </svg>
      ),
    },
  ];

  const handleAgree = () => {
    if (termsAccepted) {
      localStorage.setItem('events-splash-accepted', 'true');
      onAgree();
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Terms and Conditions Screen
  if (showTermsScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Dark overlay with blur */}
        <div className="absolute inset-0 bg-[rgba(12,0,17,0.80)] backdrop-blur-[7.5px]" />

        {/* Content Container */}
        <div className="relative w-full max-w-[440px] md:max-w-[700px] lg:max-w-[800px] px-6 max-h-[90vh] overflow-y-auto">
          {/* Main Card */}
          <div className={`relative rounded-[27px] border backdrop-blur-[15px] px-8 md:px-12 lg:px-16 py-12 md:py-16 ${
            isFestivalStyle 
              ? 'border-black/10 bg-white/95' 
              : 'border-white bg-black/5'
          }`}>
            {/* Title */}
            <h1 className={`text-center text-[20px] md:text-[24px] lg:text-[28px] font-bold mb-2 ${
              isFestivalStyle ? 'text-[#0F172A]' : 'text-white'
            }`}>
              TERMS AND CONDITIONS
            </h1>
            <p className={`text-center text-[12px] md:text-[13px] mb-8 ${
              isFestivalStyle ? 'text-[#64748B]' : 'text-white/70'
            }`}>
              Last Updated: 09.01.2026
            </p>

            {/* Terms Content */}
            <div className={`text-[12px] md:text-[13px] lg:text-[14px] font-normal leading-relaxed space-y-6 mb-8 ${
              isFestivalStyle ? 'text-[#0F172A]' : 'text-white'
            }`}>
              <div>
                <h2 className="font-semibold mb-2">1. INTRODUCTION</h2>
                <p>Welcome to IMIN (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing our website (imin.wtf) and using our services to connect with party groups, you agree to be bound by these Terms. If you do not agree, please do not use our service.</p>
              </div>

              <div>
                <h2 className="font-semibold mb-2">2. THE SERVICE</h2>
                <p>IMIN is a social matching service that:</p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                  <li>Collects user preferences for nightlife and events.</li>
                  <li>Groups users based on these preferences.</li>
                  <li>Redirects users to third-party platforms (e.g., Telegram) to facilitate communication.</li>
                  <li>Redirects users to third-party ticket vendors for event access.</li>
                </ul>
                <p className="mt-2">WE DO NOT ORGANIZE THE EVENTS. We are solely a matching service. We are not responsible for the quality, safety, or cancellation of the events you attend.</p>
              </div>

              <div>
                <h2 className="font-semibold mb-2">3. ELIGIBILITY</h2>
                <p>By using IMIN, you confirm that:</p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                  <li><strong>Age:</strong> You are at least 18 years old (or the legal drinking age in your jurisdiction).</li>
                  <li><strong>Capacity:</strong> You have the legal capacity to enter into binding contracts.</li>
                  <li><strong>Legality:</strong> You are not barred from using social services under the laws of your jurisdiction.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold mb-2">4. USER CONDUCT & SAFETY (CRITICAL)</h2>
                <p>You acknowledge that IMIN connects you with strangers for social activities.</p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                  <li><strong>Zero Tolerance:</strong> We have zero tolerance for harassment, hate speech, violence, or illegal behavior within the groups we facilitate.</li>
                  <li><strong>Personal Responsibility:</strong> You are solely responsible for your interactions with other users. We do not conduct criminal background checks on users.</li>
                  <li><strong>Safety:</strong> You agree to take necessary precautions in all interactions, especially when meeting offline.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold mb-2">5. LIABILITY DISCLAIMER (USE AT YOUR OWN RISK)</h2>
                <p>To the maximum extent permitted by law, IMIN is NOT LIABLE for:</p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                  <li><strong>Personal Injury:</strong> Any bodily injury, emotional distress, or damages arising from your meetings with other users or attendance at events.</li>
                  <li><strong>Event Issues:</strong> Refusal of entry by club/event organizers, lost tickets, or event cancellations.</li>
                  <li><strong>Third-Party Acts:</strong> The conduct, whether online or offline, of any other user of the service.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold mb-2">6. TICKETS AND PAYMENTS</h2>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>IMIN may redirect you to third-party ticket sellers. Any purchase is a contract solely between you and the ticket seller.</li>
                  <li>IMIN does not process refunds for third-party event tickets.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold mb-2">7. DATA PRIVACY & THIRD-PARTY PLATFORMS</h2>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Data Processing:</strong> By using the service, you agree to our processing of your data (Name, Age, Preferences, Contact Info) to facilitate the matching process.</li>
                  <li><strong>Telegram:</strong> You acknowledge that group chats are hosted on Telegram, a third-party platform. By joining a group, you agree to Telegram&apos;s Terms of Service and understand that your profile information may be visible to other group members.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold mb-2">8. TERMINATION</h2>
                <p>We reserve the right to ban you from our service and remove you from any associated groups (Telegram/WhatsApp) at our sole discretion, without notice, if you violate these Terms.</p>
              </div>

              <div>
                <h2 className="font-semibold mb-2">9. GOVERNING LAW</h2>
                <p>These Terms are governed by the laws of France, Grand-Est.</p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setShowTermsScreen(false)}
              className={`w-full h-[45px] rounded-[30px] border text-[15px] font-medium hover:opacity-90 transition-all backdrop-blur-[15px] ${
                isFestivalStyle
                  ? 'border-black/20 bg-[#0F172A] text-white'
                  : 'border-white/30 bg-white text-black'
              }`}
            >
              BACK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Splash Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay with blur */}
      <div className="absolute inset-0 bg-[rgba(12,0,17,0.80)] backdrop-blur-[7.5px]" />

      {/* Content Container */}
      <div className="relative w-full max-w-[440px] md:max-w-[600px] lg:max-w-[700px] px-6">
        {/* Main Card */}
        <div className={`relative rounded-[27px] border backdrop-blur-[15px] px-8 md:px-12 lg:px-16 py-12 md:py-16 ${
          isFestivalStyle 
            ? 'border-black/10 bg-white/95' 
            : 'border-white bg-black/5'
        }`}>
          
          {/* Logo */}
          <div className="flex justify-center mb-8 md:mb-12">
            <svg
              width="49"
              height="65"
              viewBox="0 0 49 65"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="md:w-[60px] md:h-[80px] lg:w-[70px] lg:h-[90px]"
            >
              <path d="M13.3152 30.107V0.794613C13.3152 0.353162 13.7974 0 14.5552 0H23.9931C24.4753 0 24.9576 0.17658 25.0953 0.529743L30.262 9.1822C30.4687 9.49122 30.8132 9.84438 31.1576 9.84438C31.5709 9.84438 31.8465 9.49122 32.0532 9.1822L37.0821 0.529743C37.3577 0.17658 37.771 0 38.3221 0H47.76C48.4489 0 49 0.353162 49 0.794613V30.107C49 30.5926 48.4489 30.9016 47.76 30.9016H39.5621C38.8732 30.9016 38.3221 30.5926 38.3221 30.107V16.731C38.2532 16.3779 37.9777 16.3337 37.771 16.6869L32.1909 24.6772C31.3643 25.6042 30.3998 25.0745 30.1243 24.6772L24.5442 16.6869C24.3375 16.3337 23.9931 16.3779 23.9931 16.731V30.107C23.9931 30.5926 23.3731 30.9016 22.7531 30.9016H14.5552C13.7974 30.9016 13.3152 30.5926 13.3152 30.107Z" fill={isFestivalStyle ? "#0F172A" : "white"}/>
              <path d="M0 34.8793V63.6863C0 64.1201 0.481064 64.4672 1.1683 64.4672H9.41514C10.1711 64.4672 10.6522 64.1201 10.6522 63.6863V34.8793C10.6522 34.4454 10.1711 34.0984 9.41514 34.0984H1.1683C0.481064 34.0984 0 34.4454 0 34.8793Z" fill={isFestivalStyle ? "#0F172A" : "white"}/>
              <path d="M26.9448 52.5511L36.6921 64.4703C36.9399 64.7793 37.6007 65 38.1789 65H47.4305C48.2566 65 49 64.6468 49 64.2054V34.893C49 34.4515 48.2566 34.0984 47.4305 34.0984H37.6007C36.6921 34.0984 36.0312 34.4515 36.0312 34.893V46.9446C35.866 47.3419 35.2052 47.3861 35.04 47.0329L25.9536 34.6281C25.7058 34.2749 25.1275 34.0984 24.4667 34.0984H15.0499C14.1413 34.0984 13.3152 34.4515 13.3152 34.893V64.2054C13.3152 64.6468 14.1413 65 15.0499 65H24.5493C25.3754 65 26.1188 64.6468 26.1188 64.2054V52.6393C26.2014 52.2862 26.697 52.1979 26.9448 52.5511Z" fill={isFestivalStyle ? "#0F172A" : "white"}/>
              <path d="M0 0.794613V30.107C0 30.5485 0.481064 30.9016 1.1683 30.9016H9.41514C10.1711 30.9016 10.6522 30.5485 10.6522 30.107V0.794613C10.6522 0.353162 10.1711 0 9.41514 0H1.1683C0.481064 0 0 0.353162 0 0.794613Z" fill={isFestivalStyle ? "#0F172A" : "white"}/>
            </svg>
          </div>

          {/* Title */}
          <h2 className={`text-center text-[20px] md:text-[24px] font-bold mb-6 md:mb-8 ${
            isFestivalStyle ? 'text-[#0F172A]' : 'text-white'
          }`}>
            How It Works
          </h2>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? isFestivalStyle
                      ? 'bg-[#7C3AED] w-8'
                      : 'bg-white w-8'
                    : isFestivalStyle
                    ? 'bg-[#7C3AED]/30 w-2'
                    : 'bg-white/30 w-2'
                }`}
              />
            ))}
          </div>

          {/* Current Step Content */}
          <div className="mb-8 md:mb-10">
            <div className={`flex flex-col items-center mb-6 ${
              isFestivalStyle ? 'text-[#0F172A]' : 'text-white'
            }`}>
              <div className={`w-[80px] h-[80px] md:w-[90px] md:h-[90px] rounded-full border flex items-center justify-center mb-4 ${
                isFestivalStyle
                  ? 'border-[#7C3AED]/20 bg-[#7C3AED]/10'
                  : 'border-white/20 bg-white/10'
              }`}>
                <div className={isFestivalStyle ? 'text-[#7C3AED]' : 'text-white'}>
                  {steps[currentStep].icon}
                </div>
              </div>
              <h3 className="text-[18px] md:text-[20px] font-bold mb-3 text-center">
                {steps[currentStep].title}
              </h3>
              <p className="text-[14px] md:text-[15px] text-center leading-relaxed max-w-md">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mb-6 md:mb-8">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className={`flex-1 h-[45px] rounded-[30px] border text-[15px] font-medium transition-all ${
                  isFestivalStyle
                    ? 'border-black/20 bg-white text-[#0F172A] hover:bg-gray-100'
                    : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Previous
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className={`flex-1 h-[45px] rounded-[30px] border text-[15px] font-medium transition-all ${
                  isFestivalStyle
                    ? 'border-black/20 bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                    : 'border-white/30 bg-white text-black hover:bg-white/90'
                }`}
              >
                Next
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-3 mb-6 md:mb-8 px-2">
            <button
              type="button"
              onClick={() => setTermsAccepted(!termsAccepted)}
              className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 mt-0.5"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.0035 1.255C14.8351 1.255 18.7535 5.17339 18.7535 10.0051C18.7535 14.8367 14.8351 18.7551 10.0035 18.7551C5.1718 18.7551 1.25342 14.8367 1.25342 10.0051C1.25342 5.17339 5.1718 1.255 10.0035 1.255ZM8.18641 12.8471L6.04419 10.7031C5.67923 10.338 5.67915 9.74246 6.04419 9.37736C6.4093 9.01232 7.00745 9.01461 7.3699 9.37736L8.88016 10.8888L12.6372 7.13179C13.0023 6.76667 13.5979 6.76667 13.9629 7.13179C14.328 7.49682 14.3275 8.09291 13.9629 8.4575L9.54195 12.8784C9.17736 13.243 8.58127 13.2436 8.21623 12.8784C8.20598 12.8682 8.19608 12.8578 8.18641 12.8471Z"
                  fill={termsAccepted ? (isFestivalStyle ? "#7C3AED" : "white") : (isFestivalStyle ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.2)")}
                />
              </svg>
            </button>
            <p className={`text-[10px] md:text-[11px] lg:text-[12px] font-normal leading-relaxed ${
              isFestivalStyle ? 'text-[#0F172A]' : 'text-white'
            }`}>
              By clicking the button you agree with{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsScreen(true);
                }}
                className="underline hover:opacity-80"
              >
                Terms & Conditions
              </button>
            </p>
          </div>

          {/* Agree Button */}
          <button
            onClick={handleAgree}
            disabled={!termsAccepted}
            className={`w-full h-[45px] md:h-[50px] lg:h-[55px] rounded-[30px] border text-[15px] md:text-[16px] font-medium transition-all backdrop-blur-[15px] ${
              termsAccepted
                ? isFestivalStyle
                  ? 'border-black/20 bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                  : 'border-white/30 bg-white text-black hover:bg-white/90'
                : isFestivalStyle
                ? 'border-black/20 bg-white/50 text-[#0F172A]/50 cursor-not-allowed opacity-50'
                : 'border-white/30 bg-white/35 text-black/50 cursor-not-allowed opacity-35'
            }`}
          >
            GET STARTED
          </button>
        </div>
      </div>
    </div>
  );
}
