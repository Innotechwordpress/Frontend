from app.api.endpoints import orchestrate

api_router.include_router(orchestrate.router, tags=["orchestrator"])
