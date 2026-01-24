'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';

export default function GatewaySelector() {
  const vid1Ref = useRef<HTMLVideoElement>(null);
  const vid2Ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Preload videos with better performance
    const preloadVideos = async () => {
      if (vid1Ref.current) {
        vid1Ref.current.load();
        // Set video to be ready for playback
        vid1Ref.current.preload = 'auto';
      }
      if (vid2Ref.current) {
        vid2Ref.current.load();
        vid2Ref.current.preload = 'auto';
      }
    };
    preloadVideos();
  }, []);

  const playVideo = (videoRef: React.RefObject<HTMLVideoElement>) => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      // Video is loaded enough to play
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Autoplay was prevented or other error
          console.log('Video play error:', error);
        });
      }
    }
  };

  const stopVideo = (videoRef: React.RefObject<HTMLVideoElement>) => {
    if (videoRef.current) {
      videoRef.current.pause();
      // Don't reset time to allow seamless resume
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    const video = e.currentTarget;
    console.error('Video src:', video.src);
    console.error('Video error code:', video.error?.code);
  };

  return (
    <section className="gateway-splash">
      {/* Main Content */}
      <div className="gateway-container">
        <div className="headline-group">
          <span className="tagline">Turn Solo Traffic Into Social Squads</span>
          <h1>The Social Infrastructure Layer</h1>
          <p>We connect people to experiences they wouldn&apos;t go to alone. Select your organization type to get started.</p>
        </div>

        {/* Selection Grid */}
        <div className="selection-grid">
          {/* Nightlife Card */}
          <Link
            href="/"
            className="event-card card-nightlife"
            onMouseEnter={() => playVideo(vid1Ref)}
            onMouseLeave={() => stopVideo(vid1Ref)}
          >
            <video
              ref={vid1Ref}
              className="video-layer"
              muted
              loop
              playsInline
              preload="auto"
              poster="/assets/placeholders/nightlife-preview-poster.jpg"
              onError={handleVideoError}
              onLoadedData={() => {
                // Video is ready, ensure smooth playback
                if (vid1Ref.current) {
                  vid1Ref.current.playbackRate = 1.0;
                }
              }}
            >
              <source src="/assets/placeholders/nightlife-preview.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="arrow-icon">↗</div>
            <div className="card-overlay">
              <div className="event-title">Nightlife & Clubs</div>
              <div className="event-desc">
                For high-frequency events, weekly parties, local venues, and club nights.
                <ul className="desc-list">
                  <li>Weekly Club Nights</li>
                  <li>Rooftop Events</li>
                  <li>Underground Raves</li>
                </ul>
              </div>
            </div>
          </Link>

          {/* Festival Card */}
          <Link
            href="/?style=festival"
            className="event-card card-festival"
            onMouseEnter={() => playVideo(vid2Ref)}
            onMouseLeave={() => stopVideo(vid2Ref)}
          >
            <video
              ref={vid2Ref}
              className="video-layer"
              muted
              loop
              playsInline
              preload="auto"
              poster="/assets/placeholders/festival-preview-poster.jpg"
              onError={handleVideoError}
              onLoadedData={() => {
                // Video is ready, ensure smooth playback
                if (vid2Ref.current) {
                  vid2Ref.current.playbackRate = 1.0;
                }
              }}
            >
              <source src="/assets/placeholders/festival-preview.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="arrow-icon">↗</div>
            <div className="card-overlay">
              <div className="event-title">Festivals & Travel</div>
              <div className="event-desc">
                For multi-day experiences requiring travel logistics.
                <ul className="desc-list">
                  <li>Major Music Festivals</li>
                  <li>Dance Congresses</li>
                  <li>Destination Events</li>
                </ul>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
