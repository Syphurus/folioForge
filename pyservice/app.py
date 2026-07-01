from fastapi import FastAPI
from routers import scan
# Srestha will add pdf_routes here later

app = FastAPI()
app.include_router(scan.router)