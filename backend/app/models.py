from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    documents = relationship("PDFDocument", back_populates="owner", cascade="all, delete-orphan")


class PDFDocument(Base):
    __tablename__ = "pdf_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    extracted_text = Column(Text, nullable=False)
    textbook_structure = Column(Text, nullable=True)
    textbook_data = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="documents")
    chunks = relationship("PDFChunk", back_populates="document", cascade="all, delete-orphan")

    @property
    def is_embedded(self) -> bool:
        return len(self.chunks) > 0


class PDFChunk(Base):
    __tablename__ = "pdf_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("pdf_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    embedding = Column(Vector(2048), nullable=False)  # 2048 dimensions for Nemotron-3-embed-1b

    document = relationship("PDFDocument", back_populates="chunks")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("pdf_documents.id", ondelete="CASCADE"), nullable=True)
    title = Column(String, nullable=False)
    topic_name = Column(String, nullable=True)
    chapter_name = Column(String, nullable=True)
    questions = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")
    document = relationship("PDFDocument")


class LessonPresentation(Base):
    __tablename__ = "lesson_presentations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("pdf_documents.id", ondelete="CASCADE"), nullable=True)
    title = Column(String, nullable=False)
    topic_name = Column(String, nullable=True)
    chapter_name = Column(String, nullable=True)
    slides_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")
    document = relationship("PDFDocument")
