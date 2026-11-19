from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    print(" test_health passed!")

def test_departments():
    res = client.get("/api/v1/departments/")
    assert res.status_code == 200
    depts = res.json()
    assert len(depts) >= 5
    print(f" test_departments passed! ({len(depts)} departments retrieved)")

def test_auth_demo_switch():
    res = client.post("/api/v1/auth/demo-switch", json={"role": "student"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"
    print(" test_auth_demo_switch passed!")
    return data["access_token"]

def test_chat_rag(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post(
        "/api/v1/chat/ask",
        headers=headers,
        json={"query": "What is the minimum attendance requirement for examinations?"}
    )
    assert res.status_code == 200
    data = res.json()
    print("DEBUG CHAT DATA:", data)
    assert data["is_answered"] is True
    assert len(data["sources"]) > 0
    assert "75%" in data["answer"]
    print(" test_chat_rag passed! RAG generated answer with sources:")
    print("   Answer snippet:", data["answer"][:120], "...")
    print("   Citations count:", len(data["sources"]))

def test_tickets(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. List tickets
    res = client.get("/api/v1/tickets/", headers=headers)
    assert res.status_code == 200
    tickets = res.json()
    print(f" test_tickets listing passed! ({len(tickets)} tickets)")

    # 2. Create ticket
    res_create = client.post(
        "/api/v1/tickets/",
        headers=headers,
        json={
            "title": "Need bonafide certificate for scholarship application",
            "description": "Please provide official college seal bonafide for state scholarship.",
            "category": "Certificates",
            "priority": "high"
        }
    )
    assert res_create.status_code == 200
    new_t = res_create.json()
    assert "TICK-" in new_t["ticket_number"]
    print(f" test_ticket creation passed! (Ticket Number: {new_t['ticket_number']})")

def test_analytics(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/analytics/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_tickets"] >= 3
    assert data["total_queries"] >= 1
    print(f" test_analytics passed! Satisfaction: {data['satisfaction_rate']}%")

def test_supabase_status(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/system/supabase-status", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "connected" in data
    assert "mode" in data
    print(f" test_supabase_status passed! (Mode: {data['mode']}, Connected: {data['connected']})")

if __name__ == "__main__":
    print("\n--- Running AI College Helpdesk Backend API Tests ---")
    test_health()
    test_departments()
    token = test_auth_demo_switch()
    test_chat_rag(token)
    test_tickets(token)
    test_analytics(token)
    test_supabase_status(token)
    print("\n ALL BACKEND TESTS PASSED CLEANLY!\n")
