const gameScreen = document.getElementById('game');
const ctx = gameScreen.getContext('2d');

let player = {x: 100, y: 100, size: 50, speed: 10, health: 400};
let activeEnemies = [];

let flagStartWave = false;
let wave = 0;

const enemiesAvailable = 
{
    basicSlime: {size:20, speed:0.001, health:50, x:null, y:null},
    midSlime:   {size:40, speed:0.01, health:100, x:null, y:null}
};
const enemyList = Object.values(enemiesAvailable);


//keypress 
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function resizeScreen(){
    const rect = gameScreen.getBoundingClientRect();
    gameScreen.width = rect.width;
    gameScreen.height = rect.height;
}

function changePlayerHealth(givenAmount){
    let oldhealth = player.health;
    player.health +=givenAmount;
    if (player.health > 400 || player.health < 0)
    {
        player.health = oldhealth;
    }
}

function spawnWave(amount){
    while (amount >= 0)
    {
        //push a random COPY enemy from enemiesAvailable using enemy list to the active enemy list
        activeEnemies.push({...enemyList[Math.floor(Math.random() * enemyList.length)]});
        //give the enemey a unique location
        activeEnemies.at(-1).x = Math.floor(Math.random() * ((gameScreen.width-activeEnemies.at(-1).size) - 0 + 1)) + 0,
        activeEnemies.at(-1).y = Math.floor(Math.random() * ((gameScreen.height-activeEnemies.at(-1).size) - 0 + 1)) + 0,
        //itterate for amount of enemies being spawned
        amount --;
    }
}

function update(){
    if (keys['w']) player.y -= player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['d']) player.x += player.speed;

    if (keys['e'])changePlayerHealth(+5);
    if (keys['q'])changePlayerHealth(-5);

    if (keys['z'])flagStartWave = true;

    //move the enemies
    for (let i = 0; i < activeEnemies.length; i++)
    {
        activeEnemies[i].x += (player.x - activeEnemies[i].x) * activeEnemies[i].speed;
        activeEnemies[i].y += (player.y - activeEnemies[i].y) * activeEnemies[i].speed;
    }
}

function waveupdate(){
    //check if new wave is being initiated
    if (flagStartWave)
    {
        //set wavestart flag off and increment wave forward for begining
        flagStartWave = false;
        wave ++;

        //spawn the enemies for the wave
        spawnWave(1);
        
        console.log(`[GAME] New wave starting. Current wave: ${wave}`);
    }
}

function render(){
    //clear the canvas
    ctx.clearRect(0,0, gameScreen.width, gameScreen.height);

    //
    //draw screen items
    //

    //draw player
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x, player.y, player.size,player.size);
    
    //draw the enemies
    for (let i = 0; i < activeEnemies.length; i++)
    {
        //draw the current itterated enemy
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(activeEnemies[i].x,activeEnemies[i].y,activeEnemies[i].size,activeEnemies[i].size)
    }

    //
    //draw UI
    //

    //player health bar
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(30,gameScreen.height-60,410,30);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(35,gameScreen.height-55,player.health,20);
}
//run the game loop every frame
function mainloop() {
    resizeScreen();
    waveupdate();
    update();
    render();
    requestAnimationFrame(mainloop);
}
requestAnimationFrame(mainloop);