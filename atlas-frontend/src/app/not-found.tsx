"use client";

import React from "react";
import Link from "next/link";
import { IconAlertTriangle } from "@tabler/icons-react";
import GraphBackground from "@/components/ui/GraphBackground";

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
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <GraphBackground />
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <IconAlertTriangle size={64} color="#d2a8ff" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', color: '#24292f' }}>
          Node Not Found
        </h1>
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
