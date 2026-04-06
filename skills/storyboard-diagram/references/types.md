# 类型定义参考

## 核心类型

### ShotType (景别)

```typescript
type ShotType = "远景" | "全景" | "中景" | "近景" | "特写" | "大特写";
```

| 景别 | 描述 | 典型用途 |
|------|------|----------|
| 远景 | 展示环境全貌 | 建立镜头、场景交代 |
| 全景 | 展示人物全身 | 人物与环境关系 |
| 中景 | 展示人物半身 | 对话、动作 |
| 近景 | 展示人物胸部以上 | 情感表达 |
| 特写 | 展示人物面部 | 情感细节 |
| 大特写 | 展示局部细节 | 强调重点 |

### CameraMovement (运镜方式)

```typescript
type CameraMovement = 
  | "固定" 
  | "推镜头" 
  | "拉镜头" 
  | "缓推" 
  | "跟随" 
  | "环绕"
  | "摇镜头"
  | "升降";
```

| 运镜 | 描述 | camera.end 设置 |
|------|------|-----------------|
| 固定 | 镜头不动 | 不设置 end |
| 推镜头 | 镜头向前移动 | end 比 start 更靠近主体 |
| 拉镜头 | 镜头向后移动 | end 比 start 更远离主体 |
| 缓推 | 缓慢推进 | 同推镜头，但距离较小 |
| 跟随 | 跟随主体移动 | end 与主体移动方向一致 |
| 环绕 | 围绕主体旋转 | end 在主体周围 |
| 摇镜头 | 水平转动 | lookAt 变化 |
| 升降 | 垂直移动 | y 值变化 |

### Position (位置)

```typescript
type Position = {
  x: number;  // 水平坐标，正值为右
  y: number;  // 垂直坐标，正值为下（俯视图）
};
```

**坐标系说明**：
- 原点 (0, 0) 在场景中心
- X 轴：右为正，左为负
- Y 轴：下为正，上为负
- 单位为逻辑单位，通过 SCALE 常量（默认 10）转换为像素

### CameraPosition (镜头位置)

```typescript
type CameraPosition = {
  start: Position;      // 起始位置（必需）
  end?: Position;       // 结束位置（可选，用于移动镜头）
  fov?: number;         // 视场角度数，默认 60
  lookAt?: Position;    // 镜头朝向目标（可选）
};
```

**FOV 锥形方向计算优先级**：
1. 如果设置了 `lookAt`，镜头朝向该目标
2. 如果设置了 `end`，镜头朝向移动方向
3. 如果有主体，镜头朝向主体
4. 默认朝向场景中心 (0, 0)

### SubjectPosition (主体位置)

```typescript
type SubjectPosition = {
  id: string;           // 唯一标识
  label: string;        // 显示标签
  start: Position;      // 起始位置
  end?: Position;       // 结束位置（可选）
  color?: string;       // 颜色，默认 #44aaff
  path?: Position[];    // 移动路径点（可选）
};
```

**移动路径**：
- 如果设置了 `path`，主体沿路径点移动
- 如果只设置了 `end`，主体从 start 直线移动到 end
- 路径动画随镜头进度同步

### EnvironmentElement (环境元素)

```typescript
type EnvironmentElement = {
  id: string;
  type: "rect" | "circle" | "line" | "polygon" | "text";
  position: Position;
  size?: { width: number; height: number } | { radius: number };
  points?: Position[];   // 用于 line 和 polygon
  color?: string;        // 边框颜色
  label?: string;        // 显示文本
  rotation?: number;     // 旋转角度
};
```

**元素类型说明**：

| 类型 | 必需属性 | 用途 |
|------|----------|------|
| rect | size: { width, height } | 建筑物、家具、区域 |
| circle | size: { radius } | 监控摄像头、标记点 |
| line | points[] | 路径、边界、霓虹灯 |
| polygon | points[] | 不规则区域、角落 |
| text | label | 文字标注 |

### ShotDiagramData (分镜数据)

```typescript
type ShotDiagramData = {
  shotNumber: number;           // 分镜序号
  totalShots: number;           // 总分镜数
  duration: number;             // 时长（秒）
  shotType: ShotType;           // 景别
  cameraMovement: CameraMovement; // 运镜方式
  viewType: ViewType;           // 视角类型（固定为"俯视图"）
  description: string;          // 分镜描述
  camera: CameraPosition;       // 镜头位置
  subjects: SubjectPosition[];  // 主体列表
  environment: EnvironmentElement[]; // 环境元素列表
  notes?: string;               // 备注说明
};
```

## 颜色常量

```typescript
const COLORS = {
  background: "#0a0a0f",      // 背景色
  gridLine: "#252540",        // 网格线
  camera: "#ff4444",          // 镜头颜色
  cameraFov: "rgba(255, 68, 68, 0.15)", // FOV 区域
  subject: "#44aaff",         // 主体颜色
  subjectPath: "rgba(68, 170, 255, 0.5)", // 主体路径
  environment: "#3a3a5a",     // 环境边框
  environmentFill: "#2a2a4a", // 环境填充
  text: "#ffffff",            // 文字颜色
  textSecondary: "#888899",   // 次要文字
  accent: "#ffaa00",          // 强调色
};
```

## 缩放常量

```typescript
const SCALE = 10; // 逻辑单位到像素的转换比例
```
