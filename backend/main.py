"""
FastAPI backend for Credit Card Fraud Detection.
Serves real trained ML models — no mock scores anywhere.

Run with:
    cd backend
    uvicorn main:app --reload --port 8000
"""

import io
import json
import logging
import os
from datetime import datetime
from typing import List, Optional, Any

import numpy as np
import pandas as pd
from fastapi import (
    FastAPI, Depends, HTTPException, UploadFile, File, Query
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, get_db, Base
from models import TransactionRecord, CardSetting, UserProfile
from schemas import (
    BatchResponse, BatchRowResponse,
    HealthResponse,
    AlertResolutionRequest,
    CardSettingsSchema, CardSettingsUpdateSchema,
    UserProfileSchema,
    BatchRealisticResponse, BatchRealisticRowResponse,
)
from model_loader import registry, load_all_artifacts, FULL_FEATURE_COLUMNS

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="Serves real trained scikit-learn models for fraud detection.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:4173",  # Vite preview
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup / Shutdown ────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    # Create all SQLite tables
    Base.metadata.create_all(bind=engine)
    logger.info("SQLite tables ensured (app.db).")

    # Load and evaluate every model artifact — exits loudly if anything is missing
    load_all_artifacts()

    # Seed default card settings row if it doesn't exist yet
    from database import SessionLocal
    db = SessionLocal()
    try:
        if not db.query(CardSetting).first():
            db.add(CardSetting(
                id=1,
                frozen=False,
                single_purchase_limit=1500.0,
                block_overseas=True,
                block_high_risk_merchants=True,
            ))
            db.commit()
    finally:
        db.close()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _risk_level(score_0_to_1: float) -> str:
    """
    Map 0-1 fraud probability to safe / caution / danger.
    Base dataset fraud rate is 0.386% (0.00386).
    - safe:    prob < 0.10 (<10.0% score)
    - caution: 0.10 <= prob < 0.35 (10.0% to 35.0% score, 25x-90x base fraud rate)
    - danger:  prob >= 0.35 (>=35.0% score, >90x base fraud rate)
    """
    if score_0_to_1 >= 0.35:
        return "danger"
    elif score_0_to_1 >= 0.10:
        return "caution"
    return "safe"


def _model_per_row_reasons(
    scaled_feats: np.ndarray,
    feature_names: List[str],
    importances: np.ndarray,
    raw_row: dict,
    profile: Any,
    dist_km: float,
    fallback_used: bool,
    n: int = 3
) -> List[str]:
    """
    Compute per-row feature importance contributions:
    impact_i = abs(scaled_feats[0, i]) * importances[i]
    Map top impactful features into plain-English sentences based on the model's actual weights.
    """
    impacts = np.abs(scaled_feats[0]) * importances
    top_indices = np.argsort(impacts)[::-1]

    reasons = []
    seen = set()

    for idx in top_indices:
        fname = feature_names[idx]
        sval = scaled_feats[0, idx]
        imp = impacts[idx]

        if imp < 0.001 and len(reasons) >= 1:
            continue

        if fname == "amt_log" and "amt_log" not in seen:
            seen.add("amt_log")
            if sval > 0.5:
                reasons.append(f"Transaction amount (${raw_row['amount']:.2f}) is significantly higher than average.")
            elif sval < -0.5:
                reasons.append(f"Transaction amount (${raw_row['amount']:.2f}) is lower than typical spend.")

        elif fname == "distance_km" and "distance_km" not in seen:
            seen.add("distance_km")
            if dist_km > 10.0:
                reasons.append(f"Merchant location ({dist_km:.1f} km away) deviates from cardholder home area ({profile.home_city}, {profile.home_state}).")

        elif fname == "merchant_freq" and "merchant_freq" not in seen:
            seen.add("merchant_freq")
            if sval < 0:
                reasons.append("Unseen or infrequent merchant terminal frequency in training data.")

        elif fname == "hour_of_day" and "hour_of_day" not in seen:
            seen.add("hour_of_day")
            reasons.append(f"Transaction time ({raw_row['date']}) falls in an atypical model window.")

        elif fname == "day_of_week" and "day_of_week" not in seen:
            seen.add("day_of_week")
            reasons.append("Day-of-week timing signal contributed to risk evaluation.")

        elif fname.startswith("category_") and "category" not in seen:
            seen.add("category")
            cat_name = fname.replace("category_", "")
            if fallback_used:
                reasons.append(f"Transaction category '{raw_row['category']}' mapped to fallback classification ('misc_pos').")
            else:
                reasons.append(f"Purchase category '{cat_name}' contributed to risk profile.")

        elif fname == "city_pop" and "city_pop" not in seen:
            seen.add("city_pop")
            reasons.append("Cardholder city population density signal evaluated.")

        elif fname == "age" and "age" not in seen:
            seen.add("age")
            reasons.append(f"Cardholder age ({profile.age} yrs) demographic factor evaluated.")

        if len(reasons) >= n:
            break

    if fallback_used and "category" not in seen:
        reasons.append(f"Transaction category '{raw_row['category']}' mapped to fallback classification ('misc_pos').")

    if not reasons:
        reasons.append("Transaction evaluated with standard model risk thresholds.")

    return reasons


def _top_contributing_features(X_sub_row: pd.DataFrame, n: int = 3) -> List[str]:
    """Return top n feature names by absolute scaled magnitude × model weight."""
    feature_names = list(X_sub_row.columns)
    model = registry.production_artifact["model"]

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        scores = np.abs(X_sub_row.values[0]) * importances
    elif hasattr(model, "coef_"):
        importances = np.abs(model.coef_[0])
        scores = np.abs(X_sub_row.values[0]) * importances
    else:
        scores = np.abs(X_sub_row.values[0])

    top_idx = np.argsort(scores)[::-1][:n]
    return [feature_names[int(i)] for i in top_idx]


def _reasons_for_row(features: List[str], amount: float, score: float) -> List[str]:
    """Translate raw feature names into plain-English sentences."""
    feature_map = {
        "Amount": f"Transaction amount (${amount:.2f}) is unusually high for this context.",
        "Time":   "Transaction occurred at an atypical time of day.",
        "V1":  "Cardholder identity score shows irregular pattern.",
        "V2":  "Merchant authentication signal is anomalous.",
        "V3":  "Transaction velocity indicator is elevated.",
        "V4":  "Card-present signal shows mismatch with expected behavior.",
        "V5":  "Usage pattern diverges from historical norms.",
        "V6":  "Merchant risk category deviates from typical spend.",
        "V7":  "Geographic distance signal is outside normal range.",
        "V8":  "Device fingerprint pattern is unusual.",
        "V9":  "Session token anomaly detected.",
        "V10": "Spending frequency pattern is irregular.",
        "V11": "Charge amount is inconsistent with merchant type.",
        "V12": "Cross-border indicator is anomalous.",
        "V13": "Time-since-last-transaction signal is atypical.",
        "V14": "High-risk merchant category signal elevated.",
        "V15": "Card-not-present risk score elevated.",
        "V16": "Account age and tenure signal is anomalous.",
        "V17": "Online vs in-store mismatch detected.",
        "V18": "Repeated attempt pattern detected.",
        "V19": "Purchase category mismatch detected.",
        "V20": "Network routing anomaly detected.",
        "V21": "Known fraud pattern feature is active.",
        "V22": "Billing address mismatch signal detected.",
        "V23": "IP geolocation is inconsistent with card home location.",
        "V24": "Device location differs from card-registered location.",
        "V25": "Unusual refund or reversal pattern.",
        "V26": "Transaction limit proximity signal is elevated.",
        "V27": "Unrecognized merchant terminal ID.",
        "V28": "Emerging fraud cluster pattern detected.",
    }
    reasons = []
    for fname in features:
        r = feature_map.get(fname)
        if r:
            reasons.append(r)
    if score >= 0.70 and len(reasons) < 1:
        reasons.append("Multiple risk signals combined exceed the high-risk threshold.")
    return reasons or ["Transaction risk assessment completed — no single dominant signal."]


# ── GET /api/health ───────────────────────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse, tags=["Monitoring"])
def health():
    prod = registry.production_metrics or {}
    total = len(registry.trained_models) + (1 if registry.realistic_model is not None else 0)
    return {
        "status": "healthy",
        "production_model": {
            "key":          registry.production_key,
            "model_name":   prod.get("model_name"),
            "feature_set":  prod.get("feature_set"),
            "f1_score":     prod.get("f1_score"),
            "recall":       prod.get("recall"),
            "precision":    prod.get("precision"),
            "accuracy":     prod.get("accuracy"),
            "roc_auc":      prod.get("roc_auc"),
            "metric_used":  registry.metric_used_for_selection,
        },
        "total_models_loaded": total,
    }



# ── POST /api/predict/batch ───────────────────────────────────────────────────
@app.post("/api/predict/batch", response_model=BatchResponse, tags=["Prediction"])
async def predict_batch(
    file: UploadFile = File(..., description="CSV with columns: Time, V1-V28, Amount"),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).first()
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Complete your profile before checking a statement"
        )

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {exc}")

    # Validate required columns
    missing_cols = [c for c in FULL_FEATURE_COLUMNS if c not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=422,
            detail=f"CSV is missing required columns: {missing_cols}. "
                   f"Expected: Time, V1-V28, Amount"
        )

    # Drop non-feature columns (e.g. Class label if present)
    X_raw = df[FULL_FEATURE_COLUMNS].copy().reset_index(drop=True)

    try:
        # Scale using the fitted scaler (transform only — never re-fit)
        X_scaled_arr = registry.scaler.transform(X_raw)
        X_scaled = pd.DataFrame(X_scaled_arr, columns=FULL_FEATURE_COLUMNS)

        # Apply feature selection for production model
        fs_slug = registry.production_artifact["feature_set_slug"]
        X_sub = registry.get_feature_subset(X_scaled, fs_slug)

        model = registry.production_artifact["model"]
        preds = model.predict(X_sub)

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_sub)[:, 1]
        else:
            probs = preds.astype(float)

    except Exception as exc:
        logger.error("Prediction error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")

    results = []
    flagged = 0
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for i in range(len(X_raw)):
        prob     = float(probs[i])
        score_pct = round(prob * 100, 2)
        risk     = _risk_level(prob)
        amount   = float(X_raw.loc[i, "Amount"])

        # Top contributing features for this row
        X_sub_row = X_sub.iloc[[i]]
        top_feats = _top_contributing_features(X_sub_row, n=3)
        reasons   = _reasons_for_row(top_feats, amount, prob)

        if risk in ("caution", "danger"):
            flagged += 1

        # Persist to SQLite
        record = TransactionRecord(
            row_index   = i,
            merchant    = df.get("merchant", pd.Series(["BATCH_UPLOAD"] * len(df))).iloc[i]
                          if "merchant" in df.columns else "BATCH_UPLOAD",
            category    = df.get("category", pd.Series(["General"] * len(df))).iloc[i]
                          if "category" in df.columns else "General",
            amount      = amount,
            location    = df.get("location", pd.Series(["N/A"] * len(df))).iloc[i]
                          if "location" in df.columns else "N/A",
            time_stamp  = now_str,
            risk_level  = risk,
            risk_score  = score_pct,
            reasons_json = json.dumps(reasons),
            is_resolved = False,
            created_at  = now_str,
        )
        db.add(record)
        db.flush()  # get auto-id

        results.append(BatchRowResponse(
            id                    = record.id,
            row_index             = i,
            merchant              = record.merchant,
            amount                = amount,
            risk                  = risk,
            score                 = score_pct,
            top_contributing_features = reasons,
        ))

    db.commit()
    logger.info("Batch scored %d rows, %d flagged.", len(results), flagged)

    return BatchResponse(
        total_processed = len(results),
        flagged_count   = flagged,
        results         = results,
    )


# ── POST /api/predict/batch/realistic ─────────────────────────────────────────
@app.post("/api/predict/batch/realistic", response_model=BatchRealisticResponse, tags=["Prediction"])
async def predict_batch_realistic(
    file: UploadFile = File(..., description="CSV with columns: Date, Merchant, Category, Amount, City, State"),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).first()
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Complete your profile before checking a statement"
        )

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {exc}")

    # Robust column cleaning (handles UTF-8 BOM, zero-width spaces, quotes, and whitespace)
    def _clean_col_name(col) -> str:
        s = str(col).replace("\ufeff", "").replace("\u200b", "").strip().strip('"').strip("'").lower()
        return s

    raw_cols = {_clean_col_name(c): c for c in df.columns}

    ALIAS_MAP = {
        "date": ["date", "trans_date", "timestamp", "trans_date_trans_time", "time", "date_time", "datetime", "created_at"],
        "merchant": ["merchant", "merchant_name", "merch", "vendor", "payee", "store", "name", "description"],
        "category": ["category", "cat", "genre", "type", "trans_category"],
        "amount": ["amount", "amt", "val", "price", "total", "cost"],
        "city": ["city", "merchant_city", "merch_city", "town", "loc_city", "cust_city", "location_city"],
        "state": ["state", "merchant_state", "merch_state", "region", "province", "loc_state", "cust_state", "location_state"],
        "location": ["location", "loc", "city_state", "city/state", "merch_location", "merchant_location", "address"],
    }

    col_map = {}
    for req_key, aliases in ALIAS_MAP.items():
        found_col = None
        for alias in aliases:
            if alias in raw_cols:
                found_col = raw_cols[alias]
                break
        if found_col is not None:
            col_map[req_key] = found_col

    # Verify core columns (Date, Merchant, Category, Amount)
    core_required = ["date", "merchant", "category", "amount"]
    missing_core = [k.capitalize() for k in core_required if k not in col_map]
    if missing_core:
        raise HTTPException(
            status_code=422,
            detail=f"CSV is missing required realistic columns: {missing_core}. Expected: Date, Merchant, Category, Amount, City, State"
        )

    # Handle location (City & State)
    if ("city" not in col_map or "state" not in col_map) and "location" in col_map:
        loc_col = col_map["location"]
        cities = []
        states = []
        for val in df[loc_col]:
            s_val = str(val).strip()
            if "," in s_val:
                parts = s_val.split(",", 1)
                cities.append(parts[0].strip())
                states.append(parts[1].strip())
            elif "/" in s_val:
                parts = s_val.split("/", 1)
                cities.append(parts[0].strip())
                states.append(parts[1].strip())
            else:
                parts = s_val.split()
                if len(parts) >= 2:
                    cities.append(" ".join(parts[:-1]).strip())
                    states.append(parts[-1].strip())
                else:
                    cities.append(s_val)
                    states.append("")
        df["_derived_city"] = cities
        df["_derived_state"] = states
        col_map["city"] = "_derived_city"
        col_map["state"] = "_derived_state"

    if "city" not in col_map:
        df["_derived_city"] = ""
        col_map["city"] = "_derived_city"
    if "state" not in col_map:
        df["_derived_state"] = ""
        col_map["state"] = "_derived_state"

    # Customer location lookup
    cust_key = f"{profile.home_city.strip()}, {profile.home_state.strip()}".lower()
    cust_info = registry.city_lookup.get(cust_key) or registry.city_lookup.get(profile.home_city.strip().lower())

    fe = registry.realistic_fe
    model = registry.realistic_model

    if not fe or not model:
        raise HTTPException(status_code=503, detail="Realistic model not loaded on server startup.")

    min_merchant_freq = min(fe.merchant_freq.values()) if fe.merchant_freq else 0.0005
    known_categories = set(fe.ohe_category.categories_[0])

    from train_realistic_model import haversine_distance

    results = []
    scored_count = 0
    unscored_count = 0
    flagged_count = 0
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for i, row in df.iterrows():
        raw_date = row[col_map["date"]]
        raw_merchant = str(row[col_map["merchant"]]).strip()
        raw_category = str(row[col_map["category"]]).strip()
        raw_amount = float(row[col_map["amount"]])
        raw_city = str(row[col_map["city"]]).strip()
        raw_state = str(row[col_map["state"]]).strip()

        # Merchant location lookup
        m_key = f"{raw_city}, {raw_state}".lower()
        merch_info = registry.city_lookup.get(m_key) or registry.city_lookup.get(raw_city.lower())

        # If EITHER lookup misses, mark as insufficient location data
        if not cust_info or not merch_info:
            unscored_count += 1
            missing_detail = []
            if not cust_info:
                missing_detail.append(f"Customer home city ({profile.home_city}, {profile.home_state}) not found in geocoding database")
            if not merch_info:
                missing_detail.append(f"Merchant location ({raw_city}, {raw_state}) not found in geocoding database")

            results.append(BatchRealisticRowResponse(
                row_index=i,
                status="insufficient_location_data",
                merchant=raw_merchant,
                amount=raw_amount,
                note="; ".join(missing_detail)
            ))
            continue

        # Both locations resolved
        dist_km = float(haversine_distance(
            cust_info["lat"], cust_info["long"],
            merch_info["lat"], merch_info["long"]
        ))

        dt = pd.to_datetime(raw_date)
        hour_of_day = int(dt.hour)
        day_of_week = int(dt.dayofweek)
        is_weekend = int(day_of_week >= 5)

        gender_binary = 1 if profile.gender.upper() in ("M", "MALE") else 0
        amt_log = float(np.log1p(raw_amount))
        m_freq = float(fe.merchant_freq.get(raw_merchant, min_merchant_freq))

        fallback_used = False
        cat = raw_category
        if cat not in known_categories:
            cat = "misc_pos"  # Documented fallback category
            fallback_used = True

        cat_df = pd.DataFrame([{"category": cat}])
        cat_encoded = fe.ohe_category.transform(cat_df)
        cat_cols = [f"category_{c.replace('category_', '')}" for c in fe.ohe_category.get_feature_names_out()]

        feats = {
            "age": profile.age,
            "hour_of_day": hour_of_day,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "distance_km": dist_km,
            "gender_binary": gender_binary,
            "amt_log": amt_log,
            "city_pop": cust_info["city_pop"],
            "merchant_freq": m_freq,
        }
        for col, val in zip(cat_cols, cat_encoded[0]):
            feats[col] = float(val)

        feats_df = pd.DataFrame([feats])[fe.feature_names]
        scaled_feats = fe.scaler.transform(feats_df)

        prob = float(model.predict_proba(scaled_feats)[0, 1])
        score_pct = round(prob * 100, 2)
        risk = _risk_level(prob)

        if risk in ("caution", "danger"):
            flagged_count += 1
        scored_count += 1

        # Per-row model weighted feature importance explainability
        reasons = _model_per_row_reasons(
            scaled_feats=scaled_feats,
            feature_names=fe.feature_names,
            importances=model.feature_importances_,
            raw_row={
                "date": raw_date,
                "merchant": raw_merchant,
                "category": raw_category,
                "amount": raw_amount,
            },
            profile=profile,
            dist_km=dist_km,
            fallback_used=fallback_used,
            n=3,
        )

        # Persist scored row to SQLite
        record = TransactionRecord(
            row_index=i,
            merchant=raw_merchant,
            category=raw_category,
            amount=raw_amount,
            location=f"{raw_city}, {raw_state}",
            time_stamp=dt.strftime("%Y-%m-%d %H:%M:%S"),
            risk_level=risk,
            risk_score=score_pct,
            reasons_json=json.dumps(reasons),
            is_resolved=False,
            created_at=now_str,
        )
        db.add(record)
        db.flush()

        results.append(BatchRealisticRowResponse(
            id=record.id,
            row_index=i,
            status="scored",
            merchant=raw_merchant,
            category=raw_category,
            amount=raw_amount,
            risk=risk,
            score_pct=score_pct,
            top_contributing_features=reasons,
            note="Category mapped to fallback 'misc_pos'" if fallback_used else None
        ))

    db.commit()
    logger.info("Realistic batch processed %d rows: %d scored, %d unscored, %d flagged.",
                len(df), scored_count, unscored_count, flagged_count)

    return BatchRealisticResponse(
        total_processed=len(df),
        scored_count=scored_count,
        unscored_count=unscored_count,
        flagged_count=flagged_count,
        results=results,
    )


# ── GET /api/transactions ─────────────────────────────────────────────────────
@app.get("/api/transactions", tags=["Transactions"])
def get_transactions(
    page: int   = Query(1, ge=1),
    limit: int  = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    total  = db.query(TransactionRecord).count()
    rows   = (
        db.query(TransactionRecord)
          .order_by(TransactionRecord.id.desc())
          .offset(offset)
          .limit(limit)
          .all()
    )

    results = []
    for r in rows:
        try:
            reasons = json.loads(r.reasons_json)
        except Exception:
            reasons = []
        results.append({
            "id":           r.id,
            "row_index":    r.row_index,
            "merchant":     r.merchant,
            "category":     r.category,
            "amount":       r.amount,
            "location":     r.location,
            "time_stamp":   r.time_stamp,
            "risk_level":   r.risk_level,
            "risk_score":   r.risk_score,
            "reasons":      reasons,
            "is_resolved":  r.is_resolved,
            "resolution":   r.resolution,
        })

    return {
        "total":   total,
        "page":    page,
        "limit":   limit,
        "results": results,
    }


# ── GET /api/transactions/{tx_id} ──────────────────────────────────────────────
@app.get("/api/transactions/{tx_id}", tags=["Transactions"])
def get_transaction_by_id(tx_id: int, db: Session = Depends(get_db)):
    record = db.query(TransactionRecord).filter(TransactionRecord.id == tx_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Transaction #{tx_id} not found.")

    try:
        reasons = json.loads(record.reasons_json)
    except Exception:
        reasons = []

    return {
        "id":           record.id,
        "row_index":    record.row_index,
        "merchant":     record.merchant,
        "category":     record.category,
        "amount":       record.amount,
        "location":     record.location,
        "time_stamp":   record.time_stamp,
        "risk_level":   record.risk_level,
        "risk_score":   record.risk_score,
        "reasons":      reasons,
        "is_resolved":  record.is_resolved,
        "resolution":   record.resolution,
        "created_at":   record.created_at,
    }


# ── GET /api/alerts ───────────────────────────────────────────────────────────
@app.get("/api/alerts", tags=["Alerts"])
def get_alerts(db: Session = Depends(get_db)):
    rows = (
        db.query(TransactionRecord)
          .filter(
              TransactionRecord.risk_level.in_(["caution", "danger"]),
              TransactionRecord.is_resolved == False,
          )
          .order_by(TransactionRecord.id.desc())
          .all()
    )

    results = []
    for r in rows:
        try:
            reasons = json.loads(r.reasons_json)
        except Exception:
            reasons = []
        results.append({
            "id":          r.id,
            "merchant":    r.merchant,
            "category":    r.category,
            "amount":      r.amount,
            "time_stamp":  r.time_stamp,
            "risk_level":  r.risk_level,
            "risk_score":  r.risk_score,
            "reasons":     reasons,
            "is_resolved": r.is_resolved,
        })

    return {"count": len(results), "alerts": results}


# ── PATCH /api/alerts/{id} ────────────────────────────────────────────────────
@app.patch("/api/alerts/{alert_id}", tags=["Alerts"])
def resolve_alert(
    alert_id: int,
    body: AlertResolutionRequest,
    db: Session = Depends(get_db),
):
    record = db.query(TransactionRecord).filter(TransactionRecord.id == alert_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Alert #{alert_id} not found.")

    if body.resolution not in ("safe", "blocked"):
        raise HTTPException(status_code=422, detail="resolution must be 'safe' or 'blocked'.")

    record.is_resolved = True
    record.resolution  = body.resolution
    db.commit()
    db.refresh(record)

    logger.info("Alert #%d resolved as '%s'.", alert_id, body.resolution)
    return {"id": alert_id, "resolution": record.resolution, "is_resolved": True}


# ── GET /api/analytics/trend ──────────────────────────────────────────────────
@app.get("/api/analytics/trend", tags=["Analytics"])
def get_fraud_trend(db: Session = Depends(get_db)):
    records = db.query(
        TransactionRecord.time_stamp,
        TransactionRecord.risk_level
    ).all()

    daily_stats = {}
    for r in records:
        ts = str(r.time_stamp or "").strip()
        date_str = ts[:10] if len(ts) >= 10 else "Unknown"
        if date_str == "Unknown":
            continue
        if date_str not in daily_stats:
            daily_stats[date_str] = {"date": date_str, "scanned": 0, "flagged": 0}
        daily_stats[date_str]["scanned"] += 1
        if r.risk_level in ("caution", "danger"):
            daily_stats[date_str]["flagged"] += 1

    sorted_dates = sorted(daily_stats.keys())
    last_30_dates = sorted_dates[-30:]
    results = [daily_stats[d] for d in last_30_dates]

    return {
        "total_days": len(results),
        "trend": results,
    }


# ── GET /api/analytics/by-category ───────────────────────────────────────────
@app.get("/api/analytics/by-category", tags=["Analytics"])
def get_flagged_by_category(db: Session = Depends(get_db)):
    records = (
        db.query(
            TransactionRecord.category,
            func.count(TransactionRecord.id).label("flagged_count")
        )
        .filter(TransactionRecord.risk_level.in_(["caution", "danger"]))
        .group_by(TransactionRecord.category)
        .order_by(func.count(TransactionRecord.id).desc())
        .limit(8)
        .all()
    )

    results = [
        {"category": r[0] or "General", "flagged_count": int(r[1])}
        for r in records
    ]

    return {
        "total_categories": len(results),
        "by_category": results,
    }



# ── GET /api/card-settings ────────────────────────────────────────────────────
@app.get("/api/card-settings", response_model=CardSettingsSchema, tags=["Card Controls"])
def get_card_settings(db: Session = Depends(get_db)):
    setting = db.query(CardSetting).filter(CardSetting.id == 1).first()
    if not setting:
        # Return defaults
        return CardSettingsSchema(
            frozen=False,
            single_purchase_limit=1500.0,
            block_overseas=True,
            block_high_risk_merchants=True,
        )
    return setting


# ── PATCH /api/card-settings ──────────────────────────────────────────────────
@app.patch("/api/card-settings", response_model=CardSettingsSchema, tags=["Card Controls"])
def update_card_settings(
    body: CardSettingsUpdateSchema,
    db: Session = Depends(get_db),
):
    setting = db.query(CardSetting).filter(CardSetting.id == 1).first()
    if not setting:
        setting = CardSetting(id=1)
        db.add(setting)

    if body.frozen is not None:
        setting.frozen = body.frozen
    if body.single_purchase_limit is not None:
        setting.single_purchase_limit = body.single_purchase_limit
    if body.block_overseas is not None:
        setting.block_overseas = body.block_overseas
    if body.block_high_risk_merchants is not None:
        setting.block_high_risk_merchants = body.block_high_risk_merchants

    setting.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.commit()
    db.refresh(setting)

    logger.info("Card settings updated: frozen=%s, limit=%.0f", setting.frozen, setting.single_purchase_limit)
    return setting


# ── GET /api/profile ──────────────────────────────────────────────────────────
@app.get("/api/profile", response_model=UserProfileSchema, tags=["Profile"])
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.id == 1).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not configured yet.")
    return profile


# ── PUT /api/profile ──────────────────────────────────────────────────────────
@app.put("/api/profile", response_model=UserProfileSchema, tags=["Profile"])
def update_profile(
    body: UserProfileSchema,
    db: Session = Depends(get_db),
):
    if not body.age or body.age < 1 or body.age > 120:
        raise HTTPException(status_code=422, detail="Valid age (1-120) is required.")

    gender_clean = body.gender.strip().lower()
    if gender_clean not in ("m", "f", "other", "male", "female"):
        raise HTTPException(status_code=422, detail="Gender must be 'M', 'F', or 'other'.")

    g_code = "M" if gender_clean in ("m", "male") else ("F" if gender_clean in ("f", "female") else "other")

    if not body.home_city or not body.home_city.strip():
        raise HTTPException(status_code=422, detail="Home city is required.")

    if not body.home_state or not body.home_state.strip():
        raise HTTPException(status_code=422, detail="Home state is required.")

    profile = db.query(UserProfile).filter(UserProfile.id == 1).first()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if not profile:
        profile = UserProfile(
            id=1,
            age=body.age,
            gender=g_code,
            home_city=body.home_city.strip(),
            home_state=body.home_state.strip(),
            created_at=now_str,
            updated_at=now_str,
        )
        db.add(profile)
    else:
        profile.age = body.age
        profile.gender = g_code
        profile.home_city = body.home_city.strip()
        profile.home_state = body.home_state.strip()
        profile.updated_at = now_str

    db.commit()
    db.refresh(profile)
    logger.info("User profile updated: age=%d, gender=%s, location=%s, %s",
                profile.age, profile.gender, profile.home_city, profile.home_state)
    return profile


# ── GET /api/results/overview ─────────────────────────────────────────────────
@app.get("/api/results/overview", tags=["Analytics"])
def results_overview():
    """
    Returns real evaluation metrics for all 15 model×feature-set combinations.
    Intended for the analyst/academic dashboard, not the main cardholder UI.
    """
    if not registry.all_metrics:
        raise HTTPException(
            status_code=503,
            detail="Metrics not yet computed. The server is still loading."
        )

    return {
        "production_model_key": registry.production_key,
        "metric_used_for_selection": registry.metric_used_for_selection,
        "models": registry.all_metrics,
    }


# ── POST /api/report/scan-pdf ──────────────────────────────────────────────────
from fastapi import Body
from fastapi.responses import StreamingResponse
from io import BytesIO
import textwrap

@app.post("/api/report/scan-pdf", tags=["Report"])
async def generate_scan_pdf(payload: dict = Body(...)):
    """
    Generate a PDF summary of a single statement scan.
    Expects the JSON body that POST /api/predict/batch/realistic returns,
    plus an optional 'file_name' and 'scanned_at' field added by the frontend.

    Returns: application/pdf stream — filename: fraud_report.pdf
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
            HRFlowable, KeepTogether,
        )
        from reportlab.graphics.shapes import Drawing, Rect, String, Line
        from reportlab.graphics import renderPDF
    except ImportError:
        raise HTTPException(status_code=500, detail="reportlab not installed on server.")

    # ── Pull data from payload ──────────────────────────────────────────────
    results      = payload.get("results", [])
    total        = payload.get("total_processed", len(results))
    scored_count = payload.get("scored_count", 0)
    unscored     = payload.get("unscored_count", 0)
    flagged      = payload.get("flagged_count", 0)
    file_name    = payload.get("file_name", "statement.csv")
    scanned_at   = payload.get("scanned_at", datetime.now().strftime("%Y-%m-%d %H:%M"))

    # Derived counts from this scan
    safe_count    = sum(1 for r in results if r.get("risk") == "safe")
    caution_count = sum(1 for r in results if r.get("risk") == "caution")
    danger_count  = sum(1 for r in results if r.get("risk") == "danger")

    # Category breakdown (flagged only, from THIS scan)
    cat_counts: dict[str, int] = {}
    for r in results:
        if r.get("risk") in ("caution", "danger") and r.get("status") == "scored":
            cat = r.get("category") or "unknown"
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
    # Sort by count desc, top 8
    top_cats = sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)[:8]

    # Flagged rows table
    flagged_rows = [
        r for r in results
        if r.get("risk") in ("caution", "danger") and r.get("status") == "scored"
    ]

    # ── Colour palette (matches frontend) ──────────────────────────────────
    COLOR_DARK   = colors.HexColor("#1B1F2A")
    COLOR_BLUE   = colors.HexColor("#2F4B7C")
    COLOR_GREEN  = colors.HexColor("#1F7A5C")
    COLOR_AMBER  = colors.HexColor("#B8792A")
    COLOR_RED    = colors.HexColor("#B23A2E")
    COLOR_BG     = colors.HexColor("#FAF9F6")
    COLOR_BORDER = colors.HexColor("#DAD6CC")
    COLOR_LIGHT  = colors.HexColor("#F0EEE8")
    COLOR_MUTED  = colors.HexColor("#6B6558")

    # ── Document setup ──────────────────────────────────────────────────────
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title="CardShield Scan Report",
        author="CardShield Fraud Detection",
    )

    styles = getSampleStyleSheet()
    w = A4[0] - 4*cm  # usable width

    # Custom paragraph styles
    H1 = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=18,
                         textColor=COLOR_DARK, spaceAfter=4, leading=22)
    H2 = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=11,
                         textColor=COLOR_DARK, spaceAfter=4, leading=14,
                         spaceBefore=10)
    LABEL = ParagraphStyle("LABEL", fontName="Helvetica-Bold", fontSize=7,
                            textColor=COLOR_MUTED, spaceAfter=0, leading=10,
                            wordWrap="CJK")
    SMALL = ParagraphStyle("SMALL", fontName="Helvetica", fontSize=8,
                            textColor=COLOR_MUTED, spaceAfter=0, leading=11)
    BODY  = ParagraphStyle("BODY",  fontName="Helvetica", fontSize=9,
                            textColor=COLOR_DARK, spaceAfter=0, leading=12)
    MONO  = ParagraphStyle("MONO",  fontName="Courier", fontSize=8,
                            textColor=COLOR_DARK, spaceAfter=0, leading=11)

    story = []

    # ── Header ──────────────────────────────────────────────────────────────
    story.append(Paragraph("CardShield", ParagraphStyle(
        "brand", fontName="Helvetica-Bold", fontSize=10,
        textColor=COLOR_BLUE, spaceAfter=2)))
    story.append(Paragraph("Statement Scan Report", H1))
    story.append(HRFlowable(width=w, thickness=1, color=COLOR_BORDER, spaceAfter=6))

    meta_data = [
        ["File", file_name],
        ["Scanned at", scanned_at],
        ["Model", "CardShield Realistic Fraud Detector"],
    ]
    meta_table = Table(meta_data, colWidths=[3*cm, w - 3*cm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 8),
        ("TEXTCOLOR",  (0, 0), (0, -1),  COLOR_MUTED),
        ("TEXTCOLOR",  (1, 0), (1, -1),  COLOR_DARK),
        ("FONTNAME",   (0, 0), (0, -1),  "Helvetica-Bold"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # ── Summary stats (4 cells) ─────────────────────────────────────────────
    story.append(Paragraph("Scan Summary", H2))

    def stat_cell(label: str, value: str, color=COLOR_DARK):
        return [
            Paragraph(label.upper(), LABEL),
            Paragraph(value, ParagraphStyle(
                "statval", fontName="Helvetica-Bold", fontSize=18,
                textColor=color, leading=22)),
        ]

    stats_table_data = [[
        stat_cell("Total Rows", str(total)),
        stat_cell("Safe", str(safe_count), COLOR_GREEN),
        stat_cell("Caution", str(caution_count), COLOR_AMBER),
        stat_cell("Danger", str(danger_count), COLOR_RED),
    ]]
    col_w = w / 4
    stat_tbl = Table(stats_table_data, colWidths=[col_w]*4, rowHeights=[52])
    stat_tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), COLOR_LIGHT),
        ("BOX",          (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("INNERGRID",    (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("TOPPADDING",   (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
        ("LEFTPADDING",  (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN",       (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(stat_tbl)
    story.append(Spacer(1, 18))

    # ── Category bar chart (this scan only) ─────────────────────────────────
    story.append(Paragraph("Flagged Transactions by Category", H2))
    story.append(Paragraph(
        "Recomputed from this scan's caution + danger rows only — not all-time data.",
        SMALL))
    story.append(Spacer(1, 6))

    if not top_cats:
        story.append(Paragraph(
            "No flagged transactions in this scan — nothing to chart.", BODY))
    else:
        CHART_H   = 160
        CHART_W   = float(w)
        bar_max   = max(v for _, v in top_cats)
        bar_area  = CHART_W - 5.5*cm   # leave room for labels
        row_h     = CHART_H / len(top_cats)
        bar_h_px  = max(8, row_h * 0.55)

        d = Drawing(CHART_W, CHART_H)
        for i, (cat, cnt) in enumerate(top_cats):
            y_center = CHART_H - (i + 0.5) * row_h
            bar_len  = (cnt / bar_max) * bar_area if bar_max else 0

            # Category label (right-aligned)
            lbl_x = 4.8 * cm
            label_str = cat if len(cat) <= 18 else cat[:17] + "…"
            d.add(String(lbl_x - 4,
                         y_center - 3,
                         label_str,
                         fontName="Helvetica", fontSize=7,
                         fillColor=COLOR_DARK,
                         textAnchor="end"))

            # Bar
            d.add(Rect(lbl_x, y_center - bar_h_px / 2,
                       bar_len, bar_h_px,
                       fillColor=COLOR_RED, strokeColor=None))

            # Count label after bar
            d.add(String(lbl_x + bar_len + 4,
                         y_center - 3,
                         str(cnt),
                         fontName="Helvetica-Bold", fontSize=7,
                         fillColor=COLOR_DARK))

        story.append(d)

    story.append(Spacer(1, 16))

    # ── Flagged rows table ───────────────────────────────────────────────────
    story.append(Paragraph(
        f"Flagged Transactions ({len(flagged_rows)} rows)", H2))

    if not flagged_rows:
        story.append(Paragraph(
            "No caution or danger rows in this scan.", BODY))
    else:
        # Table header
        tbl_header = [
            Paragraph("#",        ParagraphStyle("th", fontName="Helvetica-Bold",
                                                  fontSize=7, textColor=COLOR_MUTED,
                                                  leading=10)),
            Paragraph("Merchant", ParagraphStyle("th", fontName="Helvetica-Bold",
                                                  fontSize=7, textColor=COLOR_MUTED,
                                                  leading=10)),
            Paragraph("Amount",   ParagraphStyle("th", fontName="Helvetica-Bold",
                                                  fontSize=7, textColor=COLOR_MUTED,
                                                  leading=10, alignment=TA_RIGHT)),
            Paragraph("Risk",     ParagraphStyle("th", fontName="Helvetica-Bold",
                                                  fontSize=7, textColor=COLOR_MUTED,
                                                  leading=10, alignment=TA_CENTER)),
            Paragraph("Score",    ParagraphStyle("th", fontName="Helvetica-Bold",
                                                  fontSize=7, textColor=COLOR_MUTED,
                                                  leading=10, alignment=TA_RIGHT)),
            Paragraph("Top Reason", ParagraphStyle("th", fontName="Helvetica-Bold",
                                                    fontSize=7, textColor=COLOR_MUTED,
                                                    leading=10)),
        ]

        col_widths = [1*cm, 3.5*cm, 1.8*cm, 1.5*cm, 1.5*cm, w - 9.3*cm]

        tbl_data = [tbl_header]
        for r in flagged_rows:
            risk   = r.get("risk", "safe")
            risk_c = COLOR_RED if risk == "danger" else COLOR_AMBER
            score  = r.get("score_pct")
            score_str = f"{score:.1f}%" if score is not None else "—"
            amt    = r.get("amount")
            amt_str= f"${amt:.2f}" if amt is not None else "—"

            features = r.get("top_contributing_features") or []
            top_reason = features[0] if features else "—"
            # Wrap long reasons
            wrapped = "\n".join(textwrap.wrap(top_reason, 55))

            row_style = ParagraphStyle("cell", fontName="Helvetica", fontSize=7,
                                        textColor=COLOR_DARK, leading=10)
            row_style_r = ParagraphStyle("cellr", fontName="Helvetica", fontSize=7,
                                          textColor=COLOR_DARK, leading=10,
                                          alignment=TA_RIGHT)
            row_style_risk = ParagraphStyle("cellrisk", fontName="Helvetica-Bold",
                                             fontSize=7, textColor=risk_c, leading=10,
                                             alignment=TA_CENTER)

            tbl_data.append([
                Paragraph(str(r.get("row_index", "")), row_style),
                Paragraph((r.get("merchant") or "—")[:35], row_style),
                Paragraph(amt_str,   row_style_r),
                Paragraph(risk.upper(), row_style_risk),
                Paragraph(score_str, row_style_r),
                Paragraph(wrapped,   row_style),
            ])

        tbl = Table(tbl_data, colWidths=col_widths, repeatRows=1)
        tbl.setStyle(TableStyle([
            # Header row
            ("BACKGROUND",    (0, 0), (-1, 0),  COLOR_LIGHT),
            ("TOPPADDING",    (0, 0), (-1, 0),  5),
            ("BOTTOMPADDING", (0, 0), (-1, 0),  5),
            ("LINEBELOW",     (0, 0), (-1, 0),  0.75, COLOR_BORDER),
            # Body rows
            ("BACKGROUND",    (0, 1), (-1, -1), COLOR_BG),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [COLOR_BG, COLOR_LIGHT]),
            ("TOPPADDING",    (0, 1), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
            ("LINEBELOW",     (0, 1), (-1, -1), 0.25, COLOR_BORDER),
            # All
            ("LEFTPADDING",   (0, 0), (-1, -1), 5),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 5),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("BOX",           (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ]))
        story.append(tbl)

    # ── Footer note ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width=w, thickness=0.5, color=COLOR_BORDER, spaceAfter=6))
    story.append(Paragraph(
        "Generated by CardShield · Real ML model scores — not financial or legal advice.",
        ParagraphStyle("footer", fontName="Helvetica", fontSize=7,
                        textColor=COLOR_MUTED, alignment=TA_CENTER)))

    # ── Build PDF ────────────────────────────────────────────────────────────
    doc.build(story)
    buf.seek(0)

    safe_name = file_name.replace(" ", "_").replace(".csv", "") or "statement"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="fraud_report_{safe_name}.pdf"',
            "Cache-Control": "no-store",
        },
    )
