"use client";

import React, { useEffect, useState, useCallback } from "react";
import { IconLogout, IconMap2, IconSearch, IconNetwork, IconDatabase, IconCode, IconCpu, IconBrandOpenai, IconSparkles, IconX, IconBrandGithub, IconPlus } from "@tabler/icons-react";
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Graph State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Selection State
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  // Repository State
  const [repos, setRepos] = useState<any[]>([]);
  const [activeRepository, setActiveRepository] = useState<any>(null);

  // Import Repo Form State
  const [isImporting, setIsImporting] = useState(false);
  const [repoFullName, setRepoFullName] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [importError, setImportError] = useState("");

  // 1. Fetch User & Repos
  useEffect(() => {
    fetch("http://localhost:8080/api/v1/auth/me", { credentials: "include" })
    .then(res => {
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    })
    .then(data => {
      setUser(data);
      return fetch("http://localhost:8080/api/v1/repos", { credentials: "include" });
    })
    .then(res => res.json())
    .then(repoData => {
      setRepos(repoData);
      if (repoData && repoData.length > 0) {
        setActiveRepository(repoData[0]);
      }
      setLoading(false);
    })
    .catch(() => {
      window.location.href = "/unauthorized";
    });
  }, []);

  // 2. Fetch Graph when Active Repo changes
  useEffect(() => {
    if (!activeRepository) return;

    fetch(`http://localhost:8080/api/v1/repos/${activeRepository.id}/graph`, { credentials: "include" })
    .then(res => res.json())
    .then(graphData => {
      if (!graphData.nodes) return;
      
      // Transform backend nodes to ReactFlow nodes
      const rfNodes = graphData.nodes.map((n: any, i: number) => {
        // Assign color based on type
        let bg = "#f6f8fa"; let border = "#d0d7de"; let color = "#24292f";
        if (n.type === "CLASS" || n.type === "FILE") { bg = "#fdf4ff"; border = "#f0abfc"; color = "#86198f"; }
        if (n.type === "INTERFACE") { bg = "#e1effe"; border = "#76a9fa"; color = "#1e429f"; }
        
        return {
          id: n.id,
          type: "default",
          data: { label: n.name, fullData: n },
          // Very simple grid layout since backend doesn't provide X/Y
          position: { x: (i % 5) * 200 + 50, y: Math.floor(i / 5) * 150 + 50 },
          style: { background: bg, color: color, border: `1px solid ${border}`, borderRadius: "8px", fontWeight: 600, padding: "10px" }
        };
      });

      // Transform backend edges to ReactFlow edges
      const rfEdges = graphData.edges.map((e: any, i: number) => ({
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: '#9ca3af' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af' }
      }));

      setNodes(rfNodes);
      setEdges(rfEdges);
    })
    .catch(err => console.error("Failed to load graph", err));
  }, [activeRepository, setNodes, setEdges]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/v1/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    } catch (err) {}
  };

  const handleImportRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    setIsImporting(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: repoFullName, accessToken: githubToken }),
        credentials: "include"
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to import repository");
      }
      const newRepo = await res.json();
      setRepos([...repos, newRepo]);
      setActiveRepository(newRepo);
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setIsImporting(false);
    }
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
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#57606a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Repositories</span>
            <button onClick={() => setActiveRepository(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}><IconPlus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
            {repos.map(r => (
              <button 
                key={r.id} 
                onClick={() => setActiveRepository(r)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', 
                  backgroundColor: activeRepository?.id === r.id ? '#e1effe' : 'transparent',
                  color: activeRepository?.id === r.id ? '#1e429f' : '#57606a',
                  border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeRepository?.id === r.id ? 600 : 400
                }}
              >
                <IconCode size={16} /> {r.name}
              </button>
            ))}
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

      {/* 2. CENTER PANEL: Interactive Graph OR Empty State */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {activeRepository ? (
          <>
            <header style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Codebase Graph: {activeRepository.name}</div>
              <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: '#e1effe', color: '#1e429f', fontWeight: 600 }}>Classes / Interfaces</span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: '#fdf4ff', color: '#86198f', fontWeight: 600 }}>Services</span>
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
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8fa' }}>
            <div style={{ textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #d0d7de', maxWidth: '500px', width: '100%' }}>
              <IconBrandGithub size={48} color="#d0d7de" style={{ marginBottom: '1.5rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem', color: '#24292f' }}>Import Repository</h2>
              <p style={{ color: '#57606a', marginBottom: '2rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Connect a GitHub repository to parse its architecture. Atlas will extract symbols, classes, and dependencies to generate your interactive map.
              </p>
              
              <form onSubmit={handleImportRepo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                {importError && <div style={{ color: 'red', fontSize: '0.85rem', textAlign: 'center', backgroundColor: '#ffebe9', padding: '0.5rem', borderRadius: '6px' }}>{importError}</div>}
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Repository Full Name</label>
                  <input type="text" placeholder="e.g. spring-projects/spring-petclinic" value={repoFullName} onChange={e => setRepoFullName(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>GitHub Access Token (Optional for public)</label>
                  <input type="password" placeholder="ghp_xxxxxxxxxxxx" value={githubToken} onChange={e => setGithubToken(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem' }} />
                </div>

                <button 
                  type="submit"
                  disabled={isImporting}
                  style={{
                    backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 600, cursor: isImporting ? 'not-allowed' : 'pointer', marginTop: '0.5rem', opacity: isImporting ? 0.7 : 1
                  }}
                >
                  {isImporting ? 'Importing...' : 'Parse Codebase'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* 3. RIGHT PANEL: Inspector / AI Analysis */}
      {activeRepository && selectedNode && (
        <aside style={{ width: '300px', backgroundColor: 'white', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 10, boxShadow: '-4px 0 16px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Inspector</div>
            <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a' }}>
              <IconX size={18} />
            </button>
          </div>

          <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#57606a', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{selectedNode.data.fullData?.type || "Symbol"}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, wordBreak: 'break-all' }}>{selectedNode.data.label}</div>
              <div style={{ fontSize: '0.85rem', color: '#8c959f', marginTop: '0.25rem' }}>{selectedNode.data.fullData?.filePath || "No path"}</div>
            </div>

            <div style={{ marginBottom: '1.5rem', backgroundColor: '#f6f8fa', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: '#57606a', fontWeight: 600, marginBottom: '0.5rem' }}>RELATIONSHIPS</div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#cf222e' }}>↑</span> Used by dependents
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#2da44e' }}>↓</span> Depends on
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
                This is <strong>{selectedNode.data.label}</strong>. We can interrogate the backend AI agent to explain exactly why this node exists.
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
