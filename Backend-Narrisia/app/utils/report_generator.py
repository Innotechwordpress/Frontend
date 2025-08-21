from app.models.schemas import ResearchReport
from jinja2 import Template

md_template = """
# Research Report for {{ report.company_name }}

**Report ID:** {{ report.report_id }}  
**Date:** {{ report.research_date }}  
**Status:** {{ report.overall_status }}  
**Completion:** {{ report.completion_percentage }}%

## Company Profile
{{ report.company_profile.description }}

## Key Insights
{% for insight in report.key_insights %}
- {{ insight }}
{% endfor %}

## Recommendations
{% for rec in report.recommendations %}
- {{ rec }}
{% endfor %}
"""

def generate_markdown_report(report: ResearchReport) -> str:
    template = Template(md_template)
    return template.render(report=report)
