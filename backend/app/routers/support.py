from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json
import os
from pathlib import Path

from app.database import get_db
from app.models import User
from app.schemas.support import (
    SupportTicketCreate, SupportTicketUpdate, SupportTicketResponse, SupportTicketFilter,
    KnowledgeBaseArticleCreate, KnowledgeBaseArticleUpdate, KnowledgeBaseArticleResponse,
    SupportContact, SupportResource
)
from app.utils.auth import get_current_active_user

router = APIRouter()

# Support Tickets endpoints
@router.post("/tickets", response_model=SupportTicketResponse)
async def create_support_ticket(
    ticket: SupportTicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new support ticket"""
    # Import here to avoid circular imports
    from app.models import SupportTicket as SupportTicketModel
    
    db_ticket = SupportTicketModel(
        user_id=ticket.user_id,
        subject=ticket.subject,
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority,
        status=ticket.status
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    # Get user information for response
    user = db.query(User).filter(User.id == db_ticket.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": db_ticket.id,
        "user_id": db_ticket.user_id,
        "subject": db_ticket.subject,
        "description": db_ticket.description,
        "category": db_ticket.category,
        "priority": db_ticket.priority,
        "status": db_ticket.status,
        "created_at": db_ticket.created_at,
        "updated_at": db_ticket.updated_at,
        "username": user.username,
        "full_name": user.full_name
    }

@router.get("/tickets", response_model=List[SupportTicketResponse])
async def get_support_tickets(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get support tickets with optional filters"""
    # Import here to avoid circular imports
    from app.models import SupportTicket as SupportTicketModel
    
    query = db.query(SupportTicketModel, User).join(User)
    
    if user_id:
        query = query.filter(SupportTicketModel.user_id == user_id)
    
    if category:
        query = query.filter(SupportTicketModel.category.ilike(f"%{category}%"))
    
    if priority:
        query = query.filter(SupportTicketModel.priority == priority)
    
    if status:
        query = query.filter(SupportTicketModel.status == status)
    
    # Order by created_at descending (most recent first)
    query = query.order_by(SupportTicketModel.created_at.desc())
    
    # Apply pagination
    tickets = query.offset(skip).limit(limit).all()
    
    # Convert to response format
    result = []
    for ticket, user in tickets:
        result.append({
            "id": ticket.id,
            "user_id": ticket.user_id,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at,
            "username": user.username,
            "full_name": user.full_name
        })
    
    return result

@router.get("/tickets/{ticket_id}", response_model=SupportTicketResponse)
async def get_support_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific support ticket by ID"""
    # Import here to avoid circular imports
    from app.models import SupportTicket as SupportTicketModel
    
    ticket = db.query(SupportTicketModel, User).join(User).filter(SupportTicketModel.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    
    ticket_model, user = ticket
    
    return {
        "id": ticket_model.id,
        "user_id": ticket_model.user_id,
        "subject": ticket_model.subject,
        "description": ticket_model.description,
        "category": ticket_model.category,
        "priority": ticket_model.priority,
        "status": ticket_model.status,
        "created_at": ticket_model.created_at,
        "updated_at": ticket_model.updated_at,
        "username": user.username,
        "full_name": user.full_name
    }

@router.put("/tickets/{ticket_id}", response_model=SupportTicketResponse)
async def update_support_ticket(
    ticket_id: int,
    ticket_update: SupportTicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a support ticket"""
    # Import here to avoid circular imports
    from app.models import SupportTicket as SupportTicketModel
    
    db_ticket = db.query(SupportTicketModel).filter(SupportTicketModel.id == ticket_id).first()
    
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    
    # Update fields if provided
    update_data = ticket_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    
    db_ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_ticket)
    
    # Get user information for response
    user = db.query(User).filter(User.id == db_ticket.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": db_ticket.id,
        "user_id": db_ticket.user_id,
        "subject": db_ticket.subject,
        "description": db_ticket.description,
        "category": db_ticket.category,
        "priority": db_ticket.priority,
        "status": db_ticket.status,
        "created_at": db_ticket.created_at,
        "updated_at": db_ticket.updated_at,
        "username": user.username,
        "full_name": user.full_name
    }

# Knowledge Base endpoints
@router.post("/knowledge-base", response_model=KnowledgeBaseArticleResponse)
async def create_knowledge_base_article(
    article: KnowledgeBaseArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new knowledge base article"""
    # Import here to avoid circular imports
    from app.models import KnowledgeBaseArticle as KnowledgeBaseArticleModel
    
    db_article = KnowledgeBaseArticleModel(
        title=article.title,
        content=article.content,
        category=article.category,
        tags=json.dumps(article.tags),
        is_published=article.is_published,
        created_by=article.created_by
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    
    # Get author information for response
    author = db.query(User).filter(User.id == db_article.created_by).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    return {
        "id": db_article.id,
        "title": db_article.title,
        "content": db_article.content,
        "category": db_article.category,
        "tags": json.loads(db_article.tags) if db_article.tags else [],
        "is_published": db_article.is_published,
        "created_at": db_article.created_at,
        "updated_at": db_article.updated_at,
        "author_name": author.full_name
    }

@router.get("/knowledge-base", response_model=List[KnowledgeBaseArticleResponse])
async def get_knowledge_base_articles(
    category: Optional[str] = Query(None, description="Filter by category"),
    is_published: Optional[bool] = Query(True, description="Filter by published status"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get knowledge base articles with optional filters"""
    # Import here to avoid circular imports
    from app.models import KnowledgeBaseArticle as KnowledgeBaseArticleModel
    
    query = db.query(KnowledgeBaseArticleModel, User).join(User, KnowledgeBaseArticleModel.created_by == User.id)
    
    if category:
        query = query.filter(KnowledgeBaseArticleModel.category.ilike(f"%{category}%"))
    
    if is_published is not None:
        query = query.filter(KnowledgeBaseArticleModel.is_published == is_published)
    
    if search:
        query = query.filter(
            (KnowledgeBaseArticleModel.title.ilike(f"%{search}%")) |
            (KnowledgeBaseArticleModel.content.ilike(f"%{search}%"))
        )
    
    # Order by created_at descending (most recent first)
    query = query.order_by(KnowledgeBaseArticleModel.created_at.desc())
    
    # Apply pagination
    articles = query.offset(skip).limit(limit).all()
    
    # Convert to response format
    result = []
    for article, author in articles:
        result.append({
            "id": article.id,
            "title": article.title,
            "content": article.content,
            "category": article.category,
            "tags": json.loads(article.tags) if article.tags else [],
            "is_published": article.is_published,
            "created_at": article.created_at,
            "updated_at": article.updated_at,
            "author_name": author.full_name
        })
    
    return result

@router.get("/knowledge-base/{article_id}", response_model=KnowledgeBaseArticleResponse)
async def get_knowledge_base_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific knowledge base article by ID"""
    # Import here to avoid circular imports
    from app.models import KnowledgeBaseArticle as KnowledgeBaseArticleModel
    
    article = db.query(KnowledgeBaseArticleModel, User).join(User, KnowledgeBaseArticleModel.created_by == User.id).filter(KnowledgeBaseArticleModel.id == article_id).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Knowledge base article not found")
    
    article_model, author = article
    
    return {
        "id": article_model.id,
        "title": article_model.title,
        "content": article_model.content,
        "category": article_model.category,
        "tags": json.loads(article_model.tags) if article_model.tags else [],
        "is_published": article_model.is_published,
        "created_at": article_model.created_at,
        "updated_at": article_model.updated_at,
        "author_name": author.full_name
    }

@router.put("/knowledge-base/{article_id}", response_model=KnowledgeBaseArticleResponse)
async def update_knowledge_base_article(
    article_id: int,
    article_update: KnowledgeBaseArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a knowledge base article"""
    # Import here to avoid circular imports
    from app.models import KnowledgeBaseArticle as KnowledgeBaseArticleModel
    
    db_article = db.query(KnowledgeBaseArticleModel).filter(KnowledgeBaseArticleModel.id == article_id).first()
    
    if not db_article:
        raise HTTPException(status_code=404, detail="Knowledge base article not found")
    
    # Update fields if provided
    update_data = article_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "tags":
            setattr(db_article, field, json.dumps(value))
        else:
            setattr(db_article, field, value)
    
    db_article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_article)
    
    # Get author information for response
    author = db.query(User).filter(User.id == db_article.created_by).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    return {
        "id": db_article.id,
        "title": db_article.title,
        "content": db_article.content,
        "category": db_article.category,
        "tags": json.loads(db_article.tags) if db_article.tags else [],
        "is_published": db_article.is_published,
        "created_at": db_article.created_at,
        "updated_at": db_article.updated_at,
        "author_name": author.full_name
    }

# Support Contacts endpoints
@router.get("/contacts", response_model=List[SupportContact])
async def get_support_contacts(
    department: Optional[str] = Query(None, description="Filter by department"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get support contacts"""
    # Import here to avoid circular imports
    from app.models import SupportContact as SupportContactModel
    
    query = db.query(SupportContactModel)
    
    if department:
        query = query.filter(SupportContactModel.department.ilike(f"%{department}%"))
    
    if is_active is not None:
        query = query.filter(SupportContactModel.is_active == is_active)
    
    contacts = query.all()
    return contacts

# Support Resources endpoints
@router.get("/resources", response_model=List[SupportResource])
async def get_support_resources(
    category: Optional[str] = Query(None, description="Filter by category"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get support resources"""
    # Import here to avoid circular imports
    from app.models import SupportResource as SupportResourceModel
    
    query = db.query(SupportResourceModel)
    
    if category:
        query = query.filter(SupportResourceModel.category.ilike(f"%{category}%"))
    
    if resource_type:
        query = query.filter(SupportResourceModel.resource_type == resource_type)
    
    if is_active is not None:
        query = query.filter(SupportResourceModel.is_active == is_active)
    
    resources = query.all()
    return resources