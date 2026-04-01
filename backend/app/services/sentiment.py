# ─────────────────────────────────────────────────────────────
#  services/sentiment.py  — Keyword-based sentiment + crisis detection
#  (No external ML dependency — works offline; swap for BERT if needed)
# ─────────────────────────────────────────────────────────────
import re
from dataclasses import dataclass
from typing import Tuple


# ── Keyword banks ────────────────────────────────────────────

CRISIS_TIER3 = [
    r"\bsuicid\w*\b", r"\bkill\s+myself\b", r"\bend\s+my\s+life\b",
    r"\bwant\s+to\s+die\b", r"\bno\s+reason\s+to\s+live\b",
    r"\bself.?harm\b", r"\bhurt\s+myself\b", r"\bcut\s+myself\b",
    r"\boverdose\b", r"\bjump\s+off\b", r"\bhanging\s+myself\b",
    r"\bdon'?t\s+want\s+to\s+(be\s+)?alive\b",
]

CRISIS_TIER2 = [
    r"\bcan'?t\s+(go\s+on|cope|take\s+it)\b", r"\bgiving\s+up\b",
    r"\bno\s+hope\b", r"\bworthless\b", r"\buseless\b",
    r"\bnobody\s+cares\b", r"\bfeel\s+like\s+a\s+burden\b",
    r"\btrapped\b", r"\bescap(e|ing)\b", r"\bpanic\s+attack\b",
    r"\bbreakdown\b", r"\bfall\s+apart\b",
]

SENTIMENT_MAP = {
    "happy":     [r"\bhappy\b", r"\bjoy\w*\b", r"\bexcited\b", r"\bgrateful\b",
                  r"\bblessed\b", r"\bgreat\b", r"\bamazing\b", r"\bwonderful\b",
                  r"\bthankful\b", r"\boptimistic\b", r"\bcheerful\b"],
    "sad":       [r"\bsad\b", r"\bcry\w*\b", r"\btear\w*\b", r"\bgrief\b",
                  r"\blonely\b", r"\balone\b", r"\bmiss\w*\b", r"\bhurt\b",
                  r"\bpain\b", r"\bbroken\b", r"\bnumb\b"],
    "anxious":   [r"\banxi\w*\b", r"\bworr\w*\b", r"\bnervous\b", r"\bscared\b",
                  r"\bfear\w*\b", r"\bpanic\w*\b", r"\bstress\w*\b",
                  r"\boverwhelm\w*\b", r"\btense\b", r"\buneasy\b"],
    "depressed": [r"\bdepress\w*\b", r"\bhopeless\b", r"\bempty\b",
                  r"\bworthless\b", r"\bexhaust\w*\b", r"\btired\s+of\b",
                  r"\bcan'?t\s+get\s+up\b", r"\bno\s+energy\b",
                  r"\bno\s+motivation\b", r"\bfeel\s+nothing\b"],
    "angry":     [r"\bangr\w*\b", r"\bfurious\b", r"\brage\b", r"\bfrustr\w*\b",
                  r"\birritat\w*\b", r"\bhatred\b", r"\bhate\b"],
}

# Mood score mapping (1–10)
MOOD_SCORES = {
    "happy": 8.0,
    "neutral": 5.0,
    "anxious": 3.5,
    "angry": 3.0,
    "sad": 2.5,
    "depressed": 1.5,
}


@dataclass
class AnalysisResult:
    sentiment: str       # happy | sad | anxious | depressed | angry | neutral
    crisis_tier: int     # 0 | 1 | 2 | 3
    mood_score: float    # 1–10


def analyse(text: str) -> AnalysisResult:
    """
    Analyse user text for sentiment and crisis tier.
    Returns an AnalysisResult dataclass.
    """
    lower = text.lower()

    # ── Crisis detection (highest priority) ──────────────────
    for pattern in CRISIS_TIER3:
        if re.search(pattern, lower):
            return AnalysisResult("depressed", 3, 1.0)

    for pattern in CRISIS_TIER2:
        if re.search(pattern, lower):
            return AnalysisResult("depressed", 2, 2.0)

    # ── Sentiment scoring ─────────────────────────────────────
    scores: dict[str, int] = {k: 0 for k in SENTIMENT_MAP}
    for sentiment, patterns in SENTIMENT_MAP.items():
        for p in patterns:
            if re.search(p, lower):
                scores[sentiment] += 1

    best = max(scores, key=lambda k: scores[k])
    if scores[best] == 0:
        best = "neutral"

    # Tier 1 if depressed/sad with no crisis keywords
    tier = 1 if best in ("depressed", "sad", "anxious") else 0

    return AnalysisResult(
        sentiment=best,
        crisis_tier=tier,
        mood_score=MOOD_SCORES.get(best, 5.0),
    )
