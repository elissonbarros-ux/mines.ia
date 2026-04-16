let selecionadas = []
let probs = []
let historico_acerto = []

const grid = document.getElementById("grid")

// 🔲 criar grid
for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
        const div = document.createElement("div")
        div.className = "cell"
        div.dataset.i = i
        div.dataset.j = j

        div.onclick = () => {
            div.style.background = "red"
            selecionadas.push([i, j])
        }

        grid.appendChild(div)
    }
}

// 🚀 enviar jogada
function enviar() {
    const qtd_minas = document.getElementById("num_minas").value

    fetch("/play", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ 
            minas: selecionadas,
            qtd_minas: parseInt(qtd_minas)
        })
    })
    .then(res => res.json())
    .then(data => {
        probs = data.probs

        atualizar()
        mostrarMinas(data.minas)
        calcularAcerto(data.minas)
        sugerirTop5()
    })
}

// 🎨 atualizar cores
function atualizar() {
    const cells = document.querySelectorAll(".cell")

    cells.forEach(cell => {
        const i = cell.dataset.i
        const j = cell.dataset.j
        const p = probs[i][j]

        const red = Math.floor(255 * p)
        const green = Math.floor(255 * (1 - p))

        cell.style.background = `rgb(${red}, ${green}, 0)`
        cell.innerText = (p * 100).toFixed(0) + "%"
        cell.classList.remove("safe")
    })

    selecionadas = []
}

// 💣 mostrar minas
function mostrarMinas(minas) {
    minas.forEach(([i, j]) => {
        const cell = document.querySelector(`[data-i='${i}'][data-j='${j}']`)
        cell.style.background = "black"
        cell.innerText = "💣"
    })
}

// 📊 calcular acerto
function calcularAcerto(minas) {
    let acertos = 0

    selecionadas.forEach(pos => {
        if (!minas.some(m => m[0] == pos[0] && m[1] == pos[1])) {
            acertos++
        }
    })

    let taxa = selecionadas.length > 0 ? acertos / selecionadas.length : 0

    historico_acerto.push(taxa)
    atualizarGrafico()
}

// 📊 gráfico
let chart = new Chart(document.getElementById("grafico"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Taxa de Acerto",
            data: [],
            borderColor: "gold",
            fill: false
        }]
    }
})

function atualizarGrafico() {
    chart.data.labels.push("Rodada " + historico_acerto.length)
    chart.data.datasets[0].data = historico_acerto
    chart.update()
}

// 🤖 sugestão TOP 5 inteligente
function sugerirTop5() {
    const cells = document.querySelectorAll(".cell")

    let lista = []

    cells.forEach(cell => {
        const i = cell.dataset.i
        const j = cell.dataset.j

        lista.push({
            cell,
            prob: probs[i][j]
        })
    })

    // menor probabilidade = mais seguro
    lista.sort((a, b) => a.prob - b.prob)

    cells.forEach(c => c.classList.remove("safe"))

    for (let k = 0; k < 5; k++) {
        lista[k].cell.classList.add("safe")
    }
}

// 🔄 reset
function resetar() {
    location.reload()
}