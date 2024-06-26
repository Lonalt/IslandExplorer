class Monster{
    position: GraphNode;
    attack: number;
    life: number;
    lastTurnMove: number;
    icon: string;
    
    constructor(position: GraphNode, timeLimit: number){
        this.position = position;
        this.attack = randomNum(2,20);
        this.life = randomNum(10, 100);
        this.lastTurnMove = timeLimit;
        this.icon = ['\u{1F40D}', '\u{1F406}', '\u{1F40A}', '\u{1F41C}'][randomNum(0,3)];
    }

    randomMove(timeLimit: number){
        let newPosition = randomNum(0,this.position.neighbors.length);
        if ((this.lastTurnMove > timeLimit) && !(newPosition > this.position.neighbors.length-1) && (this.position.neighbors.length != 0) && !(this.position.neighbors[newPosition].safe)){
            this.position.element.textContent = this.position.element.textContent!.replace(this.icon, '');
            this.position.monster = false
            this.position = this.position.neighbors[newPosition];
            this.position.monster = true
            this.lastTurnMove = timeLimit
            this.display()
        }
    }
    display(){
        this.position.element.textContent = this.position.element.textContent + this.icon;
    }
    flight(timeLimit: number){
        let newPosition = randomNum(0,this.position.neighbors.length - 1);
        let i = 2
        do{
            newPosition = randomNum(0,this.position.neighbors.length - 1);
            i -= 1;
        }while((i > 0 && !this.position.safe))
        if (!this.position.safe){
            this.position.element.textContent = this.position.element.textContent!.replace(this.icon, '');
            this.position = this.position.neighbors[newPosition];
            this.lastTurnMove = timeLimit
            this.display()
        }
    }
    damage(dmg: number, island: GraphNode[], timeLimit: number){
        this.life -= dmg;
        if(this.life < 0){
            this.respawn(island, timeLimit)
        }
    }
    respawn(island: GraphNode[],timeLimit: number){
        const newPosition = randomNum(0, island.length - 1);
        this.position.element.textContent = this.position.element.textContent!.replace(this.icon, '');
        this.position = island[newPosition];
        this.life = randomNum(6, 120);
        this.lastTurnMove = timeLimit
        this.display()
    }
    msg(){
        const mMsg: Record<string, string>  = {
            '\u{1F40D}': "Uma cobra venenosa surge, pronta para atacar!",
            '\u{1F406}': "Um leopardo faminto aparece das sombras!",
            '\u{1F40A}': "Um crocodilo monstruoso emerge das águas!",
            '\u{1F41C}': "Uma horda de formigas gigantes se aproxima!"
        };
        alert(mMsg[this.icon])
    }
}
class GraphNode{
    element: HTMLTableCellElement;
    neighbors: GraphNode[];
    coordinates?: [number, number];
    trapDamage: number;
    safe: boolean;
    danger: number;
    f: number;
    g: number;
    h: number;
    monster: boolean;
    constructor(element: HTMLTableCellElement, coordinates: [number,number]){
        this.element = element;
        this.neighbors = [];
        this.coordinates = coordinates;
        this.trapDamage = 0
        this.safe = false
        this.danger = 0
        this.f = 0
        this.g = 0
        this.h = 0
        this.monster = false
    }
    getCoordenates(){
        return `${this.coordinates![0]} ${this.coordinates![1]}`
    }
    sameCoordenates(node: GraphNode){
        return (this.coordinates![0] === node.coordinates![0] && this.coordinates![1] === node.coordinates![1])
    }
    heuristic(goal: GraphNode, life: number): number {
        // Por exemplo, use a distância de Manhattan como heurística
        let t = 0
        if(this.trapDamage > 0){
            t += 15
        }
        if(this.safe){
            t += -2
        }
        if(this.monster){
            t += 20
        }
        let h = Math.abs(this.coordinates![0] - goal.coordinates![0]) + Math.abs(this.coordinates![1] - goal.coordinates![1]);
        return h + t
    }
}
class Weapon{
    position: GraphNode;
    attack: number;
    durability: number;
    icon: string;
    
    constructor(position: GraphNode){
        this.position = position;
        this.attack = randomNum(5, 50);
        this.durability = 3;
        this.icon = ["\u{1F5E1}", '\u{1FA93}', '\u{1FA83}'][randomNum(0,2)];
    }
    attackMonster(){
        if (this.durability > 0){
            this.durability--;
        }
    }

    display(){
        this.position.element.textContent += this.icon
    }

    pickWeapon(playerPocket: GraphNode){
        this.position.element.textContent = this.position.element.textContent!.replace(this.icon, '');
        this.position = playerPocket
    }
    msg(){
        const wMsg: Record<string, string> = {
            '\u{1F5E1}': "Uma espada antiga reluz em uma câmara secreta.",
            '\u{1FA93}': "Um machado de guerra brilha em um túmulo antigo.",
            '\u{1FA83}': "Um Boomerang repousa em um recanto da floresta."
        };
        alert(wMsg[this.icon])
        
    }
}
interface Treasure{
    position?: GraphNode,
    icon: string,
    percent: number,
    dropTreasure(position: GraphNode):any;
    getTreasure(player: any):void;
}
const newTd = document.createElement('td');
const playerPocket = new GraphNode(newTd, [-1, -1])

function BFS(v1: GraphNode, target: GraphNode) {
    const visited: {[key: string]: boolean} = {};
    const queue: GraphNode[] = [];
    queue.push(v1);
    visited[v1.getCoordenates()] = true;
    let isReachable = false
    while (queue.length > 0) {
        const vu = queue.shift()!;

        vu.neighbors.forEach(neighbor => {
            if (!visited[neighbor.getCoordenates()]) {
                if (neighbor.sameCoordenates(target)){
                    isReachable = true
                }
                visited[neighbor.getCoordenates()] = true;
                queue.push(neighbor);
            }
        });
    }
    return isReachable;
}
function aStar(start: GraphNode, goal: GraphNode, life:number) {
    const openSet: GraphNode[] = []
    const closedSet: GraphNode[] = []
    console.log(openSet)
    openSet.map(position =>{
        position.f = 0
        position.g = 0
        position.h = 0
    })
    start.f = 0
    start.g = 0
    start.h = 0
    openSet.push(start);

    while (openSet.length > 0) {
        let currentNode = openSet[0];
        let currentIndex = 0;
        
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < currentNode.f) {
                currentNode = openSet[i];
                currentIndex = i;
            }
        }

        openSet.splice(currentIndex, 1);
        closedSet.push(currentNode);

        if (currentNode === goal) {
            
            const path: GraphNode[] = [];
            let current = currentNode;
            while (current) {
                path.unshift(current);
                current = current.neighbors.find(neighbor => neighbor.g === current.g - 1)!;
            }
            console.log(path)
            return path;
        }

        
        for (const neighbor of currentNode.neighbors) {
            if (closedSet.find(node => node === neighbor)) {
                continue; 
            }

            const gScore = currentNode.g + 1; 

            if (!openSet.find(node => node === neighbor) || gScore < neighbor.g) {
                neighbor.g = gScore;
                neighbor.h = neighbor.heuristic(goal, life);
                neighbor.f = neighbor.g + neighbor.h;

                if (!openSet.find(node => node === neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    return []
}
function randomNum(a: number, b: number){
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
function calcularDistancia(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2)) === 1;
}
function generateIslandGraph(MatrixSize:number, nodeMutipli:number){

    let tableElements: boolean[][] = [];

    for (let i = 0; i < MatrixSize; i++) {
        tableElements[i] = Array(MatrixSize).fill(false);
    }

    let x = 0
    let y = 0
    tableElements[x][y] = true
    
    for(let j = 0; j < MatrixSize*nodeMutipli;j++){
        do{
            x = randomNum(0, MatrixSize - 1);
            y = randomNum(0, MatrixSize - 1);
        }while(tableElements[x][y] === true);
        tableElements[x][y] = true
    }
    return tableElements
}
function generateIsland(MatrixSize:number, nodeMutipli:number, treasure: Treasure, n: number){
    const document = window.document;
    const table = document.getElementById("table")!;
    let nodeList = []
    let tableElements = generateIslandGraph(MatrixSize, nodeMutipli);

    for(let i = 0; i < MatrixSize;i++){
        const newTr = document.createElement('tr');
        for(let j = 0; j < MatrixSize;j++){
            const newTd = document.createElement('td');
            if (tableElements[i][j]){
                
                newTd.classList.add('node');
                nodeList.push(new GraphNode(newTd, [i,j]))

            }else{
                newTd.classList.add('node');
                newTd.classList.add('invisible');
            }
            newTr.appendChild(newTd);
        }
        table.appendChild(newTr);
    }

    for(let i = 0; i < MatrixSize * nodeMutipli;i++){
        const node1 = nodeList[i]
        for(let j = 0; j < MatrixSize * nodeMutipli;j++){
            const node2 = nodeList[j]
            if(calcularDistancia(node1.coordinates![0], node1.coordinates![1], node2.coordinates![0], node2.coordinates![1])){
                node1.neighbors.push(node2);
            }
        }
    } 
    
    treasure.position = nodeList[randomNum(Math.floor(n/1.5), n-1)]
    if(!BFS(nodeList[0], treasure.position)){
        location.reload()
    }
    treasure.position.safe = true
    nodeList[0].safe = true
    return nodeList
}
async function spawnCreatures(island: GraphNode[], n: number, weaponList: Weapon[], timeLimit: number){
    let mwd = 0;
    let monsterList: Monster[] = []
    while(((n)/100) * 28 > mwd){
        let index = randomNum(1,n-1);
        if (mwd % 3 === 0 && !(island[index].safe)){
            let m=new Monster(island[index], timeLimit);
            monsterList.push(m);
            monsterList[monsterList.length-1] = m
            monsterList = monsterList.filter(monster =>{
                if(monster.position !== undefined){
                    return true
                }else{
                    mwd--;
                    return false
                }
            });
        }else if(mwd % 3 === 1 && !(island[index].safe)){
            island[index].trapDamage = randomNum(4, 15);
            island[index].element.classList.add('trap');
        }else if(mwd % 3 === 2){
            weaponList.push(new Weapon(island[index]));
        }else{
            mwd--
        }
        mwd++;
    }

    return monsterList
}
function getEdgesNumber(G: GraphNode[]){
    return G.reduce((acc, node) => acc + node.neighbors.length, 0)
}
function timerAtt(timer: HTMLSpanElement, time: number){
    timer.textContent = `${"\u{23F3}"} ${time}`
}
function fightOrFlight(island: GraphNode[], monsters: Monster[], timeLimit: number){
    let strongest:Monster = monsters[0]
    let weakest:Monster = monsters[0]
    for(let m of monsters){
        if (m.attack > strongest.attack){
            strongest = m
        }
        if(m.attack < weakest.attack){
            weakest = m
        }
    }
    weakest.damage(weakest.life+10, island, timeLimit);
    weakest.lastTurnMove = timeLimit
    strongest.lastTurnMove = timeLimit
    for(let m of monsters){
        if (m.lastTurnMove > timeLimit){
            m.damage(strongest.life, island, timeLimit)
            m.flight(timeLimit)
        }
    }
}
function playerInput(monster: Monster|undefined, weapon: Weapon|undefined, player: any, treasure: Treasure, timeLimit: number){
    let msg: string = ''
    let opCount = 0
    const options: Record<string, Function> = {}
    if(monster != undefined){
        opCount++
        msg += `Opção ${ opCount } - Atacar monstro.\n`
        options[`${ opCount }`] = () => {
            player.inCombat = 2
            player.atackMonster(monster)
            player.lastTurnMove = timeLimit
        }
        opCount++
        msg += `Opção ${ opCount } - Sentindo-se sobrecarregado, você opta por uma retirada estratégica para evitar o perigo imediato.\n`
        options[`${ opCount }`] = () => {
            player.randomMove(monster)
            monster.lastTurnMove = timeLimit
            player.lastTurnMove = timeLimit
        }
    }
    if(weapon != undefined){
        opCount++
        msg += `Opção ${ opCount } - Equipar a arma que você encontrou.\n`
        options[`${ opCount }`] = () => {
            player.lastTurnMove = timeLimit
            if(player.weapon.durability <= 0){
                player.weapon = weapon
                player.pickWeapon(weapon)
            }else{
                player.dropWeapon()
                player.pickWeapon(weapon)
            }
        }
    }
    if(treasure.position?.sameCoordenates(player.position)){
        opCount++
        msg += `Opção ${ opCount } - Pegar tesouro.\n`
        options[`${ opCount }`] = () => {
            treasure.getTreasure(player)
            player.lastTurnMove = timeLimit
        }
    }
    if(player.weapon.durability > 0){
        opCount++
        msg += `Opção ${ opCount } - Soltar arma equipada\n   - Dano da arma: ${player.weapon.attack}\n   - Durabilidade: ${player.weapon.durability}\n\n`
        options[`${ opCount }`] = () => {
            player.dropWeapon()
            player.lastTurnMove = timeLimit
        }
    }
    if(weapon != undefined || player.weapon.durability > 0){
        opCount++
        msg += `Opção ${ opCount } - Continuar sua jornada.\n`
        options[`${ opCount }`] = () => {
            player.lastTurnMove = 0
            return
        }
    }
    const playerInput = prompt(msg);
    if(playerInput === null){
        player.moveTo(player.position)
        return
    }else{
        do{
            try {
                options[`${ playerInput }`]()
            } catch (error) {
                console.error("Ocorreu um erro:", (error as Error).message);
            }finally{
                break;
            }
        }while(true);
        
    }
}
async function playerMove(player: any, island: GraphNode[], monsterList: Monster[], weaponList: Weapon[], treasure:Treasure, timeLimit: number){
    let path: GraphNode[] = []
    trapCheck(player)
    player.serchHerb()
    let monster = monsterCheck(player, monsterList)
    let weapon = weaponCheck(player, weaponList)
    if(monster == undefined){
        player.inCombat = 0
    }
    if(player.inCombat > 0){
        player.atackMonster(monster)
        player.inCombat -= 1
        player.lastTurnMove = timeLimit
        
    }
    else if(monster != undefined || weapon != undefined || (player.weapon.durability > 0)){
        playerInput(monster, weapon, player, treasure, timeLimit);
    }
    if(player.lastTurnMove != timeLimit){
        if(treasure.position?.sameCoordenates(player.position)){
            treasure.position.element.innerText = treasure.position.element.innerText.replace(treasure.icon, '');
            treasure.position = playerPocket
            treasure.getTreasure(player)
        }

        if(player.treasure === 0){
            path = aStar(player.position, treasure.position!, player.life)
        }else{
            path = aStar(player.position, island[0], player.life)
        }
        await player.moveTo(path[1])
        if(player.position.safe && !(island[0].sameCoordenates(player.position))){
            player.savePoint = true
            player.savePointPosition = player.position
        }
    }
}
function wait() {
    return new Promise<void>(resolve => setTimeout(resolve, 700));
}
async function monstersMove(monsterList: Monster[], island: GraphNode[], timeLimit: number, player: any){
    monsterList.map(monster => {
        if(monster.position.sameCoordenates(player.position)){
            if(!player.position.sameCoordenates(player.lastPosition)){
                monster.msg()
            }else{
                const dmg = randomNum(2, monster.attack)
                alert(`O monstro desfere um golpe certeiro causando (-${dmg} HP)`)
                player.damage(dmg)
            }
            monster.lastTurnMove = timeLimit
            
        }
        const monsterFight = monsterList.filter(((m) => monster.position.coordinates === m.position.coordinates))
        if(monsterFight.length > 1) {
            fightOrFlight(island, monsterFight, timeLimit)
        }else{
            monster.randomMove(timeLimit)
        }
    })
}
function trapCheck(player: any){
    if(player.poisonDmg > 0){
        alert(`O veneno continua a queimar em suas veias, causando dano de 2 HP a cada ${player.poisonDmg} turnos.`)
        player.poisonDmg--;
        player.damage(2)
    }
    if (player.position.trapDamage){
        const trapDmgMsg = [
            `Um trecho escorregadio na beira de um abismo te pega desprevenido! Você consegue se equilibrar, mas não sem um tropeção doloroso. (-${player.position.trapDamage} HP)`,
            `Seu pé afunda em um buraco disfarçado de solo firme! Com esforço, você consegue se libertar antes que a areia movediça o engula completamente. (-${player.position.trapDamage} HP por sufocamento e esforço para escapar)`,
            `Enquanto atravessa um pântano, você pisa em um pequeno poço de piche! Seu pé fica preso brevemente antes que você consiga se soltar. (-${player.position.trapDamage} HP por queimaduras leves e esforço para se libertar)`,
        ]
        const poisonDmg = [
            `Um pequeno escorpião emerge das sombras e crava seu ferrão venenoso em sua perna! Você sente uma queimação aguda, mas consegue afastá-lo rapidamente. (-${player.position.trapDamage} HP por veneno)`,
            `Ao colher o fruto chamativo de uma planta desconhecida, você percebe tarde demais sua toxicidade! Você cospe o pedaço ingerido, sentindo apenas uma leve náusea. (${player.position.trapDamage} HP por envenenamento)`
        ]
        if(randomNum(1, 4) === 1){
            player.poisonDmg = 3
            alert(poisonDmg[randomNum(0, poisonDmg.length-1)])
            player.damage(player.position.trapDamage)
        }else{
            alert(trapDmgMsg[randomNum(0, trapDmgMsg.length-1)])
            player.damage(player.position.trapDamage)
        }
        
    }
}
function monsterCheck(player: any, monsterList: Monster[]){
    for(let m of monsterList){
        if(m.position.sameCoordenates(player.position)){
            return m
        }
    }
}
function weaponCheck(player: any, weaponList: Weapon[]){
    for(let w of weaponList){
        if(w.position.sameCoordenates(player.position)){
            w.msg()
            return w
        }
    }
}
async function main(){

    const timer = document.getElementById('timer')!;

    const MatrixSize = 10;
    const nodeMutipli = 7
    const n = MatrixSize * nodeMutipli
    const weaponList: Weapon[] = []
    const herbIcon ='\u{1F33F}'
    const treasure: Treasure = {
        icon: '\u{1FA99}',
        percent: 100,
        dropTreasure(position: GraphNode){
            treasure.position!.element.textContent = treasure.position!.element.textContent + treasure.icon
            treasure.position = position
        },
        getTreasure(player: any){
            player.treasure = player.life
            const treasure = document.getElementById('treasure')!
            if(player.weapon.durability > 0){
                player.treasure -= player.weapon.attack
            }
            treasure.textContent = `${this.icon} ${player.treasure}%`
        },

    };

    const island = generateIsland(MatrixSize, nodeMutipli, treasure, n);
    let checkPoints: GraphNode[] = [island[randomNum(1, n-1)], island[randomNum(1, n-1)]]
    const m = getEdgesNumber(island)
    let timeLimit =  m * 3

    for (let i = 0;i < 10; i++){
        island[randomNum(1, island.length-1)].element.innerText += herbIcon
    }
    
    checkPoints = checkPoints.map((position) =>{
        do{
            position = island[randomNum(1, n-1)]
        }while(position.trapDamage > 0);
        position.element.classList.add('checkPoint')
        position.safe = true
        return position
    });
    const monsterList = await spawnCreatures(island, n, weaponList, timeLimit);
    const player = {
        position: island[0],
        lastPosition: island[0],
        attack: 5,
        life: 100,
        icon: "\u{1F9CD}",
        weapon: weaponList[0],
        savePoint: false,
        savePointPosition: island[0],
        treasure: 0,
        gameOver: false,
        poison: 0,
        actionAvailable: false,
        lastTurnMove: 0,
        inCombat: 0,

        atackMonster(monster: Monster){
            if(this.weapon.durability > 0){
                alert(`Seu ataque atinge o monstro em cheio, causando (-${this.weapon.attack} HP)`)
                monster.damage(this.weapon.attack, island, timeLimit)
                this.weapon.durability -= 1
            }else{
                alert(`Seu ataque atinge o monstro em cheio, causando (-${this.attack} HP)`)
                monster.damage(this.attack, island, timeLimit)
            }
            player.lastPosition = player.position
        },
        pickWeapon(weapon: Weapon){
            this.lastTurnMove = timeLimit
            weapon.pickWeapon(playerPocket)
            this.weapon = weapon
            this.moveTo(player.position)
            if(player.treasure > 0){
                player.treasure -= player.weapon.attack
                const treasure = document.getElementById('treasure')!
                if(player.treasure <= 0){
                    player.treasure = 0
                    player.gameOver = true
                    treasure.textContent = `${0} ${0}%`
                }
                treasure.textContent = `${this.icon} ${player.treasure}%`
            }
        },
        damage(dmg: number){
            this.life -= dmg
            const life = document.getElementById('life')!
            life.textContent = `${"\u{2764}"} ${this.life}%`
            if(player.life <= 0){
                if(this.savePoint){
                    this.respawn()
                }else{
                    player.position.element.innerText = player.position.element.innerText.replace(player.icon,'\u{1F480}')
                    alert('Game Over')
                }
            }
            if(player.treasure > 0){
                player.treasure -= dmg
                const treasure = document.getElementById('treasure')!
                if(player.treasure <= 0){
                    treasure.textContent = `${0} ${0}%`
                    player.gameOver = true
                }
                treasure.textContent = `${this.icon} ${player.treasure}%`
            }
        },
        moveTo(newPosition: GraphNode){
            this.position.element.textContent = this.position.element.textContent!.replace(this.icon, '');
            this.lastPosition = this.position
            this.position = newPosition
            this.lastTurnMove = timeLimit
            this.display()
        },
        randomMove(monster: Monster){
            this.damage(monster.attack)
            this.lastTurnMove = timeLimit
            let newPosition = randomNum(0,this.position.neighbors.length-1);
            this.moveTo(this.position.neighbors[newPosition])
            alert(`O monstro desfere um golpe certeiro causando (-${monster.attack} HP) mas Você consegue escapar.`)
        },
        display(){
            this.position.element.textContent = this.icon + this.position.element.textContent
        },
        respawn(){
            this.position.element.textContent = this.position.element.textContent!.replace(this.icon, '');
            player.position = player.savePointPosition
            player.life = 100
            player.savePointPosition.element.classList.remove('checkPoint')
            player.savePoint = false
            player.weapon.durability = 0
            this.display()
            alert("Após o confronto, você se sente revigorado e pronto para enfrentar novos desafios.")
        },
        dropWeapon(){
            this.lastTurnMove = timeLimit
            player.weapon.position = player.position
            player.weapon.display()
            player.weapon = weaponList[0]
            this.lastTurnMove = timeLimit
        },
        serchHerb(){
            if(this.position.element.innerText.includes(herbIcon)){
                if(player.life == 100){
                    return
                }
                const lifeRecover = randomNum(6, 15)
                this.life += lifeRecover
                if(player.life > 100){
                    player.life = 100
                    return
                }
                this.lastTurnMove = timeLimit
                const life = document.getElementById('life')!
                life.textContent = `${"\u{2764}"} ${this.life}%`
                this.position.element.innerText = this.position.element.innerText.replace(herbIcon, '')
                alert(`Você encontra uma erva medicinal e a consome, recuperando (+${lifeRecover} HP).`)
            }
        }
    };
    player.weapon.durability = 0
    monsterList.map( monster => monster.display())
    island[0].element.textContent = player.icon;

    treasure.position!.element.textContent = treasure.icon
    treasure.position!.safe = true
    timerAtt(timer, timeLimit)

    weaponList.map(weapon => weapon.display());

    await wait()
    while(!player.gameOver){
        await playerMove(player, island, monsterList, weaponList, treasure, timeLimit);
        await monstersMove(monsterList, island, timeLimit, player)
        timeLimit--;
        timerAtt(timer, timeLimit);
        if (timeLimit === 0 || (player.life <= 0 && !(player.savePoint)) || (player.position.sameCoordenates(island[0]) && player.treasure > 0)){
            player.gameOver = true
        }
        await wait();
    }
    if(player.treasure > 0){
        alert("You win!");
    }
}

main()