"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "./hero/Navbar";
import HeroSection from "./hero/HeroSection";
import PreviewSection from "./hero/PreviewSection";
import HowItWorks from "./hero/HowItWorks";
import Features from "./hero/Features";
import Footer from "./hero/Footer";

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const revealEls = useRef<Element[]>([]);

  //  Init 
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    const saved = localStorage.getItem("canvas-theme");
    if (saved === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  //  Dark mode toggle 
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("canvas-theme", next ? "dark" : "light");
  };

  //  IntersectionObserver — generic reveal 
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    revealEls.current.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const addReveal = (el: Element | null) => {
    if (el && !revealEls.current.includes(el)) revealEls.current.push(el);
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", fontFamily: "'Inter Tight', system-ui, sans-serif", minHeight: "100vh", position: "relative" }}>
      <style>{`
        .nav-link {
          position: relative;
          color: var(--ink) !important;
          text-decoration: none;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 1px;
          background: var(--ink);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .nav-link:hover::after {
          transform: scaleX(1);
        }
        .theme-toggle:hover {
          background: var(--ink) !important;
          color: var(--paper) !important;
          transform: rotate(20deg);
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(46,138,106, 0.55); }
          70% { box-shadow: 0 0 0 10px rgba(46,138,106, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46,138,106, 0); }
        }
      `}</style>

      {/* Grain */}
      <svg className="grain" xmlns="http://www.w3.org/2000/svg">
        <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0" /></filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>

      {/* Corner ticks + rule line */}
      <div style={{ position: "fixed", top: 58, left: 30, width: 12, height: 12, border: "1px solid var(--ink)", zIndex: 25 }} />
      <div style={{ position: "fixed", top: 58, right: 30, width: 12, height: 12, border: "1px solid var(--ink)", zIndex: 25 }} />
      <div style={{ position: "fixed", top: 64, left: 36, right: 36, height: 1, background: "var(--rule, #1B1814)", opacity: 0.7, zIndex: 25 }} />

      <Navbar 
        scrolled={scrolled} 
        isLoggedIn={isLoggedIn} 
        darkMode={darkMode} 
        toggleDark={toggleDark} 
        scrollTo={scrollTo} 
      />

      <HeroSection scrollTo={scrollTo} />
      
      <PreviewSection addReveal={addReveal} />
      
      <HowItWorks addReveal={addReveal} />
      
      <Features addReveal={addReveal} />

      <Footer />
    </div>
  );
}
