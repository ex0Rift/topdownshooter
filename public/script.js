const gameScreen = document.getElementById('game');
const ctx = gameScreen.getContext('2d');
const deathScreen = document.getElementById('deathScreen');

let player = {x: 100, y: 100, size: 19, speed: 10, health: 400, damageCoolDown: 120, xp: 0, level: 0};
const maxdamageCoolDown = player.damageCoolDown;

const campFire = {x:gameScreen.width,y:gameScreen.height,size:40};

let activeEnemies = [];
let activeBullets = [];

let flagStartWave = false;
let flagGameWaiting = false;

let wave = 0;
const waveDifficultyMultiplier = 1.5;

let mouse = {x:null, y:null};

const bulletsAvailable = {
    Pistol:  {interval:10, damage:19,spread:1,x:null,y:null,dx:null,dy:null,distance:null},
    SMG:     {interval:2, damage:12,spread:1,x:null,y:null,dx:null,dy:null,distance:null},
    Rifle:   {interval:20, damage:50,spread:1,x:null,y:null,dx:null,dy:null,distance:null},
    DeathRay:{interval:1, damage:200,spread:75,x:null,y:null,dx:null,dy:null,distance:null},
    Shotgun :{interval:15, damage:15,spread:5,x:null,y:null,dx:null,dy:null,distance:null},
};
const bulletList = Object.values(bulletsAvailable);
let currentBulletType = 1;
let currentBulletInterval = 0;
const bulletSpeed = 50;

const enemiesAvailable = 
{
    basicSlime: {size:50, speed:2, health:50,xp:30, damage:20, x:null, y:null},
    midSlime:   {size:70, speed:3, health:100,xp:50, damage:25, x:null, y:null},
    largeSlime: {size:100, speed:1, health:200,xp:60, damage:35, x:null, y:null},
    fastSlime:  {size:60, speed:8, health:40,xp:70, damage:18, x:null, y:null},
    tanksSlime: {size:150, speed:0.8, health:300,xp:110, damage:100, x:null, y:null}
};
const enemyList = Object.values(enemiesAvailable);

//create the pattern for the background
let pattern = null;
Ibackground.onload = () => {
    ctx.imageSmoothingEnabled = false;
    pattern = ctx.createPattern(Ibackground,'repeat');
    pattern.setTransform(new DOMMatrix().scale(2));
};

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

const checkPointInPerimiter = (px, py, x1, y1, x2, y2) => {
    //checking a single point (px,py) to see if it is inside a perimeter
    //perimmeter is top left (x1,y1) and top right (x2,y2)
    if(px < x2 && px > x1 && py < y2 && py > y1){
        return 1;
    }
    else
    {
        return 0;
    }
}

//function orignating from index.html to control the deathScreen div from showing
function replay(){
    deathScreen.style.display = 'none';
    flagGameWaiting = false;
}

function resizeScreen(){
    const rect = gameScreen.getBoundingClientRect();
    gameScreen.width = rect.width;
    gameScreen.height = rect.height;
    campFire.x = gameScreen.width/2-campFire.size/2;
    campFire.y = gameScreen.height/2-campFire.size/2;
    ctx.imageSmoothingEnabled = false;
}

function playerDeath(){
    //set the game into waiting for screen input
    flagGameWaiting = true;
    //show the death screen
    deathScreen.style.display = 'flex';
    //reset player health
    changePlayerHealth(+400);
    //reset enemies and bullets on sceen to go away
    activeEnemies.splice(0,activeEnemies.length);
    activeBullets.splice(0,activeBullets.length);
    //set the gun to the default gun
    currentBulletType = 0;
}

function changePlayerHealth(givenAmount){
    const oldhealth = player.health;
    player.health +=givenAmount;
    if (player.health > 400 || player.health < 0)
    {
        player.health = oldhealth;
    }
    //if more damadge is done than health available set it to 0
    if (player.health+givenAmount < 0)
    {
        player.health = 0;
    }
}

function changePlayerXP(givenAmount){
    //give the amount of xp
    player.xp += givenAmount;
    if (player.xp > 400){
        //if xp is full, reset xp and add level
        player.level ++;
        player.xp = 0;
    } else if (player.xp < 0){  
        //if xp goes below 0 remove level and fill xp bar to top 
        player.level --;
        player.xp = 400;
    }
}

function spawnWave(amount){
    while (amount >= 0)
    {
        //push a random COPY enemy from enemiesAvailable using enemy list to the active enemy list
        activeEnemies.push({...enemyList[Math.floor(Math.random() * enemyList.length)]});
        const enemy = activeEnemies.at(-1);
        //give the enemey a unique location along the edge of the screen
        const side = Math.floor(Math.random() * 4);
        switch (side){
            case 0: // top edge
                enemy.x = Math.floor(Math.random() * gameScreen.width);
                enemy.y = -enemy.size;
                break;
            case 1: //right edge
                enemy.x = gameScreen.width;
                enemy.y = Math.floor(Math.random() * gameScreen.height);
                break;
            case 2: //bottom edge
                enemy.x = Math.floor(Math.random() * gameScreen.width);
                enemy.y = gameScreen.height;
                break;
            case 3: // left edge
                enemy.x = enemy.size;
                enemy.y = Math.floor(Math.random() * gameScreen.height);
                break;
        }

        amount --;
    }
}

function update(){
    //check if player health has gone to 0 if so, call playerDeath function to reset the game
    if (player.health == 0 || flagGameWaiting){
        if (player.health == 0){playerDeath();}

        
        //prevent rest of code from running
        return;
    }

    if (keys['w']) player.y -= player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['d']) player.x += player.speed;

    if (keys['z'])flagStartWave = true;

    if (keys['q'])changePlayerXP(-5);
    if (keys['e'])changePlayerXP(+5);

    //start wave if the campfire was pressed
    if (
        mousePressed &&
        mouse.x > campFire.x &&
        mouse.x < campFire.x+campFire.size &&
        mouse.y > campFire.y &&
        mouse.y < campFire.y+campFire.size
    ){
        if (activeEnemies.length == 0)
            flagStartWave = true;
    }

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
    //update each enemy
    for (let i = 0; i < activeEnemies.length; i++)
    {
        //check for death
        if (activeEnemies[i].health <= 0)
        {
            //give player xp
            changePlayerXP(activeEnemies[i].xp);
            //remove the enemey from the array
            activeEnemies.splice(i,1);
            continue;
        }

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
        //collision for interacting with player
        //

        //check if middle of player is inside bounding box of the current itteration of enemy
        const collide = checkPointInPerimiter(
            player.x+(player.size/2),
            player.y+(player.size/2),
            activeEnemies[i].x,
            activeEnemies[i].y,
            activeEnemies[i].x+activeEnemies[i].size,
            activeEnemies[i].y+activeEnemies[i].size
        );
        //check if damadge cooldown is over AND is colliding
        if (player.damageCoolDown == 0 && collide == 1)
        {
            //remove enemey aproriate amount of health
            changePlayerHealth(-activeEnemies[i].damage);
            //reset cooldown
            player.damageCoolDown = maxdamageCoolDown;
        }
        //itterate cooldown
        if(player.damageCoolDown > 0)player.damageCoolDown --;
    }
    //move the bullets
    for (let i = 0; i < activeBullets.length; i++)
    {   
        activeBullets[i].x += (activeBullets[i].dx / activeBullets[i].distance) * bulletSpeed;
        activeBullets[i].y += (activeBullets[i].dy / activeBullets[i].distance) * bulletSpeed;
        //check if position os outside of the window
        if 
        (
            activeBullets[i].x < 0 || activeBullets[i].x > gameScreen.width ||
            activeBullets[i].y < 0 || activeBullets[i].y > gameScreen.height
        ){  
            //delete bullet if outside the window
            activeBullets.splice(i,1);
        } //only check collision if bullet has not been deleted
        else {
            for (let j = 0; j < activeEnemies.length; j++)
            {
                const collide = checkPointInPerimiter(
                    activeBullets[i].x+5,
                    activeBullets[i].y+5,
                    activeEnemies[j].x,
                    activeEnemies[j].y,
                    activeEnemies[j].x+activeEnemies[j].size,
                    activeEnemies[j].y+activeEnemies[j].size
                )
                if (collide)
                {   
                    //destroy the bullet
                    activeBullets.splice(i,1);
                    //apply damadge to the enemy
                    activeEnemies[j].health -= bulletList[currentBulletType].damage;
                    break;
                }
            }
        }
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
        spawnWave(wave*waveDifficultyMultiplier);
        
        console.log(`[GAME] New wave starting. Current wave: ${wave}`);
    }
}

function render(){
    //put the background on the canvas
    ctx.fillStyle = pattern;
    ctx.fillRect(0,0,gameScreen.width,gameScreen.height);

    //
    //draw screen items
    //

    //draw player
    ctx.fillStyle = "#ffffff";
    ctx.drawImage(Iplayer,player.x, player.y, player.size,player.size);
    
    //draw the bullets
    for (let i = 0; i < activeBullets.length; i++)
    {
        ctx.fillStyle = "#ffb300";
        ctx.fillRect(activeBullets[i].x,activeBullets[i].y,10,10);
    }

    //draw the enemies
    for (let i = 0; i < activeEnemies.length; i++)
    {
        //change image depending on which slime
        let currentImage = Iplayer;
        if(activeEnemies[i].size == enemiesAvailable.basicSlime.size){currentImage = IsmallEnemy;}
        if(activeEnemies[i].size == enemiesAvailable.tanksSlime.size){currentImage = ItankSlime;}
        if(activeEnemies[i].size == enemiesAvailable.fastSlime.size){currentImage = IfastSlime;}
        if(activeEnemies[i].size == enemiesAvailable.midSlime.size){currentImage = ImidSlime;}
        if(activeEnemies[i].size == enemiesAvailable.largeSlime.size){currentImage = IbigSlime;}
        //draw the current itterated enemy
        ctx.drawImage(currentImage,activeEnemies[i].x,activeEnemies[i].y,activeEnemies[i].size,activeEnemies[i].size);
    }
    //draw the wave spawner (campfire)
    ctx.fillStyle = "#d71149";
    ctx.drawImage(Icampfire,campFire.x,campFire.y,campFire.size,campFire.size);

    //
    //draw UI
    //
    
    //player health bar
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(30,gameScreen.height-60,410,30);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(35,gameScreen.height-55,player.health,20);

    //player xp bar
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(gameScreen.width-440,gameScreen.height-60,410,30);
    ctx.fillStyle = "#c3a11a";
    ctx.fillRect(gameScreen.width-435,gameScreen.height-55,player.xp,20);
    //add text for level
    ctx.font = '30px Arial';
    ctx.fillText(`${player.level}`,gameScreen.width-470,gameScreen.height-35);
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