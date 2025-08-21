def compute_credibility_score(
    age_years: int = 0,
    market_cap: float = 0,
    employees: int = 0,
    domain_age: int = 0,
    sentiment_score: float = 0.5,
    certified: bool = False,
    funded_by_top_investors: bool = False
) -> tuple[float, dict]:
    """
    Computes a credibility score as a float (e.g., 98.5) based on weighted metrics.
    """

    def safe(value, default=0):
        return value if isinstance(value, (int, float)) and value is not None else default

    # Normalized scores (capped)
    factors = {
        "age": min(safe(age_years) / 3, 10),                # Max at 30 years
        "market_cap": min(safe(market_cap) / 1e8, 10),      # Max at $1B
        "employee_count": min(safe(employees) / 100, 10),   # Max at 1,000
        "domain_age": min(safe(domain_age) / 2, 10),        # Max at 20 years
        "online_sentiment": min(safe(sentiment_score, 0.5) * 10, 10),  # Score from 0–10
        "certifications": 10 if certified else 0,
        "funding_backing": 10 if funded_by_top_investors else 0,
    }

    # Weights for each factor
    weights = {
        "age": 0.20,
        "market_cap": 0.20,
        "employee_count": 0.15,
        "domain_age": 0.10,
        "online_sentiment": 0.15,
        "certifications": 0.10,
        "funding_backing": 0.10,
    }

    # Weighted average and final float score
    weighted_total = sum(factors[k] * weights[k] for k in factors)
    final_score = round(weighted_total * 10, 2)  # Keep two decimal points (0–100 scale)

    return final_score, factors
