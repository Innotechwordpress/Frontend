
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
        
        For reference:
        - Wellfound (formerly AngelList Talent) is a recruitment technology platform for startups
        - Internshala is an education technology platform for internships and training
        - Naukri is a recruitment technology platform
        
        Return accurate information in the following JSON format:

        {{
            "company_name": "{company_name}",
            "industry": "Technology/Finance/Healthcare/Recruitment Technology/Education Technology/etc",
            "company_size": "Startup (1-50)/Small (51-200)/Medium (201-1000)/Large (1000+)",
            "founded": 2020,
            "market_cap": 1000000000,
            "revenue": 500000000,
            "funding_status": "Public/Private/Startup/Series A/B/C/etc",
            "investors": ["Investor 1", "Investor 2"],
            "domain_age": 10,
            "ssl_certificate": true,
            "business_verified": true,
            "employee_count": 500,
            "headquarters": "City, Country",
            "website": "https://company.com",
            "description": "Brief company description",
            "key_products": ["Product 1", "Product 2"],
            "competitors": ["Competitor 1", "Competitor 2"],
            "business_model": "B2B/B2C/SaaS/etc",
            "reputation_score": 0.85
        }}
        
        Provide realistic estimates based on publicly available information. 
        If exact data is not available, provide reasonable estimates based on company size and industry.
        Be especially accurate about the industry classification - use "Recruitment Technology" for job/talent platforms.
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
        """Fallback data when OpenAI request fails"""
        return {
            "company_name": company_name,
            "industry": "Unknown",
            "company_size": "Unknown",
            "founded": 2020,
            "market_cap": 0,
            "revenue": 0,
            "funding_status": "Unknown",
            "investors": ["Unknown"],
            "domain_age": 5,
            "ssl_certificate": True,
            "business_verified": True,
            "employee_count": 0,
            "headquarters": "Unknown",
            "website": f"https://{company_name.lower()}.com",
            "description": "Company details not available",
            "key_products": ["Unknown"],
            "competitors": ["Unknown"],
            "business_model": "Unknown",
            "reputation_score": 0.5
        }
