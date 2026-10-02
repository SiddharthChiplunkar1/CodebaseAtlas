"use client";

import React from 'react';
import ReactFlow, { Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: '' }, style: { width: 10, height: 10, borderRadius: '50%', background: '#0969da', border: 'none' } },
  { id: '2', position: { x: 300, y: 50 }, data: { label: '' }, style: { width: 15, height: 15, borderRadius: '50%', background: '#cf222e', border: 'none' } },
  { id: '3', position: { x: 500, y: 150 }, data: { label: '' }, style: { width: 8, height: 8, borderRadius: '50%', background: '#2da44e', border: 'none' } },
  { id: '4', position: { x: 200, y: 300 }, data: { label: '' }, style: { width: 20, height: 20, borderRadius: '50%', background: '#8250df', border: 'none' } },
  { id: '5', position: { x: 450, y: 350 }, data: { label: '' }, style: { width: 12, height: 12, borderRadius: '50%', background: '#bf8700', border: 'none' } },
  { id: '6', position: { x: 700, y: 200 }, data: { label: '' }, style: { width: 14, height: 14, borderRadius: '50%', background: '#0969da', border: 'none' } },
  { id: '7', position: { x: 800, y: 400 }, data: { label: '' }, style: { width: 10, height: 10, borderRadius: '50%', background: '#cf222e', border: 'none' } },
  { id: '8', position: { x: 150, y: 500 }, data: { label: '' }, style: { width: 18, height: 18, borderRadius: '50%', background: '#2da44e', border: 'none' } },
  { id: '9', position: { x: 600, y: 500 }, data: { label: '' }, style: { width: 8, height: 8, borderRadius: '50%', background: '#8250df', border: 'none' } },
  { id: '10', position: { x: -50, y: 200 }, data: { label: '' }, style: { width: 12, height: 12, borderRadius: '50%', background: '#bf8700', border: 'none' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e1-4', source: '1', target: '4', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e2-3', source: '2', target: '3', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e4-5', source: '4', target: '5', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e3-6', source: '3', target: '6', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e6-7', source: '6', target: '7', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e5-9', source: '5', target: '9', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e4-8', source: '4', target: '8', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e1-10', source: '1', target: '10', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e10-4', source: '10', target: '4', style: { stroke: '#d0d7de', strokeWidth: 1 } },
  { id: 'e7-9', source: '7', target: '9', style: { stroke: '#d0d7de', strokeWidth: 1 } },
];

export default function GraphBackground() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#ccc" gap={30} size={1} />
      </ReactFlow>
      {/* Soft gradient overlay to fade edges */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(246,248,250,0) 30%, rgba(246,248,250,1) 80%)' }} />
    </div>
  );
}
