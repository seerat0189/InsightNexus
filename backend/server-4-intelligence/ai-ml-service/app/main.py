from fastapi import FastAPI
from app.schemas import InputData
from app.model import predict_risk

app = FastAPI()

@app.post("/predict")
def predict(data: InputData):
    result = predict_risk(data.dict())

    return {
        "success": True,
        "prediction": result
    }
