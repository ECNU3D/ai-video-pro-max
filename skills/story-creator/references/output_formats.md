# 输出格式参考

本文档定义了各阶段生成内容的 JSON 结构，供生成时参考以保持格式一致。

## 目录
1. [故事大纲格式](#故事大纲格式)
2. [角色设计格式](#角色设计格式)
3. [剧集大纲格式](#剧集大纲格式)
4. [一致性检查格式](#一致性检查格式)
5. [完整项目导出格式](#完整项目导出格式)

---

## 故事大纲格式

```json
{
    "title": "故事标题",
    "synopsis": "200字以内的故事简介",
    "theme": "核心主题",
    "characters": [
        {
            "name": "角色名称",
            "age": "年龄（如：25岁、中年等）",
            "appearance": "外貌描述（100字以内）",
            "personality": "性格特点（50字以内）",
            "background": "背景故事（100字以内）",
            "relationships": "与其他角色的关系",
            "visual_description": "英文视觉描述（50词以内，用于AI视频生成）"
        }
    ],
    "episodes": [
        {
            "episode_number": 1,
            "title": "本集标题",
            "outline": "本集剧情大纲（100-200字）",
            "key_events": ["关键事件1", "关键事件2"]
        }
    ]
}
```

### 字段说明
- `title`：2-10个字的故事标题，简洁有力
- `synopsis`：概括整个故事的核心冲突和走向
- `theme`：用一句话概括故事想要表达的核心思想
- `characters`：正好是用户指定数量的角色
- `episodes`：正好是用户指定集数的剧集概要
- `visual_description`：**必须用英文**，包含年龄、性别、发型、服装、体型、标志特征

---

## 角色设计格式

```json
{
    "characters": [
        {
            "name": "角色姓名",
            "age": "28岁",
            "appearance": "身材高大，短发利落，脸上有一道战斗留下的伤疤，眼神坚毅",
            "personality": "沉默寡言但意志坚定，重视战友，有牺牲精神",
            "background": "前特种兵，家人死于虫族第一波入侵，加入机甲部队复仇",
            "relationships": "与苏晴互相信任，对陈指挥官又敬又畏",
            "role": "主角",
            "visual_description": "Tall muscular Asian man, 28 years old, short black hair, scar on left cheek, wearing dark military uniform, determined gaze",
            "major_events": []
        }
    ]
}
```

### 角色定位类型
- 主角、配角、反派、导师、伙伴、爱人、对手

---

## 剧集大纲格式

```json
{
    "episodes": [
        {
            "episode_number": 1,
            "title": "本集标题",
            "outline": "详细的剧情大纲（100-200字），描述主要事件、角色互动和情感转折",
            "key_events": [
                "关键事件1：[具体描述]",
                "关键事件2：[具体描述]",
                "关键事件3：[具体描述]"
            ],
            "duration": 60
        }
    ]
}
```

---

## 一致性检查格式

```json
{
    "issues": [
        {
            "type": "episode",
            "name": "第2集 - 重逢",
            "issue": "角色A与角色B被描述为'第一次见面'，但他们在第1集已经相遇过",
            "severity": "error",
            "suggested_fix": "将'第一次见面'改为'再次相遇'",
            "auto_fixable": true
        }
    ],
    "overall_assessment": "好/一般/需要改进"
}
```

### 严重程度
- `error`：严重矛盾，必须修复
- `warning`：建议修复，不影响核心理解

---

## 完整项目导出格式

导出为 Markdown 文档时使用以下结构：

```markdown
# 《故事标题》

## 项目信息
- **类型**：科幻
- **风格**：赛博朋克
- **目标受众**：18-35岁科幻爱好者
- **集数**：3集
- **每集时长**：60秒

## 故事简介
[synopsis内容]

## 核心主题
[theme内容]

---

## 角色设计

### 角色1：[姓名]
- **年龄**：[age]
- **外貌**：[appearance]
- **性格**：[personality]
- **背景**：[background]
- **关系**：[relationships]
- **视觉描述**：[visual_description]

---

## 剧集大纲

### 第1集：《[标题]》
[outline内容]

**关键事件：**
- [事件1]
- [事件2]

```
