"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { IconLogout, IconMap2, IconSearch, IconNetwork, IconDatabase, IconCode, IconCpu, IconBrandOpenai, IconSparkles, IconX } from "@tabler/icons-react";
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

// 1. Initial Mock Data for Graph
const initialNodes = [
  {
    id: "api-auth",
    type: "default",
    data: { label: "AuthController (API)" },
    position: { x: 250, y: 50 },
    style: { background: "#e1effe", color: "#1e429f", border: "1px solid #76a9fa", borderRadius: "8px", fontWeight: 600, padding: "10px" }
  },
  {
    id: "srv-auth",
    type: "default",
    data: { label: "AuthService (Service)" },
    position: { x: 250, y: 150 },
    style: { background: "#fdf4ff", color: "#86198f", border: "1px solid #f0abfc", borderRadius: "8px", fontWeight: 600, padding: "10px" }
  },
  {
    id: "repo-user",
    type: "default",
    data: { label: "UserRepository (DB)" },
    position: { x: 150, y: 250 },
    style: { background: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7", borderRadius: "8px", fontWeight: 600, padding: "10px" }
  },
  {
    id: "srv-jwt",
    type: "default",
    data: { label: "JwtService (Security)" },
    position: { x: 350, y: 250 },
    style: { background: "#fefce8", color: "#854d0e", border: "1px solid #fde047", borderRadius: "8px", fontWeight: 600, padding: "10px" }
  }
];

const initialEdges = [
  { id: "e1", source: "api-auth", target: "srv-auth", animated: true, style: { stroke: '#9ca3af' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af' } },
  { id: "e2", source: "srv-auth", target: "repo-user", animated: true, style: { stroke: '#9ca3af' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af' } },
  { id: "e3", source: "srv-auth", target: "srv-jwt", animated: true, style: { stroke: '#9ca3af' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af' } },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Graph State
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Selection State
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    // Fetch authenticated user
    fetch("http://localhost:8080/api/v1/auth/me", { credentials: "include" })
    .then(res => {
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    })
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(() => {
      window.location.href = "/unauthorized";
    });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/v1/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    } catch (err) {}
  };

  const onNodeClick = useCallback((event: any, node: any) => {
    setSelectedNode(node);
  }, []);

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
      {/* 1. LEFT PANEL: Navigation */}
      <aside style={{ width: '250px', backgroundColor: '#f6f8fa', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <IconMap2 size={24} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Atlas Studio</span>
        </div>
        
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.75rem' }}>
            <IconSearch size={16} color="#8c959f" />
            <input type="text" placeholder="Search repository... ⌘K" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', marginLeft: '0.5rem' }} />
          </div>
        </div>

        <nav style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#57606a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Repository Context</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: '4px', color: '#57606a', fontSize: '0.85rem', textDecoration: 'none' }}><IconCode size={16} /> codebase-atlas</a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: '4px', color: '#57606a', fontSize: '0.85rem', textDecoration: 'none', marginLeft: '1rem' }}><IconDatabase size={16} /> DB Schema</a>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#57606a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Architecture Views</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--hover)', color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              <IconNetwork size={18} /> System Map
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', color: '#57606a', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              <IconCpu size={18} /> Services
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', color: '#57606a', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              <IconBrandOpenai size={18} /> Ask Atlas
            </a>
          </div>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0969da', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a' }} title="Logout">
            <IconLogout size={18} />
          </button>
        </div>
      </aside>

      {/* 2. CENTER PANEL: Interactive Graph */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <header style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Codebase Graph</div>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: '#e1effe', color: '#1e429f', fontWeight: 600 }}>API Routes</span>
            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: '#fdf4ff', color: '#86198f', fontWeight: 600 }}>Services</span>
            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: '#ecfdf5', color: '#065f46', fontWeight: 600 }}>Database</span>
          </div>
        </header>

        <div style={{ width: '100%', height: '100%' }}>
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedNode(null)}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#ccc" gap={16} />
            <Controls />
            <MiniMap style={{ border: '1px solid #d0d7de', borderRadius: '8px' }} />
          </ReactFlow>
        </div>
      </main>

      {/* 3. RIGHT PANEL: Inspector / AI Analysis */}
      {selectedNode && (
        <aside style={{ width: '300px', backgroundColor: 'white', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 10, boxShadow: '-4px 0 16px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Inspector</div>
            <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a' }}>
              <IconX size={18} />
            </button>
          </div>

          <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#57606a', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Selected Node</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, wordBreak: 'break-all' }}>{selectedNode.data.label}</div>
              <div style={{ fontSize: '0.85rem', color: '#8c959f', marginTop: '0.25rem' }}>ID: {selectedNode.id}</div>
            </div>

            <div style={{ marginBottom: '1.5rem', backgroundColor: '#f6f8fa', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: '#57606a', fontWeight: 600, marginBottom: '0.5rem' }}>RELATIONSHIPS</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#cf222e' }}>↑</span> Used by 1 module
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#2da44e' }}>↓</span> Depends on 2 modules
              </div>
              
              <button style={{ marginTop: '0.75rem', width: '100%', padding: '0.4rem', background: 'white', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                Trace Impact
              </button>
            </div>

            <div style={{ backgroundColor: '#fcfaff', borderRadius: '8px', padding: '1rem', border: '1px solid #e1d4ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#8250df' }}>
                <IconSparkles size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>AI Analysis</span>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#24292f' }}>
                This is the <strong>{selectedNode.data.label}</strong>. It handles core responsibilities within its bounded context.
                <br /><br />
                <em>"Why does this component exist?"</em>
                <br />
                It abstracts the underlying implementation details and orchestrates downstream dependencies.
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
