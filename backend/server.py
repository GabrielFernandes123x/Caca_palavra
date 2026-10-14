from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import Annotated, List, Optional
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc):
        return cls.model_validate(doc)

    def to_mongo(self):
        data = self.model_dump(by_alias=True, exclude={"id"})
        return data


class ScoreCreate(BaseModel):
    name: str = Field(min_length=1, max_length=30)
    seconds: int = Field(ge=1, le=86400)


class Score(BaseDocument):
    name: str
    seconds: int
    created_at: str


@api_router.get("/")
async def root():
    return {"message": "Caça-Palavras Tech"}


@api_router.post("/scores")
async def create_score(payload: ScoreCreate):
    score = Score(name=payload.name.strip().upper(), seconds=payload.seconds,
                  created_at=datetime.now(timezone.utc).isoformat())
    result = await db.scores.insert_one(score.to_mongo())
    score.id = str(result.inserted_id)
    return score.model_dump()


@api_router.get("/scores")
async def list_scores():
    docs = await db.scores.find().sort([("seconds", 1), ("created_at", 1)]).to_list(10)
    return [Score.from_mongo(d).model_dump() for d in docs]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
