from dotenv import load_dotenv
from openai import OpenAI
import pandas as pd
from pathlib import Path
import json


# ============================================================
# 1. LOAD PROJECT DATA & SIMULATION FUNCTIONS
# ============================================================

def get_forecast(item: int):
    """
    Get the 26-week demand forecast for a specific item.
    """
    file_path = (
        Path(__file__).resolve().parent.parent
        / "data"
        / "processed"
        / "forecast_results.csv"
    )

    df = pd.read_csv(file_path)

    # Keep only the requested item
    item_data = df[df["item"] == item]

    # Convert dataframe to normal Python data
    return item_data.to_dict(orient="records")


def get_production_plan(item: int):
    """
    Get the master production plan schedule for a specific item.
    """
    file_path = (
        Path(__file__).resolve().parent.parent
        / "data"
        / "processed"
        / "optimized_plan.csv"
    )

    df = pd.read_csv(file_path)

    # Keep only the requested item
    item_data = df[df["item"] == item]

    # Convert dataframe to normal Python data
    return item_data.to_dict(orient="records")


def get_risk_analysis():
    """
    Get Monte Carlo risk analysis metrics and strategy comparisons.
    """
    processed_dir = Path(__file__).resolve().parent.parent / "data" / "processed"
    risk_summary_path = processed_dir / "monte_carlo_risk_summary.csv"
    comparison_path = processed_dir / "monte_carlo_comparison.csv"

    if comparison_path.exists():
        df_risk = pd.read_csv(risk_summary_path)
        df_comp = pd.read_csv(comparison_path)
        df = pd.merge(df_risk, df_comp, on="Strategy", suffixes=("", "_comp"))
        df = df.loc[:, ~df.columns.str.endswith("_comp")]
    else:
        df = pd.read_csv(risk_summary_path)

    return df.to_dict(orient="records")


def run_what_if(
    demand_change: float = 0.0,
    capacity_change: float = 0.0,
    safety_stock_change: float = 0.0
):
    """
    Run a what-if planning scenario with percentage adjustments to demand,
    capacity, or safety stock. Returns baseline vs scenario metrics.
    """
    processed_dir = Path(__file__).resolve().parent.parent / "data" / "processed"
    plan_path = processed_dir / "optimized_plan.csv"
    risk_path = processed_dir / "monte_carlo_risk_summary.csv"
    comp_path = processed_dir / "monte_carlo_comparison.csv"

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

    unit_prod_cost = 10.0
    unit_holding_cost = 2.5
    unit_penalty_cost = 15.0

    base_cost = (
        (base_prod * unit_prod_cost)
        + (base_inventory * unit_holding_cost)
        + (base_stockout * unit_penalty_cost)
    )

    scenario_demand = base_demand * (1.0 + demand_change)
    max_capacity = base_prod * (1.0 + capacity_change)
    scenario_prod = min(scenario_demand, max_capacity)

    unfulfilled = max(0.0, scenario_demand - scenario_prod)
    scenario_inventory = max(
        0.0,
        (base_inventory * (1.0 + safety_stock_change)) + max(0.0, scenario_prod - scenario_demand),
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
# 2. TEST THE PYTHON FUNCTIONS AT STARTUP
# ============================================================

print("\nTesting get_forecast()...")
test_forecast_data = get_forecast(7)
print(f"Found {len(test_forecast_data)} forecast records for Item 7.")

print("\nTesting get_production_plan()...")
test_prod_data = get_production_plan(7)
print(f"Found {len(test_prod_data)} production records for Item 7.")

print("\nTesting get_risk_analysis()...")
test_risk_data = get_risk_analysis()
print(f"Found {len(test_risk_data)} risk analysis strategy records.")

print("\nTesting run_what_if(+15% demand)...")
test_what_if = run_what_if(demand_change=0.15, capacity_change=0.0, safety_stock_change=0.0)
print(f"Baseline service level: {test_what_if['baseline']['service_level']}% -> Scenario service level: {test_what_if['scenario']['service_level']}%")


# ============================================================
# 3. LOAD OPENAI API KEY
# ============================================================

load_dotenv()

client = OpenAI()


# ============================================================
# 4. DEFINE THE TOOLS FOR THE LLM
# ============================================================

tools = [
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


# ============================================================
# 5. CONVERSATION HISTORY
# ============================================================

conversation = []


# ============================================================
# 6. CHAT LOOP
# ============================================================

print("\n" + "=" * 60)
print("Demand & Production Planning Assistant")
print("=" * 60)

print("Ask me about demand forecasts, production plans, risk analysis, or what-if scenarios.")
print("Examples:")
print("  - What is the forecast for Item 7?")
print("  - What is the production plan for Item 7?")
print("  - What is the risk of our current production plan?")
print("  - What happens if demand increases by 15%?")
print("Type 'exit' to stop.\n")


while True:

    # --------------------------------------------------------
    # Get user message
    # --------------------------------------------------------

    user_message = input("You: ")

    if user_message.lower() == "exit":
        print("\nGoodbye!")
        break


    # --------------------------------------------------------
    # Add user message to conversation
    # --------------------------------------------------------

    conversation.append({
        "role": "user",
        "content": user_message
    })


    # --------------------------------------------------------
    # Ask the LLM what to do
    # --------------------------------------------------------

    response = client.responses.create(
        model="gpt-6-luna",
        input=conversation,
        tools=tools
    )


    # --------------------------------------------------------
    # Check whether the LLM wants to call a tool
    # --------------------------------------------------------

    tool_was_called = False

    for output_item in response.output:

        if output_item.type == "function_call":

            tool_was_called = True

            print("\n[Tool] LLM wants to use:", output_item.name)


            # ------------------------------------------------
            # Read the arguments chosen by the LLM
            # ------------------------------------------------

            arguments = json.loads(output_item.arguments)


            # ------------------------------------------------
            # ACTUALLY RUN THE APPROPRIATE PYTHON FUNCTION
            # ------------------------------------------------

            if output_item.name == "get_forecast":
                item_number = arguments.get("item", 1)
                print(f"[Forecast] Getting forecast for Item {item_number}...")
                result = get_forecast(item_number)
            elif output_item.name == "get_production_plan":
                item_number = arguments.get("item", 1)
                print(f"[Production] Getting production plan for Item {item_number}...")
                result = get_production_plan(item_number)
            elif output_item.name == "get_risk_analysis":
                print("[Risk] Fetching Monte Carlo risk analysis data...")
                result = get_risk_analysis()
            elif output_item.name == "run_what_if":
                d_change = float(arguments.get("demand_change", 0.0))
                c_change = float(arguments.get("capacity_change", 0.0))
                s_change = float(arguments.get("safety_stock_change", 0.0))
                print(f"[What-If] Running scenario (demand: {d_change*100:+.1f}%, capacity: {c_change*100:+.1f}%, safety stock: {s_change*100:+.1f}%)...")
                result = run_what_if(
                    demand_change=d_change,
                    capacity_change=c_change,
                    safety_stock_change=s_change
                )
            else:
                result = []


            # ------------------------------------------------
            # Send the tool call itself into conversation
            # ------------------------------------------------

            conversation.append(output_item)


            # ------------------------------------------------
            # Send the REAL data back to the LLM
            # ------------------------------------------------

            conversation.append({
                "type": "function_call_output",
                "call_id": output_item.call_id,
                "output": json.dumps(result)
            })


    # --------------------------------------------------------
    # If a tool was called, ask the LLM to interpret the result
    # --------------------------------------------------------

    if tool_was_called:

        final_response = client.responses.create(
            model="gpt-6-luna",
            input=conversation,
            tools=tools
        )

        assistant_message = final_response.output_text

    else:

        # No tool needed — normal conversational answer
        assistant_message = response.output_text


    # --------------------------------------------------------
    # Display answer
    # --------------------------------------------------------

    print(f"\nAI: {assistant_message}\n")


    # --------------------------------------------------------
    # Save assistant response to conversation
    # --------------------------------------------------------

    conversation.append({
        "role": "assistant",
        "content": assistant_message
    })