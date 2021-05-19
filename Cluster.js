let contador = 0

class Cluster {
    constructor(pai, elemento) {

        this.numero = contador + 1
        this.elementos = (elemento) ? [elemento] : []
        this.filhos = []
        this.pai = pai || null
        this.probabilidades = {}

        contador++

        if (this.pai == null) this.fixarProbabilidades()
    }


    pushE(elemento) {
        this.elementos.push(elemento)
    }

    pushC(...clusters) {
        this.filhos.push(...clusters)
    }

    // frequência atributos valores
    fixarProbabilidades() {
        this.probabilidades = {}
        this.elementos.forEach((elemento) => {
            for (let caracteristica in elemento.caracteristicas) {
                let key = caracteristica + elemento.caracteristicas[caracteristica]

                if (!this.probabilidades[key]) this.probabilidades[key] = 0

                this.probabilidades[key]++
            }

        })

        for (let key in this.probabilidades)
            this.probabilidades[key] = this.probabilidades[key] / this.elementos.length
    }

    static simularFixProbabilidades(elementos) {
        let probabilidades = {}
        elementos.forEach((elemento) => {
            for (let caracteristica in elemento.caracteristicas) {
                let value = elemento.caracteristicas[caracteristica]
                let key = `${caracteristica}${value}`

                if (!probabilidades[key]) probabilidades[key] = 0

                probabilidades[key]++
            }

        })

        for (let key in probabilidades) probabilidades[key] = probabilidades[key] / elementos.length

        return { probabilidades, totalElementos: elementos.length };
    }
}

module.exports = Cluster