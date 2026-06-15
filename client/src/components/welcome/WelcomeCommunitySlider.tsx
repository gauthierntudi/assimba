import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';

export const WELCOME_CAROUSEL_SLIDE_COUNT = 3;
const SLIDE_COUNT = WELCOME_CAROUSEL_SLIDE_COUNT;
const SWIPE_THRESHOLD = 48;
const AUTOPLAY_INTERVAL_MS = 4500;
const AUTOPLAY_PAUSE_MS = 10000;

const IMAGE_SLIDES = [
  {
    src: '/img/s2.jpg',
    label: 'La passion',
    text: 'Partagez l\u2019émotion du stade avec des milliers de supporters.',
  },
  {
    src: '/img/s3.jpg',
    label: 'L\u2019unité',
    text: 'Une seule équipe, une seule famille, un seul hymne.',
  },
] as const;

const TRACK_SLIDES = [
  SLIDE_COUNT - 1,
  ...Array.from({ length: SLIDE_COUNT }, (_, index) => index),
  0,
] as const;

function toLogicalSlide(trackIndex: number) {
  if (trackIndex === 0) {
    return SLIDE_COUNT - 1;
  }

  if (trackIndex === TRACK_SLIDES.length - 1) {
    return 0;
  }

  return trackIndex - 1;
}

function CommunitySlideCard({ hidden = false }: { hidden?: boolean }) {
  return (
    <article className="welcome-community__card" aria-hidden={hidden || undefined}>
      <div className="welcome-community__stats">
        <p className="welcome-community__label">La communauté</p>
        <div className="welcome-community__figures">
          <p className="welcome-community__count">+2K</p>
          <p className="welcome-community__metric">Supporters.</p>
        </div>
        <p className="welcome-community__caption">Une communauté qui grandit chaque jour</p>
      </div>

      <div className="welcome-community__visual">
        <div className="welcome-community__photo">
          <img src="/img/img01.jpg" alt={hidden ? '' : 'Supporters AS Simba'} />
        </div>
        <p className="welcome-community__quote">
          Rejoignez une communauté de passionnés qui grandit chaque saison.
        </p>
      </div>
    </article>
  );
}

function ImageSlideCard({
  slide,
  hidden = false,
}: {
  slide: (typeof IMAGE_SLIDES)[number];
  hidden?: boolean;
}) {
  return (
    <article
      className="welcome-community__card welcome-community__card--image"
      aria-hidden={hidden || undefined}
    >
      <img src={slide.src} alt="" />
      <div className="welcome-community__overlay">
        <p className="welcome-community__overlay-label">{slide.label}</p>
        <p className="welcome-community__overlay-text">{slide.text}</p>
      </div>
    </article>
  );
}

function renderSlide(slideIndex: number, hidden = false) {
  if (slideIndex === 0) {
    return <CommunitySlideCard hidden={hidden} />;
  }

  return <ImageSlideCard slide={IMAGE_SLIDES[slideIndex - 1]} hidden={hidden} />;
}

type WelcomeCarouselDotsProps = {
  activeSlide: number;
  onSelect: (index: number) => void;
};

function WelcomeCarouselDots({ activeSlide, onSelect }: WelcomeCarouselDotsProps) {
  return (
    <div className="welcome-carousel-dots" role="tablist" aria-label="Carrousel communauté">
      {Array.from({ length: SLIDE_COUNT }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          className={[
            'welcome-carousel-dots__dot',
            index === activeSlide ? 'welcome-carousel-dots__dot--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={`Slide ${index + 1}`}
          aria-selected={index === activeSlide}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}

export function WelcomeCommunityBlock() {
  const [trackIndex, setTrackIndex] = useState(1);
  const [logicalSlide, setLogicalSlide] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const touchStartX = useRef(0);
  const autoplayPausedUntil = useRef(0);
  const resetFrameRef = useRef<number | null>(null);

  const pauseAutoplay = useCallback(() => {
    autoplayPausedUntil.current = Date.now() + AUTOPLAY_PAUSE_MS;
  }, []);

  const resetTrackIndex = useCallback((nextIndex: number) => {
    setTransitionEnabled(false);
    setTrackIndex(nextIndex);
    setLogicalSlide(toLogicalSlide(nextIndex));

    if (resetFrameRef.current !== null) {
      cancelAnimationFrame(resetFrameRef.current);
    }

    resetFrameRef.current = requestAnimationFrame(() => {
      resetFrameRef.current = requestAnimationFrame(() => {
        setTransitionEnabled(true);
        resetFrameRef.current = null;
      });
    });
  }, []);

  const goToTrackIndex = useCallback(
    (nextIndex: number) => {
      pauseAutoplay();
      setTransitionEnabled(true);
      setTrackIndex(nextIndex);
      setLogicalSlide(toLogicalSlide(nextIndex));
    },
    [pauseAutoplay],
  );

  const goToNext = useCallback(() => {
    goToTrackIndex(trackIndex + 1);
  }, [goToTrackIndex, trackIndex]);

  const goToPrev = useCallback(() => {
    goToTrackIndex(trackIndex - 1);
  }, [goToTrackIndex, trackIndex]);

  const goToLogicalSlide = useCallback(
    (index: number) => {
      if (index === logicalSlide) {
        return;
      }

      goToTrackIndex(index + 1);
    },
    [goToTrackIndex, logicalSlide],
  );

  const handleTransitionEnd = () => {
    if (trackIndex === TRACK_SLIDES.length - 1) {
      resetTrackIndex(1);
      return;
    }

    if (trackIndex === 0) {
      resetTrackIndex(SLIDE_COUNT);
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;

    if (delta > SWIPE_THRESHOLD) {
      goToNext();
      return;
    }

    if (delta < -SWIPE_THRESHOLD) {
      goToPrev();
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      if (Date.now() < autoplayPausedUntil.current) {
        return;
      }

      setTransitionEnabled(true);
      setTrackIndex((current) => {
        const next = current + 1;
        setLogicalSlide(toLogicalSlide(next));
        return next;
      });
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    return () => {
      if (resetFrameRef.current !== null) {
        cancelAnimationFrame(resetFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <WelcomeCarouselDots activeSlide={logicalSlide} onSelect={goToLogicalSlide} />

      <section
        className="welcome-community"
        aria-label="La communauté"
        aria-roledescription="carrousel"
      >
        <div
          className="welcome-community__viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={[
              'welcome-community__track',
              transitionEnabled ? '' : 'welcome-community__track--instant',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ transform: `translateX(-${trackIndex * 100}%)` }}
            onTransitionEnd={handleTransitionEnd}
          >
            {TRACK_SLIDES.map((slideIndex, index) => {
              const isClone = index === 0 || index === TRACK_SLIDES.length - 1;

              return (
                <div
                  key={`track-${index}-${slideIndex}`}
                  className="welcome-community__slide"
                  aria-hidden={isClone || undefined}
                >
                  {renderSlide(slideIndex, isClone)}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
