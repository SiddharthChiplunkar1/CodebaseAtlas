"use client";

import React, { useEffect, useState } from "react";
import { IconLogout, IconMap2, IconFolder, IconSearch, IconChartNetwork, IconMessageCode } from "@tabler/icons-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current authenticated user using the secure HttpOnly cookie
    fetch("http://localhost:8080/api/v1/auth/me", {
      credentials: "include"
    })
    .then(res => {
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    })
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(() => {
      // If not authenticated (401), redirect to unauthorized or home
      window.location.href = "/unauthorized";
    });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/v1/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e1e4e8', borderTopColor: '#0969da', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#f6f8fa', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <IconMap2 size={28} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Atlas Studio</span>
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#57606a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Menu</div>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--hover)', color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600, marginBottom: '0.5rem' }}>
            <IconFolder size={20} color="#57606a" /> My Repositories
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px', color: '#57606a', textDecoration: 'none', fontWeight: 500, marginBottom: '0.5rem' }}>
            <IconChartNetwork size={20} /> Code Graph
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px', color: '#57606a', textDecoration: 'none', fontWeight: 500, marginBottom: '0.5rem' }}>
            <IconSearch size={20} /> Semantic Search
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px', color: '#57606a', textDecoration: 'none', fontWeight: 500, marginBottom: '0.5rem' }}>
            <IconMessageCode size={20} /> AI Chat
          </a>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0969da', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a', padding: '0.5rem' }} title="Logout">
            <IconLogout size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1.5rem 3rem', borderBottom: '1px solid var(--border)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, m: 0 }}>My Repositories</h1>
          <button style={{ backgroundColor: '#2da44e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Import Repository
          </button>
        </header>

        <div style={{ padding: '3rem', flex: 1, backgroundColor: '#f6f8fa' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #d0d7de' }}>
            <IconFolder size={48} color="#d0d7de" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No repositories imported yet</h2>
            <p style={{ color: '#57606a', marginBottom: '2rem' }}>Import a GitHub repository to start generating code graphs and semantic embeddings.</p>
            <button style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              Connect GitHub
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
