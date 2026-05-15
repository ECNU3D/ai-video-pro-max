# AI 短视频创作技能库

一套面向 AI 短视频创作的技能库，覆盖从故事构思、导演前置分析、视觉设计、镜头节奏、分镜脚本生成，到审片、反馈诊断、参考图准备和生成前预检查的完整流程。

本仓库的核心主张不是"把剧情转成 prompt"，而是**把导演流程里会反复返工的中间分析层显式化、可复用化**。

## 快速开始

```bash
git clone https://github.com/your-repo/seedance2.0-skill.git
cd seedance2.0-skill
./sync.sh
```

运行 `sync.sh` 后，仓库中的 `skills/` 会自动软链接到：

- `.agents/skills` → Codex
- `.claude/skills` → Claude Code
- `.trae/skills` → Trae

推荐使用 `Trae + GLM-5` 或 `Codex` 进行调用与串联。[代码觉醒](./代码觉醒/) 示例项目就是基于这套工作流完成的。

## 这个仓库解决什么问题

很多 AI 视频工作流的问题，不是"平台不会生成"，而是上游导演判断没做完：

- 剧情重点还没提炼清楚就写 prompt
- 多人站位、走位、轴线没梳理就拼镜头
- 对话戏没有权力变化，动作戏没有升级闭环
- 审片时只知道"感觉不对"，却不知道回退到哪一层修改

本仓库把这些中间层变成可审阅、可重跑的显式文档。

---

## 读这份 README 最重要的一件事：**文档不改自己**

仓库里**绝大多数技能的输出，本质上都是"对当前上游输入的一次分析 + 设计 + 建议"**，而不是你创作的最终稿。

举几个具体例子（看一下 [`对面/`](./对面/) 目录里的真实产物就明白了）：

- `storyboard-blueprint` 产出的"导演分镜蓝图"，是对你提供的**剧本**的一次分析——里面带 5W2H 信息缺口审查、强弱转换点识别、镜头段落建议
- `continuity-blocking-planner` 产出的"连续性与 Blocking 检测报告"，是对你提供的**已有分镜 + 场景参考图**的一次检测——里面带高风险镜头列表和"最小补丁建议"
- `dialogue-scene-director` / `action-scene-choreographer` 产出的"导演设计"，是对你提供的**对话场 / 动作场 + 蓝图 + blocking**的一次编排分析
- `scene-atmosphere` / `shot-rhythm-planner` / `visual-director` 同理——都是基于上游输入的派生分析
- `storyboard-reviewer` / `feedback-diagnoser` / `video-transition-auditor` 则是纯审查报告

这些文档的共同特征：

> **下次你用相同的技能重跑，上一次你手动改的内容会被覆盖。** 所以手动修这些产物本身意义不大——这一版顺眼了，下次重跑又回到原样；更糟的是，你的手改掩盖了真正的上游输入问题。

### 正确的迭代姿势只有两种

| 姿势 | 什么时候用 | 怎么做 |
|------|-----------|--------|
| 往上补 | 产物暴露出上游信息缺口（剧本语焉不详、5W2H 不全、场景参考图缺失、角色关系模糊） | 改剧本 / 加场景参考图 / 补前置文档，然后**重跑这个技能** |
| 往下改 | 产物里已经清清楚楚给了问题和建议 | 按它的建议去修改**下游**（平台分镜脚本 / 参考图提示词 / 重新出图），不要回头改产物本身 |

### 真正可以手改的只有两头

- **最上游**：你自己的剧本、`story-creator` 生成的故事文档、你提供的参考图——这是设计源头，手改天经地义
- **最下游的平台表达**：平台分镜脚本（`seedance-storyboard` 等）和参考图提示词（`reference-image-prompt-polisher`）里的**平台表达层**——换个运镜词、补几句描述、改几个形容词，可以直接手改

**中间所有导演分析/设计层、所有审查/诊断报告，都不手改。**

---

## 技能依赖关系总图

下图展示每个技能的输入来自哪里、输出流向哪里。实线是主依赖，虚线是可选依赖。

```text
            ┌──────────────────────────────────────────────────┐
            │  讨论陪练：li-dan-mentor                          │
            │  任何一步卡住 / 心态崩了 / 方向飘，都能退出来聊     │
            │  （无文档输入输出，与数据流独立）                  │
            └──────────────────────────────────────────────────┘

┌─ 创意层 ──────────────────────────────────────────────────────┐
│  用户的题材 / 梗概 ──► story-creator ──► 故事文档              │
│                                       （大纲 + 分集剧情）     │
└───────────────────────────────┬───────────────────────────────┘
                                │
                  ┌─────────────┼─────────────┬─────────────┐
                  ▼             ▼             ▼             ▼
┌─ 导演分析/设计层 ─────────────────────────────────────────────┐
│                                                               │
│  storyboard-blueprint  ◄── 故事文档 / 用户剧本                 │
│     输出：导演分镜蓝图                                         │
│     下游：几乎所有其它导演分析技能 + 平台分镜                    │
│                                                               │
│  visual-director       ◄── 故事文档                           │
│     输出：视觉设计文档                                         │
│     下游：scene-atmosphere / 平台分镜 / 参考图提示词 / 审片     │
│                                                               │
│  shot-rhythm-planner   ◄── 故事文档 / 导演分镜蓝图             │
│     输出：镜头节奏规划                                         │
│     下游：平台分镜 / 审片                                       │
│                                                               │
│  scene-atmosphere      ◄── 故事场景列表 + 视觉设计文档（可选）  │
│     输出：场景氛围卡片                                         │
│     下游：平台分镜 / 参考图提示词                                │
│                                                               │
│  continuity-blocking-planner                                   │
│     输入：已有的平台分镜脚本（必需）+ 场景参考图（推荐）         │
│           + 导演分镜蓝图（可选）                                │
│     输出：连续性与 Blocking 检测报告（含最小补丁建议）           │
│     下游：平台分镜修订 / 对话戏导演设计 / 动作戏编排             │
│                                                               │
│  dialogue-scene-director                                       │
│     输入：对话场剧本 + 导演分镜蓝图（可选）                      │
│           + Blocking 报告（可选）                               │
│     输出：对话戏导演设计                                        │
│     下游：平台分镜                                              │
│                                                               │
│  action-scene-choreographer                                    │
│     输入：动作场剧本 + 导演分镜蓝图（可选）                      │
│           + Blocking 报告（可选）+ 角色能力设定（可选）          │
│     输出：动作戏导演编排                                        │
│     下游：平台分镜                                              │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌─ 平台翻译层 ──────────────────────────────────────────────────┐
│                                                               │
│  平台分镜技能（seedance / hailuo / wanxiang / vidu-storyboard） │
│     输入：剧情文本（最低要求）+ 上面导演分析/设计层的任意组合     │
│     输出：平台分镜脚本（每镜 prompt + 时长 + 首尾帧提示）         │
│     下游：storyboard-reviewer / continuity-blocking-planner   │
│           （作为它二次检测的输入）/ 参考图提示词 / 镜头示意图     │
│                                                               │
│  reference-image-prompt-polisher                               │
│     输入：分镜脚本 / 角色描述 / 场景描述 / 粗提示词               │
│           + 视觉设计文档（可选）+ 场景氛围卡片（可选）            │
│     输出：生图提示词 Markdown                                   │
│     下游：gemini-batch-imagegen / 手动出图                      │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌─ 执行/预览层 ─────────────────────────────────────────────────┐
│                                                               │
│  gemini-batch-imagegen                                         │
│     输入：生图提示词 Markdown（来自 reference-image-prompt-polisher）│
│     输出：批量下载的图片 + manifest.md                           │
│     下游：video-transition-auditor / 视频平台生成                │
│                                                               │
│  storyboard-diagram                                            │
│     输入：平台分镜脚本                                           │
│     输出：Remotion 可视化项目（俯视图动画 + 镜头路径）            │
│     下游：人工预览 / 团队讨论                                    │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌─ 审查/诊断层 · 只读，永远不改 ────────────────────────────────┐
│                                                               │
│  storyboard-reviewer                                           │
│     输入：平台分镜脚本 + 视觉设计文档（可选）                     │
│     输出：8 维度审片报告                                        │
│     下游：人按报告回头修对应层                                  │
│                                                               │
│  feedback-diagnoser                                            │
│     输入：模糊反馈原文 + 被反馈对象 + 可选的相关上游文档           │
│     输出：反馈归因报告（问题层级 + 返工范围 + 修正路径）           │
│     下游：人按诊断回头修对应层                                  │
│                                                               │
│  video-transition-auditor                                      │
│     输入：首帧图（来自 gemini-batch-imagegen 或手动出图）         │
│           + 提示词（来自平台分镜脚本）+ 尾帧图（可选）             │
│     输出：一致性预检报告                                        │
│     下游：人回参考图提示词或平台分镜修订                          │
└───────────────────────────────────────────────────────────────┘
```

---

## 一句话迭代规则

> **产物不对 → 往上补输入再重跑，或往下按建议改；导演分析层和审查层的文档永远不手动编辑。**

---

## 讨论陪练层：`li-dan-mentor`

这个技能独立于上面的数据流，不在任何一条固定链路里。

| 项目 | 内容 |
|------|------|
| 定位 | 创作教练 / 讨论陪练，以李诞《工作手册》方法论回应问题 |
| 什么时候用 | 方向飘忽、动机不清、被反馈打击、不知道从哪起步、纠结要不要继续、心态崩了 |
| 什么时候**不要**用 | 已经明确要做什么、只差具体设计——直接用对应技能；要审片——那是 `storyboard-reviewer` |
| 输入 | 一段话描述当前卡点、情绪或模糊意图 |
| 输出 | 对话（共情 + 方法论诊断 + 今天就能做的最小行动） |
| 上游依赖 | 无 |
| 下游使用 | 没有文档输出；帮你决定下一步回到哪个技能继续做事 |

把它当成创作过程中的**暂停按钮**：聊完带着清晰的下一步，回到数据流的对应层继续做事。

---

## 技能详解（按数据流顺序）

每个技能都按下面的固定结构说明：**输入是什么**、**输出是什么**、**上游依赖哪些技能的输出**、**输出被哪些技能使用**、**迭代方式**。

### 创意层

#### `story-creator`

| 项目 | 内容 |
|------|------|
| 输入 | 用户提供的题材、梗概、创意片段（自然语言） |
| 输出 | 故事文档 `{故事标题}.md`（含故事大纲、角色设定、分集剧情） |
| 上游依赖 | 无。这是数据流的源头 |
| 输出被谁使用 | `storyboard-blueprint`（作为剧本输入）、`visual-director`（作为故事输入）、`shot-rhythm-planner`（作为剧情输入）、`scene-atmosphere`（提供场景列表） |
| 产物本质 | 可编辑的上游源文档 |
| 迭代方式 | **这是仓库里唯一一个可以放心手改输出内容的技能**。手改或重跑都行；改完之后，所有下游导演分析层都需要重跑 |

### 导演分析/设计层

这一层的 7 个技能特征一致：输入是上游文档，输出是"对当前输入的一次性分析 + 建议"。**不手改输出**；信息缺口就补上游输入后重跑，建议没被下游采纳就按建议重新生成下游。

#### `storyboard-blueprint`

| 项目 | 内容 |
|------|------|
| 输入 | 剧本 / 场次 / 故事段落 Markdown |
| 输出 | 导演分镜蓝图 `{标题}-导演分镜蓝图.md`（含剧情重点、权重节奏、强弱转换点、5W2H 信息完整度审查、组装方向比较、镜头段落蓝图、风险标注） |
| 上游依赖 | `story-creator` 的故事文档，或用户手写剧本 |
| 输出被谁使用 | `continuity-blocking-planner`（作为剧情背景）、`dialogue-scene-director`（作为场次蓝图）、`action-scene-choreographer`（作为场次蓝图）、平台分镜技能（作为创作依据） |
| 产物本质 | 对剧本的一次分析 + 设计建议 |
| 迭代方式 | 报告指出 5W2H 缺口 → 补剧本后重跑；报告给出段落建议 → 按建议做平台分镜；**不手改蓝图本身** |

#### `visual-director`

| 项目 | 内容 |
|------|------|
| 输入 | 故事大纲、分集剧情、角色设定（通常来自 `story-creator`） |
| 输出 | 视觉设计文档 `{故事标题}-视觉设计文档.md`（含整体基调、色彩身份、构图策略、光影规则、视觉母题） |
| 上游依赖 | `story-creator` 的故事文档 |
| 输出被谁使用 | `scene-atmosphere`（作为视觉基调）、平台分镜技能（作为风格约束）、`reference-image-prompt-polisher`（作为风格约束）、`storyboard-reviewer`（作为审片对照标准） |
| 产物本质 | 视觉规划分析 + 设计决策 |
| 迭代方式 | 故事变了 → 重跑；某方向不满意 → 把新要求写进输入后重跑；下游没表达 → 改平台分镜或参考图提示词 |

#### `shot-rhythm-planner`

| 项目 | 内容 |
|------|------|
| 输入 | 剧情文本 + 目标时长 + 类型风格 + 目标平台 |
| 输出 | 镜头节奏规划 `{故事标题}-{集数}-镜头节奏规划.md`（含镜头数量、时长分配、景别、运镜、节奏曲线） |
| 上游依赖 | `story-creator` 的故事文档 或 `storyboard-blueprint` 的导演分镜蓝图 |
| 输出被谁使用 | 平台分镜技能（作为节奏约束）、`storyboard-reviewer`（作为对照标准） |
| 产物本质 | 节奏规划分析 |
| 迭代方式 | 时长 / 平台 / 类型约束变了 → 改输入后重跑；下游没按规划做 → 改平台分镜 |

#### `scene-atmosphere`

| 项目 | 内容 |
|------|------|
| 输入 | 场景列表（从故事文档提取）+ 视觉设计文档（来自 `visual-director`，可选） |
| 输出 | 场景氛围卡片 `{故事标题}-场景氛围卡片.md`（每场景的光源、色温、粒子、质感、纵深、音效 + 可直接拼接的提示词片段） |
| 上游依赖 | `story-creator` 提供场景列表，`visual-director` 提供视觉基调 |
| 输出被谁使用 | 平台分镜技能（作为氛围提示词来源）、`reference-image-prompt-polisher`（作为氛围参考） |
| 产物本质 | 氛围分析与设计 |
| 迭代方式 | 场景设定变了 / 视觉设计文档换了 → 重跑；下游没表达 → 改平台分镜 |

#### `continuity-blocking-planner`

| 项目 | 内容 |
|------|------|
| 输入 | **已有的平台分镜脚本（必需）**；场景参考图 / 俯视图（推荐）；导演分镜蓝图（可选） |
| 输出 | 连续性与 Blocking 检测报告 `{标题}-连续性与Blocking检测报告.md`（含空间骨架、站位、轴线、逐镜布局审计、衔接桥梁设计、高风险点、**最小补丁建议**） |
| 上游依赖 | 平台分镜技能（提供已有分镜）、用户提供的场景参考图、`storyboard-blueprint`（提供剧情上下文） |
| 输出被谁使用 | 平台分镜技能（按报告中的最小补丁建议修订）、`dialogue-scene-director` / `action-scene-choreographer`（作为空间上下文输入） |
| 产物本质 | 对现有分镜的空间检测报告 + 补丁建议 |
| 迭代方式 | 报告指出"参考图不足 / 俯视图缺失" → 补图重跑；报告给了补丁建议 → 按补丁改平台分镜；**不手改这份报告** |

> 典型误区：看到报告说"分镜 6 高风险"就去修改报告里的文字。正确做法是按报告第 11 节"下游交接建议"改平台分镜脚本里的镜头 6，或者补充场景俯视图后重跑这个技能。

#### `dialogue-scene-director`

| 项目 | 内容 |
|------|------|
| 输入 | 对话场剧本（必需）；导演分镜蓝图（可选）；Blocking 检测报告（可选） |
| 输出 | 对话戏导演设计 `{标题}-对话戏导演设计.md`（含权力变化、语速关系、停顿、表演、动静组合、借景抒情） |
| 上游依赖 | 用户剧本 或 `story-creator`（提供对话场原文）、`storyboard-blueprint`（提供蓝图）、`continuity-blocking-planner`（提供空间布局） |
| 输出被谁使用 | 平台分镜技能（作为对话戏表演约束） |
| 产物本质 | 对对话场的编排设计 |
| 迭代方式 | 剧情重点不对 → 回 `storyboard-blueprint` 重跑；站位不清 → 回 `continuity-blocking-planner` 重跑；下游没表达 → 改平台分镜 |

#### `action-scene-choreographer`

| 项目 | 内容 |
|------|------|
| 输入 | 动作场剧本（必需）；导演分镜蓝图（可选）；Blocking 检测报告（可选）；角色能力设定（可选） |
| 输出 | 动作戏导演编排 `{标题}-动作戏导演编排.md`（含对峙、攻防转换、升级闭环、大招释放、高潮尾戏、收尾） |
| 上游依赖 | 用户剧本 或 `story-creator`、`storyboard-blueprint`、`continuity-blocking-planner` |
| 输出被谁使用 | 平台分镜技能 |
| 产物本质 | 对动作场的编排设计 |
| 迭代方式 | 同 `dialogue-scene-director`：回上游对应技能重跑；下游没表达 → 改平台分镜 |

### 平台翻译层

#### 平台分镜技能：`seedance-storyboard` / `hailuo-storyboard` / `wanxiang-storyboard` / `vidu-storyboard`

| 项目 | 内容 |
|------|------|
| 输入 | 剧情文本（最低要求）；或以下上游文档的任意组合：导演分镜蓝图、视觉设计文档、镜头节奏规划、场景氛围卡片、Blocking 检测报告、对话戏导演设计、动作戏导演编排 |
| 输出 | 平台分镜脚本 `{主题}-{平台}分镜脚本.md`（每镜的 prompt + 时长 + 首尾帧提示） |
| 上游依赖 | `story-creator` / 用户剧本（提供剧情）；`storyboard-blueprint`、`visual-director`、`shot-rhythm-planner`、`scene-atmosphere`、`continuity-blocking-planner`、`dialogue-scene-director`、`action-scene-choreographer`（任何一个都可作为可选依赖） |
| 输出被谁使用 | `storyboard-reviewer`（被审查）、`continuity-blocking-planner`（被二次检测）、`reference-image-prompt-polisher`（提取分镜内容）、`storyboard-diagram`（被可视化）、`video-transition-auditor`（首尾帧被预检） |
| 产物本质 | 可被有限手改的平台表达文档 |
| 迭代方式 | 平台语法 / 镜头词 / 描述具体度不够 → **直接手改或重跑**；设计问题（选镜不对、节奏错、站位乱）→ 回上游对应的导演分析技能，重跑后再重新生成平台分镜 |

四个平台之间的差异：

| 技能 | 平台 | 特点 |
|------|------|------|
| `seedance-storyboard` | 即梦 Seedance 2.0 | 叙事模式强、常用度最高 |
| `hailuo-storyboard` | 海螺 AI | 适合时间序列式运镜表达 |
| `wanxiang-storyboard` | 通义万相 2.6 | 美学表达较强、支持角色引用 |
| `vidu-storyboard` | Vidu | 适合短时长镜头与动态关键词控制 |

> "可以手改"特指**平台表达层的微调**（换个运镜词、补几句描述）。如果改动触及设计决策（选哪个景别、哪个镜头要强化、整体节奏），请回上游导演分析层。

#### `reference-image-prompt-polisher`

| 项目 | 内容 |
|------|------|
| 输入 | 分镜脚本 / 角色描述 / 场景描述 / 粗提示词（必需）；视觉设计文档（可选）；场景氛围卡片（可选） |
| 输出 | 生图提示词 Markdown `{主题关键词}-参考图提示词.md` |
| 上游依赖 | 平台分镜技能（提供分镜内容）、`visual-director`（提供风格）、`scene-atmosphere`（提供氛围）、用户原始描述 |
| 输出被谁使用 | `gemini-batch-imagegen`（作为批量出图输入）、人工出图工作流 |
| 产物本质 | 可被手改的生图提示词 |
| 迭代方式 | 提示词细节不稳 → 手改或重跑；风格系统问题 → 回 `visual-director` / `scene-atmosphere`；选镜问题 → 回平台分镜 |

### 执行/预览层

#### `gemini-batch-imagegen`

| 项目 | 内容 |
|------|------|
| 输入 | 生图提示词 Markdown（通常来自 `reference-image-prompt-polisher`），也可以是平台分镜脚本中的关键帧提示词 |
| 输出 | 批量下载的图片 + `manifest.md` |
| 上游依赖 | `reference-image-prompt-polisher` 或 平台分镜技能 |
| 输出被谁使用 | `video-transition-auditor`（首帧输入）、视频平台生成（作为参考图） |
| 产物本质 | 执行结果（图片文件） |
| 迭代方式 | 图不稳定 → 回 `reference-image-prompt-polisher` 改提示词重出；风格飘 → 回 `visual-director` / `scene-atmosphere` |

#### `storyboard-diagram`

| 项目 | 内容 |
|------|------|
| 输入 | 平台分镜脚本 Markdown（来自平台分镜技能） |
| 输出 | Remotion 可视化项目（俯视图动画 + 镜头路径） |
| 上游依赖 | 平台分镜技能 |
| 输出被谁使用 | 人工预览、团队讨论、演示视频 |
| 产物本质 | 执行/预览结果 |
| 迭代方式 | 镜头路径不顺 → 回 `continuity-blocking-planner` 补场景图后重跑，或改平台分镜；节奏不对 → 回 `shot-rhythm-planner` |

### 审查/诊断层（永远只读）

#### `storyboard-reviewer`

| 项目 | 内容 |
|------|------|
| 输入 | 平台分镜脚本（必需）；视觉设计文档（可选，用作对照标准） |
| 输出 | 8 维度审片报告 `{标题}-审片报告.md`（景别分布、运镜多样性、提示词质量、色彩连续性、视觉连续性、节奏、叙事完整性 等） |
| 上游依赖 | 平台分镜技能、`visual-director` |
| 输出被谁使用 | 人按报告回头修对应层；可传给 `feedback-diagnoser` 做进一步归因 |
| 产物本质 | 纯审查报告 |
| 迭代方式 | **永远不改报告**。按报告指向的层回头修：节奏问题回 `shot-rhythm-planner`，设计问题回 `storyboard-blueprint`，空间问题回 `continuity-blocking-planner`，表达问题改平台分镜。改完重跑审片 |

#### `feedback-diagnoser`

| 项目 | 内容 |
|------|------|
| 输入 | 模糊反馈原文 + 被反馈对象（任意层的文档或生成结果）+ 相关上游文档（可选） |
| 输出 | 反馈归因报告 `{标题}-反馈诊断.md`（问题层级、返工范围、修正路径） |
| 上游依赖 | 任意层的输出 |
| 输出被谁使用 | 人按诊断回头修对应层 |
| 产物本质 | 纯诊断报告 |
| 迭代方式 | **永远不改报告**。按诊断结果回对应层修；诊断不准 → 补上下文后重跑诊断 |

`storyboard-reviewer` 和 `feedback-diagnoser` 的区别：

- `storyboard-reviewer` 告诉你**哪里有问题**
- `feedback-diagnoser` 告诉你**问题更可能出在哪一层**，以及**先改什么最省成本**

#### `video-transition-auditor`

| 项目 | 内容 |
|------|------|
| 输入 | 首帧图（来自 `gemini-batch-imagegen` 或手动出图）+ 提示词（来自平台分镜脚本）+ 尾帧图（可选） |
| 输出 | 一致性预检报告 `{标题}-预检报告.md`（帧词一致性、首尾帧跳变、迁移逻辑） |
| 上游依赖 | `gemini-batch-imagegen`、平台分镜技能 |
| 输出被谁使用 | 人回 `reference-image-prompt-polisher` 或平台分镜技能修订 |
| 产物本质 | 纯预检报告 |
| 迭代方式 | **永远不改报告**。帧不一致 → 回 `reference-image-prompt-polisher` 重出图；迁移逻辑断 → 改平台分镜；改完重跑预检 |

### 辅助技能

| 技能 | 用途 |
|------|------|
| `remotion-best-practices` | Remotion / React 程序化视频的最佳实践参考 |
| `skill-creator` | 创建新技能或扩展现有技能的元技能 |

---

## 两种典型链路

### 1. 快速出片链（剧情简单 / 赶时间 / 结构清晰）

```text
用户剧本 或 story-creator 产出的故事文档
    │
    ├─► visual-director               → 视觉设计文档（可选）
    ├─► scene-atmosphere              → 场景氛围卡片（可选）
    └─► shot-rhythm-planner           → 镜头节奏规划（可选）
        │
        ▼
    平台分镜技能（seedance / hailuo / wanxiang / vidu）
        │   输入：上面任意组合的文档
        │   输出：平台分镜脚本
        ▼
    storyboard-reviewer               → 审片报告（只读，按报告回头修）
        │
        ▼
    reference-image-prompt-polisher   → 生图提示词（可选）
        │
        ▼
    gemini-batch-imagegen             → 批量图片（可选）
        │
        ▼
    video-transition-auditor          → 预检报告（只读）
        │
        ▼
    提交视频平台生成
```

### 2. 导演前置链（多人戏 / 复杂空间 / 高要求）

```text
用户剧本 或 story-creator 产出的故事文档
    │
    ▼
storyboard-blueprint                  → 导演分镜蓝图
    ├─► visual-director               → 视觉设计文档（可并行）
    ├─► shot-rhythm-planner           → 镜头节奏规划（可并行）
    └─► scene-atmosphere              → 场景氛围卡片（可并行）
        │
        ▼
    平台分镜技能（第一版草稿）         → 平台分镜脚本（第一版）
        │
        ▼
    continuity-blocking-planner       → Blocking 检测报告
        │   （需要已有分镜 + 场景参考图）
        │
        ▼
    dialogue-scene-director 或
    action-scene-choreographer        → 对话戏 / 动作戏导演设计
        │   （按场次选择；可复用上游的蓝图和 Blocking 报告）
        │
        ▼
    平台分镜技能（第二版）             → 平台分镜脚本（吃入所有上游设计）
        │
        ▼
    storyboard-reviewer               → 审片报告（只读）
        │
        ▼
    reference-image-prompt-polisher   → 生图提示词
        │
        ▼
    gemini-batch-imagegen             → 批量图片
        │
        ├─► feedback-diagnoser        → 反馈归因（反馈模糊时，只读）
        │   → 按报告回对应层重跑 → 重生下游 → 再跑审查
        │
        ▼
    video-transition-auditor          → 预检报告（只读）
        │
        ▼
    提交视频平台生成
```

两条链路都默认 `li-dan-mentor` 随时可以从任何位置退出来使用，聊完再回到链路继续。

### 该走哪条链

| 场景 | 推荐链路 |
|------|----------|
| 单人 / 简单情节 / 赶一版 | 快速出片链 |
| 多人对话、群戏 | 导演前置链 + `continuity-blocking-planner` + `dialogue-scene-director` |
| 动作、追逐、技能释放 | 导演前置链 + `action-scene-choreographer` |
| 审片后只知道"感觉不对" | `storyboard-reviewer` + `feedback-diagnoser`，然后按报告回对应层 |
| 方向飘 / 心态崩 / 不想动 | 先 `li-dan-mentor` 聊完再回链路 |

---

## 常见问题排查表

按"现象 → 问题出在哪一层 → 操作"三栏看。**重点：操作里绝不包含"手改导演分析层或审查层的产物"。**

| 现象 | 问题出在哪一层 | 操作 |
|------|---------------|------|
| 故事 premise 不成立 | 创意层（故事文档本身） | 手改故事文档，或重跑 `story-creator`；所有下游导演分析层重跑 |
| 剧情重点不清、5W2H 不完整 | 创意层（剧本信息不够） | 补剧本细节 → 重跑 `storyboard-blueprint` |
| 人物突然换边、走位看不懂 | 创意层（场景参考图 / 俯视图不足）或平台分镜没遵守 | 补场景参考图 → 重跑 `continuity-blocking-planner` → 按报告里的补丁改平台分镜 |
| 对话戏没戏、停顿不成立 | 平台分镜没吃 `dialogue-scene-director` 的设计 | 重新生成平台分镜时把对话戏导演设计喂进去 |
| 动作戏不够爽、升级不清 | 平台分镜没吃 `action-scene-choreographer` 的编排 | 重新生成平台分镜时把动作戏编排喂进去 |
| 整体风格飘 | 故事未定调 或 视觉设计文档覆盖不全 | 补故事设定 → 重跑 `visual-director` → 下游全部重跑 |
| 单场氛围不对 | 场景描述不细 或 视觉设计文档 | 补场景细节 → 重跑 `scene-atmosphere` |
| 节奏不对 | 上游时长 / 平台约束 或 平台分镜不守规划 | 调整约束重跑 `shot-rhythm-planner`，或改平台分镜 |
| 平台 prompt 语法 / 镜头词 / 描述不具体 | 平台翻译层 | **直接手改平台分镜**（这是少数允许手改的地方） |
| 审片指出一堆问题但不知从哪下手 | 需要先归因 | 用 `feedback-diagnoser` 归因；**不要改审片报告** |
| 首尾帧与提示词对不上 | 参考图提示词 或 平台分镜 | 重出图或改平台分镜 → 重跑 `video-transition-auditor` |
| 参考图始终不稳 | 参考图提示词 或 视觉设计文档 / 场景氛围 | 改提示词重出；还不稳就回 `visual-director` / `scene-atmosphere` |
| 示意图里镜头路径就不顺 | 创意层（场景图不足）或 平台分镜 | 补场景图 → 重跑 `continuity-blocking-planner` → 改平台分镜 → 重生成示意图 |
| 不知道从哪开始、心态崩了 | 不是文档问题 | 先 `li-dan-mentor` 聊，再回链路 |

### 三条执行铁律

1. **导演分析/设计层的 7 份文档都不手改**（导演分镜蓝图、视觉设计文档、镜头节奏规划、场景氛围卡片、Blocking 检测报告、对话戏导演设计、动作戏导演编排）——下次重跑会覆盖
2. **审查/诊断层的 3 份报告永远只读**（审片报告、反馈归因报告、预检报告）——它们是指路牌，按它回头修对应层
3. **只有两处可以放心手改**：创意层（你自己的剧本 / `story-creator` 产出的故事文档）和平台翻译层（平台分镜脚本 / 参考图提示词）的平台表达部分

---

## `skills/` 目录结构

```text
skills/
├── li-dan-mentor/                     # 讨论陪练层
│   └── references/
│       ├── core-methodology.md
│       └── voice-and-quotes.md
├── story-creator/                     # 创意层
├── storyboard-blueprint/              # 导演分析/设计层
│   └── references/
│       ├── blueprint-template.md
│       └── analysis-checklist.md
├── visual-director/
├── shot-rhythm-planner/
├── scene-atmosphere/
├── continuity-blocking-planner/
│   └── references/
│       ├── blocking-template.md
│       └── continuity-checklist.md
├── dialogue-scene-director/
│   └── references/
│       ├── dialogue-template.md
│       └── dialogue-checklist.md
├── action-scene-choreographer/
│   └── references/
│       ├── action-template.md
│       └── action-checklist.md
├── seedance-storyboard/               # 平台翻译层
├── hailuo-storyboard/
├── wanxiang-storyboard/
├── vidu-storyboard/
├── reference-image-prompt-polisher/
├── gemini-batch-imagegen/             # 执行/预览层
├── storyboard-diagram/
├── storyboard-reviewer/               # 审查/诊断层
├── feedback-diagnoser/
│   └── references/
│       ├── diagnosis-template.md
│       └── symptom-map.md
├── video-transition-auditor/
├── remotion-best-practices/           # 辅助
└── skill-creator/                     # 辅助
```

---

## 专业知识来源

导演分析/设计层和反馈诊断层的大量方法，提炼自仓库中的 [分镜创作_markdown](./分镜创作_markdown/) 资料（一本关于分镜创作与导演思维的系统化书稿）。`li-dan-mentor` 基于李诞《工作手册》。

| 知识模块 | 对应技能 |
|----------|----------|
| 导演讲戏、剧情重点提炼、5W2H、强弱转换点 | `storyboard-blueprint`、`feedback-diagnoser` |
| 草分组装、镜头衔接、锚点意识、看不懂归因 | `storyboard-blueprint`、`continuity-blocking-planner`、`feedback-diagnoser` |
| 站位、走位、轴线、越轴、视线、动接、群戏空间 | `continuity-blocking-planner` |
| 对话戏权力变化、语速、表演、动静、借景抒情 | `dialogue-scene-director` |
| 对峙、攻防、三三原则、追逐、大招、收尾 | `action-scene-choreographer` |
| 视觉风格、色彩策略、光影氛围 | `visual-director`、`scene-atmosphere` |
| 节奏结构、景别分配、运镜变化 | `shot-rhythm-planner`、`storyboard-reviewer` |
| 李诞《工作手册》：创作量、五心法、真诚、长期主义 | `li-dan-mentor` |

---

## 一句话记住这个仓库

> **导演分析层和审查层的文档都不改自己；有问题要么往上补输入重跑，要么按它的建议改下游；想不清楚先找 `li-dan-mentor` 聊。**
