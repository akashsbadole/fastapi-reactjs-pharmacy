from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SupportTicketBase(BaseModel):
    subject: str
    description: str
    category: str
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Open"

class SupportTicketCreate(SupportTicketBase):
    user_id: int

class SupportTicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class SupportTicket(SupportTicketBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SupportTicketResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    description: str
    category: str
    priority: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    username: str
    full_name: str
    
    class Config:
        from_attributes = True

class SupportTicketFilter(BaseModel):
    user_id: Optional[int] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    skip: int = 0
    limit: int = 100

class KnowledgeBaseArticleBase(BaseModel):
    title: str
    content: str
    category: str
    tags: Optional[List[str]] = []
    is_published: Optional[bool] = True

class KnowledgeBaseArticleCreate(KnowledgeBaseArticleBase):
    created_by: int

class KnowledgeBaseArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None

class KnowledgeBaseArticle(KnowledgeBaseArticleBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class KnowledgeBaseArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    tags: List[str]
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    author_name: str
    
    class Config:
        from_attributes = True

class SupportContact(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    phone: Optional[str] = None
    department: str
    is_active: bool = True
    
    class Config:
        from_attributes = True

class SupportResource(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    resource_type: str  # VIDEO, DOCUMENT, LINK
    url: Optional[str] = None
    file_path: Optional[str] = None
    category: str
    is_active: bool = True
    
    class Config:
        from_attributes = True