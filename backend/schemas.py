from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict


class SingleLookupRequest(BaseModel):
    amount: float = Field(..., example=499.00)
    merchant_name: str = Field(default="LUXURY_JEWELRY_ONLINE")
    category: str = Field(default="Electronics")
    location: str = Field(default="Online")
    unrecognized: bool = Field(default=True)
    classifier: Optional[str] = None
    feature_set: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    row_index: Optional[int] = None
    merchant: str
    category: str
    amount: float
    location: str
    time_stamp: str
    risk_level: str
    risk_score: float
    reasons: List[str]
    is_resolved: bool
    resolution: Optional[str] = None

    class Config:
        from_attributes = True


class AlertResolutionRequest(BaseModel):
    resolution: str = Field(..., example="safe", description="'safe' or 'blocked'")


class CardSettingsSchema(BaseModel):
    frozen: bool
    single_purchase_limit: float
    block_overseas: bool
    block_high_risk_merchants: bool

    class Config:
        from_attributes = True


class CardSettingsUpdateSchema(BaseModel):
    frozen: Optional[bool] = None
    single_purchase_limit: Optional[float] = None
    block_overseas: Optional[bool] = None
    block_high_risk_merchants: Optional[bool] = None


class BatchRowResponse(BaseModel):
    id: Optional[int] = None
    row_index: int
    merchant: str
    amount: float
    risk: str
    score: float
    top_contributing_features: List[str]


class BatchResponse(BaseModel):
    total_processed: int
    flagged_count: int
    results: List[BatchRowResponse]


class HealthResponse(BaseModel):
    status: str
    production_model: Dict[str, Any]
    total_models_loaded: int


class UserProfileSchema(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Cardholder age in years")
    gender: str = Field(..., description="'M', 'F', or 'other'")
    home_city: str = Field(..., min_length=1, description="Cardholder home city")
    home_state: str = Field(..., min_length=1, description="Cardholder home state")

    class Config:
        from_attributes = True


class BatchRealisticRowResponse(BaseModel):
    row_index: int
    status: str = Field(default="scored")  # "scored" | "insufficient_location_data"
    id: Optional[int] = None
    merchant: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    risk: Optional[str] = None  # "safe" | "caution" | "danger"
    score_pct: Optional[float] = None
    top_contributing_features: Optional[List[str]] = None
    note: Optional[str] = None


class BatchRealisticResponse(BaseModel):
    total_processed: int
    scored_count: int
    unscored_count: int
    flagged_count: int
    results: List[BatchRealisticRowResponse]


