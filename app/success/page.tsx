'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { EventDto } from '@/lib/types/event';

function SuccessContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams ? searchParams.get('eventId') : null;
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) {
        return;
      }

      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        
        if (response.ok && !data.error) {
          const event: EventDto = data;
          if (event && event.ticketUrl) {
            setTicketUrl(event.ticketUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching event:', err);
      }
    }

    fetchEvent();
  }, [eventId]);

  return (
    <div className="relative bg-black overflow-hidden flex flex-col" style={{ minHeight: '100svh' }}>
      {/* Background Image */}
      <img
        src="/assets/background.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ 
          zIndex: 0
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center flex-1 min-h-0">
        {/* Logo - Top */}
        <div className="pt-8 sm:pt-4 md:pt-6 lg:pt-8 xl:pt-12">
          <svg
            width="77"
            height="102"
            viewBox="0 0 77 102"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[45px] h-[60px] sm:w-[55px] sm:h-[73px] md:w-[65px] md:h-[86px] lg:w-[75px] lg:h-[99px] xl:w-[85px] xl:h-[113px]"
          >
            <path
              d="M20.9239 47.2449V1.24693C20.9239 0.554192 21.6817 0 22.8725 0H37.7034C38.4612 0 39.219 0.277095 39.4355 0.831288L47.5546 14.409C47.8794 14.8939 48.4207 15.4481 48.962 15.4481C49.6115 15.4481 50.0445 14.8939 50.3693 14.409L58.2719 0.831288C58.7049 0.277095 59.3544 0 60.2205 0H75.0514C76.134 0 77 0.554192 77 1.24693V47.2449C77 48.0069 76.134 48.4918 75.0514 48.4918H62.1691C61.0865 48.4918 60.2205 48.0069 60.2205 47.2449V26.2548C60.1122 25.7007 59.6792 25.6314 59.3544 26.1856L50.5858 38.7242C49.2867 40.1789 47.7711 39.3476 47.3381 38.7242L38.5695 26.1856C38.2447 25.6314 37.7034 25.7007 37.7034 26.2548V47.2449C37.7034 48.0069 36.7291 48.4918 35.7548 48.4918H22.8725C21.6817 48.4918 20.9239 48.0069 20.9239 47.2449Z"
              fill="white"
            />
            <path
              d="M0 54.7336V99.9385C0 100.619 0.755958 101.164 1.8359 101.164H14.7952C15.9832 101.164 16.7391 100.619 16.7391 99.9385V54.7336C16.7391 54.0528 15.9832 53.5082 14.7952 53.5082H1.8359C0.755958 53.5082 0 54.0528 0 54.7336Z"
              fill="white"
            />
            <path
              d="M42.3419 82.4647L57.6589 101.169C58.0484 101.654 59.0868 102 59.9954 102H74.5337C75.8317 102 77 101.446 77 100.753V54.7551C77 54.0624 75.8317 53.5082 74.5337 53.5082H59.0868C57.6589 53.5082 56.6205 54.0624 56.6205 54.7551V73.6669C56.3609 74.2904 55.3224 74.3597 55.0628 73.8055L40.7842 54.3395C40.3948 53.7853 39.4861 53.5082 38.4477 53.5082H23.6498C22.222 53.5082 20.9239 54.0624 20.9239 54.7551V100.753C20.9239 101.446 22.222 102 23.6498 102H38.5775C39.8756 102 41.0438 101.446 41.0438 100.753V82.6033C41.1736 82.0491 41.9524 81.9105 42.3419 82.4647Z"
              fill="white"
            />
            <path
              d="M0 1.24693V47.2449C0 47.9376 0.755958 48.4918 1.8359 48.4918H14.7952C15.9832 48.4918 16.7391 47.9376 16.7391 47.2449V1.24693C16.7391 0.554192 15.9832 0 14.7952 0H1.8359C0.755958 0 0 0.554192 0 1.24693Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Success Content - Center */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-[90vw] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[540px] xl:max-w-[358px] px-2 sm:px-3 md:px-4 py-2 sm:py-4 md:py-6 pb-0 sm:pb-0 md:pb-6">
          {/* Success Icon */}
          <div className="w-[140px] h-[134px] sm:w-[180px] sm:h-[173px] md:w-[240px] md:h-[230px] lg:w-[320px] lg:h-[307px] xl:w-[438px] xl:h-[420px] mb-1 sm:mb-2 md:mb-3 lg:mb-4 xl:mb-9 flex items-center justify-center">
            <img
              src="/assets/success.png"
              alt="Success"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Success Text with Gradient */}
          <h1 
            className="text-[32px] sm:text-[42px] md:text-[52px] lg:text-[62px] xl:text-[70px] font-semibold uppercase text-center leading-tight sm:leading-tight md:leading-tight lg:leading-none mb-1 sm:mb-2 md:mb-3 lg:mb-4 xl:mb-[23px]"
            style={{
              background: 'linear-gradient(90deg, #B685F9 0%, #87D3FA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Success
          </h1>

          {/* Message */}
          <div className="flex flex-col items-center text-center w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[380px] xl:w-[322px] px-1 sm:px-2">
            <p className="text-white text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] font-semibold uppercase mb-0.5 sm:mb-1 md:mb-1.5 leading-tight">
              Your Crew is READY!
            </p>
            <p className="text-white text-[11px] sm:text-[12px] md:text-[13px] lg:text-[13px] xl:text-[14px] font-normal leading-normal mb-0">
              We&apos;ll drop you into a Telegram chat soon
            </p>
          </div>
        </div>

        {/* Button - Bottom */}
        <div className="w-full px-4 sm:px-6 md:px-8 pb-safe flex justify-center mt-4 sm:mt-6 md:mt-8">
          {ticketUrl ? (
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[450px] h-[50px] sm:h-[54px] md:h-[58px] lg:h-[56px] xl:h-[58px] rounded-[25px] sm:rounded-[27px] md:rounded-[29px] lg:rounded-[28px] xl:rounded-[29px] bg-white text-black text-[14px] sm:text-[15px] md:text-[16px] lg:text-[15px] xl:text-[16px] font-bold uppercase hover:bg-white/90 transition-all flex items-center justify-center px-8"
            >
              BUY YOUR TICKET
            </a>
          ) : (
            <button 
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[450px] h-[50px] sm:h-[54px] md:h-[58px] lg:h-[56px] xl:h-[58px] rounded-[25px] sm:rounded-[27px] md:rounded-[29px] lg:rounded-[28px] xl:rounded-[29px] bg-white text-black text-[14px] sm:text-[15px] md:text-[16px] lg:text-[15px] xl:text-[16px] font-bold uppercase cursor-pointer flex items-center justify-center px-8"
            >
              BUY YOUR TICKET
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-black flex items-center justify-center" style={{ minHeight: '100svh' }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
