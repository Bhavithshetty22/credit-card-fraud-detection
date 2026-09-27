# Credit Card Fraud Detection — FastAPI Backend

## Structure

```
backend/
├── main.py           # FastAPI app + all endpoints
├── model_loader.py   # Loads all 15 models, evaluates on real holdout test set
├── database.py       # SQLAlchemy engine + session factory (SQLite)
├── models.py         # ORM table definitions (TransactionRecord, CardSetting)
├── schemas.py        # Pydantic request/response schemas
├── requirements.txt  # Python dependencies
└── app.db            # SQLite database (auto-created on first run)
```

## How to Run

From the `backend/` directory:

```bash
# 1. (Optional) install dependencies if not already installed
pip install -r requirements.txt

# 2. Start the server
uvicorn main:app --reload --port 8000
```

The server will:
1. Load `models/scaler.joblib`, `models/ga_feature_selection.joblib`, `models/random_feature_selection.joblib`
2. Load all 15 trained model artifacts from `models/trained/`
3. Rebuild the 20% holdout test set (identical split to training) and evaluate every model on real data
4. Select the single best-performing model by **F1 score** (tiebreak: recall)
5. Log the selected model name and its metrics to stdout
6. **Exit immediately** if any required artifact or the dataset file is missing

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Production model name + real evaluation metrics |
| `POST` | `/api/predict/batch` | CSV upload → per-row predictions persisted to SQLite |
| `GET` | `/api/transactions` | Paginated recent transactions from SQLite |
| `GET` | `/api/alerts` | Open (unresolved) caution/danger transactions |
| `PATCH` | `/api/alerts/{id}` | Resolve alert `{"resolution": "safe"\|"blocked"}` |
| `GET` | `/api/card-settings` | Current card control settings from SQLite |
| `PATCH` | `/api/card-settings` | Update frozen, limit, overseas, high-risk toggles |
| `GET` | `/api/results/overview` | Real metrics for all 15 model×feature combos |

Interactive API docs: http://localhost:8000/docs

## Notes

- **No mock scores** — predictions always use the real scikit-learn model.
- The scaler is applied via `transform()` only; it was fitted on training data only (no leakage).
- CORS is enabled for `http://localhost:5173` and `http://localhost:4173` (Vite dev/preview).
- SQLite `app.db` is created automatically in the `backend/` directory on first startup.
- The `sklearn` version warning (`1.9.0 → 1.8.0`) is cosmetic; the models load and predict correctly.
