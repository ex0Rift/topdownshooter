const gameScreen = document.getElementById('game');
const ctx = gameScreen.getContext('2d');

let player = {x: 100, y: 100, size: 50, speed: 10, health: 400};
let activeEnemies = [];
let activeBullets = [];

let flagStartWave = false;
let wave = 0;

let mouse = {x:null, y:null};

const bulletsAvailable = {
    Pistol:  {interval:10, damage:19,spread:1,x:null,y:null,dx:null,dy:null,distance:null},
    SMG:     {interval:2, damage:12,spread:1,x:null,y:null,dx:null,dy:null,distance:null},
    Rifle:   {interval:20, damage:50,spread:1,x:null,y:null,dx:null,dy:null,distance:null},
    DeathRay:{interval:1, damage:200,spread:1,x:null,y:null,dx:null,dy:null,distance:null},
    Shotgun :{interval:15, damage:15,spread:5,x:null,y:null,dx:null,dy:null,distance:null},
};
const bulletList = Object.values(bulletsAvailable);
let currentBulletType = 4;
let currentBulletInterval = 0;
const bulletSpeed = 50;

const enemiesAvailable = 
{
    basicSlime: {size:20, speed:2, health:50, x:null, y:null},
    midSlime:   {size:40, speed:3, health:100, x:null, y:null},
    largeSlime: {size:60, speed:1, health:200, x:null, y:null},
    fastSlime:  {size:30, speed:8, health:40, x:null, y:null},
    tanksSlime: {size:100, speed:0.8, health:300, x:null, y:null}
};
const enemyList = Object.values(enemiesAvailable);


//keypress checking 
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

//mouse checking
let mousePressed = false;
document.addEventListener('mousedown', e => mousePressed = true);
document.addEventListener('mouseup', e => mousePressed = false);
document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

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

    //controlls how often a bullet is released
    if (currentBulletInterval == 0)
    {
        //shoot player gun if mouse pressed
        if (mousePressed)
        {
            //resets bullet interval
            currentBulletInterval = bulletList[currentBulletType].interval;
            //for adding spread to the bullets
            for (let i = 0; i < bulletList[currentBulletType].spread; i++)
            {
                //adds new bullet to list
                activeBullets.push({...bulletList[currentBulletType]});
                //makes first location at the player
                activeBullets.at(-1).x = player.x;
                activeBullets.at(-1).y = player.y;
                //set its dx and dy values
                const dx = mouse.x - activeBullets.at(-1).x;
                const dy = mouse.y - activeBullets.at(-1).y;
                //rotate the dx and dy values for bullet spread
                let angle = 0;
                if (i != 0){angle = i * (Math.PI / 36);}
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                //dx and dy with applied roation
                activeBullets.at(-1).dx = dx * cos - dy * sin;
                activeBullets.at(-1).dy = dx * sin + dy * cos;

                //work out distance from mouse at begining for direction
                activeBullets.at(-1).distance = Math.sqrt(activeBullets.at(-1).dx * activeBullets.at(-1).dx + activeBullets.at(-1).dy * activeBullets.at(-1).dy);
            }
        }
    }
    //itterates bullet delay
    if (currentBulletInterval != 0)currentBulletInterval --;

    //move the enemies
    for (let i = 0; i < activeEnemies.length; i++)
    {
        //find the difference between the two points
        const dx = player.x - activeEnemies[i].x;
        const dy = player.y - activeEnemies[i].y;
        //pythag to find the distance between the two points
        const distance = Math.sqrt(dx * dx + dy * dy);
        //prevent division by 0
        if (distance > player.size/2){
            activeEnemies[i].x += (dx / distance) * activeEnemies[i].speed;
            activeEnemies[i].y += (dy / distance) * activeEnemies[i].speed;
        }
    }
    //move the bullets
    for (let i = 0; i < activeBullets.length; i++)
    {
        activeBullets[i].x += (activeBullets[i].dx / activeBullets[i].distance) * bulletSpeed;
        activeBullets[i].y += (activeBullets[i].dy / activeBullets[i].distance) * bulletSpeed;
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
    
    //draw the bullets
    for (let i = 0; i < activeBullets.length; i++)
    {
        ctx.fillStyle = "#ffb300";
        ctx.fillRect(activeBullets[i].x,activeBullets[i].y,10,10);
    }

    //draw the enemies
    for (let i = 0; i < activeEnemies.length; i++)
    {
        //draw the current itterated enemy
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(activeEnemies[i].x,activeEnemies[i].y,activeEnemies[i].size,activeEnemies[i].size);
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