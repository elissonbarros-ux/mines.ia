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

def prever(num_minas, num_escolhas):
    probs = np.zeros((SIZE, SIZE))

    for i in range(SIZE):
        for j in range(SIZE):
            base = 0

            # frequência histórica
            freq_total = sum(1 for r in historico if [i, j] in r)

            # peso maior para recentes
            peso = 1
            peso_total = 0
            for r in reversed(historico[-10:]):
                if [i, j] in r:
                    base += peso
                peso_total += peso
                peso += 1

            if peso_total > 0:
                base = base / peso_total

            # modelo ML (se treinado)
            if len(X) > 30:
                ml = model.predict_proba([features(i, j)])[0][1]
            else:
                ml = 0

            # mistura inteligência
            p = (base * 0.6) + (ml * 0.4)

            probs[i][j] = p

    # transformar em lista
    lista = []
    for i in range(SIZE):
        for j in range(SIZE):
            lista.append({
                "pos": [i, j],
                "prob": probs[i][j]
            })

    # ordenar menor risco primeiro
    lista.sort(key=lambda x: x["prob"])

    # sugerir casas seguras
    sugestoes = lista[:num_escolhas]

    return {
        "probs": probs.tolist(),
        "sugestoes": sugestoes
    }
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/play", methods=["POST"])
def play():
    data = request.json

    minas = data["minas"]
    num_minas = data.get("num_minas", 5)
    num_escolhas = data.get("num_escolhas", 5)

    historico.append(minas)

    peso = len(historico)

    for i in range(SIZE):
        for j in range(SIZE):
            f = features(i, j)
            for _ in range(peso):
                X.append(f)
                y.append(1 if [i, j] in minas else 0)

    treinar()

    return jsonify(prever(num_minas, num_escolhas))    
    return jsonify(prever())