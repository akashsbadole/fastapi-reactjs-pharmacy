from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from sqlalchemy.orm import Session
from .database import get_db
from .multi_tenant_models import Tenant, TenantStatus
import re


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware to identify tenant from request and add it to the request state.
    Tenant can be identified by:
    1. Subdomain (e.g., tenant1.pharmacy.com)
    2. Custom domain (e.g., pharmacy.tenant1.com)
    3. Header (X-Tenant-ID)
    4. URL path (e.g., /api/tenant1/...)
    """

    async def dispatch(self, request: Request, call_next):
        # Get tenant from various methods
        tenant = await self.get_tenant_from_request(request)
        
        if not tenant:
            raise HTTPException(
                status_code=404,
                detail="Tenant not found or inactive"
            )
        
        # Add tenant to request state
        request.state.tenant = request.state.tenant_id = tenant.id
        request.state.tenant_slug = tenant.slug
        request.state.tenant_obj = tenant
        
        # Process the request
        response = await call_next(request)
        
        return response

    async def get_tenant_from_request(self, request: Request) -> Tenant:
        """
        Try to identify tenant from various sources in order of preference:
        1. Subdomain
        2. Custom domain
        3. Header
        4. URL path
        """
        db = next(get_db())
        
        try:
            # Try to get tenant from subdomain
            host = request.headers.get("host", "")
            
            # Extract subdomain if present
            subdomain = self.extract_subdomain(host)
            if subdomain:
                tenant = db.query(Tenant).filter(
                    Tenant.slug == subdomain,
                    Tenant.status == TenantStatus.ACTIVE
                ).first()
                if tenant:
                    return tenant
            
            # Try to get tenant from custom domain
            if host and "." in host:
                tenant = db.query(Tenant).filter(
                    Tenant.domain == host,
                    Tenant.status == TenantStatus.ACTIVE
                ).first()
                if tenant:
                    return tenant
            
            # Try to get tenant from header
            tenant_id = request.headers.get("X-Tenant-ID")
            if tenant_id:
                try:
                    tenant = db.query(Tenant).filter(
                        Tenant.id == int(tenant_id),
                        Tenant.status == TenantStatus.ACTIVE
                    ).first()
                    if tenant:
                        return tenant
                except ValueError:
                    pass  # Invalid tenant ID, continue to next method
            
            # Try to get tenant from URL path
            path_parts = request.url.path.strip("/").split("/")
            if len(path_parts) >= 2 and path_parts[0] == "api":
                potential_tenant_slug = path_parts[1]
                tenant = db.query(Tenant).filter(
                    Tenant.slug == potential_tenant_slug,
                    Tenant.status == TenantStatus.ACTIVE
                ).first()
                if tenant:
                    return tenant
            
            # If no tenant found, return None
            return None
            
        finally:
            db.close()

    def extract_subdomain(self, host: str) -> str:
        """
        Extract subdomain from host.
        Examples:
        - tenant1.pharmacy.com -> tenant1
        - tenant1.localhost -> tenant1
        - pharmacy.com -> None
        """
        # Remove port if present
        if ":" in host:
            host = host.split(":")[0]
        
        # Split by dots
        parts = host.split(".")
        
        # If we have at least 3 parts, the first one is the subdomain
        # e.g., tenant1.pharmacy.com -> ["tenant1", "pharmacy", "com"]
        if len(parts) >= 3:
            return parts[0]
        
        # For localhost with subdomain
        # e.g., tenant1.localhost -> ["tenant1", "localhost"]
        if len(parts) == 2 and parts[1] == "localhost":
            return parts[0]
        
        return None


def get_current_tenant(request: Request) -> Tenant:
    """
    Get the current tenant from the request state.
    This function should be used in endpoints to access the current tenant.
    """
    if not hasattr(request.state, "tenant_obj"):
        raise HTTPException(
            status_code=500,
            detail="Tenant not found in request state"
        )
    
    return request.state.tenant_obj


def get_current_tenant_id(request: Request) -> int:
    """
    Get the current tenant ID from the request state.
    This function should be used in endpoints to access the current tenant ID.
    """
    if not hasattr(request.state, "tenant_id"):
        raise HTTPException(
            status_code=500,
            detail="Tenant ID not found in request state"
        )
    
    return request.state.tenant_id


def get_current_tenant_slug(request: Request) -> str:
    """
    Get the current tenant slug from the request state.
    This function should be used in endpoints to access the current tenant slug.
    """
    if not hasattr(request.state, "tenant_slug"):
        raise HTTPException(
            status_code=500,
            detail="Tenant slug not found in request state"
        )
    
    return request.state.tenant_slug