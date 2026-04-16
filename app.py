from flask import Flask, render_template, request, jsonify
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import os
import json

app = Flask(__name__)

SIZE = 5
MEMORIA = 5

historico = []
X, y = [], []
model = RandomForestClassifier(n_estimators=150)

# 🔥 mapa de calor (probabilidade histórica)
mapa_calor = [[0]*SIZE for _ in range(SIZE)]
total_jogos = 0

# -------------------------
# 💾 SALVAR / CARREGAR
# -------------------------
def salvar():
    with open("dados.json", "w") as f:
        json.dump({
            "historico": historico,
            "mapa_calor": mapa_calor,
            "total_jogos": total_jogos
        }, f)

def carregar():
    global historico, mapa_calor, total_jogos
    try:
        with open("dados.json") as f:
            data = json.load(f)
            historico = data["historico"]
            mapa_calor = data["mapa_calor"]
            total_jogos = data["total_jogos"]
    except:
        historico = []
        mapa_calor = [[0]*SIZE for _ in range(SIZE)]
        total_jogos = 0

carregar()

# -------------------------
# 🧠 FEATURES
# -------------------------
def features(i, j, qtd_minas):
    f = [i, j, qtd_minas]

    ultimas = historico[-MEMORIA:]

    for r in ultimas:
        f.append(1 if [i, j] in r["minas"] else 0)

    while len(f) < 3 + MEMORIA:
        f.append(0)

    freq = sum(1 for r in ultimas if [i, j] in r["minas"])
    f.append(freq)

    return f

# -------------------------
# 🧠 TREINAMENTO
# -------------------------
def treinar():
    if len(X) > 50:
        model.fit(X, y)

# -------------------------
# 🔮 PREVISÃO
# -------------------------
def prever(qtd_minas):
    probs = np.zeros((SIZE, SIZE))

    for i in range(SIZE):
        for j in range(SIZE):

            # IA
            if len(X) > 50:
                p_modelo = model.predict_proba([features(i, j, qtd_minas)])[0][1]
            else:
                p_modelo = 0

            # mapa de calor
            if total_jogos > 0:
                p_calor = mapa_calor[i][j] / total_jogos
            else:
                p_calor = 0

            # mistura (peso maior na IA)
            p_final = (p_modelo * 0.7) + (p_calor * 0.3)

            probs[i][j] = p_final

    return probs.tolist()

# -------------------------
# 🌐 ROTAS
# -------------------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/play", methods=["POST"])
def play():
    global total_jogos

    data = request.json
    minas = data["minas"]
    qtd_minas = data["qtd_minas"]

    # salva histórico completo
    historico.append({
        "minas": minas,
        "quantidade": qtd_minas
    })

    total_jogos += 1

    # atualiza mapa de calor
    for i, j in minas:
        mapa_calor[i][j] += 1

    # treino com peso maior para recentes
    peso = 1 + (len(historico) / 10)

    for i in range(SIZE):
        for j in range(SIZE):
            f = features(i, j, qtd_minas)
            for _ in range(int(peso)):
                X.append(f)
                y.append(1 if [i, j] in minas else 0)

    treinar()
    salvar()

    return jsonify({
        "probs": prever(qtd_minas),
        "minas": minas  # 🔥 retorna pra mostrar no front
    })

# -------------------------
# 🚀 START
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)