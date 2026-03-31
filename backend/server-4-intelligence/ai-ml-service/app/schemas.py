from pydantic import BaseModel

class InputData(BaseModel):
    inventory: int
    supplierScore: int
    pendingOrders: int
    burnRate: float
