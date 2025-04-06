imgDict={}

function cleanImgDict() {
    for (let i in imgDict) {
        if (imgDict[i]) {
            imgDict[i].src = "";  // Libère la VRAM
            delete imgDict[i];     // Supprime complètement l'entrée
        }
    }
}

function removeObjectFromList(list,object){
    let listReturned=[];
    for (let i of list){
        if (i!=object){
            listReturned.push(i);
        }
    }
    return listReturned;
}

class stdCanvas{
    isJustCreated=true;
    constructor(elements){
        this.elements=elements;
    }
    create(){
    }
    step(){
        for (i of this.elements){
            if (i.isJustCreated){
                i.create();
                i.isJustCreated=false;
            }
            i.step();
        }
    }
    draw(){
        for (i of this.elements){
            i.draw();
        }
    }
}

class camera{
    constructor(x,y,width,height,givedMap){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.givedMap=givedMap;
    }
    showCameraZone(){
        if (this.x<=this.givedMap.minX){
            this.x=this.givedMap.minX;
        }
        if (this.x+this.width>=this.givedMap.width){
            this.x=this.givedMap.width-this.width;
        }
        if (this.y<=this.givedMap.minY){
            this.y=this.givedMap.minY;
        }
        if (this.y+this.height>=this.givedMap.height){
            this.y=this.givedMap.height-this.height;
        }
        for (let i of this.givedMap.elements){
            if (detectInbound(i,this.x,this.y,this.width,this.height)){
                i.draw(i.x-this.x,i.y-this.y)
            }
        }

        if (this.givedMap.player.x<=this.x){
            this.givedMap.player.x=this.x
        }

        if (this.givedMap.player.y<=this.y){
            this.givedMap.player.y=this.y
        }

        if (this.givedMap.player.x+this.givedMap.player.width>=this.x+this.width){
            this.givedMap.player.x=this.x+this.width-this.givedMap.player.width
        }
        
        if (this.givedMap.player.y+this.givedMap.player.height>=this.y+this.height){
            this.givedMap.player.y=this.y+this.height-this.givedMap.player.height
        }
        this.givedMap.player.draw(this.givedMap.player.x-this.x,this.givedMap.player.y-this.y);
    }
}

function collided(elem1,elem2){
    return (elem1.x <= elem2.x + elem2.width &&
        elem1.x + elem1.width >= elem2.x &&
        elem1.y <= elem2.y + elem2.height &&
        elem1.y + elem1.height >= elem2.y)
}

function solid(elem1,elem2){
    if (detectInbound(elem2, elem1.x - 50, elem1.y - 50, elem1.width + 50, elem1.height + 50)) {
        overlapX=Math.min(elem1.x+elem1.width,elem2.x+elem2.width)-Math.max(elem1.x,elem2.x);
        overlapY=Math.min(elem1.y+elem1.height,elem2.y+elem2.height)-Math.max(elem1.y,elem2.y);
        if (overlapX<overlapY){
            if (elem1.x+elem1.width>=elem2.x && elem1.x+elem1.width<=elem2.x+elem2.width/2){
                elem1.x=elem2.x-elem1.width
            }
            if (elem1.x<=elem2.x+elem2.width && elem1.x>=elem2.x+elem2.width/2){
                elem1.x=elem2.x+elem2.width
            }
        }else{
            if (elem1.y+elem1.height>=elem2.y && elem1.y+elem1.height<=elem2.y+elem2.height/2){
                elem1.y=elem2.y-elem1.height
            }
            if (elem1.y<=elem2.y+elem2.height && elem1.y>=elem2.y+elem2.height/2){
                elem1.y=elem2.y+elem2.height
            }
        }
    }
}
// Détection de collision entre deux éléments


// Fonction de détection d'intrusion
function detectInbound(elem, x, y, width, height) {
    return !(elem.x + elem.width < x || elem.x > x + width || elem.y + elem.height < y || elem.y > y + height);
}

class map extends stdCanvas{
    constructor(elements,player,minX,minY,width,height){
        super(elements);
        this.player=player;
        this.minX=minX;
        this.minY=minY;
        this.width=width;
        this.height=height;
    }
    Camera=new camera(0,0,960,544,this);
    step(){
        this.player.step();
        this.player.motherCanvas=this;
        for (i of this.elements){
            if (i.isJustCreated){
                i.create();
                i.motherCanvas=this;
                i.isJustCreated=false;
            }
            i.step();
            if (i instanceof launchEventObject || i instanceof enemy){
                if (i.solid==true){
                    solid(this.player,i)
                }
            }
        }
        this.Camera.y-=1
    }
    draw(){
        this.Camera.showCameraZone();
    }
}

class animatedImage{
    isJustCreated=true
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation){
        this.spritesheet=spritesheet;
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.imageCoords=imageCoords;
        this.imageCoordsIndex=imageCoordsIndex;
        this.animationSpeed=animationSpeed;
        this.spritesheetLocation=spritesheetLocation;
    }
    create(){}
    step(){}
    draw(x=this.x,y=this.y){
        if (this.imageCoordsIndex<this.imageCoords.length-1){
            this.imageCoordsIndex+=this.animationSpeed
        }else{
            this.imageCoordsIndex=0
        }
        if (this.spritesheet!=null){
            ctx.drawImage(this.spritesheet,this.imageCoords[Math.floor(this.imageCoordsIndex)][0],this.imageCoords[Math.floor(this.imageCoordsIndex)][1],this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3],x,y,this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3])
        }
    }
}

class gameEvent{
    index=0;
    isJustCreated=true;
    constructor(eventFunction,maxIndex,cache,eventSpeed,loop){
        this.eventFunction=eventFunction;
        this.maxIndex=maxIndex;
        this.cache=cache;
        this.eventSpeed=eventSpeed;
        this.loop=loop
    }
    create(){}
    step(){
        if (this.index<this.maxIndex){
            this.eventFunction(this)
            this.index+=this.eventSpeed;
        }else{
            if (this.loop){
                this.index=0;
            }else{
                if (this.motherCanvas!=undefined){
                    this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
                }
            }
        }
    }
    draw(){}
}

class enemy extends animatedImage{
    health=150;
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation,enemyPatternEvent,solid){
        super(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation);
        this.enemyPatternEvent=enemyPatternEvent;
        this.solid=solid;
    }
    create(){
        if (this.enemyPatternEvent!="nothing"){
            this.enemyPatternEvent=new gameEvent(eventsList[this.enemyPatternEvent].eventFunction,eventsList[this.enemyPatternEvent].maxIndex,eventsList[this.enemyPatternEvent].cache);
            this.enemyPatternEvent.cache=[this];
        }
    }
    step(){
        if (this.enemyPatternEvent!="nothing"){
            if (detectInbound(this,this.motherCanvas.Camera.x,this.motherCanvas.Camera.y,this.motherCanvas.Camera.width,this.motherCanvas.Camera.height)){
                this.enemyPatternEvent.step();
            }
        }
        if (this.health<=0){
            this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
        }
    }
}

class projectile extends animatedImage{
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation,moveSpeed,sender,strength){
        super(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation);
        this.moveSpeed=moveSpeed;
        this.sender=sender;
        this.strength=strength;
    }
    step(){
        this.x+=this.moveSpeed[0];
        this.y+=this.moveSpeed[1];
        if (!detectInbound(this,this.motherCanvas.Camera.x,this.motherCanvas.Camera.y,this.motherCanvas.Camera.width,this.motherCanvas.Camera.height)){
            this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
        }
        if (collided(this,this.motherCanvas.player)&&this.motherCanvas.player!=this.sender){
            this.motherCanvas.player.health-=this.strength;
            this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
        }
        for (let i of this.motherCanvas.elements){
            if ((i instanceof enemy || i instanceof character)&&i!=this.sender){
                if (collided(this,i)){
                    i.health-=this.strength;
                    this.motherCanvas.elements=removeObjectFromList(this.motherCanvas.elements,this);
                }
            }
        }
    }
}

class launchEventObject extends animatedImage{
    isJustCreated=true
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation,Event,solid){
        super(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation);
        this.Event=Event;
        this.solid=solid;
    }
}

class character extends animatedImage{
    isJustCreated=true
    health=100;
    shotIndex=0
    constructor(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation,imageCoordsList){
        super(spritesheet,x,y,width,height,imageCoords,imageCoordsIndex,animationSpeed,spritesheetLocation);
        this.imageCoordsList=imageCoordsList;
    }
    step(){
        for (let input of ([["ArrowLeft",-3,0],["ArrowRight",3,0],["ArrowUp",0,-3],["ArrowDown",0,3]])){
            if (controls[input[0]]){
                this.x+=input[1];
                this.y+=input[2];
            }
        }
        if (controls["x"]){
            if (this.shotIndex==0){
                this.motherCanvas.elements.push(new projectile(testImage,this.x,this.y-10,51,57,[[259,242,51,57],[314,242,51,57]],0,1,"images/testImage.png",[0,-10],this,5))
            }
            if (this.shotIndex>=10){
                this.shotIndex=-1;
            }
            this.shotIndex+=1;
        }
        if(this.health<=0){
            console.log("won")
        }
    }
}

function mainloop(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 960, 544);
    
    for (let i of instancesList) {
        if (i.isJustCreated) {
            i.create();
            i.isJustCreated = false;
        }
        i.step();
        i.draw();
    }

    requestAnimationFrame(mainloop);
}

function surroundedByBracket(str, characterId) {
    let temp = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "[") {
            temp++;
        } else if (str[i] === "]") {
            temp--;
        } else if (temp > 0 && i === characterId) {
            return true;
        }
    }
    return false;
}

function customFirstOccurrenceOf(str, elem, step) {
    let a = step < 0 ? str.length - 1 : 0;
    let b = step < 0 ? -1 : str.length;
    for (let i = a; i !== b; i += step) {
        if (str[i] === elem && !surroundedByBracket(str, i)) {
            return i;
        }
    }
    return null;
}

function customSplit(str, separator) {
    let temp = [];
    let firstOccurrence = customFirstOccurrenceOf(str, separator, 1);
    
    if (firstOccurrence !== null) {
        temp.push(str.substring(0, firstOccurrence));
    } else {
        temp.push(str);
        return temp;
    }

    for (let i = 0; i < str.length; i++) {
        if (str[i] === separator && !surroundedByBracket(str, i)) {
            let nextCommaIndex = customFirstOccurrenceOf(str.substring(i + 1), separator, 1);
            if (nextCommaIndex !== null) {
                let nextComma = i + 1 + nextCommaIndex;
                temp.push(str.substring(i + 1, nextComma));
            } else {
                temp.push(str.substring(i + 1));
            }
        }
    }
    return temp;
}

function customLoads(str) {
    let temp = customSplit(str.substring(1, str.length - 1), ",");
    let finalList = [];
    
    for (let i of temp) {
        if (i.startsWith("[") && i.endsWith("]")) {
            finalList.push(customLoads(i));
        } else {
            finalList.push(i);
        }
    }
    return finalList;
}

function setControls(keysArray){
    keys={}
    for (i of keysArray){
        keys[i]=false;
        document.addEventListener("keydown",function(key){
            return function(event){
                if (event.key==key){
                    keys[key]=true;
                }
            }
        }(i))
        document.addEventListener("keyup",function(key){
            return function(event){
                if (event.key==key){
                    keys[key]=false;
                }
            }
        }(i))
    }
    return keys;
}
l=""

function convertArrayValuesToNumber(ArrayGived){
    let finalArray=[];
    for (let i of ArrayGived){
        if (typeof(i)!="string"){
            finalArray.push(convertArrayValuesToNumber(i))
        }else{
            finalArray.push(parseFloat(i))
        }
    }
    return finalArray;
}

function uncompress(array) {
    let finalArray = [];
    
    array.forEach(item => {
        let subList = item.split(";").map(Number);
        
        for (let j = 0; j < subList[0]; j++) {
            finalArray.push(subList[1]);
        }
    });
    
    return finalArray;
}

function customReadFileSync(filename){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', filename, false); // 'false' rend la requête synchrone
    xhr.send();

    if (xhr.status === 200) {
        return xhr.responseText; // Retourne le contenu du fichier
    } else {
        console.error(`Erreur lors du chargement du fichier : ${xhr.status}`);
        return null;
    }
}

function readLines(filename){
    let lineBegining=0
    let finalArray=[]
    const text=customReadFileSync(filename);
    for (let i=0;i<text.length;i++){
        if (text[i]=="\r"){
            finalArray.push(text.substring(lineBegining,i));
            lineBegining=i+2;
        }
    }
    return finalArray;
}

function csvConverter(filename,imgMemDict){
    finalArray=[];
    data=readLines(filename);
    for (i of data){
        concernedList=customLoads(`[${i}]`)
        if (concernedList[0]=="enemy"){
            x=uncompress(concernedList[9])
            y=uncompress(concernedList[10])
            if (!(concernedList[6] in imgMemDict)){
                imgMemDict[concernedList[6]]=new Image();
                imgMemDict[concernedList[6]].src=concernedList[6]
            }
            for (let j=0;j<x.length;j++){
                finalArray.push(new enemy(imgMemDict[concernedList[6]],x[j],y[j],Number(concernedList[1]),Number(concernedList[2]),convertArrayValuesToNumber(concernedList[3]),Number(concernedList[4]),Number(concernedList[5]),concernedList[6],concernedList[7],concernedList[8]=="True"))
            }
        }
        else if (concernedList[0]=="animatedImage"){
            x=uncompress(concernedList[7])
            y=uncompress(concernedList[8])
            if (!(concernedList[6] in imgMemDict)){
                imgMemDict[concernedList[6]]=new Image();
                imgMemDict[concernedList[6]].src=concernedList[6]
            }
            for (let j=0;j<x.length;j++){
                finalArray.push(new animatedImage(imgMemDict[concernedList[6]],x[j],y[j],Number(concernedList[1]),Number(concernedList[2]),convertArrayValuesToNumber(concernedList[3]),Number(concernedList[4]),Number(concernedList[5]),concernedList[6]))
            }
        }
    }
    return finalArray
}

let eventsList={
    "test":new gameEvent(
        function(){
            this.cache[0].x+=1
        }
    ,150,[],1,false),
    "multiShootCorrupted":new gameEvent(
        function(){
            this.eventSpeed=1;
            if (this.index<100){
                this.cache[0].x+=1;
            }else if(this.index>=100 && this.index<120){
                this.cache[0].y+=5;
            }
            else{
                this.cache[0].y-=1;
                if (this.index%5==0){
                    this.cache[0].motherCanvas.elements.push(new projectile(testImage,this.cache[0].x,this.cache[0].y+33,11,11,[[330,129,11,11]],0,0.1,"images/testImage.png",[-2,-1],this.cache[0],20))
                }
            }
        }
    ,800,[],0,false)
}

let gameScreen=document.createElement("canvas");
gameScreen.id="gameScreen";
gameScreen.width=960;
gameScreen.height=544;
let ctx=gameScreen.getContext('2d');
controls=setControls(["ArrowLeft","ArrowUp","ArrowRight","ArrowDown","x","w","Control"]);
let testImage=new Image();
testImage.src="images/testImage.png"
let instancesList=[new map([],new character(testImage,50,50,165,102,[[21,12,165,102]],0,0.1,"images/testImage.png",[]),0,-6434,1046,7064)]
instancesList[0].elements=csvConverter("test.csv",imgDict);
mainloop();

document.body.appendChild(gameScreen);
