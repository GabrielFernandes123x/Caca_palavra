"""Tests for /api/scores endpoints and health root."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # fallback to reading from frontend .env file
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
    except FileNotFoundError:
        pass
assert BASE_URL, "REACT_APP_BACKEND_URL is required"
BASE_URL = BASE_URL.rstrip("/")

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    yield s
    # Cleanup: remove all TEST_ prefixed scores via Mongo directly
    try:
        from pymongo import MongoClient
        from dotenv import load_dotenv
        load_dotenv("/app/backend/.env")
        mc = MongoClient(os.environ["MONGO_URL"])
        mc[os.environ["DB_NAME"]].scores.delete_many({"name": {"$regex": "^TEST_"}})
        mc.close()
    except Exception as e:
        print(f"Cleanup warning: {e}")


def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


def test_create_score_uppercases_name(session):
    payload = {"name": "test_alice", "seconds": 123}
    r = session.post(f"{API}/scores", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["name"] == "TEST_ALICE"
    assert data["seconds"] == 123
    assert data.get("id")
    assert isinstance(data["id"], str)
    assert "created_at" in data


def test_create_score_validation_empty_name(session):
    r = session.post(f"{API}/scores", json={"name": "", "seconds": 10})
    assert r.status_code == 422


def test_create_score_validation_seconds_lt_1(session):
    r = session.post(f"{API}/scores", json={"name": "TEST_X", "seconds": 0})
    assert r.status_code == 422


def test_list_scores_sorted_and_limited(session):
    # Insert several scores
    inserts = [("TEST_FAST", 5), ("TEST_SLOW", 999), ("TEST_MID", 300)]
    for n, s in inserts:
        rr = session.post(f"{API}/scores", json={"name": n, "seconds": s})
        assert rr.status_code == 200

    r = session.get(f"{API}/scores")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) <= 10
    seconds_list = [d["seconds"] for d in data]
    assert seconds_list == sorted(seconds_list)
    # Must not contain mongo _id
    for d in data:
        assert "_id" not in d
        assert "id" in d
