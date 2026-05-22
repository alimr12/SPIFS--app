"""
SPIFS AI chat API — POST /api/chat, POST /api/session/reset
Run: python main.py   (default port 8002; prediction service expected on 8000)
"""
from __future__ import annotations

import json
import os
import re
import uuid
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SCRIPT_DIR = Path(__file__).resolve().parent
PREDICT_URL = os.getenv("PREDICT_API_URL", "http://localhost:8000/predict").rstrip("/")
CHAT_PORT = int(os.getenv("CHAT_PORT", "8002"))

REQUIRED_FIELDS = [
    "city",
    "location_type",
    "society",
    "block_sector",
    "size",
    "investment_period",
    "current_price",
]

SOCIETIES = [
    "Bahria Town Islamabad",
    "Capital Smart City",
    "DHA Islamabad",
    "Faisal Town",
    "Bahria Town Rawalpindi",
    "DHA Islamabad-Rawalpindi",
    "Faisal Hills",
    "Grace Valley",
]

sessions: dict[str, dict[str, Any]] = {}

app = FastAPI(title="SPIFS Chat API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ResetRequest(BaseModel):
    session_id: str


def load_rag() -> dict[str, Any]:
    path = SCRIPT_DIR / "societies_rag.json"
    if not path.exists():
        raise FileNotFoundError(f"societies_rag.json not found at {path}")
    with path.open(encoding="utf-8") as f:
        return json.load(f)


RAG_DATA = load_rag()


def new_session_id() -> str:
    return str(uuid.uuid4())


def get_session(session_id: str | None) -> tuple[str, dict[str, Any]]:
    if session_id and session_id in sessions:
        return session_id, sessions[session_id]
    sid = new_session_id()
    sessions[sid] = {}
    return sid, sessions[sid]


def parse_price(text: str) -> float | None:
    cleaned = text.lower().replace(",", "").strip()
    crore = re.search(r"([\d.]+)\s*crore", cleaned)
    if crore:
        return float(crore.group(1)) * 10_000_000
    lac = re.search(r"([\d.]+)\s*(lac|lakh)", cleaned)
    if lac:
        return float(lac.group(1)) * 100_000
    digits = re.search(r"\b(\d{6,})\b", cleaned)
    if digits:
        return float(digits.group(1))
    return None


def parse_message(message: str) -> dict[str, Any]:
    text = message.strip()
    lower = text.lower()
    out: dict[str, Any] = {}

    if "islamabad" in lower:
        out["city"] = "Islamabad"
    elif "rawalpindi" in lower:
        out["city"] = "Rawalpindi"

    if "residential" in lower:
        out["location_type"] = "Residential"
    elif "commercial" in lower:
        out["location_type"] = "Commercial"

    for society in SOCIETIES:
        if society.lower() in lower:
            out["society"] = society
            break

    block = re.search(
        r"(?:block|sector|phase)\s*([a-z0-9\-]+)",
        lower,
        re.I,
    )
    if block:
        label = block.group(0)
        out["block_sector"] = label[0].upper() + label[1:] if label else label

    size = re.search(r"(\d+(?:\.\d+)?)\s*marla", lower)
    if size:
        out["size"] = f"{size.group(1)} marla"

    months = re.search(r"(\d+)\s*months?", lower)
    if months:
        out["investment_period"] = f"{months.group(1)} Months"

    price = parse_price(text)
    if price is not None:
        out["current_price"] = price

    # Comma-separated shorthand: "Islamabad, DHA, 5 marla"
    if "," in text and len(out) < 3:
        parts = [p.strip() for p in text.split(",") if p.strip()]
        for part in parts:
            sub = parse_message(part)
            out.update({k: v for k, v in sub.items() if v is not None})

    return out


def missing_fields(state: dict[str, Any]) -> list[str]:
    return [f for f in REQUIRED_FIELDS if not state.get(f)]


def is_faq(message: str) -> bool:
    lower = message.lower()
    return any(
        k in lower
        for k in ("noc", "legal", "approved", "status", "lawful", "legality")
    )


def find_society_in_message(message: str) -> str | None:
    lower = message.lower()
    for society in SOCIETIES:
        if society.lower() in lower:
            return society
    for society in RAG_DATA:
        if society.lower() in lower:
            return society
    return None


def faq_reply(message: str) -> str | None:
    society = find_society_in_message(message)
    if not society:
        return (
            "I can answer NOC and legal questions for Bahria Town Islamabad, "
            "Capital Smart City, DHA Islamabad, and Faisal Town. "
            "Which society do you mean?"
        )
    info = RAG_DATA.get(society)
    if not info:
        return f"I don't have NOC notes loaded for {society} yet."
    return (
        f"**{society}** — NOC status: {info.get('noc_status', 'Unknown')}. "
        f"{info.get('legal_note', '')} "
        "This is general guidance, not legal advice; verify with the developer and CDA/RDA before buying."
    )


async def run_prediction(state: dict[str, Any]) -> tuple[dict[str, Any], bool]:
    """Call FastAPI /predict on port 8000. Returns (prediction_dict, is_mock)."""
    payload = {
        "city": state["city"],
        "location_type": state["location_type"],
        "society": state["society"],
        "block_sector": state["block_sector"],
        "size": state["size"],
        "investment_period": state["investment_period"],
        "current_price": float(state["current_price"]),
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(PREDICT_URL, json=payload)
            res.raise_for_status()
            data = res.json()
    except Exception:
        current = float(state["current_price"])
        predicted = round(current * 1.08, 0)
        return {
            "current_price_pkr": current,
            "predicted_price_pkr": predicted,
            "lower_bound_pkr": round(predicted * 0.9, 0),
            "upper_bound_pkr": round(predicted * 1.1, 0),
            "return_percentage": 8.0,
            "mock": True,
        }, True

    predicted = data.get("predicted_price") or data.get("prediction")
    current = data.get("current_price") or state["current_price"]
    return {
        "current_price_pkr": current,
        "predicted_price_pkr": predicted,
        "lower_bound_pkr": data.get("lower_bound"),
        "upper_bound_pkr": data.get("upper_bound"),
        "return_percentage": data.get("return_percentage"),
        "mock": False,
    }, False


def partial_reply(state: dict[str, Any], missing: list[str]) -> str:
    have = ", ".join(f"{k}={state[k]}" for k in REQUIRED_FIELDS if state.get(k))
    need = ", ".join(missing)
    return (
        f"Got it. So far I have: {have or 'nothing yet'}. "
        f"Still need: {need}. "
        "You can send everything in one line, e.g. "
        '"Islamabad residential DHA Islamabad Block A 10 marla 24 months 20000000".'
    )


@app.get("/")
def health():
    return {"service": "spifs-chat", "predict_upstream": PREDICT_URL}


@app.post("/api/chat")
async def chat(body: ChatRequest):
    message = (body.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    session_id, state = get_session(body.session_id)
    parsed = parse_message(message)
    state.update({k: v for k, v in parsed.items() if v is not None})
    sessions[session_id] = state

    if is_faq(message) and not all(state.get(f) for f in REQUIRED_FIELDS):
        reply = faq_reply(message)
        return {
            "session_id": session_id,
            "route": "faq",
            "reply": reply,
            "missing_fields": missing_fields(state),
            "state": state,
            "metadata": {},
        }

    missing = missing_fields(state)
    if missing:
        return {
            "session_id": session_id,
            "route": "partial",
            "reply": partial_reply(state, missing),
            "missing_fields": missing,
            "state": state,
            "metadata": {},
        }

    prediction, is_mock = await run_prediction(state)
    disclaimer = (
        "Forecast uses historical patterns and your inputs; not financial or legal advice. "
        "Verify NOC, possession, and market comps before investing."
    )
    if is_mock:
        disclaimer = (
            "Demo forecast — could not reach the prediction model on port 8000. "
            + disclaimer
        )

    return {
        "session_id": session_id,
        "route": "prediction",
        "reply": disclaimer,
        "missing_fields": [],
        "state": state,
        "metadata": {"prediction": prediction},
    }


@app.post("/api/session/reset")
def reset_session(body: ResetRequest):
    sessions.pop(body.session_id, None)
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=CHAT_PORT, reload=False)