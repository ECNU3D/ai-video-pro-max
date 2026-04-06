#!/usr/bin/env python3
"""
Initialize a Remotion project for storyboard diagrams.
Creates the project structure with all necessary components.
"""

import argparse
import subprocess
import os
import json


def init_remotion_project(project_path: str, project_name: str = "storyboard-diagrams"):
    """Initialize a Remotion project for storyboard diagrams."""
    
    full_path = os.path.join(project_path, project_name)
    
    print(f"Creating Remotion project at: {full_path}")
    
    subprocess.run([
        "npx", "create-video@latest", project_name,
        "--template=blank"
    ], cwd=project_path, check=True)
    
    print("Installing dependencies...")
    subprocess.run(["npm", "i"], cwd=full_path, check=True)
    
    print("Installing @remotion/three...")
    subprocess.run(["npx", "remotion", "add", "@remotion/three"], cwd=full_path, check=True)
    
    print("Installing @react-three/drei and three...")
    subprocess.run(["npm", "i", "@react-three/drei", "three"], cwd=full_path, check=True)
    
    src_path = os.path.join(full_path, "src")
    
    files_to_create = {
        "types.ts": TYPES_FILE,
        "TopDownDiagram.tsx": TOPDOWN_DIAGRAM_FILE,
        "shotData.ts": SHOT_DATA_FILE,
    }
    
    for filename, content in files_to_create.items():
        filepath = os.path.join(src_path, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Created: {filepath}")
    
    print("\nProject initialized successfully!")
    print(f"\nTo start: cd {full_path} && npm run dev")


TYPES_FILE = '''export type ShotType = "远景" | "全景" | "中景" | "近景" | "特写" | "大特写";

export type CameraMovement = 
  | "固定" 
  | "推镜头" 
  | "拉镜头" 
  | "缓推" 
  | "跟随" 
  | "环绕"
  | "摇镜头"
  | "升降";

export type ViewType = "俯视图";

export type Position = {
  x: number;
  y: number;
};

export type CameraPosition = {
  start: Position;
  end?: Position;
  fov?: number;
  lookAt?: Position;
};

export type SubjectPosition = {
  id: string;
  label: string;
  start: Position;
  end?: Position;
  color?: string;
  path?: Position[];
};

export type EnvironmentElement = {
  id: string;
  type: "rect" | "circle" | "line" | "polygon" | "text";
  position: Position;
  size?: { width: number; height: number } | { radius: number };
  points?: Position[];
  color?: string;
  label?: string;
  rotation?: number;
};

export type ShotDiagramData = {
  shotNumber: number;
  totalShots: number;
  duration: number;
  shotType: ShotType;
  cameraMovement: CameraMovement;
  viewType: ViewType;
  description: string;
  camera: CameraPosition;
  subjects: SubjectPosition[];
  environment: EnvironmentElement[];
  notes?: string;
};
'''

TOPDOWN_DIAGRAM_FILE = '''import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { ShotDiagramData, Position } from "./types";

const COLORS = {
  background: "#0a0a0f",
  gridLine: "#252540",
  camera: "#ff4444",
  cameraFov: "rgba(255, 68, 68, 0.15)",
  subject: "#44aaff",
  subjectPath: "rgba(68, 170, 255, 0.5)",
  environment: "#3a3a5a",
  environmentFill: "#2a2a4a",
  text: "#ffffff",
  textSecondary: "#888899",
  accent: "#ffaa00",
};

const SCALE = 10;

const TopDownDiagram: React.FC<{ data: ShotDiagramData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const centerX = width / 2;
  const centerY = height / 2;

  const progress = spring({ frame, fps, config: { damping: 200 } });

  const cameraProgress = interpolate(frame, [0, data.duration * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const getInterpolatedPosition = (
    start: Position,
    end: Position | undefined,
    t: number
  ): Position => {
    if (!end) return start;
    return {
      x: interpolate(t, [0, 1], [start.x, end.x]),
      y: interpolate(t, [0, 1], [start.y, end.y]),
    };
  };

  const currentCameraPos = getInterpolatedPosition(
    data.camera.start,
    data.camera.end,
    cameraProgress
  );

  const drawGrid = () => {
    const gridLines: React.ReactNode[] = [];
    const gridSize = 50;
    const gridExtent = 500;

    for (let x = -gridExtent; x <= gridExtent; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={centerX + x}
          y1={centerY - gridExtent}
          x2={centerX + x}
          y2={centerY + gridExtent}
          stroke={COLORS.gridLine}
          strokeWidth={0.5}
        />
      );
    }

    for (let y = -gridExtent; y <= gridExtent; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={centerX - gridExtent}
          y1={centerY + y}
          x2={centerX + gridExtent}
          y2={centerY + y}
          stroke={COLORS.gridLine}
          strokeWidth={0.5}
        />
      );
    }

    return gridLines;
  };

  const drawEnvironment = () => {
    return data.environment.map((el) => {
      const x = centerX + el.position.x * SCALE;
      const y = centerY + el.position.y * SCALE;
      const color = el.color || COLORS.environment;
      const fillColor = el.color || COLORS.environmentFill;

      switch (el.type) {
        case "rect": {
          const size = el.size as { width: number; height: number };
          return (
            <g key={el.id}>
              <rect
                x={x - (size.width * SCALE) / 2}
                y={y - (size.height * SCALE) / 2}
                width={size.width * SCALE}
                height={size.height * SCALE}
                fill={fillColor}
                stroke={color}
                strokeWidth={2}
                opacity={progress}
                rx={4}
              />
              {el.label && (
                <text x={x} y={y} fill={COLORS.text} fontSize={12} textAnchor="middle" dominantBaseline="middle" opacity={progress}>
                  {el.label}
                </text>
              )}
            </g>
          );
        }
        case "circle": {
          const size = el.size as { radius: number };
          return (
            <g key={el.id}>
              <circle cx={x} cy={y} r={size.radius * SCALE} fill={fillColor} stroke={color} strokeWidth={2} opacity={progress} />
              {el.label && (
                <text x={x} y={y} fill={COLORS.text} fontSize={12} textAnchor="middle" dominantBaseline="middle" opacity={progress}>
                  {el.label}
                </text>
              )}
            </g>
          );
        }
        case "line": {
          if (!el.points || el.points.length < 2) return null;
          const pathD = el.points.map((p, i) => {
            const px = centerX + p.x * SCALE;
            const py = centerY + p.y * SCALE;
            return i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`;
          }).join(" ");
          return <path key={el.id} d={pathD} fill="none" stroke={color} strokeWidth={2} opacity={progress} />;
        }
        case "polygon": {
          if (!el.points || el.points.length < 3) return null;
          const pathD = el.points.map((p, i) => {
            const px = centerX + p.x * SCALE;
            const py = centerY + p.y * SCALE;
            return i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`;
          }).join(" ") + " Z";
          return <path key={el.id} d={pathD} fill={fillColor} stroke={color} strokeWidth={2} opacity={progress} />;
        }
        case "text":
          return (
            <text key={el.id} x={x} y={y} fill={color} fontSize={14} textAnchor="middle" dominantBaseline="middle" opacity={progress}>
              {el.label}
            </text>
          );
        default:
          return null;
      }
    });
  };

  const drawSubjectPath = (subject: typeof data.subjects[0]) => {
    if (!subject.end && !subject.path) return null;
    const pathPoints = subject.path || [subject.start, subject.end!];
    const pathD = pathPoints.map((p, i) => {
      const x = centerX + p.x * SCALE;
      const y = centerY + p.y * SCALE;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(" ");

    return (
      <path
        key={`path-${subject.id}`}
        d={pathD}
        fill="none"
        stroke={subject.color || COLORS.subjectPath}
        strokeWidth={3}
        strokeDasharray="8 4"
        opacity={progress * 0.6}
      />
    );
  };

  const drawSubject = (subject: typeof data.subjects[0]) => {
    const currentPos = getInterpolatedPosition(
      subject.start,
      subject.end || subject.path?.[subject.path.length - 1],
      cameraProgress
    );
    const x = centerX + currentPos.x * SCALE;
    const y = centerY + currentPos.y * SCALE;

    return (
      <g key={subject.id}>
        <circle cx={x} cy={y} r={12} fill={subject.color || COLORS.subject} stroke="#ffffff" strokeWidth={2} opacity={progress} />
        <text x={x} y={y + 25} fill={COLORS.text} fontSize={11} textAnchor="middle" fontWeight="bold" opacity={progress}>
          {subject.label}
        </text>
      </g>
    );
  };

  const drawCameraPath = () => {
    if (!data.camera.end) return null;
    const startX = centerX + data.camera.start.x * SCALE;
    const startY = centerY + data.camera.start.y * SCALE;
    const endX = centerX + data.camera.end.x * SCALE;
    const endY = centerY + data.camera.end.y * SCALE;

    return (
      <line
        x1={startX} y1={startY} x2={endX} y2={endY}
        stroke={COLORS.camera} strokeWidth={2} strokeDasharray="6 4" opacity={progress * 0.5}
      />
    );
  };

  const drawCamera = () => {
    const x = centerX + currentCameraPos.x * SCALE;
    const y = centerY + currentCameraPos.y * SCALE;
    const fov = data.camera.fov || 60;
    const fovLength = 80;

    let cameraAngle = 0;
    if (data.camera.lookAt) {
      const dx = data.camera.lookAt.x - currentCameraPos.x;
      const dy = data.camera.lookAt.y - currentCameraPos.y;
      cameraAngle = Math.atan2(dy, dx);
    } else if (data.camera.end) {
      const dx = data.camera.end.x - data.camera.start.x;
      const dy = data.camera.end.y - data.camera.start.y;
      cameraAngle = Math.atan2(dy, dx);
    } else if (data.subjects.length > 0) {
      const mainSubject = data.subjects[0];
      const subjectPos = mainSubject.end || mainSubject.start;
      const dx = subjectPos.x - currentCameraPos.x;
      const dy = subjectPos.y - currentCameraPos.y;
      cameraAngle = Math.atan2(dy, dx);
    } else {
      cameraAngle = Math.atan2(-currentCameraPos.y, -currentCameraPos.x);
    }

    const halfAngle = (fov / 2) * (Math.PI / 180);
    const x1 = x + fovLength * Math.cos(cameraAngle - halfAngle);
    const y1 = y + fovLength * Math.sin(cameraAngle - halfAngle);
    const x2 = x + fovLength * Math.cos(cameraAngle + halfAngle);
    const y2 = y + fovLength * Math.sin(cameraAngle + halfAngle);

    const camWidth = 16;
    const camHeight = 20;
    const camPoints = [
      [x - camWidth/2 * Math.cos(cameraAngle) + camHeight/2 * Math.sin(cameraAngle), 
       y - camWidth/2 * Math.sin(cameraAngle) - camHeight/2 * Math.cos(cameraAngle)],
      [x + camWidth/2 * Math.cos(cameraAngle) + camHeight/2 * Math.sin(cameraAngle), 
       y + camWidth/2 * Math.sin(cameraAngle) - camHeight/2 * Math.cos(cameraAngle)],
      [x + camWidth/2 * Math.cos(cameraAngle) + camHeight/2 * 2 * Math.cos(cameraAngle) - camHeight/2 * Math.sin(cameraAngle), 
       y + camWidth/2 * Math.sin(cameraAngle) + camHeight/2 * 2 * Math.sin(cameraAngle) + camHeight/2 * Math.cos(cameraAngle)],
      [x - camWidth/2 * Math.cos(cameraAngle) + camHeight/2 * 2 * Math.cos(cameraAngle) - camHeight/2 * Math.sin(cameraAngle), 
       y - camWidth/2 * Math.sin(cameraAngle) + camHeight/2 * 2 * Math.sin(cameraAngle) + camHeight/2 * Math.cos(cameraAngle)],
    ];

    return (
      <g key="camera">
        <polygon points={`${x},${y} ${x1},${y1} ${x2},${y2}`} fill={COLORS.cameraFov} stroke={COLORS.camera} strokeWidth={1} opacity={progress * 0.8} />
        <polygon points={camPoints.map(p => p.join(',')).join(' ')} fill={COLORS.camera} stroke="#ffffff" strokeWidth={2} opacity={progress} />
        <text x={x} y={y + 30} fill={COLORS.text} fontSize={11} textAnchor="middle" fontWeight="bold" opacity={progress}>镜头</text>
      </g>
    );
  };

  const drawLegend = () => {
    const legendY = height - 80;
    const legendX = 30;

    return (
      <g opacity={progress}>
        <rect x={legendX - 10} y={legendY - 20} width={200} height={80} fill="rgba(0,0,0,0.6)" rx={8} />
        <circle cx={legendX + 10} cy={legendY} r={6} fill={COLORS.camera} />
        <text x={legendX + 25} y={legendY + 4} fill={COLORS.text} fontSize={12}>镜头位置/移动</text>
        <circle cx={legendX + 10} cy={legendY + 25} r={6} fill={COLORS.subject} />
        <text x={legendX + 25} y={legendY + 29} fill={COLORS.text} fontSize={12}>主体位置/移动</text>
        <rect x={legendX + 4} y={legendY + 44} width={12} height={12} fill={COLORS.environmentFill} stroke={COLORS.environment} />
        <text x={legendX + 25} y={legendY + 54} fill={COLORS.text} fontSize={12}>环境元素</text>
      </g>
    );
  };

  const drawInfo = () => {
    return (
      <g opacity={progress}>
        <rect x={20} y={20} width={280} height={100} fill="rgba(0,0,0,0.7)" rx={8} />
        <text x={30} y={45} fill={COLORS.accent} fontSize={16} fontWeight="bold">分镜 {data.shotNumber} / {data.totalShots}</text>
        <text x={30} y={65} fill={COLORS.text} fontSize={12}>景别: {data.shotType} | 运镜: {data.cameraMovement}</text>
        <text x={30} y={82} fill={COLORS.text} fontSize={12}>时长: {data.duration}秒 | 视角: {data.viewType}</text>
        <text x={30} y={105} fill={COLORS.textSecondary} fontSize={10}>{data.description.slice(0, 30)}...</text>
      </g>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <svg width={width} height={height}>
        {drawGrid()}
        {drawEnvironment()}
        {drawCameraPath()}
        {data.subjects.map(drawSubjectPath)}
        {data.subjects.map(drawSubject)}
        {drawCamera()}
        {drawLegend()}
        {drawInfo()}
      </svg>
    </AbsoluteFill>
  );
};

export default TopDownDiagram;
'''

SHOT_DATA_FILE = '''import type { ShotDiagramData } from "./types";

export const exampleShotData: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 1,
  duration: 10,
  shotType: "中景",
  cameraMovement: "固定",
  viewType: "俯视图",
  description: "示例分镜：展示一个简单的场景",
  camera: {
    start: { x: 0, y: -25 },
    fov: 50,
    lookAt: { x: 0, y: 0 },
  },
  subjects: [
    {
      id: "subject1",
      label: "主角",
      start: { x: 0, y: 5 },
      color: "#44aaff",
    },
  ],
  environment: [
    {
      id: "room",
      type: "rect",
      position: { x: 0, y: 0 },
      size: { width: 40, height: 30 },
      color: "#1a1a2e",
    },
    {
      id: "desk",
      type: "rect",
      position: { x: 0, y: 0 },
      size: { width: 12, height: 6 },
      color: "#3a3a5a",
      label: "工作台",
    },
  ],
  notes: "这是一个示例分镜数据",
};
'''


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Initialize a Remotion storyboard diagram project")
    parser.add_argument("path", help="Path to create the project in")
    parser.add_argument("--name", default="storyboard-diagrams", help="Project name")
    
    args = parser.parse_args()
    init_remotion_project(args.path, args.name)
