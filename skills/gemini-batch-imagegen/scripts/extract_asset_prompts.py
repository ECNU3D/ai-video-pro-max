#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


HEADING_RE = re.compile(r"^###\s+(.+?)\s*$", re.MULTILINE)
TOP_HEADING_RE = re.compile(r"^#\s+(.+?)\s*$", re.MULTILINE)
CODE_BLOCK_RE = re.compile(r"```(?:\w+)?\n(.*?)```", re.DOTALL)
STYLE_PREFIX_RE = re.compile(r"通用画风[^`]*`([^`]+)`")
ID_RE = re.compile(r"\b([CPS]\d+(?:-[A-Z0-9]+)?)\b")
SHOT_RE = re.compile(r"^#\s*分镜\s*(\d+)\s*[｜|]\s*(.+?)\s*$", re.MULTILINE)
KEYFRAME_RE = re.compile(r"^###\s*Keyframe\s+(Start|End)\s*$", re.MULTILINE | re.IGNORECASE)
INLINE_FIELD_RE = re.compile(r"^\*\*(.+?)：\*\*\s*(.*)$", re.MULTILINE)
FIELD_START_RE = re.compile(r"^\*\*(.+?)：\*\*\s*$", re.MULTILINE)
SHOT_BLOCK_RE = re.compile(r"^###\s*【?分镜\s*(\d+)\s*/\s*(\d+)】?.*$", re.MULTILINE)
SUPPLEMENT_SECTION_RE = re.compile(r"^###\s*补充素材\s*$", re.MULTILINE)
SUPPLEMENT_ITEM_RE = re.compile(r"^####\s*补充素材\s+(.+?)\s*$", re.MULTILINE)

KIND_PREFIXES = {
    "角色": "character",
    "道具": "prop",
    "场景": "scene",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract character / prop / scene prompts from a script markdown file."
    )
    parser.add_argument("markdown_path", help="Path to the source markdown file")
    parser.add_argument(
        "--ids",
        help="Comma-separated asset IDs to keep, for example C01,S14",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print JSON instead of human-readable text",
    )
    return parser.parse_args()


def detect_style_prefix(text: str) -> str:
    match = STYLE_PREFIX_RE.search(text)
    return match.group(1).strip() if match else ""


def sanitize_file_stem(text: str) -> str:
    text = text.strip()
    text = re.sub(r"[·•]+", "-", text)
    text = re.sub(r"[（）()]+", "-", text)
    text = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", text, flags=re.UNICODE)
    text = re.sub(r"-{2,}", "-", text)
    return text.strip("-")


def normalize_prompt(prompt: str, style_prefix: str) -> str:
    prompt = prompt.strip()
    if "【通用画风前缀】" in prompt and style_prefix:
        prompt = prompt.replace("【通用画风前缀】", style_prefix)
    return prompt


def kind_from_asset_id(asset_id: str) -> str:
    if asset_id.startswith("C"):
        return "character"
    if asset_id.startswith("P"):
        return "prop"
    if asset_id.startswith("S"):
        return "scene"
    return "asset"


def parse_supplement_entries(text: str) -> list[dict[str, str]]:
    section_match = SUPPLEMENT_SECTION_RE.search(text)
    if not section_match:
        return []

    tail = text[section_match.end():]
    next_major = re.search(r"^##\s+", tail, re.MULTILINE)
    section = tail[: next_major.start()] if next_major else tail
    matches = list(SUPPLEMENT_ITEM_RE.finditer(section))
    entries: list[dict[str, str]] = []

    for index, match in enumerate(matches):
        heading = match.group(1).strip()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(section)
        item_section = section[start:end]
        code_match = CODE_BLOCK_RE.search(item_section)
        if not code_match:
            continue

        asset_id_match = ID_RE.search(heading)
        asset_id = asset_id_match.group(1) if asset_id_match else ""
        title = heading
        if "·" in heading:
            title = heading.split("·", 1)[1].strip()

        prompt_raw = code_match.group(1).strip()
        prompt = prompt_raw
        file_stem = sanitize_file_stem(f"{asset_id}-{title}" if asset_id else title)

        entries.append(
            {
                "kind": kind_from_asset_id(asset_id),
                "id": asset_id,
                "heading": heading,
                "title": title,
                "style_prefix": "",
                "prompt_raw": prompt_raw,
                "prompt": prompt,
                "file_stem": file_stem,
            }
        )

    return entries


def parse_asset_entries(text: str) -> list[dict[str, str]]:
    style_prefix = detect_style_prefix(text)
    matches = list(HEADING_RE.finditer(text))
    entries: list[dict[str, str]] = []

    for index, match in enumerate(matches):
        heading = match.group(1).strip()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        section = text[start:end]

        prefix = heading.split(" ", 1)[0]
        kind = KIND_PREFIXES.get(prefix)
        if not kind:
            continue

        code_match = CODE_BLOCK_RE.search(section)
        if not code_match:
            continue

        asset_id_match = ID_RE.search(heading)
        asset_id = asset_id_match.group(1) if asset_id_match else ""

        title = heading
        if "·" in heading:
            title = heading.split("·", 1)[1].strip()

        prompt_raw = code_match.group(1).strip()
        prompt = normalize_prompt(prompt_raw, style_prefix)
        file_stem = sanitize_file_stem(f"{asset_id}-{title}" if asset_id else title)

        entries.append(
            {
                "kind": kind,
                "id": asset_id,
                "heading": heading,
                "title": title,
                "style_prefix": style_prefix,
                "prompt_raw": prompt_raw,
                "prompt": prompt,
                "file_stem": file_stem,
            }
        )

    return entries


def split_labeled_fields(section: str) -> list[tuple[str, str]]:
    matches = list(FIELD_START_RE.finditer(section))
    fields: list[tuple[str, str]] = []

    for index, match in enumerate(matches):
        label = match.group(1).strip()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(section)
        value = section[start:end].strip()
        if value:
            fields.append((label, value))

    if fields:
        return fields

    inline_matches = INLINE_FIELD_RE.findall(section)
    return [(label.strip(), value.strip()) for label, value in inline_matches if value.strip()]


def build_storyboard_prompt(section: str) -> str:
    fields = split_labeled_fields(section)
    if not fields:
        return ""
    return "\n".join(f"{label}：\n{value}" for label, value in fields)


def parse_storyboard_entries(text: str) -> list[dict[str, str]]:
    shot_matches = list(SHOT_RE.finditer(text))
    entries: list[dict[str, str]] = []

    for shot_index, shot_match in enumerate(shot_matches):
        shot_number = int(shot_match.group(1))
        shot_title = shot_match.group(2).strip()
        shot_start = shot_match.end()
        shot_end = shot_matches[shot_index + 1].start() if shot_index + 1 < len(shot_matches) else len(text)
        shot_section = text[shot_start:shot_end]

        keyframes = list(KEYFRAME_RE.finditer(shot_section))
        for keyframe_index, keyframe_match in enumerate(keyframes):
            frame_type = keyframe_match.group(1).lower()
            start = keyframe_match.end()
            end = keyframes[keyframe_index + 1].start() if keyframe_index + 1 < len(keyframes) else len(shot_section)
            frame_section = shot_section[start:end]
            prompt = build_storyboard_prompt(frame_section)
            if not prompt:
                continue

            frame_label = "start" if frame_type == "start" else "end"
            asset_id = f"SHOT{shot_number:02d}_{frame_label.upper()}"
            title = f"分镜{shot_number} {shot_title} {frame_label}"
            file_stem = sanitize_file_stem(f"{asset_id}-{shot_title}-{frame_label}")

            entries.append(
                {
                    "kind": "storyboard",
                    "id": asset_id,
                    "heading": f"分镜{shot_number} {shot_title} / {frame_label}",
                    "title": title,
                    "style_prefix": "",
                    "prompt_raw": prompt,
                    "prompt": prompt,
                    "file_stem": file_stem,
                }
            )

    return entries


def parse_shot_prompt_entries(text: str) -> list[dict[str, str]]:
    matches = list(SHOT_BLOCK_RE.finditer(text))
    entries: list[dict[str, str]] = []

    for index, match in enumerate(matches):
        shot_number = int(match.group(1))
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        section = text[start:end]
        code_match = CODE_BLOCK_RE.search(section)
        if not code_match:
            continue

        title = match.group(0).strip("# ").strip()
        prompt = code_match.group(1).strip()
        asset_id = f"SHOT{shot_number:02d}"
        file_stem = sanitize_file_stem(f"{asset_id}-{title}")

        entries.append(
            {
                "kind": "storyboard",
                "id": asset_id,
                "heading": title,
                "title": title,
                "style_prefix": "",
                "prompt_raw": prompt,
                "prompt": prompt,
                "file_stem": file_stem,
            }
        )

    return entries


def extract_entries(text: str) -> list[dict[str, str]]:
    entries = parse_supplement_entries(text)
    if entries:
        return entries
    entries = parse_asset_entries(text)
    if entries:
        return entries
    entries = parse_storyboard_entries(text)
    if entries:
        return entries
    return parse_shot_prompt_entries(text)


def main() -> int:
    args = parse_args()
    markdown_path = Path(args.markdown_path).expanduser().resolve()
    if not markdown_path.is_file():
        print(f"Markdown file not found: {markdown_path}", file=sys.stderr)
        return 1

    text = markdown_path.read_text(encoding="utf-8")
    entries = extract_entries(text)
    if not entries:
        print(
            "No supported prompt pattern detected. Try inferring the document's repeated structure and confirm the split rule with the user.",
            file=sys.stderr,
        )
        return 2

    if args.ids:
        wanted = {item.strip() for item in args.ids.split(",") if item.strip()}
        entries = [entry for entry in entries if entry["id"] in wanted]

    if args.json:
        print(json.dumps(entries, ensure_ascii=False, indent=2))
        return 0

    for entry in entries:
        print(f"[{entry['kind']}] {entry['id']} {entry['title']}")
        print(f"file_stem: {entry['file_stem']}")
        print(entry["prompt"])
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
