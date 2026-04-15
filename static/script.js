let selecionadas = []
let probs = []

window.onload = function() {
    const grid = document.getElementById("grid")

    if (!grid) {
        console.log("GRID NÃO ENCONTRADO")
        return
    }

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const div = document.createElement("div")
            div.className = "cell"
            div.dataset.i = i
            div.dataset.j = j

            div.onclick = function() {
                div.style.background = "red"
                selecionadas.push([i, j])
            }

            grid.appendChild(div)
        }
    }

    console.log("GRID CRIADO COM SUCESSO")
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
        probs = data.probs || []
        mostrarSugestoes(data.sugestoes || [])
        atualizar()
    })
    .catch(err => console.log("ERRO:", err))
}

function atualizar() {
    const cells = document.querySelectorAll(".cell")

    cells.forEach(cell => {
        const i = cell.dataset.i
        const j = cell.dataset.j

        const p = probs[i]?.[j] || 0

        const red = Math.floor(255 * p)
        const green = Math.floor(255 * (1 - p))

        cell.style.background = `rgb(${red}, ${green}, 0)`
        cell.innerText = (p * 100).toFixed(0) + "%"

        if (p > 0.7) {
            cell.style.border = "3px solid red"
        } else if (p < 0.3) {
            cell.style.border = "3px solid lime"
        } else {
            cell.style.border = "1px solid #333"
        }
    })

    selecionadas = []
}

function mostrarSugestoes(sugestoes) {
    document.querySelectorAll(".cell").forEach(c => {
        c.style.boxShadow = "none"
    })

    sugestoes.forEach(s => {
        const [i, j] = s.pos
        const cell = document.querySelector(`.cell[data-i='${i}'][data-j='${j}']`)

        if (cell) {
            cell.style.boxShadow = "0 0 15px lime"
        }
    })
}

function resetar() {
    location.reload()
}