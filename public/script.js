const gameScreen = document.getElementById('game');
const ctx = gameScreen.getContext('2d');

let player = {x: 100, y: 100, size: 50, speed: 10};

//keypress 
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function resizeScreen(){
    const rect = gameScreen.getBoundingClientRect();
    gameScreen.width = rect.width;
    gameScreen.height = rect.height;
}

function update(){
    if (keys['w']) player.y -= player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['d']) player.x += player.speed;
}

function render(){
    //clear the canvas
    ctx.clearRect(0,0, gameScreen.width, gameScreen.height);

    //draw screen items
    ctx.fillRect(player.x, player.y, player.size,player.size);

    //draw UI

    //player health bar
    ctx.fillRect(30,gameScreen.height-80,400,50);
}
//run the game loop every frame
function mainloop() {
    resizeScreen();
    update();
    render();
    requestAnimationFrame(mainloop);
}
requestAnimationFrame(mainloop);