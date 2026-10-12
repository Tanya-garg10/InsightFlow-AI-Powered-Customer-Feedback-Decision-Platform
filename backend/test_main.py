from backend.analysis import parse_adapted_completion, clean_completion_json, run_local_baseline, calculate_priority_score

def test_clean_completion_json_markdown():
    raw = "```json\n{\"sentiment\": \"positive\", \"issue_summary\": \"Great product\"}\n```"
    cleaned = clean_completion_json(raw)
    assert cleaned == '{"sentiment": "positive", "issue_summary": "Great product"}'

def test_parse_adapted_completion_valid():
    raw = '{"sentiment": "positive", "issue_summary": "Design is sleek", "key_topics": ["Design"], "severity": "low", "recommended_action": "Maintain design", "evidence": "sleek"}'
    parsed, is_valid, error = parse_adapted_completion(raw)
    assert is_valid is True
    assert parsed["sentiment"] == "positive"
    assert parsed["severity"] == "low"
    assert "Design" in parsed["key_topics"]

def test_parse_adapted_completion_malformed():
    raw = "this is not json at all"
    parsed, is_valid, error = parse_adapted_completion(raw)
    assert is_valid is False
    assert len(error) > 0

def test_run_local_baseline_negative():
    review = "I was scammed by a fraudulent seller and lost money"
    result = run_local_baseline(review, "Fraud and Scam")
    assert result["sentiment"] == "negative"
    assert result["severity"] == "high"
    assert "Fraud Allegation" in result["key_topics"]

def test_calculate_priority_score_bounds():
    high_score = calculate_priority_score(frequency=10, severity="high", evidence_quality=1.0)
    assert high_score == 100
    low_score = calculate_priority_score(frequency=1, severity="low", evidence_quality=0.5)
    assert 10 <= low_score <= 40
