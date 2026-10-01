import React from "react";
import Link from "next/link";
import { IconShieldLock } from "@tabler/icons-react";
import GraphBackground from "@/components/ui/GraphBackground";

export default function UnauthorizedPage() {
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
      <GraphBackground />

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
          background: '#fff8c5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <IconShieldLock size={40} color="#9a6700" />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', color: '#24292f' }}>
          Access Denied
        </h1>
        <p style={{ color: '#57606a', marginBottom: '2rem', lineHeight: 1.6 }}>
          You do not have the required permissions to view this node. Please sign in with an authorized account to continue.
        </p>
        
        <Link href="/" style={{
          display: 'inline-block',
          backgroundColor: '#0969da',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 600,
          transition: 'background-color 0.2s',
          boxShadow: '0 1px 0 rgba(27,31,36,0.1)'
        }}
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
