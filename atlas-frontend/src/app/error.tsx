"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { IconBug } from "@tabler/icons-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background graph */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.02, pointerEvents: 'none' }}>
        <defs>
          <pattern id="error-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#error-grid)" />
      </svg>

      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
        maxWidth: '500px',
        width: '90%',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#ffebe9',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <IconBug size={40} color="#cf222e" />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.04em', color: '#24292f' }}>
          500
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#24292f' }}>
          System Malfunction
        </h2>
        <p style={{ color: '#57606a', marginBottom: '2rem', lineHeight: 1.6 }}>
          A critical error occurred while rendering the application state. Our engineering nodes have been notified.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => reset()}
            style={{
              backgroundColor: 'white',
              color: '#24292f',
              border: '1px solid #d0d7de',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 0 rgba(27,31,36,0.04)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            Try again
          </button>
          
          <Link href="/" style={{
            display: 'inline-block',
            backgroundColor: '#2da44e',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'background-color 0.2s',
            boxShadow: '0 1px 0 rgba(27,31,36,0.1)'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2c974b')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2da44e')}
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
