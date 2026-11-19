from app.main import app

print("Successfully loaded FastAPI app!")
print(f"Total registered routes: {len(app.routes)}")
for route in app.routes:
    if hasattr(route, "path"):
        print(f" - {route.path}")
