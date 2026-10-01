"use client";

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconMap2, IconBuildingCommunity, IconArrowRight, IconGitMerge, IconLayoutDashboard, IconRipple, IconSearch, IconMessageCode, IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="landing-container">
      <header className="header">
        <div className="header-left">
          <div className="logo-container">
            <IconMap2 size={28} />
            <span>Codebase Atlas</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#features" className="nav-link">
                Features
              </a>
            </li>
            <li>
              <Link href="/dashboard" className="nav-link">
                Atlas Studio
              </Link>
            </li>
          </ul>
        </div>
      </header>

      <main className="hero">
        {/* Background Graphic SVG */}
        <svg className="background-graphic" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
          {/* Light background lines */}
          <line x1="70" y1="550" x2="70" y2="750" className="graph-line-light" />
          <line x1="370" y1="150" x2="370" y2="550" className="graph-line-light" />
          
          {/* Main path */}
          <path d="M 370 200 L 370 300 Q 370 320 350 320 L 290 320 Q 270 320 270 340 L 270 500 Q 270 520 250 520 L 190 520 Q 170 520 170 540 L 170 650" className="graph-path" />
          
          {/* Branch paths */}
          <path d="M 270 400 Q 270 420 290 420 L 350 420 Q 370 420 370 440 L 370 500" className="graph-path" />
          <path d="M 170 580 Q 170 600 150 600 L 90 600 Q 70 600 70 620 L 70 700" className="graph-path" />

          {/* Nodes Main Path */}
          {/* N1: 370, 200 Diamond */}
          <g className="node-animate" style={{ transformOrigin: '370px 200px', animationDelay: '0s' }}>
            <polygon points="370,185 385,200 370,215 355,200" className="graph-node node-blue" />
          </g>

          {/* N2: 270, 370 Square */}
          <g className="node-animate" style={{ transformOrigin: '270px 370px', animationDelay: '1s' }}>
            <rect x="255" y="355" width="30" height="30" rx="4" className="graph-node node-blue" />
          </g>

          {/* N3: 270, 460 Diamond */}
          <g className="node-animate" style={{ transformOrigin: '270px 460px', animationDelay: '1.5s' }}>
            <polygon points="270,445 285,460 270,475 255,460" className="graph-node node-blue" />
          </g>

          {/* N4: 170, 560 Triangle */}
          <g className="node-animate" style={{ transformOrigin: '170px 560px', animationDelay: '2s' }}>
            <polygon points="170,545 185,570 155,570" className="graph-node node-green" />
          </g>

          {/* N5: 170, 650 Triangle */}
          <g className="node-animate" style={{ transformOrigin: '170px 650px', animationDelay: '2.5s' }}>
            <polygon points="170,635 185,660 155,660" className="graph-node node-green" />
          </g>

          {/* Nodes Branch 1 */}
          {/* B1-1: 370, 450 Circle purple */}
          <g className="node-animate" style={{ transformOrigin: '370px 450px', animationDelay: '0.5s' }}>
            <circle cx="370" cy="450" r="16" className="graph-node node-purple" />
            <circle cx="370" cy="450" r="4" fill="var(--foreground)" />
          </g>

          {/* B1-2: 370, 500 Circle purple */}
          <g className="node-animate" style={{ transformOrigin: '370px 500px', animationDelay: '1.2s' }}>
            <circle cx="370" cy="500" r="16" className="graph-node node-purple" />
            <circle cx="370" cy="500" r="4" fill="var(--foreground)" />
          </g>

          {/* Nodes Branch 2 */}
          {/* B2-1: 70, 660 Square purple */}
          <g className="node-animate" style={{ transformOrigin: '70px 660px', animationDelay: '2.8s' }}>
            <rect x="55" y="645" width="30" height="30" rx="4" className="graph-node node-purple" />
          </g>

          {/* B2-2: 70, 700 Circle green */}
          <g className="node-animate" style={{ transformOrigin: '70px 700px', animationDelay: '3.5s' }}>
            <circle cx="70" cy="700" r="16" className="graph-node node-green" />
            <circle cx="70" cy="700" r="4" fill="var(--foreground)" />
          </g>
        </svg>

        <div className="hero-content">
          <h1 className="hero-title">
            Built for <span>&gt;_ Developers</span>
          </h1>
          <p className="hero-subtitle">
            Codebase Atlas is the world's most intelligent code mapping platform. Understand any architecture, trace impact instantly, and chat with your codebase. Join the future of development.
          </p>

          <div className="enterprise-section">
            <div className="enterprise-icon">
              <IconLayoutDashboard size={28} />
            </div>
            <div className="enterprise-content">
              <h3>Atlas Studio</h3>
              <p>Jump right into the studio and start mapping your codebase architecture.</p>
              <Link href="/dashboard" className="enterprise-link">
                Start off <IconArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-form-container">
          <div className="card-stack-container">
            {/* SIGN UP CARD */}
            <div className={`auth-card ${!isLogin ? 'front' : 'back'}`}>
              <div className="card-content">
                <div className="signup-header">
                  <IconGitMerge size={24} />
                  <h2>Get started</h2>
                </div>
                
                <form>
                  <div className="form-group-container">
                    <div className="form-line"></div>
                    
                    <div className="form-group">
                      <div className="form-dot"></div>
                      <input type="text" placeholder="Username" />
                    </div>
                    
                    <div className="form-group">
                      <div className="form-dot"></div>
                      <input type="email" placeholder="Email address" />
                    </div>
                    
                    <div className="form-group">
                      <div className="form-dot-hollow"></div>
                      <input type="password" placeholder="Password" />
                    </div>
                  </div>

                  <div className="password-hint">
                    Make sure it's at least 15 characters. <Link href="#">Learn more</Link>.
                  </div>

                  <button type="button" className="submit-btn">
                    Sign up for Atlas
                  </button>

                  <div className="oauth-divider">
                    <span>or continue with</span>
                  </div>

                  <div className="oauth-buttons">
                    <a href="http://localhost:8080/oauth2/authorization/github" className="oauth-btn github" style={{textDecoration: 'none'}}>
                      <IconBrandGithub size={20} />
                      GitHub
                    </a>
                  </div>

                  <div className="terms-text" style={{fontSize: '0.85rem'}}>
                    Already have an account? <span onClick={() => setIsLogin(true)} style={{color: '#0969da', cursor: 'pointer', fontWeight: 600}}>Sign in</span>
                  </div>
                </form>
              </div>
            </div>

            {/* SIGN IN CARD */}
            <div className={`auth-card ${isLogin ? 'front' : 'back'}`}>
              <div className="card-content">
                <div className="signup-header">
                  <IconLayoutDashboard size={24} />
                  <h2>Welcome back</h2>
                </div>
                
                <form>
                  <div className="form-group-container">
                    <div className="form-line" style={{height: '40px'}}></div>
                    
                    <div className="form-group">
                      <div className="form-dot"></div>
                      <input type="email" placeholder="Email address" />
                    </div>
                    
                    <div className="form-group">
                      <div className="form-dot-hollow"></div>
                      <input type="password" placeholder="Password" />
                    </div>
                  </div>

                  <button type="button" className="submit-btn" style={{marginTop: '2rem'}}>
                    Sign in to Atlas
                  </button>

                  <div className="oauth-divider">
                    <span>or continue with</span>
                  </div>

                  <div className="oauth-buttons">
                    <a href="http://localhost:8080/oauth2/authorization/github" className="oauth-btn github" style={{textDecoration: 'none'}}>
                      <IconBrandGithub size={20} />
                      GitHub
                    </a>
                  </div>

                  <div className="terms-text" style={{fontSize: '0.85rem'}}>
                    Don't have an account? <span onClick={() => setIsLogin(false)} style={{color: '#0969da', cursor: 'pointer', fontWeight: 600}}>Sign up</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="features-section">
        {/* Decorative Grid Pattern */}
        <svg className="features-grid-pattern" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.03, pointerEvents: 'none' }}>
          <defs>
            <pattern id="dotGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="var(--foreground)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>

        <div className="features-header" style={{ position: 'relative' }}>
          {/* Left Decorative Graph */}
          <svg width="220" height="60" viewBox="0 0 220 60" style={{ position: 'absolute', top: '0', left: '0', opacity: 0.9, zIndex: 1 }}>
            <path d="M 10 30 L 200 30" fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <path d="M 50 30 Q 70 30 70 15 L 140 15 Q 160 15 160 30" fill="none" stroke="var(--foreground)" strokeWidth="3" />
            <path d="M 100 30 Q 120 30 120 45 L 180 45" fill="none" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="10" cy="30" r="7" fill="var(--node-blue)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="50" cy="30" r="7" fill="var(--node-purple)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="100" cy="30" r="7" fill="var(--node-green)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="140" cy="15" r="7" fill="var(--node-blue)" stroke="var(--foreground)" strokeWidth="3" />
            <rect x="173" y="38" width="14" height="14" rx="2" fill="var(--node-purple)" stroke="var(--foreground)" strokeWidth="3" />
            <polygon points="200,22 208,30 200,38 192,30" fill="var(--node-green)" stroke="var(--foreground)" strokeWidth="3" />
          </svg>

          {/* Right Decorative Graph (Mirrored) */}
          <svg width="220" height="60" viewBox="0 0 220 60" style={{ position: 'absolute', top: '0', right: '0', opacity: 0.9, zIndex: 1, transform: 'scaleX(-1)' }}>
            <path d="M 10 30 L 200 30" fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <path d="M 50 30 Q 70 30 70 15 L 140 15 Q 160 15 160 30" fill="none" stroke="var(--foreground)" strokeWidth="3" />
            <path d="M 100 30 Q 120 30 120 45 L 180 45" fill="none" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="10" cy="30" r="7" fill="var(--node-blue)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="50" cy="30" r="7" fill="var(--node-purple)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="100" cy="30" r="7" fill="var(--node-green)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="140" cy="15" r="7" fill="var(--node-blue)" stroke="var(--foreground)" strokeWidth="3" />
            <rect x="173" y="38" width="14" height="14" rx="2" fill="var(--node-purple)" stroke="var(--foreground)" strokeWidth="3" />
            <polygon points="200,22 208,30 200,38 192,30" fill="var(--node-green)" stroke="var(--foreground)" strokeWidth="3" />
          </svg>

          <h2>Everything you need to understand code</h2>
          <p>Atlas gives you the tools to explore, analyze, and comprehend any codebase in minutes.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <IconLayoutDashboard size={32} />
            </div>
            <h3>Visual Code Map</h3>
            <p>Instantly generate an interactive, visual graph of your architecture. See exactly how functions, classes, and files connect and interact with each other.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <IconRipple size={32} style={{ color: "var(--node-purple)" }} />
            </div>
            <h3>Impact Analysis</h3>
            <p>Know the blast radius before you commit. Instantly discover indirect callers, broken tests, and affected API routes when you change a single function.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <IconSearch size={32} style={{ color: "var(--node-green)" }} />
            </div>
            <h3>Semantic Search</h3>
            <p>Stop grepping for exact matches. Search your codebase using natural language concepts and let our AI embeddings find exactly what you mean.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <IconMessageCode size={32} style={{ color: "var(--primary)" }} />
            </div>
            <h3>Context-Aware AI Chat</h3>
            <p>Talk to an LLM that actually understands your repo. Grounded in your structural graph and vector embeddings for highly accurate, hallucination-free answers.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
