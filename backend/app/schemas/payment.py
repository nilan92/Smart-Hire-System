from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    booking_id: int
    customer_id: int
    amount: float = Field(gt=0)
    payment_method: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    transaction_id: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: int
    status: str
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
