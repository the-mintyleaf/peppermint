"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Position,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Popover, Stack, Text, Anchor, Badge } from "@zetsel/ui";
import { useRouter } from "next/navigation";
import type { AutomationNode, AutomationEdge, NodeType, NodeStatus } from "../../../../module.api";

const NODE_COLORS: Record<NodeType, string> = {
  trigger: "#9ca3af",
  fetch: "#3b82f6",
  ai: "#a855f7",
  template: "#14b8a6",
  branch: "#f59e0b",
  condition: "#f59e0b",
  output: "#22c55e",
};

const STATUS_STYLES: Record<NodeStatus, React.CSSProperties> = {
  ok: {},
  running: { animation: "pulse-border 1.5s infinite", border: "2px solid #3b82f6" },
  pending: { opacity: 0.5 },
  error: { border: "2px solid #ef4444" },
  skipped: { opacity: 0.4 },
};

interface FlowNodeData extends Record<string, unknown> {
  label: string;
  nodeType: NodeType;
  status: NodeStatus;
  meta?: Record<string, unknown>;
}

function AutomationFlowNode({ data }: { data: FlowNodeData }) {
  const router = useRouter();
  const color = NODE_COLORS[data.nodeType];
  const style: React.CSSProperties = {
    background: color + "22",
    border: `2px solid ${color}`,
    borderRadius: 8,
    padding: "8px 12px",
    minWidth: 120,
    textAlign: "center",
    fontSize: 12,
    fontWeight: 500,
    position: "relative",
    ...STATUS_STYLES[data.status],
  };

  const nodeEl = (
    <div style={style}>
      <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
      <div>{data.label}</div>
      {data.status === "error" && (
        <div style={{ color: "#ef4444", fontSize: 10, marginTop: 2 }}>⚠ Error</div>
      )}
      {data.status === "skipped" && (
        <div style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: 10 }}>skipped</div>
      )}
      <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
    </div>
  );

  if (!data.meta) return nodeEl;

  return (
    <Popover width={220} withArrow shadow="sm" position="top">
      <Popover.Target>
        <div style={{ cursor: "pointer" }}>{nodeEl}</div>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs" p="xs">
          {Object.entries(data.meta).map(([k, v]) => (
            <Text key={k} size="xs">
              <strong>{k}:</strong> {String(v)}
            </Text>
          ))}
          {!!data.meta.template_id && (
            <Anchor
              size="xs"
              onClick={() =>
                router.push(`/admin/content/templates/${String(data.meta!.template_id)}/preview`)
              }
            >
              View Template →
            </Anchor>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

const nodeTypes = { automationNode: AutomationFlowNode };

interface AutomationDAGProps {
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}

export function AutomationDAG({ nodes: rawNodes, edges: rawEdges }: AutomationDAGProps) {
  const flowNodes: Node<FlowNodeData>[] = rawNodes.map((n, i) => ({
    id: n.id,
    type: "automationNode",
    position: n.position ?? { x: i * 180, y: 100 },
    data: {
      label: n.label,
      nodeType: n.type,
      status: n.status,
      meta: n.meta,
    },
  }));

  const flowEdges: Edge[] = rawEdges.map((e) => ({
    id: e.id,
    source: e.from,
    target: e.to,
    label: e.label,
    animated: false,
    style: { stroke: "#6b7280" },
  }));

  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [edges, , onEdgesChange] = useEdgesState(flowEdges);

  return (
    <div style={{ height: 340, border: "1px solid var(--mantine-color-default-border)", borderRadius: 8, overflow: "hidden" }}>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
