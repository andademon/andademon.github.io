const canvas = document.querySelector('#myCanvas');
const ctx = canvas.getContext('2d');

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
ctx.translate(Math.floor(canvas.width/2),Math.floor(canvas.height/2));

const settings = {
    depth: 7,
    lineWidth: 2,
    scale: 1,
    opacity: 0.8,
    lengthFractor: 0.75,
};

const OFFSET = 0;

const getColorString = (layer) => {
    const colorFloor = 10;
    const randomArr = Array.from(crypto.getRandomValues(new Uint8Array(3)));
    const [red, green, blue] = randomArr.map(
        (num) => colorFloor + Math.floor((num / 255) * (255 - colorFloor)),
    );
    const opacity = settings.opacity ** layer;
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

let colorArray = [];
for (let i = settings.depth; i > 0; i--) {
    colorArray.push(getColorString(i));
}

const getAngle = () => {
    const date = new Date();
    const second = (date.getSeconds() * 1000 + date.getMilliseconds()) / 1000;
    const minute = date.getMinutes() + second / 60;
    const hour = (date.getHours() % 12) + minute / 60;
    
    //最后减去Math.PI / 2是为了矫正，将坐标从三角坐标系转换为时钟坐标系
    const secondAngle = Math.PI * 2 * second / 60 - Math.PI / 2; 
    const minuteAngle = Math.PI * 2 * minute / 60 - Math.PI / 2;
    const hourAngle = Math.PI * 2 * hour / 12 - Math.PI / 2;

    return {
        second: secondAngle,
        minute: minuteAngle,
        hour: hourAngle,
    };
};

const clearCanvas = () => {
    ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
};

const drawFractal = (x,y,length,angle,depth,pAngle) => {
    if(depth < 1) return;
    let endX_sec = x + length * Math.cos(angle.second + pAngle);
    let endY_sec = y + length * Math.sin(angle.second + pAngle);
    let endX_min = x + length * Math.cos(angle.minute + pAngle);
    let endY_min = y + length * Math.sin(angle.minute + pAngle);

    ctx.strokeStyle = colorArray[depth-1];

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(endX_sec,endY_sec);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(endX_min,endY_min);
    ctx.stroke();
        
    const newLength = length * settings.lengthFractor;// 线段缩放长度

    drawFractal(endX_sec,endY_sec,newLength,angle,depth - 1,angle.second - angle.hour - Math.PI + pAngle);
    drawFractal(endX_min,endY_min,newLength,angle,depth - 1,angle.minute - angle.hour - Math.PI + pAngle);
};



function animate() {
    clearCanvas();
    let angle = getAngle(); // 更新角度
    drawFractal(0,0,150,angle,settings.depth,0);
    window.requestAnimationFrame(animate);
}

function init(){
    window.requestAnimationFrame(animate);
}
init();