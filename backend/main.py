from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.menu import router as menu_router
from routes.orders import router as orders_router
from routes.payments import router as payments_router
from routes.analytics import router as analytics_router
from routes.auth import router as auth_router

app = FastAPI(
    title="Dal Bafla API",
    description="Backend API for Gau Stories Dal Bafla app",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(menu_router, prefix="/api/menu", tags=["Menu"])
app.include_router(orders_router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments_router, prefix="/api/payments", tags=["Payments"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {
        "message": "Dal Bafla API running!",
        "docs": "/docs",
        "health": "ok"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
