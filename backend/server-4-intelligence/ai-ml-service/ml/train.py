import pandas as pd
from sklearn.linear_model import LogisticRegression
import pickle

data = {
    "inventory": [20, 50, 200, 150, 30, 80, 300],
    "supplierScore": [40, 60, 90, 85, 50, 70, 95],
    "pendingOrders": [5, 3, 1, 1, 6, 2, 0],
    "burnRate": [8000, 6000, 2000, 3000, 9000, 5000, 1000],
    "risk": [2, 2, 0, 0, 2, 1, 0]
}

df = pd.DataFrame(data)

X = df[["inventory", "supplierScore", "pendingOrders", "burnRate"]]
y = df["risk"]

model = LogisticRegression()
model.fit(X, y)

with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained ")