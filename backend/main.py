import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
from pathlib import Path

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
if (BASE_DIR / "data" / "processed").exists():
    PROCESSED_DIR = BASE_DIR / "data" / "processed"
else:
    PROCESSED_DIR = BASE_DIR.parent / "data" / "processed"


app = FastAPI(
    title="Demand-to-Production Planner API",
    description="Backend API for demand forecasting, production planning, and what-if scenario analysis",
    version="1.0.0"
)

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5175",
]

frontend_origin = os.getenv("FRONTEND_ORIGIN")
if frontend_origin:
    clean_origin = frontend_origin.rstrip("/")
    if clean_origin not in allowed_origins:
        allowed_origins.append(clean_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScenarioRequest(BaseModel):
    demand_change: float = Field(0.0, description="Percentage change in demand (e.g. 0.10 for +10%)")
    capacity_change: float = Field(0.0, description="Percentage change in production capacity (e.g. 0.10 for +10%)")
    safety_stock_change: float = Field(0.0, description="Percentage change in safety stock (e.g. 0.15 for +15%)")


@app.get("/")
def root():
    return {
        "message": "Demand-to-Production Planner API is running!"
    }


@app.get("/forecast")
def get_forecast():
    """Returns historical demand and quantile forecast predictions from forecast_results.csv."""
    file_path = PROCESSED_DIR / "forecast_results.csv"

    df = pd.read_csv(file_path)

    return df.to_dict(orient="records")


@app.get("/production")
def get_production():
    """Returns optimized production planning schedule records from optimized_plan.csv."""
    file_path = PROCESSED_DIR / "optimized_plan.csv"

    df = pd.read_csv(file_path)

    return df.to_dict(orient="records")


@app.get("/risk")
def get_risk():
    """Returns Monte Carlo risk evaluation summary and strategy comparison records."""
    risk_summary_path = PROCESSED_DIR / "monte_carlo_risk_summary.csv"
    comparison_path = PROCESSED_DIR / "monte_carlo_comparison.csv"

    if comparison_path.exists():
        df_risk = pd.read_csv(risk_summary_path)
        df_comp = pd.read_csv(comparison_path)
        df = pd.merge(df_risk, df_comp, on="Strategy", suffixes=("", "_comp"))
        df = df.loc[:, ~df.columns.str.endswith("_comp")]
    else:
        df = pd.read_csv(risk_summary_path)

    return df.to_dict(orient="records")


@app.post("/what-if")
def run_scenario(request: ScenarioRequest):
    """
    Calculates scenario planning metrics based on parameter adjustments (demand, capacity, safety stock)
    and compares them against baseline project data.
    """
    plan_path = PROCESSED_DIR / "optimized_plan.csv"
    risk_path = PROCESSED_DIR / "monte_carlo_risk_summary.csv"
    comp_path = PROCESSED_DIR / "monte_carlo_comparison.csv"

    # Read baseline project values
    df_plan = pd.read_csv(plan_path)
    base_demand = float(df_plan["forecast_demand"].sum())
    base_prod = float(df_plan["production"].sum())

    base_service_level = 85.15
    base_stockout = 343720.0
    base_inventory = 20938.0

    if risk_path.exists():
        df_risk = pd.read_csv(risk_path)
        q50_risk = df_risk[df_risk["Strategy"].str.contains("Q50", case=False, na=False)]
        if not q50_risk.empty:
            base_service_level = float(q50_risk["Median Service Level"].iloc[0])
            if base_service_level <= 1.0:
                base_service_level *= 100.0
            base_stockout = float(q50_risk["Average Stockout"].iloc[0])

    if comp_path.exists():
        df_comp = pd.read_csv(comp_path)
        q50_comp = df_comp[df_comp["Strategy"].str.contains("Q50", case=False, na=False)]
        if not q50_comp.empty and "Average Final Inventory" in q50_comp.columns:
            base_inventory = float(q50_comp["Average Final Inventory"].iloc[0])

    # Cost coefficients
    unit_prod_cost = 10.0
    unit_holding_cost = 2.5
    unit_penalty_cost = 15.0

    base_cost = (
        (base_prod * unit_prod_cost)
        + (base_inventory * unit_holding_cost)
        + (base_stockout * unit_penalty_cost)
    )

    # Scenario simulation
    d_change = request.demand_change
    c_change = request.capacity_change
    s_change = request.safety_stock_change

    scenario_demand = base_demand * (1.0 + d_change)
    max_capacity = base_prod * (1.0 + c_change)
    scenario_prod = min(scenario_demand, max_capacity)

    unfulfilled = max(0.0, scenario_demand - scenario_prod)
    scenario_inventory = max(
        0.0,
        (base_inventory * (1.0 + s_change)) + max(0.0, scenario_prod - scenario_demand),
    )
    scenario_stockout = max(
        0.0,
        base_stockout + (unfulfilled * 0.85) - ((scenario_inventory - base_inventory) * 0.4),
    )

    scenario_service_level = max(
        50.0, min(99.9, (1.0 - (scenario_stockout / scenario_demand)) * 100.0)
    )

    scenario_cost = (
        (scenario_prod * unit_prod_cost)
        + (scenario_inventory * unit_holding_cost)
        + (scenario_stockout * unit_penalty_cost)
    )

    return {
        "baseline": {
            "service_level": round(base_service_level, 2),
            "stockout": round(base_stockout),
            "inventory": round(base_inventory),
            "production": round(base_prod),
            "total_cost": round(base_cost),
        },
        "scenario": {
            "service_level": round(scenario_service_level, 2),
            "stockout": round(scenario_stockout),
            "inventory": round(scenario_inventory),
            "production": round(scenario_prod),
            "total_cost": round(scenario_cost),
        },
    }


# ============================================================
# CHAT / AI ASSISTANT ENDPOINT & TOOLS
# ============================================================
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import HTTPException

# Load environment variables
load_dotenv()

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation: list = []


llm_tools = [
    {
        "type": "function",
        "name": "get_forecast",
        "description": (
            "Get the 26-week demand forecast for a specific item. "
            "Use this when the user asks about demand, forecast, "
            "future demand, or forecast values for an item."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "item": {
                    "type": "integer",
                    "description": "The item number, from 1 to 20."
                }
            },
            "required": ["item"]
        }
    },
    {
        "type": "function",
        "name": "get_production_plan",
        "description": (
            "Get the master production plan schedule for a specific item. "
            "Use this when the user asks about production, production plan, "
            "inventory, backlog, or how much to produce for an item."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "item": {
                    "type": "integer",
                    "description": "The item number, from 1 to 20."
                }
            },
            "required": ["item"]
        }
    },
    {
        "type": "function",
        "name": "get_risk_analysis",
        "description": (
            "Get Monte Carlo risk analysis metrics and strategy comparisons. "
            "Use this when the user asks about risk, expected or worst-case service level, "
            "P10/P50/P90 service levels, stockouts, or comparing Q50 Optimized vs Uncertainty-Aware strategies."
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "type": "function",
        "name": "run_what_if",
        "description": (
            "Run a what-if planning scenario with percentage changes to demand, "
            "production capacity, or safety stock. "
            "Use this when the user asks what happens if demand increases/decreases, "
            "capacity changes, or safety stock changes."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "demand_change": {
                    "type": "number",
                    "description": "Percentage change in demand as a decimal (e.g., 0.15 for +15%, -0.10 for -10%). Defaults to 0.0."
                },
                "capacity_change": {
                    "type": "number",
                    "description": "Percentage change in production capacity as a decimal (e.g., -0.10 for -10%). Defaults to 0.0."
                },
                "safety_stock_change": {
                    "type": "number",
                    "description": "Percentage change in safety stock as a decimal (e.g., 0.20 for +20%). Defaults to 0.0."
                }
            },
            "required": []
        }
    }
]


def _helper_get_forecast(item: int):
    file_path = PROCESSED_DIR / "forecast_results.csv"
    df = pd.read_csv(file_path)
    return df[df["item"] == item].to_dict(orient="records")


def _helper_get_production(item: int):
    file_path = PROCESSED_DIR / "optimized_plan.csv"
    df = pd.read_csv(file_path)
    return df[df["item"] == item].to_dict(orient="records")


def _helper_get_risk():
    return get_risk()


def _helper_run_what_if(d: float, c: float, s: float):
    req = ScenarioRequest(demand_change=d, capacity_change=c, safety_stock_change=s)
    return run_scenario(req)


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    """
    AI Assistant chat endpoint with tool calling capability to query forecast, production plan,
    risk analysis, and what-if simulation scenarios.
    """
    if not openai_client:
        raise HTTPException(
            status_code=500,
            detail="OpenAI client not initialized. Ensure OPENAI_API_KEY is configured."
        )

    try:
        messages = []
        for msg in request.conversation:
            if isinstance(msg, dict) and "role" in msg and "content" in msg:
                messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": request.message})

        response = openai_client.responses.create(
            model="gpt-6-luna",
            input=messages,
            tools=llm_tools
        )

        tool_was_called = False
        for output_item in response.output:
            if output_item.type == "function_call":
                tool_was_called = True
                args = json.loads(output_item.arguments) if output_item.arguments else {}

                if output_item.name == "get_forecast":
                    item_num = int(args.get("item", 1))
                    res = _helper_get_forecast(item_num)
                elif output_item.name == "get_production_plan":
                    item_num = int(args.get("item", 1))
                    res = _helper_get_production(item_num)
                elif output_item.name == "get_risk_analysis":
                    res = _helper_get_risk()
                elif output_item.name == "run_what_if":
                    d_c = float(args.get("demand_change", 0.0))
                    c_c = float(args.get("capacity_change", 0.0))
                    s_c = float(args.get("safety_stock_change", 0.0))
                    res = _helper_run_what_if(d_c, c_c, s_c)
                else:
                    res = []

                messages.append(output_item)
                messages.append({
                    "type": "function_call_output",
                    "call_id": output_item.call_id,
                    "output": json.dumps(res)
                })

        if tool_was_called:
            final_resp = openai_client.responses.create(
                model="gpt-6-luna",
                input=messages,
                tools=llm_tools
            )
            reply = final_resp.output_text
        else:
            reply = response.output_text

        return {
            "response": reply,
            "message": reply
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))