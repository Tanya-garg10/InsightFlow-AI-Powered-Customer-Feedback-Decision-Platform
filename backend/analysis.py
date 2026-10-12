import json
import re
from typing import Dict, Any, Tuple

VALID_SENTIMENTS = {"positive", "negative", "neutral", "mixed"}
VALID_SEVERITIES = {"low", "medium", "high", "unknown"}

def clean_completion_json(raw: str) -> str:
    """Strip markdown codeblocks and escaped double quotes from LLM completion."""
    cleaned = raw.strip()
    if cleaned.startswith("```json"):
        cleaned = re.sub(r"^```json\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    elif cleaned.startswith("```"):
        cleaned = re.sub(r"^```\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    
    if '""' in cleaned:
        cleaned = cleaned.replace('""', '"')
    return cleaned.strip()

def parse_adapted_completion(raw_completion: str) -> Tuple[Dict[str, Any], bool, str]:
    """
    Parses and validates the JSON output from Adaption.
    Returns (parsed_dict, is_valid, warning_or_error)
    """
    try:
        cleaned = clean_completion_json(raw_completion)
        data = json.loads(cleaned)

        sentiment = data.get("sentiment", "neutral").lower()
        if sentiment not in VALID_SENTIMENTS:
            sentiment = "neutral"

        severity = data.get("severity", "unknown").lower()
        if severity not in VALID_SEVERITIES:
            severity = "unknown"

        key_topics = data.get("key_topics", [])
        if isinstance(key_topics, list):
            topics_str = ", ".join(key_topics)
        else:
            topics_str = str(key_topics)

        result = {
            "sentiment": sentiment,
            "severity": severity,
            "issue_summary": data.get("issue_summary", ""),
            "key_topics": topics_str,
            "recommended_action": data.get("recommended_action", ""),
            "evidence": data.get("evidence", ""),
        }
        return result, True, ""
    except Exception as e:
        return {}, False, str(e)

def run_local_baseline(review: str, category: str) -> Dict[str, Any]:
    """
    Transparent, lightweight local sentiment & severity baseline.
    Does not pretend to be artificial general intelligence.
    """
    text = review.lower()
    
    pos_words = ["great", "excellent", "love", "helpful", "promptly", "exceeded", "perfect", "exceptional", "satisfied", "innovative", "smooth", "durable"]
    neg_words = ["scam", "fraud", "defective", "unresponsive", "unhelpful", "unresolved", "delayed", "damaged", "crashing", "glitches", "counterfeit", "disappointed"]
    
    pos_count = sum(1 for w in pos_words if w in text)
    neg_count = sum(1 for w in neg_words if w in text)
    
    if pos_count > 0 and neg_count > 0:
        sentiment = "mixed"
    elif pos_count > neg_count:
        sentiment = "positive"
    elif neg_count > pos_count:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    if any(w in text for w in ["fraud", "scam", "counterfeit", "charged multiple times", "never received"]):
        severity = "high"
    elif any(w in text for w in ["delayed", "damaged", "defects", "wrong items", "glitches", "crashing"]):
        severity = "medium"
    elif sentiment == "positive":
        severity = "low"
    else:
        severity = "unknown"

    topics = []
    if category == "Fraud and Scam":
        topics.append("Fraud Allegation")
    elif category == "Operational Issues":
        topics.append("Logistics & Platform Reliability")
    elif category == "Customer Service":
        topics.append("Support Responsiveness")
    else:
        topics.append("Product Experience")

    return {
        "sentiment": sentiment,
        "severity": severity,
        "issue_summary": f"Feedback on {category}: {review[:80]}...",
        "key_topics": ", ".join(topics),
        "recommended_action": "Audit review details and route to category lead." if severity in ["high", "medium"] else "Document customer satisfaction benchmark.",
        "evidence": review[:120],
        "provenance": "transparent_baseline"
    }

def calculate_priority_score(frequency: int, severity: str, evidence_quality: float = 1.0) -> int:
    """
    Priority Score Heuristic Formula:
    Score = (NormFrequency * 40) + (SeverityWeight * 40) + (EvidenceQuality * 20)
    """
    norm_freq = min(1.0, frequency / 10.0)
    sev_weights = {"high": 1.0, "medium": 0.66, "low": 0.33, "unknown": 0.33}
    norm_sev = sev_weights.get(severity, 0.33)
    norm_qual = min(1.0, max(0.0, evidence_quality))

    return int(round((norm_freq * 40) + (norm_sev * 40) + (norm_qual * 20)))
