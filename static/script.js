let selecionadas = []
let probs = []let selecionadas = []
let probs = []

const grid = document.getElementById("grid")

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

function enviar() {
    const num_minas = document.getElementById("num_minas").value
    const num_escolhas = document.getElementById("num_escolhas").value

    fetch("/play", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            minas: selecionadas,
            num_minas: parseInt(num_minas),
            num_escolhas: parseInt(num_escolhas)
        })
    })
    .then(res => res.json())
    .then(data => {
        probs = data.probs
        mostrarSugestoes(data.sugestoes)
        atualizar()
    })
}

function atualizar() {
    const cells = document.querySelectorAll(".cell")

    cells.forEach(cell => {
        const i = cell.dataset.i
        const j = cell.dataset.j

        const p = probs[i][j]

        // cor baseada no risco
        const red = Math.floor(255 * p)
        const green = Math.floor(255 * (1 - p))

        cell.style.background = `rgb(${red}, ${green}, 0)`

        // mostrar %
        cell.innerText = (p * 100).toFixed(0) + "%"

        // destaque visual forte
        if (p > 0.7) {
            cell.style.border = "3px solid red"   // MUITO PERIGOSO
        } else if (p < 0.3) {
            cell.style.border = "3px solid lime"  // MUITO SEGURO
        } else {
            cell.style.border = "1px solid #333"
        }
    })

    selecionadas = []
}


function mostrarSugestoes(sugestoes) {
    document.querySelectorAll(".cell").forEach(c => {
        c.classList.remove("safe")
        c.style.boxShadow = "none"
    })

    sugestoes.forEach(s => {
        const [i, j] = s.pos
        const cell = document.querySelector(`.cell[data-i='${i}'][data-j='${j}']`)

        if (cell) {
            cell.classList.add("safe")
            cell.style.boxShadow = "0 0 15px lime" // brilho estilo cassino
        }
    })
}

function resetar() {
    location.reload()
}

const grid = document.getElementById("grid")

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

function enviar() {
    const num_minas = document.getElementById("num_minas").value
    const num_escolhas = document.getElementById("num_escolhas").value

    fetch("/play", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            minas: selecionadas,
            num_minas: parseInt(num_minas),
            num_escolhas: parseInt(num_escolhas)
        })
    })
    .then(res => res.json())
    .then(data => {
        probs = data.probs
        mostrarSugestoes(data.sugestoes)
        atualizar()
    })
}
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

function sugerir() {
    const cells = document.querySelectorAll(".cell")

    let lista = []

    cells.forEach(cell => {
        const i = cell.dataset.i
        const j = cell.dataset.j
        lista.push({cell, prob: probs[i][j]})
    })

    lista.sort((a, b) => a.prob - b.prob)

    cells.forEach(c => c.classList.remove("safe"))

    for (let k = 0; k < 5; k++) {
        lista[k].cell.classList.add("safe")
    }
}

function resetar() {
    location.reload()
}

function mostrarSugestoes(sugestoes) {
    document.querySelectorAll(".cell").forEach(c => c.classList.remove("safe"))

    sugestoes.forEach(s => {
        const [i, j] = s.pos
        const cell = document.querySelector(`.cell[data-i='${i}'][data-j='${j}']`)
        if (cell) {
            cell.classList.add("safe")
        }
    })
}