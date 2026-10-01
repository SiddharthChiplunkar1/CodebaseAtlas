"use client";

import React from "react";
import Link from "next/link";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <IconAlertTriangle size={64} color="#d2a8ff" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.04em' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
          Node Not Found
        </h2>
        <p style={{ color: '#57606a', marginBottom: '2rem', lineHeight: 1.6 }}>
          We couldn't find the page or node you were looking for in the graph. It might have been deleted, or the path is incorrect.
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 600,
          transition: 'background-color 0.2s'
        }}>
          Return to Map
        </Link>
      </div>
    </div>
  );
}
