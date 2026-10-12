import unittest
from backend.analysis import parse_adapted_completion, clean_completion_json, run_local_baseline, calculate_priority_score

class TestInsightFlowAnalysis(unittest.TestCase):
    def test_clean_completion_json_markdown(self):
        raw = "```json\n{\"sentiment\": \"positive\", \"issue_summary\": \"Great product\"}\n```"
        cleaned = clean_completion_json(raw)
        self.assertEqual(cleaned, '{"sentiment": "positive", "issue_summary": "Great product"}')

    def test_parse_adapted_completion_valid(self):
        raw = '{"sentiment": "positive", "issue_summary": "Design is sleek", "key_topics": ["Design"], "severity": "low", "recommended_action": "Maintain design", "evidence": "sleek"}'
        parsed, is_valid, error = parse_adapted_completion(raw)
        self.assertTrue(is_valid)
        self.assertEqual(parsed["sentiment"], "positive")
        self.assertEqual(parsed["severity"], "low")
        self.assertIn("Design", parsed["key_topics"])

    def test_parse_adapted_completion_malformed(self):
        raw = "this is not json at all"
        parsed, is_valid, error = parse_adapted_completion(raw)
        self.assertFalse(is_valid)
        self.assertTrue(len(error) > 0)

    def test_run_local_baseline_negative(self):
        review = "I was scammed by a fraudulent seller and lost money"
        result = run_local_baseline(review, "Fraud and Scam")
        self.assertEqual(result["sentiment"], "negative")
        self.assertEqual(result["severity"], "high")
        self.assertIn("Fraud Allegation", result["key_topics"])

    def test_calculate_priority_score_bounds(self):
        high_score = calculate_priority_score(frequency=10, severity="high", evidence_quality=1.0)
        self.assertEqual(high_score, 100)
        low_score = calculate_priority_score(frequency=1, severity="low", evidence_quality=0.5)
        self.assertTrue(10 <= low_score <= 40)

if __name__ == '__main__':
    unittest.main()
