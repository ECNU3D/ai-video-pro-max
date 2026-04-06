---
name: storyboard-diagram
description: 从视频分镜脚本生成分镜镜头移动示意图。使用 Remotion 创建俯视图动画，展示摄像机位置、主体移动路径、环境特征。触发场景：(1) 用户需要可视化分镜镜头移动 (2) 用户提到"镜头示意图"、"分镜动画"、"摄像机移动图" (3) 用户有分镜脚本需要生成视觉化示意图 (4) 用户想要制作视频分镜的可视化规划文档
---

# 分镜镜头移动示意图生成器

从视频分镜脚本生成 Remotion 动画项目，展示每个分镜的摄像机位置、主体移动路径和环境特征。

## 工作流程

### 1. 解析分镜脚本

从分镜脚本中提取关键信息：

- **景别**：远景/全景/中景/近景/特写/大特写
- **运镜方式**：固定/推镜头/拉镜头/跟随/环绕等
- **时长**：每个分镜的秒数
- **主体**：人物、物体及其移动
- **环境**：场景特征元素

### 2. 创建 Remotion 项目

运行初始化脚本：

```bash
python3 scripts/init_project.py <项目路径> --name <项目名称>
```

脚本会：
- 创建 Remotion 空白项目
- 安装必要依赖（@remotion/three, @react-three/drei, three）
- 生成核心组件模板

### 3. 配置分镜数据

在 `src/shotData.ts` 中配置每个分镜的数据：

```typescript
import type { ShotDiagramData } from "./types";

export const shot1Data: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 11,
  duration: 12,
  shotType: "远景",
  cameraMovement: "缓推",
  viewType: "俯视图",
  description: "城市全景，缓慢推进",
  camera: {
    start: { x: -30, y: -40 },
    end: { x: 0, y: -20 },
    fov: 75,
    lookAt: { x: 0, y: 0 },
  },
  subjects: [
    { id: "crowd1", label: "行人A", start: { x: -15, y: 10 }, end: { x: -10, y: 15 }, color: "#666677" },
  ],
  environment: [
    { id: "building1", type: "rect", position: { x: -25, y: 0 }, size: { width: 15, height: 20 }, color: "#2a2a4a", label: "高楼A" },
    { id: "camera1", type: "circle", position: { x: -20, y: -10 }, size: { radius: 2 }, color: "#ff4444", label: "监控" },
  ],
  notes: "镜头从远处缓慢推进",
};
```

### 4. 创建分镜组件

在 `src/Shots.tsx` 中为每个分镜创建组件：

```typescript
import TopDownDiagram from "./TopDownDiagram";
import { shot1Data } from "./shotData";

export const Shot1Composition: React.FC = () => {
  return <TopDownDiagram data={shot1Data} />;
};
```

### 5. 注册到 Root

在 `src/Root.tsx` 中注册所有分镜：

```typescript
import { Composition, Folder } from "remotion";
import { Shot1Composition, Shot2Composition } from "./Shots";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="分镜示意图">
        <Composition id="Shot01-城市全景" component={Shot1Composition} durationInFrames={360} fps={30} width={1280} height={720} />
        <Composition id="Shot02-数据中心" component={Shot2Composition} durationInFrames={300} fps={30} width={1280} height={720} />
      </Folder>
    </>
  );
};
```

### 6. 预览和渲染

```bash
npm run dev  # 启动 Remotion Studio 预览
npx remotion render  # 渲染为视频
```

## 核心概念

### 坐标系

- 原点 (0, 0) 在场景中心
- X 轴：右为正，左为负
- Y 轴：下为正，上为负
- SCALE = 10（逻辑单位到像素）

### 镜头 FOV 方向

优先级计算：
1. `lookAt` 属性指定的目标
2. 镜头移动方向（end - start）
3. 主体位置
4. 场景中心

### 动画驱动

所有动画由 `useCurrentFrame()` 驱动：

```typescript
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const progress = interpolate(frame, [0, duration * fps], [0, 1], { extrapolateRight: "clamp" });
```

## 环境元素类型

| 类型 | 用途 | 示例 |
|------|------|------|
| rect | 建筑、家具、区域 | 工作台、服务器、房间 |
| circle | 标记点、摄像头 | 监控摄像头、警告标志 |
| line | 路径、边界 | 霓虹灯、电缆 |
| polygon | 不规则区域 | 角落、复杂空间 |
| text | 文字标注 | 标签、说明 |

## 参考文档

- [类型定义参考](references/types.md) - 完整的类型定义说明
- [组件模式参考](references/component-patterns.md) - 动画驱动和绘制模式
- [常见分镜模式](references/shot-patterns.md) - 固定、推拉、跟随等模式模板

## 最佳实践

1. **简洁的环境元素**：只绘制关键特征，避免过度细节
2. **清晰的运动路径**：使用虚线表示移动路径
3. **一致的配色**：镜头红色、主体蓝色、环境灰色
4. **合理的时长**：根据景别和运镜复杂度设置
5. **明确的 lookAt**：确保镜头朝向正确
