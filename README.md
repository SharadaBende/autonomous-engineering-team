# 🤖 Autonomous Engineering Team

A platform where AI agents autonomously build, test, deploy and monitor software.

## 🚀 What it does

You describe a product → AI agents do everything else:

- 🗺️ **Planner Agent** → Creates architecture
- 🔍 **Research Agent** → Studies similar solutions
- 💻 **Coding Agent** → Writes the code
- 🧪 **Testing Agent** → Creates and runs tests
- 🔒 **Security Agent** → Audits for vulnerabilities
- ⚙️ **DevOps Agent** → Deploys the application
- 📊 **Monitoring Agent** → Watches production

## 🛠️ Tech Stack

- **Backend** → Python, FastAPI
- **Database** → PostgreSQL
- **Queue** → Redis + Celery
- **AI** → Anthropic Claude API
- **Frontend** → React + Tailwind CSS
- **Deployment** → Docker

## ⚙️ Setup

1. Clone the repository
2. Create virtual environment
3. Install dependencies
4. Set up environment variables
5. Run the application

## 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/autonomous-engineering-team.git
cd autonomous-engineering-team
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## 🔑 Environment Variables

Create a `.env` file and add:

```
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
```