# 📈 Demand-to-Production Optimization & Planning Platform

[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.142.2-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0%2B-646CFF.svg)](https://vitejs.dev/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.7.0-green.svg)](https://lightgbm.readthedocs.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, end-to-end **Demand-to-Production Optimization & Planning System**. This platform bridges the gap between raw machine-learning demand forecasts and execution-ready Master Production Schedules (MPS). It features **multi-quantile probabilistic forecasting (P10, P50, P90)**, **constrained production optimization**, **Monte Carlo risk simulation**, **interactive what-if scenario testing**, and an **AI Supply Chain Assistant** with dynamic function calling.

---

## 🚀 Live Deployment Links

| Component | Service | Deployment URL | Description |
| :--- | :--- | :--- | :--- |
| **Backend API** | Render | [https://demand-planner-backend.onrender.com](https://demand-planner-backend.onrender.com) | FastAPI Core Backend Service |
| **API Documentation** | Swagger UI | [https://demand-planner-backend.onrender.com/docs](https://demand-planner-backend.onrender.com/docs) | Interactive OpenAPI / Swagger Docs |
| **Frontend Application** | Render / Cloud | [https://demand-planner-frontend.onrender.com](https://demand-planner-frontend.onrender.com) | React Executive Dashboard |
| **GitHub Repository** | GitHub | [https://github.com/bgauri05/demand-to-production-optimization](https://github.com/bgauri05/demand-to-production-optimization) | Source Code & Notebook Pipeline |

---

## ✨ Key Features & Capabilities

### 1. 📊 Probabilistic Multi-Quantile Forecasting
- **Engine**: LightGBM Gradient Boosting with pinball loss objectives.
- **Quantiles**: **P10** (pessimistic / low bound), **P50** (median baseline forecast), and **P90** (high-demand upper bound).
- **Features**: Lag features (1-4 weeks), rolling statistics (4w/8w/12w mean & std), calendar features, and trend signals across 20 distinct item SKUs over a 26-week planning horizon.

### 2. ⚙️ Constrained Master Production Scheduling (MPS)
- **Optimization Objective**: Minimize total landed cost ($\text{Production Cost} + \text{Holding Cost} + \text{Stockout Penalty Cost}$).
- **Constraints**: Machine capacity limits, initial inventory levels, safety stock thresholds, non-negative production volumes, and backorder carryovers.
- **Output**: Detailed week-by-week SKU-level production schedule (`optimized_plan.csv`).

### 3. 🎲 Monte Carlo Risk Evaluation & Stress Testing
- **Simulation Horizon**: 1,000+ stochastic iterations introducing demand volatility and lead-time perturbations.
- **Strategy Comparison**: Evaluates **Q50 Standard Optimization** vs. **Uncertainty-Aware P90 Safety Buffer Strategy**.
- **Metrics Tracked**: Expected Service Level (%), Total Expected Stockout Units, Final Inventory Buffers, and Value-at-Risk (VaR).

### 4. 🎛️ Interactive What-If Scenario Engine
- Real-time simulation of supply chain disruptions:
  - **Demand Fluctuation**: $\pm X\%$ shift in consumer demand.
  - **Capacity Adjustments**: $\pm Y\%$ plant operational capacity shift.
  - **Safety Stock Buffer**: $\pm Z\%$ safety stock recalibration.
- Instantly recalculates service level, inventory holding, stockouts, and financial impact.

### 5. 🤖 AI Supply Chain Assistant (OpenAI Tool Calling)
- Natural language interface integrated with OpenAI GPT models using strict function tools:
  - `get_forecast(item)`
  - `get_production_plan(item)`
  - `get_risk_analysis()`
  - `run_what_if(demand_change, capacity_change, safety_stock_change)`
- Answers complex supply chain questions (e.g. *"What happens to our total cost if demand increases by 15% and capacity drops by 10%?"*).

### 6. 🖥️ Executive React Dashboard
- Built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**.
- Interactive data visualizations with **Recharts** and **Lucide Icons**.
- Multi-tab layout covering: *Overview*, *Forecast Analysis*, *Production Schedule*, *Risk & Simulation*, *What-If Planning*, and *AI Assistant*.

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |     Raw Demand & SKU Data (CSV/DB)    |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |  Data Processing & Feature Engineering |
                                  |         (src/forecasting/features.py)  |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |   LightGBM Probabilistic Model        |
                                  |       (P10, P50, P90 Quantiles)       |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  | Constrained MPS Production Optimizer  |
                                  |   & Monte Carlo Risk Simulator Engine  |
                                  +---------------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       FastAPI Backend API (Python)     |
                                  |         (backend/main.py:8000)        |
                                  +---------------------------------------+
                                       /              |              \
                                      /               |               \
                                     v                v                v
                 +-----------------------+  +-------------------+  +-----------------------+
                 | Swagger / OpenAPI     |  | AI Assistant Tool |  | React / Vite Frontend |
                 | Interactive Docs      |  | Calling (OpenAI)  |  | Dashboard (Port 5173) |
                 +-----------------------+  +-------------------+  +-----------------------+
```

---

## 📂 Repository Structure

```
demand-to-production-planner/
├── backend/
│   ├── app/                    # Modular FastAPI components
│   ├── main.py                 # FastAPI application server & AI Assistant endpoint
│   ├── Dockerfile              # Backend container definition
│   ├── requirements.txt        # Production backend dependencies
│   └── test_llm.py             # LLM tool-calling unit tests
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI cards, sidebars, charts
│   │   ├── pages/              # Overview, Forecast, Production, Risk, What-If, Assistant
│   │   ├── config.ts           # Dynamic API Base URL configuration
│   │   ├── App.tsx             # Main routing & app state
│   │   └── main.tsx            # React root entry point
│   ├── Dockerfile              # Frontend container definition (Nginx static server)
│   ├── nginx.conf              # Nginx server configuration
│   ├── package.json            # Node.js dependencies & scripts
│   └── vite.config.ts          # Vite build config
├── data/
│   ├── raw/                    # Original supply chain datasets
│   └── processed/              # Forecast results, optimized plans, risk summaries
├── notebooks/
│   ├── 01_day1_eda.ipynb               # Exploratory Data Analysis & SKU profiling
│   ├── 02_day1_split.ipynb             # Time-series train/test split logic
│   ├── 03_baselines.ipynb              # Naive & Moving Average baselines
│   ├── 04_day2_lightgbm.ipynb          # Feature engineering & LightGBM training
│   ├── 05_day3_forecasting.ipynb       # 26-week quantile forecast generation
│   ├── 06_day4_optimizer.ipynb         # Linear/heuristic production optimization
│   ├── 07_day5_simulation.ipynb        # Supply chain environment simulation
│   ├── 08_day6_uncertainty.ipynb       # Risk profiling & buffer evaluation
│   └── 09_day7_monte_carlo.ipynb       # Monte Carlo 1,000-run stress tests
├── src/                        # Core Python data processing module
├── docker-compose.yml          # Multi-container orchestration
├── requirements.txt            # Data science environment dependencies
└── README.md                   # Project documentation
```

---

## 💻 Local Quickstart & Setup Guide

### Prerequisites
- **Python**: `3.12+`
- **Node.js**: `18+` & `npm`
- **Docker & Docker Compose** *(Optional for containerized run)*

---

### Method 1: Local Development Run

#### 1. Clone the Repository
```bash
git clone https://github.com/bgauri05/demand-to-production-optimization.git
cd demand-to-production-optimization
```

#### 2. Set Up & Run Backend
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
# Activate virtual environment (Linux/macOS)
# source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Create backend/.env configuration
echo "OPENAI_API_KEY=your_openai_api_key_here" > backend/.env

# Launch FastAPI backend server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
The API server will run at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

#### 3. Set Up & Run Frontend
In a new terminal window:
```bash
cd frontend

# Install Node modules
npm install

# Create local environment configuration
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# Launch Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

### Method 2: Docker Compose Setup 🐳

To build and launch both backend and frontend services in isolated Docker containers:

```bash
docker-compose up --build
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`

---

## 📡 API Specification & Endpoints

| Method | Endpoint | Description | Sample Query / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Health Check | N/A |
| `GET` | `/forecast` | 26-week SKU quantile forecasts (P10, P50, P90) | N/A |
| `GET` | `/production` | Master Production Schedule & inventory levels | N/A |
| `GET` | `/risk` | Monte Carlo risk summary & strategy comparison | N/A |
| `POST` | `/what-if` | Calculate metrics under custom scenario inputs | `{"demand_change": 0.15, "capacity_change": -0.10, "safety_stock_change": 0.20}` |
| `POST` | `/chat` | AI Supply Chain Assistant (Tool-calling response) | `{"message": "What is the P90 forecast for Item 3?"}` |

---

## 🛠️ Tech Stack & Technologies Used

- **Data Processing & Machine Learning**: Python, Pandas, NumPy, Scikit-Learn, LightGBM, SciPy, Matplotlib, Seaborn
- **Backend API Framework**: FastAPI, Uvicorn, Pydantic, OpenAI API (Responses/Tools API), Python-Dotenv
- **Frontend Dashboard**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React Icons
- **DevOps & Containerization**: Docker, Docker Compose, Nginx, Render Cloud Deployment

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `OPENAI_API_KEY` | Yes (for AI Assistant) | OpenAI API key for chat & tool calling | `sk-proj-...` |
| `FRONTEND_ORIGIN` | No | Additional allowed CORS origin URL | `https://demand-planner-frontend.onrender.com` |

### Frontend (`frontend/.env`)
| Variable | Required | Description | Default |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | Target Backend API URL | `http://localhost:8000` |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing & Acknowledgments

Contributions, issues, and feature requests are welcome!
Feel free to check out the [Issues page](https://github.com/bgauri05/demand-to-production-optimization/issues).

Developed with ❤️ by **[Gauri](https://github.com/bgauri05)**.
