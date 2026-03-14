#!/usr/bin/env python3
import json
import re
import subprocess
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

API_KEY = "1b94cc4556msh5e18c965954ba06p1f0354jsn8373d4d95c2d"
API_HOST = "instagram120.p.rapidapi.com"
USERNAME = "emilizaremba"
VIRAL_CODE = "DVzI3WjAfYy"
HTML_PATH = Path("/home/clawd/marco_os/emili-helio-v3.html")
REPO_DIR = HTML_PATH.parent
TIMEZONE_BRT = timezone(timedelta(hours=-3), name="BRT")
TIMEOUT = 30


def fetch_json(url: str, payload: dict) -> dict:
    response = requests.post(
        url,
        headers={
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": API_HOST,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, dict):
        raise ValueError(f"Resposta inválida em {url}: {type(data).__name__}")
    return data


def format_pt_int(value: int) -> str:
    return f"{value:,}".replace(",", ".")


def format_short(value: int) -> str:
    if value >= 1_000_000:
        short = f"{value / 1_000_000:.2f}".rstrip("0").rstrip(".")
        return f"{short}M"
    if value >= 1_000:
        short = f"{value / 1_000:.0f}" if value >= 100_000 else f"{value / 1_000:.1f}"
        short = short.rstrip("0").rstrip(".")
        return f"{short}K"
    return str(value)


def fetch_instagram_stats() -> dict:
    profile = fetch_json(
        "https://instagram120.p.rapidapi.com/api/instagram/profile",
        {"username": USERNAME},
    )
    result = profile.get("result") or {}
    followers = result.get("follower_count")
    if followers is None:
        followers = ((result.get("edge_followed_by") or {}).get("count"))
    posts = result.get("media_count")
    if posts is None:
        posts = ((result.get("edge_owner_to_timeline_media") or {}).get("count"))

    if not isinstance(followers, int) or followers <= 0:
        raise ValueError(f"Follower count inválido: {followers!r}")
    if posts is not None and (not isinstance(posts, int) or posts < 0):
        raise ValueError(f"Media count inválido: {posts!r}")

    time.sleep(0.5)

    reels = fetch_json(
        "https://instagram120.p.rapidapi.com/api/instagram/reels",
        {"username": USERNAME},
    )

    edges = (reels.get("result") or {}).get("edges") or []
    if not edges:
        raise ValueError("API de reels retornou lista vazia")

    viral_views = None
    viral_likes = None
    total_likes = 0
    total_comments = 0
    count = 0

    for edge in edges:
        node = edge.get("node", {}) if isinstance(edge, dict) else {}
        media = node.get("media", node) if isinstance(node, dict) else {}
        if not isinstance(media, dict):
            continue
        code = media.get("code", "")
        likes = media.get("like_count", 0)
        comments = media.get("comment_count", 0)
        views = media.get("play_count", 0)

        if not all(isinstance(v, int) and v >= 0 for v in (likes, comments, views)):
            continue

        total_likes += likes
        total_comments += comments
        count += 1

        if code == VIRAL_CODE:
            viral_views = views
            viral_likes = likes

    if count == 0:
        raise ValueError("Nenhum reel válido para calcular engagement")
    if viral_views is None or viral_views <= 0:
        raise ValueError(f"Não encontrei views válidas para o viral {VIRAL_CODE}")
    if viral_likes is None or viral_likes <= 0:
        raise ValueError(f"Não encontrei likes válidos para o viral {VIRAL_CODE}")

    # Calcular engagement EXCLUINDO o viral (outlier)
    non_viral_likes = total_likes - (viral_likes or 0)
    non_viral_comments = total_comments
    non_viral_count = max(count - 1, 1)
    engagement = round(((non_viral_likes + non_viral_comments) / non_viral_count / followers) * 100, 2)
    if engagement <= 0:
        raise ValueError(f"Engagement inválido: {engagement}")

    return {
        "followers": followers,
        "posts": posts,
        "viral_views": viral_views,
        "viral_likes": viral_likes,
        "engagement": engagement,
    }


def replace_once(text: str, pattern: str, repl: str, *, flags: int = 0, desc: str = "") -> str:
    updated, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise ValueError(f"Não consegui atualizar {desc or pattern}")
    return updated


def update_html(stats: dict) -> str:
    html = HTML_PATH.read_text(encoding="utf-8")
    now = datetime.now(TIMEZONE_BRT)
    timestamp = now.strftime("%d/%m/%Y %H:%M BRT")

    followers = stats["followers"]
    viral_views = stats["viral_views"]
    viral_likes = stats["viral_likes"]
    engagement = stats["engagement"]

    html = replace_once(
        html,
        r'(<div class="chip">)([0-9]+,[0-9]{2}% de engagement)(</div>)',
        rf'\g<1>{engagement:.2f}'.replace('.', ',') + r'% de engagement\g<3>',
        desc="chip de engagement",
    )
    html = replace_once(
        html,
        r'(<div class="label">Seguidores</div><div class="value">)([0-9][0-9\.,]*)(</div>)',
        rf'\g<1>{format_pt_int(followers)}\g<3>',
        desc="KPI de seguidores",
    )
    html = replace_once(
        html,
        r'(<div class="label">Engagement</div><div class="value">)([0-9]+\.[0-9]{2}%)(</div>)',
        rf'\g<1>{engagement:.2f}%\g<3>',
        desc="KPI de engagement",
    )
    html = replace_once(
        html,
        r'(<div class="label">Views Viral</div><div class="value">)([^<]+)(</div>)',
        rf'\g<1>{format_short(viral_views)}\g<3>',
        desc="KPI de views viral",
    )
    html = replace_once(
        html,
        r'(<div class="label">Likes Viral</div><div class="value">)([^<]+)(</div>)',
        rf'\g<1>{format_short(viral_likes)}\g<3>',
        desc="KPI de likes viral",
    )
    html = replace_once(
        html,
        r"pts\.push\(\{l:'@emilizaremba',f:[0-9]+,e:[0-9]+(?:\.[0-9]+)?,r:5,risk:'Muito Alto',niche:'Perfil atual',me:1\}\);",
        f"pts.push({{l:'@emilizaremba',f:{followers},e:{engagement:.2f},r:5,risk:'Muito Alto',niche:'Perfil atual',me:1}});",
        desc="dados do scatter",
    )
    html = replace_once(
        html,
        r'(<div class="overview-footer" id="overviewFooter">)([^<]+)(</div>)',
        rf'\g<1>Atualizado em {timestamp}\g<3>',
        desc="footer de atualização",
    )

    HTML_PATH.write_text(html, encoding="utf-8")
    return timestamp


def run_git(stats: dict) -> None:
    commit_message = f"auto: update IG stats — {stats['followers']} followers, {stats['viral_views']} viral views"
    subprocess.run(["git", "add", HTML_PATH.name, Path(__file__).name], cwd=REPO_DIR, check=True)

    diff = subprocess.run(
        ["git", "diff", "--cached", "--quiet"], cwd=REPO_DIR
    )
    if diff.returncode == 0:
        print("Sem mudanças para commitar.")
        return
    if diff.returncode not in (0, 1):
        raise subprocess.CalledProcessError(diff.returncode, diff.args)

    subprocess.run(["git", "commit", "-m", commit_message], cwd=REPO_DIR, check=True)
    subprocess.run(["git", "push", "origin", "gh-pages"], cwd=REPO_DIR, check=True)


def main() -> int:
    try:
        stats = fetch_instagram_stats()
        timestamp = update_html(stats)
        print(json.dumps({"status": "updated", "timestamp": timestamp, **stats}, ensure_ascii=False, indent=2))
        run_git(stats)
        return 0
    except Exception as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
