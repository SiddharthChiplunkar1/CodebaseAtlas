import React from "react";
import Link from "next/link";
import { IconClock, IconArrowLeft } from "@tabler/icons-react";
import GraphBackground from "@/components/ui/GraphBackground";

export default function ComingSoon() {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f6f8fa', color: '#24292f', overflow: 'hidden' }}>
      <GraphBackground />
      <div style={{ position: 'relative', zIndex: 10, padding: '3rem 2rem', backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(208, 215, 222, 0.5)', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <IconClock size={48} color="#0969da" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Coming Soon</h1>
        <p style={{ color: '#57606a', marginBottom: '2rem', lineHeight: 1.5, fontSize: '0.95rem' }}>
          This feature is currently under active development. Check back soon for the next Atlas update!
        </p>
        <Link 
          href="/dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f6f8fa', color: '#24292f', border: '1px solid #d0d7de', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
        >
          <IconArrowLeft size={18} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
