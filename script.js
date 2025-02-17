imgDict={}
class stdCanvas{
    isJustCreated=true;
    constructor(elements){
        this.elements=elements;
    }
    create(){
        for (i of this.elements){
            if (i.isJustCreated){
                i.create();
                i.isJustCreated=false;
            }
        }
    }
    step(){
        for (i of this.elements){
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
        if (this.x<=0){
            this.x=0;
        }
        if (this.x+this.width>=this.givedMap.width){
            this.x=this.givedMap.width-this.width;
        }
        if (this.y<=0){
            this.y=0;
        }
        if (this.y+this.height>=this.givedMap.height){
            this.y=this.givedMap.height-this.height;
        }
        for (let i of this.givedMap.elements){
            i.draw(i.x-this.x,i.y-this.y)
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

// Détection de collision entre deux éléments
function solid(elem1, elem2) {
    let elem1Final = elem1;
    if (elem1[0] !== undefined) {
        elem1Final = elem1[0]; // Si elem1 est un tableau, prendre le premier élément
    }

    // Vérification si elem2 est dans la zone d'influence étendue de elem1
    if (detectInbound(elem2, elem1Final.x - 50, elem1Final.y - 50, elem1Final.width + 50, elem1Final.height + 50)) {
        // Vérification de la collision entre les deux éléments
        if (elem1Final.x < elem2.x + elem2.width &&
            elem1Final.x + elem1Final.width > elem2.x &&
            elem1Final.y < elem2.y + elem2.height &&
            elem1Final.y + elem1Final.height > elem2.y) {
            
            // Calcul des chevauchements sur les axes X et Y
            let overlapX = Math.min(elem1Final.x + elem1Final.width - elem2.x, elem2.x + elem2.width - elem1Final.x);
            let overlapY = Math.min(elem1Final.y + elem1Final.height - elem2.y, elem2.y + elem2.height - elem1Final.y);

            if (overlapX < overlapY) {
                // Collision sur l'axe X
                if (elem1Final.x + elem1Final.width / 2 < elem2.x + elem2.width / 2) {
                    elem1Final.x = elem1Final.x - overlapX; // Pousser à gauche
                } else {
                    elem1Final.x = elem1Final.x + overlapX; // Pousser à droite
                }
            } else {
                // Collision sur l'axe Y
                if (elem1Final.y + elem1Final.height / 2 < elem2.y + elem2.height / 2) {
                    elem1Final.y = elem1Final.y - overlapY; // Pousser vers le haut
                } else {
                    elem1Final.y = elem1Final.y + overlapY; // Pousser vers le bas
                }
            }
        }
    }
}

// Fonction de détection d'intrusion
function detectInbound(elem, x, y, width, height) {
    return !(elem.x + elem.width < x || elem.x > x + width || elem.y + elem.height < y || elem.y > y + height);
}

class map extends stdCanvas{
    constructor(elements,player,width,height){
        super(elements);
        this.player=player;
        this.width=width;
        this.height=height;
    }
    Camera=new camera(0,0,960,544,this);
    step(){
        this.player.step();
        for (i of this.elements){
            i.step();
            if (i instanceof launchEventObject){
                solid(this.player,i)
            }
        }
    }
    draw(){
        this.Camera.x=this.player.x-(Math.floor(this.Camera.width/2));
        this.Camera.y=this.player.y-(Math.floor(this.Camera.height/2));
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
        ctx.drawImage(this.spritesheet,this.imageCoords[Math.floor(this.imageCoordsIndex)][0],this.imageCoords[Math.floor(this.imageCoordsIndex)][1],this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3],x,y,this.imageCoords[Math.floor(this.imageCoordsIndex)][2],this.imageCoords[Math.floor(this.imageCoordsIndex)][3])
        this.imageCoordsIndex+=this.animationSpeed
        if (this.imageCoordsIndex>this.imageCoords.length){
			this.imageCoordsIndex=0
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

let lsd=convertArrayValuesToNumber(["5","8",["3","2"]])
console.log(lsd);

function customReadarray(filename,callBack,imgMemDict){
    fetch(filename)
    .then(text=>{
        return text.text();
    })
    .then(data=>{
        let finalArray=[];
        let firstClose;
        let firstOpen;
        for (let i=0;i<data.length;i++){
            firstClose=data[i];
            if (firstClose==">") {
                firstOpen=customFirstOccurrenceOf(data.substring(0,i),"<",-1)
                finalArray.push(data.substring(firstOpen+1,i))
            }
        }
        return finalArray;
    })
    .then(data=>{
        let finalArray=[];
        let xAndYCoords;
        let objTemplate;
        for (let i=0;i<data.length;i++){
            if (data[i].substring(0,3)=="BEG"){
                objTemplate=customLoads(`[${data[i].substring(4,data[i].length)}]`)
                for(let j=i+1;j<data.length;j++){
                    if (data[j].substring(0,9)=="DEFCOORDS"){
                        xAndYCoords=convertArrayValuesToNumber(customLoads(`[${data[j].substring(10,data[j].length)}]`));
                        if (imgMemDict[objTemplate[1]]==null){
                            imgMemDict[objTemplate[1]]=new Image();
                            imgMemDict[objTemplate[1]].src=objTemplate[1]
                        }
                        if (objTemplate[0]=="animatedImage"){
                            for (let xElem of xAndYCoords[0]){
                                for (let yElem of xAndYCoords[1]){
                                    finalArray.push(new animatedImage(imgMemDict[objTemplate[1]],xElem,yElem,Number(objTemplate[2]),Number(objTemplate[3]),convertArrayValuesToNumber(objTemplate[4]),Number(objTemplate[5]),Number(objTemplate[6]),objTemplate[1]))
                                }
                            }
                        }else if(objTemplate[0]=="launchEventObject"){
                            for (let xElem of xAndYCoords[0]){
                                for (let yElem of xAndYCoords[1]){
                                    finalArray.push(new launchEventObject(imgMemDict[objTemplate[1]],xElem,yElem,Number(objTemplate[2]),Number(objTemplate[3]),convertArrayValuesToNumber(objTemplate[4]),Number(objTemplate[5]),Number(objTemplate[6]),objTemplate[1],objTemplate[7],Boolean(objTemplate[8])))
                                }
                            }
                        }
                    }
                }
            }
        }
        callBack(finalArray);
    })
}

let gameScreen=document.createElement("canvas");
gameScreen.id="gameScreen";
gameScreen.width=960;
gameScreen.height=544;
let ctx=gameScreen.getContext('2d');
controls=setControls(["ArrowLeft","ArrowUp","ArrowRight","ArrowDown","x","w","Control"]);
let testImage=new Image();
testImage.src="images/testImage.png"
instancesList=[new map([new launchEventObject(testImage,0,0,600,600,[[24,339,96,90]],0,0.1,"images/testImage.png","nothing",false)],new character(testImage,50,50,165,102,[[21,12,165,102]],0,0.1,"images/testImage.png",[]),960,544)]
customReadarray("test.morpgef",function(array){instancesList[0].elements=array;},imgDict)
mainloop();

document.body.appendChild(gameScreen);
