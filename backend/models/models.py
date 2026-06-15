from sqlalchemy import Column, String, Integer, Text, DateTime, Enum
from sqlalchemy.sql import func
from config.database import Base
import enum
import uuid

# ---- Enums ----

class ProjectStatus(enum.Enum):
    pending = "pending"
    planning = "planning"
    researching = "researching"
    coding = "coding"
    testing = "testing"
    securing = "securing"
    deploying = "deploying"
    monitoring = "monitoring"
    completed = "completed"
    failed = "failed"

class AgentStatus(enum.Enum):
    idle = "idle"
    running = "running"
    completed = "completed"
    failed = "failed"

# ---- Models ----

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.pending)
    architecture = Column(Text, nullable=True)
    research = Column(Text, nullable=True)
    code = Column(Text, nullable=True)
    test_results = Column(Text, nullable=True)
    security_report = Column(Text, nullable=True)
    deployment_url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    status = Column(Enum(AgentStatus), default=AgentStatus.idle)
    input = Column(Text, nullable=True)
    output = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)