from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.favorite import Favorite
from app.models.provider_profile import ProviderProfile
from app.models.service import Service, ServiceStatus
from app.models.service_area import ServiceArea
from app.models.service_category import ServiceCategory
from app.models.user import User, UserRole
from app.schemas.service import AreaCreate, AreaResponse, CategoryResponse, ServiceCreate, ServiceResponse, ServiceUpdate

router = APIRouter(prefix="/api/services", tags=["Services"])

def serialize(service: Service) -> ServiceResponse:
    profile = service.provider.provider_profile
    return ServiceResponse(
        id=service.id, provider_id=service.provider_id, provider_name=service.provider.full_name,
        category_id=service.category_id, title=service.title, description=service.description,
        price=service.price, city=service.city, duration=service.duration, status=service.status,
        rating=float(profile.avg_rating) if profile else 0, review_count=profile.total_reviews if profile else 0,
        image_urls=[image.image_url for image in service.images], created_at=service.created_at,
    )

def service_query():
    return select(Service).options(joinedload(Service.provider).joinedload(User.provider_profile), joinedload(Service.images))

def owned_service(db: Session, service_id: int, provider_id: int) -> Service:
    item = db.scalar(service_query().where(Service.id == service_id, Service.provider_id == provider_id))
    if not item: raise HTTPException(status_code=404, detail="Service not found")
    return item

@router.get("/categories", response_model=list[CategoryResponse])
def categories(db: Session = Depends(get_db)):
    return db.scalars(select(ServiceCategory).order_by(ServiceCategory.id)).all()

@router.get("", response_model=list[ServiceResponse])
def search_services(q: str | None = None, category_id: int | None = None, city: str | None = None, min_price: Decimal | None = Query(None, ge=0), max_price: Decimal | None = Query(None, ge=0), db: Session = Depends(get_db)):
    statement = service_query().where(Service.status == ServiceStatus.ACTIVE)
    if q: statement = statement.where(or_(Service.title.ilike(f"%{q}%"), Service.description.ilike(f"%{q}%")))
    if category_id: statement = statement.where(Service.category_id == category_id)
    if city: statement = statement.where(Service.city.ilike(city))
    if min_price is not None: statement = statement.where(Service.price >= min_price)
    if max_price is not None: statement = statement.where(Service.price <= max_price)
    return [serialize(item) for item in db.scalars(statement.order_by(Service.created_at.desc())).unique().all()]

@router.get("/mine", response_model=list[ServiceResponse])
def my_services(user: User = Depends(require_roles(UserRole.PROVIDER)), db: Session = Depends(get_db)):
    return [serialize(item) for item in db.scalars(service_query().where(Service.provider_id == user.id).order_by(Service.created_at.desc())).unique().all()]

@router.post("", response_model=ServiceResponse, status_code=201)
def create_service(payload: ServiceCreate, user: User = Depends(require_roles(UserRole.PROVIDER)), db: Session = Depends(get_db)):
    if not db.get(ServiceCategory, payload.category_id): raise HTTPException(status_code=404, detail="Category not found")
    item = Service(provider_id=user.id, **payload.model_dump()); db.add(item); db.commit()
    return serialize(owned_service(db, item.id, user.id))

@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(service_id: int, payload: ServiceUpdate, user: User = Depends(require_roles(UserRole.PROVIDER)), db: Session = Depends(get_db)):
    item = owned_service(db, service_id, user.id)
    values = payload.model_dump(exclude_unset=True)
    if values.get("category_id") and not db.get(ServiceCategory, values["category_id"]): raise HTTPException(status_code=404, detail="Category not found")
    for key, value in values.items(): setattr(item, key, value)
    db.commit(); return serialize(owned_service(db, item.id, user.id))

@router.delete("/{service_id}", status_code=204)
def delete_service(service_id: int, user: User = Depends(require_roles(UserRole.PROVIDER)), db: Session = Depends(get_db)):
    db.delete(owned_service(db, service_id, user.id)); db.commit(); return Response(status_code=204)

@router.get("/favourites/me", response_model=list[ServiceResponse])
def favourites(user: User = Depends(require_roles(UserRole.CUSTOMER)), db: Session = Depends(get_db)):
    statement = service_query().join(Favorite).where(Favorite.user_id == user.id)
    return [serialize(item) for item in db.scalars(statement).unique().all()]

@router.post("/{service_id}/favourite", status_code=201)
def add_favourite(service_id: int, user: User = Depends(require_roles(UserRole.CUSTOMER)), db: Session = Depends(get_db)):
    if not db.get(Service, service_id): raise HTTPException(status_code=404, detail="Service not found")
    existing = db.scalar(select(Favorite).where(Favorite.user_id == user.id, Favorite.service_id == service_id))
    if not existing: db.add(Favorite(user_id=user.id, service_id=service_id)); db.commit()
    return {"service_id": service_id, "favourite": True}

@router.delete("/{service_id}/favourite", status_code=204)
def remove_favourite(service_id: int, user: User = Depends(require_roles(UserRole.CUSTOMER)), db: Session = Depends(get_db)):
    item = db.scalar(select(Favorite).where(Favorite.user_id == user.id, Favorite.service_id == service_id))
    if item: db.delete(item); db.commit()
    return Response(status_code=204)

@router.get("/areas/mine", response_model=list[AreaResponse])
def my_areas(user: User = Depends(require_roles(UserRole.PROVIDER)), db: Session = Depends(get_db)):
    return db.scalars(select(ServiceArea).where(ServiceArea.provider_id == user.id).order_by(ServiceArea.city)).all()

@router.post("/areas", response_model=AreaResponse, status_code=201)
def add_area(payload: AreaCreate, user: User = Depends(require_roles(UserRole.PROVIDER)), db: Session = Depends(get_db)):
    if payload.service_id: owned_service(db, payload.service_id, user.id)
    item = ServiceArea(provider_id=user.id, **payload.model_dump()); db.add(item); db.commit(); db.refresh(item); return item

@router.delete("/areas/{area_id}", status_code=204)
def delete_area(area_id: int, user: User = Depends(require_roles(UserRole.PROVIDER)), db: Session = Depends(get_db)):
    item = db.scalar(select(ServiceArea).where(ServiceArea.id == area_id, ServiceArea.provider_id == user.id))
    if not item: raise HTTPException(status_code=404, detail="Service area not found")
    db.delete(item); db.commit(); return Response(status_code=204)
