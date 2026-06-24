from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List


class SchemeEligibility(BaseModel):
    entity_age_years: Optional[int] = None
    max_turnover_cr: Optional[float] = None
    entity_types: Optional[List[str]] = None
    sectors: Optional[List[str]] = None
    stages: Optional[List[str]] = None
    requires_dpiit: Optional[bool] = None
    gender_specific: Optional[str] = None
    caste_specific: Optional[str] = None
    geography: Optional[List[str]] = None


class Scheme(BaseModel):
    id: str
    name: str
    ministry: str
    implementing_agency: Optional[str] = None
    type: str
    category: List[str]
    sectors: List[str]
    stages: List[str]
    description: str
    benefits: List[str]
    funding_amount: Optional[str] = None
    funding_type: Optional[str] = None
    eligibility: SchemeEligibility
    application_url: Optional[str] = None
    deadline: Optional[str] = None
    tags: List[str]
    relevance_score: Optional[float] = None


class SchemeFilterParams(BaseModel):
    sector: Optional[str] = None
    stage: Optional[str] = None
    ministry: Optional[str] = None
    funding_type: Optional[str] = None
    requires_dpiit: Optional[bool] = None
    gender_specific: Optional[str] = None
    search: Optional[str] = None
    limit: int = 20
    offset: int = 0


class SchemeMatchRequest(BaseModel):
    startup_name: Optional[str] = None
    sector: str
    stage: str
    entity_type: Optional[str] = None
    city: Optional[str] = None
    team_size: Optional[int] = None
    revenue_cr: Optional[float] = None
    dpiit_registered: Optional[bool] = None
    founder_gender: Optional[str] = None
    founder_caste: Optional[str] = None
    description: Optional[str] = None
