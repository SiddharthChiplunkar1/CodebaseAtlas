import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from pgvector.sqlalchemy import Vector
from .database import Base

class Repo(Base):
    __tablename__ = "repos"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_id = Column(String(255))
    owner = Column(String(255))
    name = Column(String(255))
    full_name = Column(String(255))
    description = Column(Text)
    clone_url = Column(String(255))
    status = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CodeNode(Base):
    __tablename__ = "code_nodes"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(PGUUID(as_uuid=True), ForeignKey("repos.id", ondelete="CASCADE"))
    node_key = Column(String(512))
    name = Column(String(255))
    type = Column(String(50))
    file_path = Column(Text)
    start_line = Column(Integer)
    end_line = Column(Integer)
    language = Column(String(50))
    signature = Column(Text)
    
    # all-MiniLM-L6-v2 produces 384-dimensional vectors.
    embedding = Column(Vector(384))
    created_at = Column(DateTime, default=datetime.utcnow)


class CodeEdge(Base):
    __tablename__ = "code_edges"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(PGUUID(as_uuid=True), ForeignKey("repos.id", ondelete="CASCADE"))
    from_node = Column(PGUUID(as_uuid=True), ForeignKey("code_nodes.id", ondelete="CASCADE"))
    to_node = Column(PGUUID(as_uuid=True), ForeignKey("code_nodes.id", ondelete="CASCADE"))
    edge_type = Column(String(50))
