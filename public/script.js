const gameScreen = document.getElementById('game');
const ctx = gameScreen.getContext('2d');

const player = {x: 100, y: 100, size: 250};

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
    if (keys['ArrowUp']) console.log('true');
}

function render(){
    //clear the canvas
    ctx.clearRect(0,0, gameScreen.width, gameScreen.height);

    //draw screen items
    ctx.fillRect(player.x, player.y, player.size,player.size);
}
//run the game loop every frame
function mainloop() {
    resizeScreen();
    update();
    render();
    requestAnimationFrame(mainloop);
}
requestAnimationFrame(mainloop);