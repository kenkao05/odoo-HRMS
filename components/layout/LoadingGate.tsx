 "use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ScrollFloat from "@/components/react-bits/ScrollFloat";

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // ScrollFloat is a scroll-driven React Bits component. We give the
    // loader its own hidden scroller and move it a little on first paint,
    // so the PeoplePay360 wordmark performs its entrance automatically.
    const scrollTween = gsap.to(scroller, {
      scrollTop: 150,
      duration: 1.15,
      delay: 0.15,
      ease: "power2.inOut",
    });

    const exitTimer = window.setTimeout(() => {
      setExiting(true);
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          scale: 1.015,
          duration: 0.65,
          ease: "power3.inOut",
          onComplete: () => setVisible(false),
        });
      }
    }, 2350);

    return () => {
      scrollTween.kill();
      window.clearTimeout(exitTimer);
    };
  }, []);

  return (
    <>
      {children}
      {visible && (
        <div
          ref={overlayRef}
          className={`pp-loader${exiting ? " pp-loader-exiting" : ""}`}
          aria-label="Loading PeoplePay360"
          role="status"
        >
          <div className="pp-loader-scroller" ref={scrollerRef}>
            <div className="pp-loader-stage">
              <div className="pp-loader-content">
                <div className="pp-loader-kicker">
                  HR &amp; PAYROLL LEDGER
                </div>

                <ScrollFloat
                  animationDuration={1}
                  ease="back.inOut(2)"
                  scrollStart="top bottom"
                  scrollEnd="center center"
                  stagger={0.035}
                  containerClassName="pp-loader-wordmark"
                  textClassName="pp-loader-wordmark-text"
                  scrollContainerRef={scrollerRef}
                >
                  PeoplePay360
                </ScrollFloat>

                <div className="pp-loader-rule" />
                <div className="pp-loader-status">
                  <span className="pp-loader-dot" />
                  Preparing your workspace
                </div>
              </div>
            </div>
          </div>

          <div className="pp-loader-corner">PEOPLEPAY360 / 01</div>
        </div>
      )}
    </>
  );
}
