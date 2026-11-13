"""Compatibility Engine — transparent, explainable scoring."""
from __future__ import annotations

from typing import Any

DIMENSION_WEIGHTS = {
    "cleanliness": 0.40,
    "sleep": 0.30,
    "guests": 0.30,
}

SIMILARITY_MATRIX: dict[str, dict[tuple[str, str], float]] = {
    "cleanliness": {
        ("proactive", "proactive"): 1.0,
        ("proactive", "balanced"): 0.7,
        ("proactive", "relaxed"): 0.2,
        ("balanced", "balanced"): 1.0,
        ("balanced", "relaxed"): 0.7,
        ("relaxed", "relaxed"): 1.0,
    },
    "sleep": {
        ("early_bird", "early_bird"): 1.0,
        ("early_bird", "flexible"): 0.8,
        ("early_bird", "night_owl"): 0.3,
        ("flexible", "flexible"): 1.0,
        ("flexible", "night_owl"): 0.8,
        ("night_owl", "night_owl"): 1.0,
    },
    "guests": {
        ("minimal", "minimal"): 1.0,
        ("minimal", "moderate"): 0.6,
        ("minimal", "social"): 0.2,
        ("moderate", "moderate"): 1.0,
        ("moderate", "social"): 0.8,
        ("social", "social"): 1.0,
    },
}

DIMENSION_TITLES = {
    "cleanliness": "Cleanliness & Chores",
    "sleep": "Sleep & Quiet Hours",
    "guests": "Guests & Social Habits",
}


def get_similarity(dimension: str, val_a: str, val_b: str) -> float:
    matrix = SIMILARITY_MATRIX.get(dimension, {})
    pair = (val_a, val_b)
    if pair in matrix:
        return matrix[pair]
    rev = (val_b, val_a)
    if rev in matrix:
        return matrix[rev]
    return 0.5


def calculate_compatibility(
    answers_a: dict[str, str],  # {dimension: answer_val}
    answers_b: dict[str, str],
    dealbreakers_a: dict[str, list[str]],  # {question_key: [unacceptable_values]}
    dealbreakers_b: dict[str, list[str]],
) -> dict[str, Any]:
    # 1. Check Hard Dealbreakers first
    for key, unacc in dealbreakers_a.items():
        if key in answers_b and answers_b[key] in unacc:
            return {
                "score": 0,
                "is_dealbreaker": True,
                "confidence": 100,
                "alignments": [],
                "potential_frictions": [f"Conflicts with hard dealbreaker: {key}"],
            }

    for key, unacc in dealbreakers_b.items():
        if key in answers_a and answers_a[key] in unacc:
            return {
                "score": 0,
                "is_dealbreaker": True,
                "confidence": 100,
                "alignments": [],
                "potential_frictions": [f"Conflicts with candidate's hard dealbreaker: {key}"],
            }

    # 2. Compute weighted similarity
    total_weight = 0.0
    weighted_sim = 0.0
    alignments: list[str] = []
    potential_frictions: list[str] = []

    for dim, weight in DIMENSION_WEIGHTS.items():
        val_a = answers_a.get(dim)
        val_b = answers_b.get(dim)
        dim_title = DIMENSION_TITLES.get(dim, dim.capitalize())

        if val_a and val_b:
            sim = get_similarity(dim, val_a, val_b)
            weighted_sim += sim * weight
            total_weight += weight

            if sim >= 0.8:
                alignments.append(f"Strong match on {dim_title}")
            elif sim <= 0.4:
                potential_frictions.append(f"Different expectations on {dim_title}")
        else:
            # Missing data: do not assume perfect match
            potential_frictions.append(f"Unanswered {dim_title} (reduces confidence)")

    if total_weight > 0:
        raw_score = (weighted_sim / total_weight) * 100
        # Confidence penalty if dimensions are missing
        confidence = int((total_weight / sum(DIMENSION_WEIGHTS.values())) * 100)
        final_score = int(raw_score * (confidence / 100))
    else:
        final_score = 50  # Neutral baseline when neither answered
        confidence = 0

    return {
        "score": final_score,
        "is_dealbreaker": False,
        "confidence": confidence,
        "alignments": alignments,
        "potential_frictions": potential_frictions,
    }
