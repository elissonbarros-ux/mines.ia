from flask import Flask, render_template, request, jsonify
import numpy as np
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)

SIZE = 5
MEMORIA = 3

historico = []
X, y = [], []

model = RandomForestClassifier(n_estimators=120)

def features(i, j):
    f = [i, j]
    ultimas = historico[-MEMORIA:]
    
    for r in ultimas:
        f.append(1 if [i, j] in r else 0)
    
    while len(f) < 2 + MEMORIA:
        f.append(0)
    
    freq = sum(1 for r in ultimas if [i, j] in r)
    f.append(freq)
    
    return f

def treinar():
    if len(X) > 30:
        model.fit(X, y)

def prever():
    probs = np.zeros((SIZE, SIZE))
    
    for i in range(SIZE):
        for j in range(SIZE):
            if len(X) > 30:
                p = model.predict_proba([features(i, j)])[0][1]
            else:
                p = 0
            probs[i][j] = p
    
    return probs.tolist()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/play", methods=["POST"])
def play():
    data = request.json
    minas = data["minas"]
    
    historico.append(minas)
    peso = len(historico)
    
    for i in range(SIZE):
        for j in range(SIZE):
            f = features(i, j)
            for _ in range(peso):
                X.append(f)
                y.append(1 if [i, j] in minas else 0)
    
    treinar()
    
    return jsonify(prever())