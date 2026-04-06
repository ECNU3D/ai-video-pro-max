# 组件模式参考

## 动画驱动原则

**核心原则**：所有动画必须由 `useCurrentFrame()` 驱动，禁止使用 CSS transitions 或 animations。

```typescript
const frame = useCurrentFrame();
const { fps, durationInFrames } = useVideoConfig();

// 正确：使用 interpolate
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

// 错误：使用 CSS transition
<div style={{ transition: "opacity 1s" }} />
```

## 进度计算模式

### 镜头移动进度

```typescript
const cameraProgress = interpolate(
  frame, 
  [0, data.duration * fps], 
  [0, 1], 
  { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
);
```

### 位置插值

```typescript
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

// 使用
const currentPos = getInterpolatedPosition(subject.start, subject.end, cameraProgress);
```

### Spring 动画

```typescript
import { spring } from "remotion";

// 入场动画
const entrance = spring({
  frame,
  fps,
  config: { damping: 200 }, // 平滑无弹跳
});

// 弹跳动画
const bouncy = spring({
  frame,
  fps,
  config: { damping: 8 }, // 有弹跳
});
```

## 镜头 FOV 方向计算

```typescript
const calculateCameraAngle = (
  cameraPos: Position,
  camera: CameraPosition,
  subjects: SubjectPosition[]
): number => {
  // 优先级 1: lookAt 目标
  if (camera.lookAt) {
    const dx = camera.lookAt.x - cameraPos.x;
    const dy = camera.lookAt.y - cameraPos.y;
    return Math.atan2(dy, dx);
  }
  
  // 优先级 2: 移动方向
  if (camera.end) {
    const dx = camera.end.x - camera.start.x;
    const dy = camera.end.y - camera.start.y;
    return Math.atan2(dy, dx);
  }
  
  // 优先级 3: 主体位置
  if (subjects.length > 0) {
    const mainSubject = subjects[0];
    const subjectPos = mainSubject.end || mainSubject.start;
    const dx = subjectPos.x - cameraPos.x;
    const dy = subjectPos.y - cameraPos.y;
    return Math.atan2(dy, dx);
  }
  
  // 默认: 场景中心
  return Math.atan2(-cameraPos.y, -cameraPos.x);
};
```

## SVG 绘制模式

### 网格背景

```typescript
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
```

### 路径绘制

```typescript
// 主体移动路径
const drawSubjectPath = (subject: SubjectPosition) => {
  if (!subject.end && !subject.path) return null;
  
  const pathPoints = subject.path || [subject.start, subject.end!];
  const pathD = pathPoints.map((p, i) => {
    const x = centerX + p.x * SCALE;
    const y = centerY + p.y * SCALE;
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(" ");

  return (
    <path
      d={pathD}
      fill="none"
      stroke={subject.color || COLORS.subjectPath}
      strokeWidth={3}
      strokeDasharray="8 4"
      opacity={progress * 0.6}
    />
  );
};
```

### 镜头 FOV 锥形

```typescript
const drawCameraFov = (x: number, y: number, angle: number, fov: number) => {
  const fovLength = 80;
  const halfAngle = (fov / 2) * (Math.PI / 180);
  
  const x1 = x + fovLength * Math.cos(angle - halfAngle);
  const y1 = y + fovLength * Math.sin(angle - halfAngle);
  const x2 = x + fovLength * Math.cos(angle + halfAngle);
  const y2 = y + fovLength * Math.sin(angle + halfAngle);

  return (
    <polygon
      points={`${x},${y} ${x1},${y1} ${x2},${y2}`}
      fill={COLORS.cameraFov}
      stroke={COLORS.camera}
      strokeWidth={1}
      opacity={progress * 0.8}
    />
  );
};
```

## 信息面板模式

```typescript
const drawInfoPanel = (data: ShotDiagramData) => {
  return (
    <g opacity={progress}>
      <rect x={20} y={20} width={280} height={100} fill="rgba(0,0,0,0.7)" rx={8} />
      <text x={30} y={45} fill={COLORS.accent} fontSize={16} fontWeight="bold">
        分镜 {data.shotNumber} / {data.totalShots}
      </text>
      <text x={30} y={65} fill={COLORS.text} fontSize={12}>
        景别: {data.shotType} | 运镜: {data.cameraMovement}
      </text>
      <text x={30} y={82} fill={COLORS.text} fontSize={12}>
        时长: {data.duration}秒 | 视角: {data.viewType}
      </text>
      <text x={30} y={105} fill={COLORS.textSecondary} fontSize={10}>
        {data.description.slice(0, 30)}...
      </text>
    </g>
  );
};
```

## 组合模式

```typescript
export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background }}>
      <svg width={width} height={height}>
        {drawGrid()}
        {drawEnvironment()}
        {drawCameraPath()}
        {subjects.map(drawSubjectPath)}
        {subjects.map(drawSubject)}
        {drawCamera()}
        {drawLegend()}
        {drawInfo()}
      </svg>
    </AbsoluteFill>
  );
};
```
