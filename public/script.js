const gameScreen = document.getElementById('game');
const ctx = gameScreen.getContext('2d');

let player = {x: 100, y: 100, size: 50, speed: 10, health: 400};

const basicSlime = {size:20, speed:5, health:50};
const midSlime = {size:40, speed:8, health:100};

const enemiesAvailable = {basicSlime,midSlime};

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
}

function render(){
    //clear the canvas
    ctx.clearRect(0,0, gameScreen.width, gameScreen.height);

    //draw screen items
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x, player.y, player.size,player.size);
    
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
    update();
    render();
    requestAnimationFrame(mainloop);
}
requestAnimationFrame(mainloop);