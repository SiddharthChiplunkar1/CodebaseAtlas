"use client";

import React, { useEffect, useState, useCallback } from "react";
import { IconLogout, IconMap2, IconSearch, IconNetwork, IconCode, IconCpu, IconBrandOpenai, IconSparkles, IconX, IconBrandGithub, IconPlus } from "@tabler/icons-react";
import * as d3 from 'd3-force';
import ReactFlow, { Background, BackgroundVariant, Controls, MiniMap, useNodesState, useEdgesState, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

// Node visual config per type (light mode)
const NODE_STYLES: Record<string, { bg: string; border: string; color: string; label: string }> = {
  CLASS:     { bg: "#fdf4ff", border: "#d8b4fe", color: "#7e22ce", label: "Class" },
  INTERFACE: { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8", label: "Interface" },
  FUNCTION:  { bg: "#f0fdf4", border: "#86efac", color: "#15803d", label: "Function" },
  FILE:      { bg: "#fffbeb", border: "#fcd34d", color: "#92400e", label: "File" },
  ROUTE:     { bg: "#fff1f2", border: "#fca5a5", color: "#b91c1c", label: "Route" },
  TEST:      { bg: "#f0fdfa", border: "#5eead4", color: "#0f766e", label: "Test" },
};

// Edge visual config per type
const EDGE_STYLES: Record<string, { stroke: string; strokeWidth: number; strokeDasharray?: string; label: string }> = {
  CALLS:      { stroke: "#9ca3af", strokeWidth: 1,   label: "calls" },
  EXTENDS:    { stroke: "#f87171", strokeWidth: 2,   label: "extends" },
  IMPLEMENTS: { stroke: "#60a5fa", strokeWidth: 2, strokeDasharray: "6 3", label: "implements" },
  IMPORTS:    { stroke: "#fbbf24", strokeWidth: 1, strokeDasharray: "3 3", label: "imports" },
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGraphLoading, setIsGraphLoading] = useState(false);

  // Graph State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Selection State
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  // Impact State
  const [impactReport, setImpactReport] = useState<any>(null);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  
  // Repository State
  const [repos, setRepos] = useState<any[]>([]);
  const [activeRepository, setActiveRepository] = useState<any>(null);

  // View State (all, classes, services)
  const [viewMode, setViewMode] = useState<string>("all");

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
        // Auto-select the first READY repository, or just the first one
        const readyRepo = repoData.find((r: any) => r.status === 'READY');
        setActiveRepository(readyRepo || repoData[0]);
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

    let pollingInterval: NodeJS.Timeout;

    const fetchGraph = () => {
      setIsGraphLoading(true);
      fetch(`http://localhost:8080/api/v1/repos/${activeRepository.id}/graph`, { credentials: "include" })
      .then(res => res.json())
      .then(graphData => {
        if (!graphData.nodes) return;
        
        // Deduplicate nodes by name
        const uniqueNodesMap = new Map();
        const idReplacements = new Map();

        graphData.nodes.forEach((n: any) => {
          if (!uniqueNodesMap.has(n.name)) {
            uniqueNodesMap.set(n.name, n);
            idReplacements.set(n.id, n.id);
          } else {
            idReplacements.set(n.id, uniqueNodesMap.get(n.name).id);
          }
        });

        const deduplicatedNodes = Array.from(uniqueNodesMap.values());
        
        // Filter based on viewMode
        const filteredNodes = deduplicatedNodes.filter((n: any) => {
          if (viewMode === "classes") return n.type === "CLASS" || n.type === "INTERFACE";
          if (viewMode === "services") {
            // Match Spring stereotypes by name convention — SERVICE type or common suffixes
            const name = n.name.toLowerCase();
            return (n.type === "CLASS" || n.type === "INTERFACE") && (
              name.endsWith("service") || name.endsWith("controller") ||
              name.endsWith("repository") || name.endsWith("handler") ||
              name.endsWith("manager") || name.endsWith("facade") ||
              name.endsWith("gateway") || name.endsWith("adapter") ||
              n.type === "ROUTE"
            );
          }
          return true;
        });

        const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

        // Count connections per node for degree-based sizing
        const degreeMap = new Map<string, number>();
        graphData.edges.forEach((e: any) => {
          const src = idReplacements.get(e.source);
          const tgt = idReplacements.get(e.target);
          if (src) degreeMap.set(src, (degreeMap.get(src) || 0) + 1);
          if (tgt) degreeMap.set(tgt, (degreeMap.get(tgt) || 0) + 1);
        });
        const maxDegree = Math.max(1, ...Array.from(degreeMap.values()));

        const rfNodes = filteredNodes.map((n: any, i: number) => {
          const style = NODE_STYLES[n.type] || { bg: "#1a1a2e", border: "#4b5563", color: "#d1d5db", label: n.type };
          const degree = degreeMap.get(n.id) || 0;
          // Scale node width between 120px and 200px based on degree
          const nodeWidth = 120 + Math.round((degree / maxDegree) * 80);

          return {
            id: n.id,
            type: "default",
            data: { label: n.name, fullData: n, degree },
            position: { x: (i % 5) * 200 + 50, y: Math.floor(i / 5) * 150 + 50 },
            style: {
              background: style.bg,
              color: style.color,
              border: `1.5px solid ${style.border}`,
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.78rem",
              padding: "8px 10px",
              width: `${nodeWidth}px`,
              boxShadow: `0 0 8px ${style.border}33`,
            }
          };
        });

        const rfEdges = graphData.edges
          .map((e: any, i: number) => {
            const es = EDGE_STYLES[e.edgeType] || EDGE_STYLES.CALLS;
            return {
              id: `e-${i}`,
              source: idReplacements.get(e.source),
              target: idReplacements.get(e.target),
              edgeType: e.edgeType,
              animated: false,
              style: { stroke: es.stroke, strokeWidth: es.strokeWidth, strokeDasharray: es.strokeDasharray || undefined, opacity: 0.7 },
              markerEnd: { type: MarkerType.ArrowClosed, color: es.stroke }
            };
          })
          .filter((e: any) => e.source !== e.target && filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

        // Yield to the event loop so the loading spinner can render before the heavy D3 calculation
        setTimeout(() => {
          // Deep clone edges for d3 so it doesn't mutate the ReactFlow edge objects
          const d3Edges = rfEdges.map((e: any) => ({ ...e }));

          // Use D3 Force Directed Graph to statically compute a beautiful organic layout
          const simulation = d3.forceSimulation(rfNodes as any)
            .force("charge", d3.forceManyBody().strength(-800))
            .force("center", d3.forceCenter(0, 0))
            .force("collide", d3.forceCollide().radius(120))
            .force("link", d3.forceLink(d3Edges as any).id((d: any) => d.id).distance(180));

          // Fast-forward the simulation to its end state
          simulation.tick(500);

          rfNodes.forEach((node: any) => {
            node.position = { x: node.x, y: node.y };
            // Remove d3 properties to avoid contaminating ReactFlow state
            delete node.x;
            delete node.y;
            delete node.vx;
            delete node.vy;
            delete node.index;
          });

          setNodes(rfNodes);
          setEdges(rfEdges);
          setIsGraphLoading(false);
        }, 50);
      })
      .catch(err => {
        console.error("Failed to load graph", err);
        setIsGraphLoading(false);
      });
    };

    if (activeRepository.status === 'READY') {
      fetchGraph();
    } else if (activeRepository.status === 'PENDING') {
      // Poll repository status every 5 seconds
      pollingInterval = setInterval(() => {
        fetch(`http://localhost:8080/api/v1/repos/${activeRepository.id}`, { credentials: "include" })
        .then(res => res.json())
        .then(repo => {
          if (repo.status === 'READY' || repo.status === 'FAILED') {
            clearInterval(pollingInterval);
            // Update repo in list and active state
            setRepos(prev => prev.map(r => r.id === repo.id ? repo : r));
            setActiveRepository(repo);
          }
        });
      }, 5000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [activeRepository, viewMode, setNodes, setEdges, setRepos]);

  // Handle Graph Interaction Highlighting
  useEffect(() => {
    if (!selectedNode) {
      // Reset all styles back to their type-based defaults
      setNodes((nds) => nds.map((n) => {
        const nodeType = n.data?.fullData?.type || "";
        const s = NODE_STYLES[nodeType] || { border: "#4b5563" };
        return { ...n, style: { ...n.style, opacity: 1, boxShadow: `0 0 8px ${s.border}33` } };
      }));
      setEdges((eds) => eds.map((e) => {
        const es = EDGE_STYLES[(e as any).edgeType] || EDGE_STYLES.CALLS;
        return { ...e, animated: false, style: { ...e.style, opacity: 0.7, stroke: es.stroke, strokeWidth: es.strokeWidth } };
      }));
      return;
    }

    let highlightIds = new Set<string>();

    if (impactReport) {
      highlightIds = new Set([
        selectedNode.id,
        ...(impactReport.directCallers || []),
        ...(impactReport.indirectCallers || []),
        ...(impactReport.affectedTests || []),
        ...(impactReport.affectedApiRoutes || [])
      ]);
    } else {
      highlightIds = new Set([selectedNode.id]);
      edges.forEach(e => {
        if (e.source === selectedNode.id) highlightIds.add(e.target);
        if (e.target === selectedNode.id) highlightIds.add(e.source);
      });
    }

    setNodes((nds) => nds.map((n) => {
      const isHighlighted = highlightIds.has(n.id);
      const nodeType = n.data?.fullData?.type || "";
      const s = NODE_STYLES[nodeType] || { border: "#4b5563" };
      let boxShadow = isHighlighted ? `0 0 12px ${s.border}` : 'none';
      if (impactReport) {
        if (n.id === selectedNode.id) boxShadow = '0 0 0 3px #60a5fa, 0 0 16px #60a5fa66';
        else if (impactReport.directCallers?.includes(n.id)) boxShadow = '0 0 0 3px #f87171';
        else if (impactReport.indirectCallers?.includes(n.id)) boxShadow = '0 0 0 2px #6b7280';
        else if (impactReport.affectedTests?.includes(n.id)) boxShadow = '0 0 0 3px #34d399';
        else if (impactReport.affectedApiRoutes?.includes(n.id)) boxShadow = '0 0 0 3px #c084fc';
      }
      return { ...n, style: { ...n.style, opacity: isHighlighted ? 1 : 0.12, boxShadow } };
    }));

    setEdges((eds) => eds.map((e) => {
      const isHighlighted = highlightIds.has(e.source) && highlightIds.has(e.target);
      const es = EDGE_STYLES[(e as any).edgeType] || EDGE_STYLES.CALLS;
      const highlightColor = impactReport ? '#f87171' : '#60a5fa';
      return {
        ...e,
        animated: isHighlighted,
        style: {
          ...e.style,
          opacity: isHighlighted ? 1 : 0.04,
          stroke: isHighlighted ? highlightColor : es.stroke,
          strokeWidth: isHighlighted ? 2 : es.strokeWidth,
          strokeDasharray: isHighlighted ? undefined : es.strokeDasharray
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: isHighlighted ? highlightColor : es.stroke }
      };
    }));
  }, [selectedNode, impactReport, setNodes, setEdges]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/v1/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    } catch (err) {}
  };

  const handleTraceImpact = async () => {
    if (!activeRepository || !selectedNode) return;
    setIsImpactLoading(true);
    setImpactReport(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/repos/${activeRepository.id}/impact/${selectedNode.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch impact");
      const data = await res.json();
      setImpactReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsImpactLoading(false);
    }
  };

  const handleImportRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    setIsImporting(true);
    
    // Auto-format GitHub URLs to just owner/repo
    let formattedName = repoFullName.trim();
    if (formattedName.includes('github.com/')) {
      formattedName = formattedName.split('github.com/')[1];
    }
    if (formattedName.endsWith('.git')) {
      formattedName = formattedName.slice(0, -4);
    }
    // Remove any trailing slashes or path segments after the repo name
    formattedName = formattedName.split('/').slice(0, 2).join('/');

    try {
      const res = await fetch("http://localhost:8080/api/v1/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formattedName, accessToken: githubToken }),
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
    setImpactReport(null);
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
          <div 
            onClick={() => window.location.href = '/coming-soon'} 
            style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.4rem 0.75rem', cursor: 'pointer' }}
          >
            <IconSearch size={16} color="#8c959f" />
            <input type="text" placeholder="Search repository... ⌘K" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', marginLeft: '0.5rem', cursor: 'pointer' }} readOnly />
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
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', 
                  backgroundColor: activeRepository?.id === r.id ? '#e1effe' : 'transparent',
                  color: activeRepository?.id === r.id ? '#1e429f' : '#57606a',
                  border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeRepository?.id === r.id ? 600 : 400
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IconCode size={16} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{r.name}</span>
                </div>
                {r.status === 'PENDING' && <span style={{ fontSize: '0.65rem', backgroundColor: '#fff8c5', color: '#9a6700', padding: '0.1rem 0.3rem', borderRadius: '10px', fontWeight: 600 }}>SYNCING</span>}
                {r.status === 'FAILED' && <span style={{ fontSize: '0.65rem', backgroundColor: '#ffebe9', color: '#cf222e', padding: '0.1rem 0.3rem', borderRadius: '10px', fontWeight: 600 }}>ERROR</span>}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#57606a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Architecture Views</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button onClick={() => setViewMode("all")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', backgroundColor: viewMode === 'all' ? 'var(--hover)' : 'transparent', color: 'var(--foreground)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: viewMode === 'all' ? 600 : 500, fontSize: '0.9rem' }}>
              <IconNetwork size={18} /> System Map (All)
            </button>
            <button onClick={() => setViewMode("classes")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', backgroundColor: viewMode === 'classes' ? 'var(--hover)' : 'transparent', color: 'var(--foreground)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: viewMode === 'classes' ? 600 : 500, fontSize: '0.9rem' }}>
              <IconCode size={18} /> Class Diagram
            </button>
            <button onClick={() => setViewMode("services")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', backgroundColor: viewMode === 'services' ? 'var(--hover)' : 'transparent', color: 'var(--foreground)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: viewMode === 'services' ? 600 : 500, fontSize: '0.9rem' }}>
              <IconCpu size={18} /> Services Diagram
            </button>
            <button onClick={() => window.location.href = '/coming-soon'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', color: '#57606a', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left', fontWeight: 500, fontSize: '0.9rem' }}>
              <IconBrandOpenai size={18} /> Ask Atlas
            </button>
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
            {/* Floating graph header */}
            <header style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#24292f' }}>Codebase Graph: <span style={{ color: '#0969da' }}>{activeRepository.name}</span></div>
              <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)' }}></div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {Object.entries(NODE_STYLES).map(([type, s]) => (
                  <span key={type} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 600 }}>{s.label}</span>
                ))}
              </div>
            </header>

            {/* Floating edge legend */}
            <div style={{ position: 'absolute', bottom: '4.5rem', left: '1rem', zIndex: 10, background: 'white', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#57606a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Edges</div>
              {Object.entries(EDGE_STYLES).map(([type, es]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke={es.stroke} strokeWidth={es.strokeWidth} strokeDasharray={es.strokeDasharray} /></svg>
                  <span style={{ fontSize: '0.7rem', color: '#57606a' }}>{es.label}</span>
                </div>
              ))}
            </div>

            {/* Node/edge count badge */}
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'white', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontSize: '0.75rem', color: '#57606a' }}>
              <span style={{ color: '#0969da', fontWeight: 700 }}>{nodes.length}</span> nodes &nbsp;&middot;&nbsp; <span style={{ color: '#2da44e', fontWeight: 700 }}>{edges.length}</span> edges
            </div>
            
            {activeRepository.status === 'PENDING' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8fa' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e1e4e8', borderTopColor: '#0969da', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#24292f' }}>Parsing Codebase...</h3>
                <p style={{ color: '#57606a', marginTop: '0.5rem' }}>Atlas is currently traversing the AST and extracting graph nodes.</p>
              </div>
            ) : activeRepository.status === 'FAILED' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8fa' }}>
                <div style={{ color: '#cf222e', marginBottom: '1rem' }}><IconX size={48} /></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#24292f' }}>Parsing Failed</h3>
                <p style={{ color: '#57606a', marginTop: '0.5rem' }}>Atlas encountered an error while parsing this repository.</p>
              </div>
            ) : isGraphLoading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8fa' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e1e4e8', borderTopColor: '#0969da', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#24292f' }}>Rendering Architecture...</h3>
                <p style={{ color: '#57606a', marginTop: '0.5rem' }}>Computing force-directed cluster layout.</p>
              </div>
            ) : nodes.length === 0 ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8fa' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#24292f' }}>No nodes found</h3>
                <p style={{ color: '#57606a', marginTop: '0.5rem' }}>This architecture view is empty for the current codebase.</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow 
                  key={viewMode}
                  nodes={nodes} 
                  edges={edges} 
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  onPaneClick={() => setSelectedNode(null)}
                  fitView
                  attributionPosition="bottom-right"
                >
                  <Background color="#d0d7de" gap={20} variant={BackgroundVariant.Dots} />
                  <Controls />
                  <MiniMap 
                    style={{ border: '1px solid var(--border)', borderRadius: '8px' }}
                    nodeColor={(n) => {
                      const nodeType = n.data?.fullData?.type || "";
                      return NODE_STYLES[nodeType]?.border || "#d0d7de";
                    }}
                  />
                </ReactFlow>
              </div>
            )}
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
      {activeRepository && selectedNode && (() => {
        const fd = selectedNode.data.fullData || {};
        const nodeStyle = NODE_STYLES[fd.type] || { bg: '#f6f8fa', border: '#d0d7de', color: '#24292f', label: fd.type || 'Symbol' };
        const incomingEdges = edges.filter(e => e.target === selectedNode.id);
        const outgoingEdges = edges.filter(e => e.source === selectedNode.id);
        return (
          <aside style={{ width: '300px', backgroundColor: 'white', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 10, boxShadow: '-4px 0 16px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: nodeStyle.bg, color: nodeStyle.color, border: `1px solid ${nodeStyle.border}` }}>{nodeStyle.label}</span>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#24292f' }}>Inspector</div>
              </div>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a' }}>
                <IconX size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Node name & location */}
              <div style={{ padding: '1rem', background: '#f6f8fa', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: nodeStyle.color, wordBreak: 'break-all', marginBottom: '0.5rem' }}>{selectedNode.data.label}</div>
                {fd.filePath && (
                  <div style={{ fontSize: '0.75rem', color: '#57606a', fontFamily: 'monospace', lineHeight: 1.6 }}>
                    {fd.filePath}
                    {fd.startLine && <span style={{ color: '#0969da' }}> :{fd.startLine}{fd.endLine && fd.endLine !== fd.startLine ? `-${fd.endLine}` : ''}</span>}
                  </div>
                )}
                {fd.language && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#57606a' }}>Language: <span style={{ color: '#24292f', fontWeight: 600 }}>{fd.language}</span></div>
                )}
              </div>

              {/* Connections */}
              <div style={{ padding: '1rem', background: '#f6f8fa', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.7rem', color: '#57606a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Connections</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#cf222e' }}>{incomingEdges.length}</div>
                    <div style={{ fontSize: '0.65rem', color: '#57606a' }}>incoming</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2da44e' }}>{outgoingEdges.length}</div>
                    <div style={{ fontSize: '0.65rem', color: '#57606a' }}>outgoing</div>
                  </div>
                </div>

                {/* Edge type breakdown */}
                {['CALLS','EXTENDS','IMPLEMENTS','IMPORTS'].map(etype => {
                  const count = [...incomingEdges, ...outgoingEdges].filter(e => (e as any).edgeType === etype).length;
                  if (count === 0) return null;
                  const es = EDGE_STYLES[etype];
                  return (
                    <div key={etype} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke={es.stroke} strokeWidth={es.strokeWidth} strokeDasharray={es.strokeDasharray} /></svg>
                        <span style={{ fontSize: '0.75rem', color: '#57606a' }}>{es.label}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: es.stroke }}>{count}</span>
                    </div>
                  );
                })}

                {!impactReport ? (
                  <button onClick={handleTraceImpact} disabled={isImpactLoading} style={{ marginTop: '0.75rem', width: '100%', padding: '0.45rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: isImpactLoading ? 'not-allowed' : 'pointer', opacity: isImpactLoading ? 0.7 : 1, color: '#24292f' }}>
                    {isImpactLoading ? 'Tracing...' : 'Trace Impact'}
                  </button>
                ) : (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[{label:'Direct Callers', val: impactReport.directCallers?.length || 0, color:'#cf222e'},{label:'Indirect Impact', val: impactReport.indirectCallers?.length || 0, color:'#57606a'},{label:'Affected Tests', val: impactReport.affectedTests?.length || 0, color:'#2da44e'},{label:'Affected Routes', val: impactReport.affectedApiRoutes?.length || 0, color:'#8250df'}].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#57606a' }}>{row.label}</span>
                        <span style={{ fontWeight: 700, color: row.color }}>{row.val}</span>
                      </div>
                    ))}
                    <button onClick={() => setImpactReport(null)} style={{ marginTop: '0.25rem', width: '100%', padding: '0.4rem', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', color: '#57606a' }}>Clear</button>
                  </div>
                )}
              </div>

              {/* AI Analysis placeholder */}
              <div style={{ backgroundColor: '#fcfaff', borderRadius: '8px', padding: '1rem', border: '1px solid #e1d4ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#8250df' }}>
                  <IconSparkles size={14} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>AI Analysis</span>
                </div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#57606a' }}>
                  Ask Atlas can explain <strong style={{ color: '#8250df' }}>{selectedNode.data.label}</strong> — its purpose, callers, and change risk. Coming soon.
                </p>
              </div>
            </div>
          </aside>
        );
      })()}
    </div>
  );
}
