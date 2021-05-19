const Cluster = require('./Cluster')
const _ = require('lodash')

let PROBABILIDADE_GLOBAL = 0
let FREQUENCIA_GLOBAL = []

const calcularProbabilidadeGlobal = function (cluster) {
    if (PROBABILIDADE_GLOBAL != 0) return;

    let { probabilidades } = Cluster.simularFixProbabilidades(cluster.elementos)
    PROBABILIDADE_GLOBAL = probabilidades
}

// Simulaçao de inserção em cada filho
const calcularProbabilidadesEFrequenciaGlobalComUC = function (clusterPai, clusters, cluster, elemento) {
    let _probabilidades = [],
        elementosTotal = clusterPai.elementos.length

    FREQUENCIA_GLOBAL = []

    let { probabilidades, totalElementos } = Cluster.simularFixProbabilidades([...cluster.elementos, elemento])
    _probabilidades.push(probabilidades)
    FREQUENCIA_GLOBAL.push(totalElementos / elementosTotal)

    clusters.forEach(c => {
        c.fixarProbabilidades()
        _probabilidades.push(c.probabilidades)

        FREQUENCIA_GLOBAL.push(c.elementos.length / elementosTotal)
    })

    let somaDoQuadrado = caucularSomaDoQuadrado(_probabilidades)
    let somaDoQuadradoUCGloabal = caucularSomaDoQuadrado([PROBABILIDADE_GLOBAL])[0]

    const uc = calcularUC(somaDoQuadrado, somaDoQuadradoUCGloabal, clusterPai.filhos.length)
    
    return uc;
}

const calcularUC = function (somaDoQuadrado, somaDoQuadradoUCGloabal, totalClusters) {
    let uc = 0
    somaDoQuadrado.forEach((somatorio, i) => {
        let dif = somatorio - somaDoQuadradoUCGloabal
        uc += dif * FREQUENCIA_GLOBAL[i]
    })

    return uc / totalClusters;
}

const caucularSomaDoQuadrado = function (probabilidades) {
    let somas = []

    probabilidades.forEach(probabilidade => {
        let soma = 0
        for (let i in probabilidade)
            soma += (probabilidade[i].toFixed(4) * probabilidade[i].toFixed(4))

        somas.push(soma)
    })

    return somas;
}

const simularInsertComClasterVazio = function (cluster, elemento) {
    let clusterCopia = _.cloneDeep(cluster)
    let clusterFilho = new Cluster
    clusterCopia.pushC(clusterFilho)

    clustersSimulados = clusterCopia.filhos.filter(e => e.numero != clusterFilho.numero)
    let uc = calcularProbabilidadesEFrequenciaGlobalComUC(clusterCopia, clustersSimulados, clusterFilho, elemento)

    return uc;
}

const simularInsertComMerge = function (cluster, clusterUCMaior, clusterUCSegundoMaior, elemento) {
    let clusterCopia = _.cloneDeep(cluster)
    clusterCopia.filhos = clusterCopia.filhos.filter(e => e.numero != clusterUCSegundoMaior.numero && e.numero != clusterUCMaior.numero)

    clusterFilho = new Cluster(clusterCopia)
    clusterFilho.elementos = [...clusterUCSegundoMaior.elementos, ...clusterUCMaior.elementos]
    clusterFilho.filhos = [...clusterUCSegundoMaior.filhos, ...clusterUCMaior.filhos]

    clusterCopia.pushC(clusterFilho)

    clustersSimulados = clusterCopia.filhos.filter(e => e.numero != clusterFilho.numero)
    let uc = calcularProbabilidadesEFrequenciaGlobalComUC(clusterCopia, clustersSimulados, clusterFilho, elemento)

    return uc
}

const COBWEB = function (cluster, elemento) {
    if (cluster.filhos.length == 0) {
        let c1 = new Cluster(cluster, ...cluster.elementos)
        let c2 = new Cluster(cluster, elemento)

        c1.probabilidades = cluster.probabilidades
        c2.fixarProbabilidades()

        cluster.pushC(c1, c2)

        cluster.elementos = [...c1.elementos, ...c2.elementos]
        cluster.fixarProbabilidades()

        return;
    }

    cluster.pushE(elemento)
    cluster.fixarProbabilidades()

    let clusterAInserir = {} // s1
    let clusterUCMaior = {} // s1
    let clusterUCSegundoMaior = {} // s4

    let UCMaior = 0 // s1
    let UCMaiorDeClasterVazio = 0 // s3
    let UCSegundoMaior = 0 // s4
    let UCMergeClaster = 0 // s4

    cluster.filhos.forEach(clusterFilho => {
        calcularProbabilidadeGlobal(cluster)

        clustersSimulados = cluster.filhos.filter(e => e.numero != clusterFilho.numero)

        // Simula inserindo em cada cluster
        let uc = calcularProbabilidadesEFrequenciaGlobalComUC(cluster, clustersSimulados, clusterFilho, elemento)

        if (uc > UCMaior) {
            clusterUCSegundoMaior = clusterUCMaior
            UCSegundoMaior = UCMaior

            UCMaior = uc
            clusterAInserir = clusterFilho
            clusterUCMaior = clusterFilho

        } else {
            if (uc > UCSegundoMaior) {
                clusterUCSegundoMaior = clusterFilho
                UCSegundoMaior = uc
            }
        }
    })
 
    UCMaiorDeClasterVazio = simularInsertComClasterVazio(cluster, elemento)
    UCMergeClaster = simularInsertComMerge(cluster, clusterUCMaior, clusterUCSegundoMaior, elemento)

    if (UCMaior > UCMaiorDeClasterVazio) {
        COBWEB(clusterAInserir, elemento)
        return;
    }

    if (UCMaiorDeClasterVazio > UCMergeClaster) {
        let c3 = new Cluster(cluster, elemento)
        c3.fixarProbabilidades()
        cluster.pushC(c3)
        return;
    }

    cluster.filhos = cluster.filhos.filter(e => e.numero != clusterUCSegundoMaior.numero && e.numero != clusterUCMaior.numero)
    let clusterFilho = new Cluster(cluster)
    clusterFilho.elementos = [...clusterUCSegundoMaior.elementos, ...clusterUCMaior.elementos]
    clusterFilho.filhos = [...clusterUCSegundoMaior.filhos, ...clusterUCMaior.filhos]
    cluster.pushC(clusterFilho)

    COBWEB(clusterFilho, elemento)
}

module.exports = COBWEB
