const Elemento = require('./Elemento')
const Cluster = require('./Cluster')
const COBWEB = require('./COBWEB')

let c = new Cluster(null, new Elemento({cor: "branco", caldas: 1, nucleo: 1}))

COBWEB(c, new Elemento({cor: "branco", caldas: 2, nucleo: 2}))
COBWEB(c, new Elemento({cor: "preto", caldas: 2, nucleo: 2}))

console.log(c.filhos);
