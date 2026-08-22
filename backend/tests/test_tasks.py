import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from main import app

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["api_v1"] == "/api/v1"


def test_create_task_success(client):
    payload = {
        "title": "Design Database Schema",
        "description": "Create schema diagram and models",
        "priority": "High",
        "status": "Todo",
        "due_date": "2026-09-01",
    }
    response = client.post("/api/v1/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Design Database Schema"
    assert data["description"] == "Create schema diagram and models"
    assert data["priority"] == "High"
    assert data["status"] == "Todo"
    assert data["due_date"] == "2026-09-01"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_task_status_enum_values(client):
    # Test all exact status enum values: 'Todo', 'In Progress', 'Completed'
    for status_val in ["Todo", "In Progress", "Completed"]:
        payload = {
            "title": f"Task for {status_val}",
            "priority": "Medium",
            "status": status_val,
        }
        res = client.post("/api/v1/tasks", json=payload)
        assert res.status_code == 201
        assert res.json()["status"] == status_val


def test_create_task_validation_errors(client):
    # Empty title
    res1 = client.post("/api/v1/tasks", json={"title": "   ", "priority": "Low"})
    assert res1.status_code == 422
    assert "status_code" in res1.json()
    assert res1.json()["status_code"] == 422
    assert "detail" in res1.json()

    # Invalid priority
    res2 = client.post("/api/v1/tasks", json={"title": "Valid Title", "priority": "Urgent"})
    assert res2.status_code == 422
    assert res2.json()["status_code"] == 422

    # Invalid status
    res3 = client.post("/api/v1/tasks", json={"title": "Valid Title", "priority": "Low", "status": "Done"})
    assert res3.status_code == 422
    assert res3.json()["status_code"] == 422


def test_get_task_by_id(client):
    create_res = client.post("/api/v1/tasks", json={"title": "Test Task", "priority": "Low"})
    task_id = create_res.json()["id"]

    # Existing task
    get_res = client.get(f"/api/v1/tasks/{task_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == task_id
    assert get_res.json()["title"] == "Test Task"

    # Non-existing task
    missing_res = client.get("/api/v1/tasks/non-existent-id")
    assert missing_res.status_code == 404
    assert missing_res.json() == {
        "detail": "Task with ID 'non-existent-id' not found",
        "status_code": 404,
    }


def test_update_task(client):
    create_res = client.post("/api/v1/tasks", json={"title": "Initial Title", "priority": "Low", "status": "Todo"})
    task_id = create_res.json()["id"]

    # Partial update status to "In Progress"
    update_res = client.put(f"/api/v1/tasks/{task_id}", json={"status": "In Progress"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "In Progress"
    assert update_res.json()["title"] == "Initial Title"

    # Full update
    update_res2 = client.put(
        f"/api/v1/tasks/{task_id}",
        json={"title": "Updated Title", "priority": "High", "status": "Completed", "description": "Finished now"},
    )
    assert update_res2.status_code == 200
    assert update_res2.json()["title"] == "Updated Title"
    assert update_res2.json()["priority"] == "High"
    assert update_res2.json()["status"] == "Completed"

    # 404 on missing
    missing_update = client.put("/api/v1/tasks/unknown-id", json={"title": "New"})
    assert missing_update.status_code == 404
    assert missing_update.json()["status_code"] == 404


def test_delete_task(client):
    create_res = client.post("/api/v1/tasks", json={"title": "Task to delete", "priority": "Low"})
    task_id = create_res.json()["id"]

    # Successful delete
    del_res = client.delete(f"/api/v1/tasks/{task_id}")
    assert del_res.status_code == 204

    # Subsequent GET returns 404
    get_res = client.get(f"/api/v1/tasks/{task_id}")
    assert get_res.status_code == 404

    # Subsequent DELETE returns 404
    del_again = client.delete(f"/api/v1/tasks/{task_id}")
    assert del_again.status_code == 404
    assert del_again.json()["status_code"] == 404


def test_list_tasks_filtering_and_search(client):
    client.post("/api/v1/tasks", json={"title": "Write Unit Tests", "priority": "High", "status": "In Progress"})
    client.post("/api/v1/tasks", json={"title": "Write Docs", "priority": "Low", "status": "Todo"})
    client.post("/api/v1/tasks", json={"title": "Deploy API", "priority": "High", "status": "Completed"})

    # Filter by status "In Progress"
    res_status = client.get("/api/v1/tasks?status=In Progress")
    assert res_status.status_code == 200
    data = res_status.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Write Unit Tests"

    # Filter by priority "High"
    res_prio = client.get("/api/v1/tasks?priority=High")
    assert res_prio.status_code == 200
    assert res_prio.json()["total"] == 2

    # Search query
    res_search = client.get("/api/v1/tasks?search=write")
    assert res_search.status_code == 200
    assert res_search.json()["total"] == 2


def test_list_tasks_sorting_and_pagination(client):
    # Create 5 tasks with due dates
    for i in range(1, 6):
        client.post(
            "/api/v1/tasks",
            json={
                "title": f"Task {i}",
                "priority": "Medium",
                "status": "Todo",
                "due_date": f"2026-09-0{i}",
            },
        )

    # Test pagination: page 1, page_size 2
    res_p1 = client.get("/api/v1/tasks?page=1&page_size=2&sort_by=due_date&sort_order=asc")
    assert res_p1.status_code == 200
    data_p1 = res_p1.json()
    assert data_p1["total"] == 5
    assert data_p1["page"] == 1
    assert data_p1["page_size"] == 2
    assert len(data_p1["items"]) == 2
    assert data_p1["items"][0]["title"] == "Task 1"
    assert data_p1["items"][1]["title"] == "Task 2"

    # Test pagination: page 2, page_size 2
    res_p2 = client.get("/api/v1/tasks?page=2&page_size=2&sort_by=due_date&sort_order=asc")
    assert res_p2.status_code == 200
    data_p2 = res_p2.json()
    assert data_p2["items"][0]["title"] == "Task 3"
    assert data_p2["items"][1]["title"] == "Task 4"


def test_sort_by_validation_allowlist(client):
    # Valid sort fields: title, priority, status, due_date, created_at
    for field in ["title", "priority", "status", "due_date", "created_at"]:
        res = client.get(f"/api/v1/tasks?sort_by={field}")
        assert res.status_code == 200

    # Invalid sort field must return 422
    res_invalid = client.get("/api/v1/tasks?sort_by=invalid_column")
    assert res_invalid.status_code == 422
    assert res_invalid.json()["status_code"] == 422


def test_page_and_page_size_constraints(client):
    # page < 1 should return 422
    res_page_0 = client.get("/api/v1/tasks?page=0")
    assert res_page_0.status_code == 422
    assert res_page_0.json()["status_code"] == 422

    # page_size < 1 should return 422
    res_size_0 = client.get("/api/v1/tasks?page_size=0")
    assert res_size_0.status_code == 422
    assert res_size_0.json()["status_code"] == 422

    # page_size > 100 should return 422
    res_size_101 = client.get("/api/v1/tasks?page_size=101")
    assert res_size_101.status_code == 422
    assert res_size_101.json()["status_code"] == 422


def test_task_summary_endpoint(client):
    client.post("/api/v1/tasks", json={"title": "Task 1", "priority": "High", "status": "Todo"})
    client.post("/api/v1/tasks", json={"title": "Task 2", "priority": "High", "status": "In Progress"})
    client.post("/api/v1/tasks", json={"title": "Task 3", "priority": "Low", "status": "Completed"})
    client.post("/api/v1/tasks", json={"title": "Task 4", "priority": "Medium", "status": "Completed"})

    res = client.get("/api/v1/tasks/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["total"] == 4
    assert summary["todo"] == 1
    assert summary["in_progress"] == 1
    assert summary["completed"] == 2
    assert summary["high_priority"] == 2
