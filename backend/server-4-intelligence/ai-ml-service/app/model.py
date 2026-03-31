import pickle

with open("ml/model.pkl", "rb") as f:
    model = pickle.load(f)


def predict_risk(data):
    prediction = model.predict([[
        data["inventory"],
        data["supplierScore"],
        data["pendingOrders"],
        data["burnRate"]
    ]])[0]

    mapping = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}
    return mapping[prediction]
