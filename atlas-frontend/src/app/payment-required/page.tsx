import React from "react";
import Link from "next/link";
import { IconCreditCard } from "@tabler/icons-react";

export default function PaymentRequiredPage() {
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
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.03, pointerEvents: 'none' }}>
        <defs>
          <pattern id="pay-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pay-grid)" />
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
          background: '#e0eaf5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <IconCreditCard size={40} color="#0969da" />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.04em', color: '#24292f' }}>
          402
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#24292f' }}>
          Payment Required
        </h2>
        <p style={{ color: '#57606a', marginBottom: '2rem', lineHeight: 1.6 }}>
          You've reached the limit of your current plan. Upgrade your Atlas subscription to analyze more repositories and access premium insights.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/" style={{
            display: 'inline-block',
            backgroundColor: 'white',
            color: '#24292f',
            border: '1px solid #d0d7de',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.2s',
            boxShadow: '0 1px 0 rgba(27,31,36,0.04)'
          }}
          >
            Go Back
          </Link>
          
          <Link href="/pricing" style={{
            display: 'inline-block',
            backgroundColor: '#8250df',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'background-color 0.2s',
            boxShadow: '0 1px 0 rgba(27,31,36,0.1)'
          }}
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
