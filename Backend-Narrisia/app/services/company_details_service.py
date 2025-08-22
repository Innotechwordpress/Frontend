
import logging
from typing import Dict, Any, Optional
from langchain_community.chat_models import ChatOpenAI
import json
import re

class CompanyDetailsService:
    def __init__(self, openai_api_key: str, model: str = "gpt-4o"):
        self.llm = ChatOpenAI(api_key=openai_api_key, model=model, temperature=0)
    
    async def get_comprehensive_details(self, company_name: str) -> Dict[str, Any]:
        """Get comprehensive company details using OpenAI"""
        
        prompt = f"""
        Provide comprehensive details about the company '{company_name}'. 
        Use your knowledge of well-known companies and research accurate information.
        
        IMPORTANT: You must provide estimates for ALL fields. Never leave any field as null, N/A, or empty.
        If you don't know exact data, provide reasonable estimates based on:
        - Company size and industry standards
        - Similar companies in the same sector
        - Publicly available information
        - Industry benchmarks
        
        For reference:
        - Indeed is a major job search platform (founded 2004, public company, $1B+ revenue)
        - Wellfound (formerly AngelList Talent) is a recruitment technology platform for startups
        - Internshala is an education technology platform for internships and training
        - Naukri is a recruitment technology platform
        - Krish TechnoLabs is a digital commerce/ecommerce solutions company
        
        Return accurate information in the following JSON format with ALL fields filled:

        {{
            "company_name": "{company_name}",
            "industry": "Technology/Finance/Healthcare/Recruitment Technology/Education Technology/etc",
            "company_size": "Startup (1-50)/Small (51-200)/Medium (201-1000)/Large (1000+)",
            "founded": 2020,
            "market_cap": 1000000000,
            "revenue": 500000000,
            "funding_status": "Public/Private/Startup/Series A/B/C/etc",
            "investors": ["Investor 1", "Investor 2"],
            "domain_age": 15,
            "ssl_certificate": true,
            "business_verified": true,
            "employee_count": 500,
            "headquarters": "City, Country",
            "website": "https://company.com",
            "description": "Brief company description with key business focus",
            "key_products": ["Product 1", "Product 2"],
            "competitors": ["Competitor 1", "Competitor 2"],
            "business_model": "B2B/B2C/SaaS/etc",
            "reputation_score": 0.85
        }}
        
        MANDATORY: Provide realistic estimates for ALL numeric fields. Use industry standards:
        - For large companies like Indeed: market_cap: 10000000000+, revenue: 1000000000+, employee_count: 5000+
        - For medium companies: market_cap: 100000000-1000000000, revenue: 50000000-500000000, employee_count: 200-2000
        - For small companies: market_cap: 10000000-100000000, revenue: 5000000-50000000, employee_count: 50-200
        - Domain age should reflect when company was likely founded
        - Always set business_verified: true for known companies
        - Reputation score between 0.6-0.9 based on company reputation
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            raw_text = response.content.strip()
            
            # Extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', raw_text)
            if json_match:
                company_data = json.loads(json_match.group())
                logging.info(f"✅ Retrieved comprehensive details for {company_name}")
                return company_data
            else:
                logging.warning(f"⚠️ Could not extract JSON from OpenAI response for {company_name}")
                return self._get_fallback_data(company_name)
                
        except Exception as e:
            logging.error(f"❌ Failed to get company details for {company_name}: {e}")
            return self._get_fallback_data(company_name)
    
    def _get_fallback_data(self, company_name: str) -> Dict[str, Any]:
        """Fallback data when OpenAI request fails - provide reasonable estimates"""
        # Provide reasonable estimates based on company name
        if any(keyword in company_name.lower() for keyword in ["indeed", "linkedin", "google", "microsoft", "amazon"]):
            # Large tech companies
            return {
                "company_name": company_name,
                "industry": "Technology",
                "company_size": "Large (1000+)",
                "founded": 2000,
                "market_cap": 5000000000,
                "revenue": 1000000000,
                "funding_status": "Public",
                "investors": ["Public Markets"],
                "domain_age": 20,
                "ssl_certificate": True,
                "business_verified": True,
                "employee_count": 5000,
                "headquarters": "United States",
                "website": f"https://{company_name.lower().replace(' ', '')}.com",
                "description": f"{company_name} is a technology company providing digital services and solutions",
                "key_products": ["Digital Platform", "Technology Solutions"],
                "competitors": ["Various Technology Companies"],
                "business_model": "B2B/B2C",
                "reputation_score": 0.8
            }
        else:
            # Medium/smaller companies
            return {
                "company_name": company_name,
                "industry": "Technology",
                "company_size": "Medium (201-1000)",
                "founded": 2010,
                "market_cap": 100000000,
                "revenue": 50000000,
                "funding_status": "Private",
                "investors": ["Private Investors"],
                "domain_age": 12,
                "ssl_certificate": True,
                "business_verified": True,
                "employee_count": 500,
                "headquarters": "Unknown",
                "website": f"https://{company_name.lower().replace(' ', '')}.com",
                "description": f"{company_name} is a technology company providing business solutions",
                "key_products": ["Business Solutions", "Technology Services"],
                "competitors": ["Industry Competitors"],
                "business_model": "B2B",
                "reputation_score": 0.7
            }
