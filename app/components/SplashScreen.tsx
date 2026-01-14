'use client';

import { useState } from 'react';

interface SplashScreenProps {
  onAgree: () => void;
}

export default function SplashScreen({ onAgree }: SplashScreenProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsScreen, setShowTermsScreen] = useState(false);

  const handleAgree = () => {
    if (termsAccepted) {
      onAgree();
    }
  };

  // Terms and Conditions Screen
  if (showTermsScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Dark overlay with blur */}
        <div className="absolute inset-0 bg-[rgba(12,0,17,0.80)] backdrop-blur-[7.5px]" />

        {/* Content Container */}
        <div className="relative w-full max-w-[440px] px-6 max-h-[90vh] overflow-y-auto">
          {/* Main Card */}
          <div className="relative rounded-[27px] border border-white bg-black/5 backdrop-blur-[15px] px-8 py-12">
            {/* Title */}
            <h1 className="text-white text-center text-[20px] font-bold mb-2">TERMS AND CONDITIONS</h1>
            <p className="text-white/70 text-center text-[12px] mb-8">Last Updated: 09.01.2026</p>

            {/* Terms Content */}
            <div className="text-white text-[12px] font-normal leading-relaxed space-y-6 mb-8">
              <div>
                <h2 className="font-semibold mb-2">1. INTRODUCTION</h2>
                <p>Welcome to IMIN ("we," "our," or "us"). By accessing our website (imin.wtf) and using our services to connect with party groups, you agree to be bound by these Terms. If you do not agree, please do not use our service.</p>
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
                  <li><strong>Telegram:</strong> You acknowledge that group chats are hosted on Telegram, a third-party platform. By joining a group, you agree to Telegram's Terms of Service and understand that your profile information may be visible to other group members.</li>
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
              className="w-full h-[45px] rounded-[30px] border border-white/30 bg-white text-black text-[15px] font-medium hover:bg-white/90 transition-all backdrop-blur-[15px]"
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
      <div className="relative w-full max-w-[440px] px-6">
        {/* Main Card */}
        <div className="relative rounded-[27px] border border-white bg-black/5 backdrop-blur-[15px] px-8 py-12">
          
          {/* Logo */}
          <div className="flex justify-center mb-16">
            <svg
              width="49"
              height="65"
              viewBox="0 0 49 65"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13.3152 30.107V0.794613C13.3152 0.353162 13.7974 0 14.5552 0H23.9931C24.4753 0 24.9576 0.17658 25.0953 0.529743L30.262 9.1822C30.4687 9.49122 30.8132 9.84438 31.1576 9.84438C31.5709 9.84438 31.8465 9.49122 32.0532 9.1822L37.0821 0.529743C37.3577 0.17658 37.771 0 38.3221 0H47.76C48.4489 0 49 0.353162 49 0.794613V30.107C49 30.5926 48.4489 30.9016 47.76 30.9016H39.5621C38.8732 30.9016 38.3221 30.5926 38.3221 30.107V16.731C38.2532 16.3779 37.9777 16.3337 37.771 16.6869L32.1909 24.6772C31.3643 25.6042 30.3998 25.0745 30.1243 24.6772L24.5442 16.6869C24.3375 16.3337 23.9931 16.3779 23.9931 16.731V30.107C23.9931 30.5926 23.3731 30.9016 22.7531 30.9016H14.5552C13.7974 30.9016 13.3152 30.5926 13.3152 30.107Z" fill="white"/>
              <path d="M0 34.8793V63.6863C0 64.1201 0.481064 64.4672 1.1683 64.4672H9.41514C10.1711 64.4672 10.6522 64.1201 10.6522 63.6863V34.8793C10.6522 34.4454 10.1711 34.0984 9.41514 34.0984H1.1683C0.481064 34.0984 0 34.4454 0 34.8793Z" fill="white"/>
              <path d="M26.9448 52.5511L36.6921 64.4703C36.9399 64.7793 37.6007 65 38.1789 65H47.4305C48.2566 65 49 64.6468 49 64.2054V34.893C49 34.4515 48.2566 34.0984 47.4305 34.0984H37.6007C36.6921 34.0984 36.0312 34.4515 36.0312 34.893V46.9446C35.866 47.3419 35.2052 47.3861 35.04 47.0329L25.9536 34.6281C25.7058 34.2749 25.1275 34.0984 24.4667 34.0984H15.0499C14.1413 34.0984 13.3152 34.4515 13.3152 34.893V64.2054C13.3152 64.6468 14.1413 65 15.0499 65H24.5493C25.3754 65 26.1188 64.6468 26.1188 64.2054V52.6393C26.2014 52.2862 26.697 52.1979 26.9448 52.5511Z" fill="white"/>
              <path d="M0 0.794613V30.107C0 30.5485 0.481064 30.9016 1.1683 30.9016H9.41514C10.1711 30.9016 10.6522 30.5485 10.6522 30.107V0.794613C10.6522 0.353162 10.1711 0 9.41514 0H1.1683C0.481064 0 0 0.353162 0 0.794613Z" fill="white"/>
            </svg>
          </div>

          {/* Feature 1: Groups up to 5 people */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-[60px] h-[60px] rounded-full border border-[rgba(136,209,250,0.05)] bg-[rgba(136,209,250,0.10)] flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_87_443)">
                  <path d="M7.5 13C6.60998 13 5.73995 12.7361 4.99993 12.2416C4.25991 11.7472 3.68314 11.0443 3.34254 10.2221C3.00195 9.39981 2.91283 8.49501 3.08647 7.6221C3.2601 6.74918 3.68868 5.94736 4.31802 5.31802C4.94736 4.68869 5.74918 4.2601 6.62209 4.08647C7.49501 3.91284 8.39981 4.00195 9.22208 4.34254C10.0443 4.68314 10.7471 5.25991 11.2416 5.99994C11.7361 6.73996 12 7.60999 12 8.5C11.9987 9.69307 11.5241 10.8369 10.6805 11.6805C9.83689 12.5241 8.69307 12.9987 7.5 13ZM14 24H1C0.734784 24 0.48043 23.8946 0.292893 23.7071C0.105357 23.5196 0 23.2652 0 23V22.5C0 20.5109 0.790176 18.6032 2.1967 17.1967C3.60322 15.7902 5.51088 15 7.5 15C9.48912 15 11.3968 15.7902 12.8033 17.1967C14.2098 18.6032 15 20.5109 15 22.5V23C15 23.2652 14.8946 23.5196 14.7071 23.7071C14.5196 23.8946 14.2652 24 14 24ZM17.5 9C16.61 9 15.74 8.73608 14.9999 8.24162C14.2599 7.74715 13.6831 7.04435 13.3425 6.22208C13.0019 5.39981 12.9128 4.49501 13.0865 3.6221C13.2601 2.74918 13.6887 1.94736 14.318 1.31802C14.9474 0.688685 15.7492 0.260102 16.6221 0.0864683C17.495 -0.0871652 18.3998 0.00194979 19.2221 0.342544C20.0443 0.683139 20.7471 1.25991 21.2416 1.99994C21.7361 2.73996 22 3.60999 22 4.5C21.9987 5.69307 21.5241 6.83689 20.6805 7.68052C19.8369 8.52415 18.6931 8.99868 17.5 9ZM16.079 11.021C15.1476 11.146 14.2521 11.4619 13.4485 11.9491C12.6449 12.4362 11.9506 13.084 11.409 13.852C13.6499 14.8697 15.4106 16.7142 16.323 19H23C23.2652 19 23.5196 18.8946 23.7071 18.7071C23.8946 18.5196 24 18.2652 24 18V17.962C23.999 16.9652 23.7853 15.9801 23.3733 15.0725C22.9612 14.1648 22.3603 13.3555 21.6106 12.6986C20.8609 12.0416 19.9797 11.5522 19.0258 11.2629C18.0719 10.9736 17.0673 10.8911 16.079 11.021Z" fill="#88D1FA"/>
                </g>
                <defs>
                  <clipPath id="clip0_87_443">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <p className="text-white text-center text-[15px] font-normal">Groups up to 5 people</p>
          </div>

          {/* Feature 2: Mixed-gender groups */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-[60px] h-[60px] rounded-full border border-[rgba(136,209,250,0.05)] bg-[rgba(136,209,250,0.10)] flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_87_449)">
                  <path d="M3.98391 5H1.89591C1.95491 4.761 1.99591 4.605 2.01291 4.55C2.86691 1.829 5.35991 0 8.21491 0C9.20191 0 10.1379 0.231 10.9859 0.629C10.5259 1.135 10.1279 1.696 9.80891 2.307C9.78491 2.296 9.76891 2.275 9.74391 2.266C9.73791 2.264 9.73091 2.261 9.72491 2.259C9.28791 2.103 8.80391 2.3 8.56691 2.699C8.18691 3.336 7.65791 3.879 7.00991 4.283C6.19991 4.789 5.23391 5 3.98391 5ZM16.8969 12C20.2059 12 22.8969 9.309 22.8969 6C22.8969 2.691 20.2059 0 16.8969 0C13.5879 0 10.8969 2.691 10.8969 6C10.8969 9.309 13.5879 12 16.8969 12ZM1.63091 13.932C2.73891 13.216 3.97191 12.679 5.28691 12.357C3.17691 11.364 1.66591 9.312 1.43891 6.885C1.14991 8.093 0.563912 10.555 0.0299123 12.806C-0.190088 13.735 0.828912 14.45 1.63091 13.932ZM8.06591 5.979C6.98491 6.653 5.45691 6.999 4.21391 6.999C4.17591 6.999 3.80391 6.999 3.52391 6.999C3.88491 9.263 5.85091 10.998 8.21391 10.998C8.96191 10.998 9.66391 10.816 10.2939 10.507C9.41391 9.222 8.89591 7.67 8.89591 5.998C8.89591 5.771 8.91091 5.547 8.92991 5.325C8.65891 5.561 8.37591 5.784 8.06491 5.978L8.06591 5.979ZM23.9979 18.999C23.8179 17.031 22.8009 15.315 21.3079 14.17C20.7109 13.712 19.8439 13.839 19.3509 14.405L16.9979 17.102L14.6139 14.414C14.1169 13.854 13.2519 13.733 12.6589 14.192C11.1819 15.337 10.1769 17.043 9.99791 18.999C9.99591 19.122 9.99791 21.999 9.99791 21.999C9.99791 23.102 10.8949 23.999 11.9979 23.999H21.9979C23.1009 23.999 23.9979 23.102 23.9979 21.999C23.9979 21.999 23.9989 19.122 23.9979 18.999ZM7.99791 19.362L4.61491 15.521C4.11791 14.961 3.25291 14.84 2.65991 15.299C1.18491 16.445 0.178912 18.151 -8.76735e-05 20.107C-0.00208767 20.23 -8.76735e-05 22 -8.76735e-05 22C-8.76735e-05 23.103 0.896912 24 1.99991 24H8.55491C8.20991 23.409 7.99891 22.732 7.99891 22C7.99891 21.999 7.99891 20.4 7.99891 19.363L7.99791 19.362Z" fill="#88D1FA"/>
                </g>
                <defs>
                  <clipPath id="clip0_87_449">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <p className="text-white text-center text-[15px] font-normal">Mixed-gender groups</p>
          </div>

          {/* Feature 3: Just good vibes */}
          <div className="flex flex-col items-center mb-16">
            <div className="w-[60px] h-[60px] rounded-full border border-[rgba(136,209,250,0.05)] bg-[rgba(136,209,250,0.10)] flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_87_455)">
                  <path d="M12.118 20.0321L3.11997 23.8201C2.83597 23.9391 2.53897 23.9981 2.24497 23.9981C1.66297 23.9981 1.09197 23.7691 0.660967 23.3391C0.0129671 22.6911 -0.176033 21.7261 0.179967 20.8811L3.96797 11.8821L12.118 20.0321ZM16.208 14.2721L9.72897 7.7931C9.09197 7.1551 8.18197 6.8791 7.29897 7.0521C6.41497 7.2261 5.67797 7.8241 5.32797 8.6561L4.80697 9.8941L14.109 19.1961L15.347 18.6751C16.178 18.3251 16.777 17.5881 16.95 16.7041C17.123 15.8191 16.846 14.9101 16.209 14.2731L16.208 14.2721ZM15.796 7.6051C16.526 6.6431 16.93 5.6211 16.998 4.5641C17.17 1.8671 15.203 0.282099 15.12 0.215099C14.69 -0.122901 14.069 -0.0519013 13.724 0.377099C13.38 0.805099 13.449 1.4331 13.874 1.7801C13.924 1.8211 15.106 2.8051 15.002 4.4361C14.96 5.0931 14.691 5.7521 14.204 6.3951C13.87 6.8351 13.956 7.4621 14.396 7.7961C14.577 7.9331 14.789 7.9991 15 7.9991C15.302 7.9991 15.601 7.8621 15.797 7.6031L15.796 7.6051ZM23.576 13.8181C24.028 13.5001 24.136 12.8761 23.817 12.4241C23.444 11.8951 22.431 11.0001 21 11.0001C20.224 11.0001 19.495 11.2401 18.892 11.6951C18.451 12.0271 18.364 12.6551 18.696 13.0951C19.029 13.5351 19.655 13.6241 20.097 13.2901C20.353 13.0971 20.657 12.9991 21 12.9991C21.729 12.9991 22.16 13.5471 22.19 13.5861C22.385 13.8561 22.69 13.9991 23.001 13.9991C23.2 13.9991 23.401 13.9391 23.576 13.8161V13.8181ZM21 1.5011C21 2.3291 21.672 3.0011 22.5 3.0011C23.328 3.0011 24 2.3291 24 1.5011C24 0.673099 23.328 0.00109863 22.5 0.00109863C21.672 0.00109863 21 0.673099 21 1.5011ZM19 6.5011C19 7.3291 19.672 8.0011 20.5 8.0011C21.328 8.0011 22 7.3291 22 6.5011C22 5.6731 21.328 5.0011 20.5 5.0011C19.672 5.0011 19 5.6731 19 6.5011ZM7.99997 2.5001C7.99997 3.3281 8.67197 4.0001 9.49997 4.0001C10.328 4.0001 11 3.3281 11 2.5001C11 1.6721 10.328 1.0001 9.49997 1.0001C8.67197 1.0001 7.99997 1.6721 7.99997 2.5001ZM20 18.5001C20 19.3281 20.672 20.0001 21.5 20.0001C22.328 20.0001 23 19.3281 23 18.5001C23 17.6721 22.328 17.0001 21.5 17.0001C20.672 17.0001 20 17.6721 20 18.5001ZM0.999967 3.5001C0.999967 4.3281 1.67197 5.0001 2.49997 5.0001C3.32797 5.0001 3.99997 4.3281 3.99997 3.5001C3.99997 2.6721 3.32797 2.0001 2.49997 2.0001C1.67197 2.0001 0.999967 2.6721 0.999967 3.5001ZM15 22.5001C15 23.3281 15.672 24.0001 16.5 24.0001C17.328 24.0001 18 23.3281 18 22.5001C18 21.6721 17.328 21.0001 16.5 21.0001C15.672 21.0001 15 21.6721 15 22.5001Z" fill="#88D1FA"/>
                </g>
                <defs>
                  <clipPath id="clip0_87_455">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <p className="text-white text-center text-[15px] font-normal">Just good vibes</p>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-3 mb-8 px-2">
            <button
              type="button"
              onClick={() => setTermsAccepted(!termsAccepted)}
              className="flex-shrink-0 w-5 h-5 mt-0.5"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.0035 1.255C14.8351 1.255 18.7535 5.17339 18.7535 10.0051C18.7535 14.8367 14.8351 18.7551 10.0035 18.7551C5.1718 18.7551 1.25342 14.8367 1.25342 10.0051C1.25342 5.17339 5.1718 1.255 10.0035 1.255ZM8.18641 12.8471L6.04419 10.7031C5.67923 10.338 5.67915 9.74246 6.04419 9.37736C6.4093 9.01232 7.00745 9.01461 7.3699 9.37736L8.88016 10.8888L12.6372 7.13179C13.0023 6.76667 13.5979 6.76667 13.9629 7.13179C14.328 7.49682 14.3275 8.09291 13.9629 8.4575L9.54195 12.8784C9.17736 13.243 8.58127 13.2436 8.21623 12.8784C8.20598 12.8682 8.19608 12.8578 8.18641 12.8471Z"
                  fill={termsAccepted ? "white" : "rgba(255,255,255,0.2)"}
                />
              </svg>
            </button>
            <p className="text-white text-[10px] font-normal leading-relaxed">
              By clicking the button you agree with{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsScreen(true);
                }}
                className="underline hover:text-white/80"
              >
                Terms & Conditions
              </button>
            </p>
          </div>

          {/* Agree Button */}
          <button
            onClick={handleAgree}
            disabled={!termsAccepted}
            className={`w-full h-[45px] rounded-[30px] border text-[15px] font-medium transition-all backdrop-blur-[15px] ${
              termsAccepted
                ? 'border-white/30 bg-white text-black hover:bg-white/90'
                : 'border-white/30 bg-white/35 text-black/50 cursor-not-allowed opacity-35'
            }`}
          >
            I'M IN
          </button>
        </div>
      </div>
    </div>
  );
}
