# 常见分镜模式

## 固定镜头

适用于：对话、特写、静态场景

```typescript
const fixedShot: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 1,
  duration: 8,
  shotType: "中景",
  cameraMovement: "固定",
  viewType: "俯视图",
  description: "固定镜头拍摄主体",
  camera: {
    start: { x: 0, y: -25 },
    fov: 50,
    lookAt: { x: 0, y: 0 },
  },
  subjects: [
    { id: "subject1", label: "主角", start: { x: 0, y: 5 }, color: "#44aaff" },
  ],
  environment: [
    { id: "room", type: "rect", position: { x: 0, y: 0 }, size: { width: 40, height: 30 }, color: "#1a1a2e" },
  ],
};
```

## 推镜头

适用于：强调、聚焦、发现

```typescript
const pushShot: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 1,
  duration: 8,
  shotType: "近景",
  cameraMovement: "推镜头",
  viewType: "俯视图",
  description: "镜头推进聚焦主体",
  camera: {
    start: { x: 0, y: -20 },
    end: { x: 0, y: -8 },
    fov: 35,
    lookAt: { x: 0, y: 5 },
  },
  subjects: [
    { id: "subject1", label: "主角", start: { x: 0, y: 5 }, color: "#44aaff" },
  ],
  environment: [
    { id: "room", type: "rect", position: { x: 0, y: 0 }, size: { width: 40, height: 30 }, color: "#1a1a2e" },
  ],
};
```

## 拉镜头

适用于：揭示环境、建立场景、结束

```typescript
const pullShot: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 1,
  duration: 9,
  shotType: "中景",
  cameraMovement: "拉镜头",
  viewType: "俯视图",
  description: "镜头拉远展示全景",
  camera: {
    start: { x: 0, y: -8 },
    end: { x: 0, y: -30 },
    fov: 60,
    lookAt: { x: 0, y: 5 },
  },
  subjects: [
    { id: "subject1", label: "主角", start: { x: 0, y: 5 }, color: "#44aaff" },
  ],
  environment: [
    { id: "room", type: "rect", position: { x: 0, y: 0 }, size: { width: 50, height: 40 }, color: "#1a1a2e" },
    { id: "camera1", type: "circle", position: { x: -20, y: -15 }, size: { radius: 2 }, color: "#ff0000", label: "监控" },
    { id: "camera2", type: "circle", position: { x: 20, y: -15 }, size: { radius: 2 }, color: "#ff0000", label: "监控" },
  ],
};
```

## 跟随镜头

适用于：追逐、行走、运动

```typescript
const followShot: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 1,
  duration: 5,
  shotType: "全景",
  cameraMovement: "跟随",
  viewType: "俯视图",
  description: "镜头跟随主体移动",
  camera: {
    start: { x: 5, y: -10 },
    end: { x: 15, y: 5 },
    fov: 60,
    lookAt: { x: 10, y: 15 },
  },
  subjects: [
    { 
      id: "subject1", 
      label: "主角", 
      start: { x: 0, y: 10 }, 
      end: { x: 20, y: 20 }, 
      color: "#44aaff",
      path: [{ x: 0, y: 10 }, { x: 10, y: 15 }, { x: 20, y: 20 }],
    },
    { id: "chaser1", label: "追击者A", start: { x: -5, y: 0 }, end: { x: 5, y: 10 }, color: "#ff6666" },
  ],
  environment: [
    { id: "room", type: "rect", position: { x: 10, y: 10 }, size: { width: 50, height: 40 }, color: "#1a1a2e" },
    { id: "obstacle1", type: "rect", position: { x: 5, y: 12 }, size: { width: 3, height: 8 }, color: "#444466", label: "障碍" },
  ],
};
```

## 城市远景

适用于：开场、建立镜头

```typescript
const cityWideShot: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 1,
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
    { id: "crowd2", label: "行人B", start: { x: 10, y: 5 }, end: { x: 15, y: 8 }, color: "#666677" },
  ],
  environment: [
    { id: "building1", type: "rect", position: { x: -25, y: 0 }, size: { width: 15, height: 20 }, color: "#2a2a4a", label: "高楼A" },
    { id: "building2", type: "rect", position: { x: 25, y: 5 }, size: { width: 12, height: 18 }, color: "#2a2a4a", label: "高楼B" },
    { id: "street", type: "rect", position: { x: 0, y: 0 }, size: { width: 60, height: 8 }, color: "#1a1a2e" },
    { id: "camera1", type: "circle", position: { x: -20, y: -10 }, size: { radius: 2 }, color: "#ff4444", label: "监控" },
  ],
};
```

## 室内场景

适用于：办公室、数据中心、房间

```typescript
const indoorShot: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 1,
  duration: 10,
  shotType: "中景",
  cameraMovement: "固定",
  viewType: "俯视图",
  description: "室内场景，主体在工作",
  camera: {
    start: { x: 0, y: -25 },
    fov: 50,
    lookAt: { x: 0, y: 5 },
  },
  subjects: [
    { id: "worker", label: "工作者", start: { x: 0, y: 5 }, color: "#44aaff" },
  ],
  environment: [
    { id: "room", type: "rect", position: { x: 0, y: 0 }, size: { width: 40, height: 30 }, color: "#1a1a2e" },
    { id: "desk", type: "rect", position: { x: 0, y: 0 }, size: { width: 12, height: 6 }, color: "#3a3a5a", label: "工作台" },
    { id: "server1", type: "rect", position: { x: -15, y: 8 }, size: { width: 6, height: 10 }, color: "#2a2a4a", label: "服务器" },
    { id: "server2", type: "rect", position: { x: 15, y: 8 }, size: { width: 6, height: 10 }, color: "#2a2a4a", label: "服务器" },
    { id: "cable", type: "line", position: { x: 0, y: 0 }, points: [{ x: -12, y: 8 }, { x: -5, y: 3 }], color: "#444466" },
  ],
};
```

## 追逐场景

适用于：逃跑、追击、动作

```typescript
const chaseShot: ShotDiagramData = {
  shotNumber: 1,
  totalShots: 1,
  duration: 6,
  shotType: "中景",
  cameraMovement: "跟随",
  viewType: "俯视图",
  description: "追逐场景，多人移动",
  camera: {
    start: { x: 0, y: -15 },
    end: { x: 5, y: 0 },
    fov: 55,
    lookAt: { x: 0, y: 10 },
  },
  subjects: [
    { id: "runner", label: "逃跑者", start: { x: 0, y: 5 }, end: { x: 0, y: 15 }, color: "#44aaff" },
    { id: "chaser1", label: "追击者A", start: { x: -15, y: -15 }, end: { x: -8, y: 0 }, color: "#ff6666" },
    { id: "chaser2", label: "追击者B", start: { x: 0, y: -18 }, end: { x: 0, y: -5 }, color: "#ff6666" },
    { id: "chaser3", label: "追击者C", start: { x: 15, y: -15 }, end: { x: 8, y: 0 }, color: "#ff6666" },
  ],
  environment: [
    { id: "room", type: "rect", position: { x: 0, y: 0 }, size: { width: 50, height: 40 }, color: "#1a1a2e" },
    { id: "entrance", type: "rect", position: { x: 0, y: -18 }, size: { width: 20, height: 4 }, color: "#3a3a5a", label: "入口" },
  ],
};
```

## 环境元素模板

### 监控摄像头

```typescript
{ 
  id: "camera1", 
  type: "circle", 
  position: { x: -20, y: -15 }, 
  size: { radius: 2 }, 
  color: "#ff4444", 
  label: "监控" 
}
```

### 霓虹灯

```typescript
{ 
  id: "neon1", 
  type: "line", 
  position: { x: 0, y: 0 }, 
  points: [{ x: -25, y: -15 }, { x: -20, y: -15 }, { x: -20, y: -10 }], 
  color: "#00ffff" 
}
```

### 不规则角落

```typescript
{ 
  id: "corner", 
  type: "polygon", 
  position: { x: 0, y: 0 }, 
  points: [
    { x: -10, y: -5 },
    { x: 10, y: -5 },
    { x: 10, y: 15 },
    { x: 5, y: 15 },
    { x: 5, y: 0 },
    { x: -10, y: 0 },
  ], 
  color: "#1a1a2e" 
}
```

### 出口标记

```typescript
{ 
  id: "exit", 
  type: "rect", 
  position: { x: 35, y: 20 }, 
  size: { width: 4, height: 6 }, 
  color: "#00ff00", 
  label: "出口" 
}
```
