import pygame

class time1input:
    latency=0
    pressed=False
    def __init__(self,checkedInput):
        self.checkedInput=checkedInput
    def verify(self,keysDetector):
        if self.latency<10:
            self.latency+=1
        if keysDetector[self.checkedInput] and self.pressed==False and self.latency==10:
            self.latency=0
            self.pressed=True
            return True
        elif keysDetector[self.checkedInput]:
            return False
        else:
            self.pressed=False

class camera:
    def __init__(self,x,y,width,height):
        self.x=x
        self.y=y
        self.width=width
        self.height=height

def freeVmem(vmem):
    for i in list(vmem.keys()):
        del vmem[i]

def compress(array):
    finalArray = []
    if not array:  
        return finalArray
    
    nbVal = 1
    previousVal = array[0]
    
    for i in range(1, len(array)):
        if array[i] == previousVal:
            nbVal += 1
        else:
            finalArray.append("{};{},".format(nbVal, previousVal))
            nbVal = 1
            previousVal = array[i]
    
    finalArray.append("{};{}".format(nbVal, previousVal))
    
    return finalArray

def uncompress(array):
    finalArray=[]
    for i in array:
        subList=i.split(";")
        subList[0]=int(subList[0])
        subList[1]=int(subList[1])
        for j in range(0,subList[0]):
            finalArray.append(subList[1])
    return finalArray

print(uncompress(["1;6","1;126","1;243","1;147","3;30"]))

def removeElementFromString(string,elem):
    finalString=""
    for i in range(0,len(string)):
        if string[i]!=elem:
            finalString+=string[i]
    return finalString

def minX(tab):
    minXGived=tab[0][2]
    for i in tab:
        if i[2]<=minXGived:
            minXGived=i[2]
    return minXGived

def minY(tab):
    minYGived=tab[0][3]
    for i in tab:
        if i[3]<=minYGived:
            minYGived=i[3]
    return minYGived

def maxX(tab):
    minXGived=tab[0][2]+tab[0][4]
    for i in tab:
        if i[2]+i[4]>=minXGived:
            minXGived=i[2]+i[4]
    return minXGived

def maxY(tab):
    minYGived=tab[0][3]+tab[0][5]
    for i in tab:
        if i[3]+i[5]>=minYGived:
            minYGived=i[3]+i[5]
    return minYGived

def getElts(Array):
    dictElem={}
    for i in Array:
        elem=[]
        for j in range(len(i)):
            if not 1<=j<=3:
                elem.append(i[j])
        if not str(elem)[1:len(str(elem))-1] in dictElem.keys():
            dictElem[str(elem)[1:len(str(elem))-1]]=[[i[2]],[i[3]]]
        else:
            dictElem[str(elem)[1:len(str(elem))-1]][0].append(i[2])
            dictElem[str(elem)[1:len(str(elem))-1]][1].append(i[3])
    return dictElem

def detectInbound(element,x,y,width,height):
	if (element[2]>=x and element[2]<=x+width) or (element[2]+element[4]>=x and element[2]+element[4]<=x+width) or (element[2]<=x and element[2]+element[4]>=x+width):
		if (element[3]>=y and element[3]<=y+height) or (element[3]+element[5]>=y and element[3]+element[5]<=y+height) or (element[3]<=y and element[3]+element[5]>=y+height):
			return True

def convertArrayValuesToNumber(array):
    finalArray=[]
    for i in range(0,len(array)):
        if isinstance(array[i],list):
            finalArray.append(convertArrayValuesToNumber(array[i]))
        else:
            finalArray.append(float(array[i]))
    return finalArray

def surroundedByBracket(str,characterId):
    temp=0
    for i in range(0,len(str)):
        if str[i]=="[":
            temp+=1
        elif str[i]=="]":
            temp-=1
        elif temp>0 and i==characterId:
            return True
    return False

def customFirstOccurenceOf(str,elem):
    for i in range(0,len(str)):
        if str[i]==elem and not surroundedByBracket(str,i):
            return i
    return None

def customSplit(str,separator):
    temp=[]
    temp.append(str[0:customFirstOccurenceOf(str,separator)])
    for i in range(0,len(str)):
        if str[i]==separator and not surroundedByBracket(str,i):
            if customFirstOccurenceOf(str[i+1:],str[i])!=None:
                nextComa=len(str[:i])+customFirstOccurenceOf(str[i+1:],str[i])
                temp.append(str[i+1:nextComa+1])
            else:
                temp.append(str[i+1:len(str)])
    return temp

def customLoads(str):
    temp=customSplit(str[1:len(str)-1],",")
    finalList=[]
    for i in temp:
        if i[0]=="[" and i[len(i)-1]=="]":
            finalList.append(customLoads(i))
        else:
            finalList.append(i)
    return finalList

class Main:
    cliActived=False
    imgDict={}
    instancesList=[]
    objectsList=[]
    itemIndex=0
    toggleLeft=time1input(pygame.K_1)
    toggleRight=time1input(pygame.K_2)
    placeElement=time1input(pygame.K_x)
    removeElement=time1input(pygame.K_c)
    slowLeft=time1input(pygame.K_LEFT)
    slowRight=time1input(pygame.K_RIGHT)
    slowUp=time1input(pygame.K_UP)
    slowDown=time1input(pygame.K_DOWN)
    Camera=camera(0,0,960,544)
    cursorX=0
    cursorY=0
    def __init__(self,resolution):
        self.resolution=resolution
    def cli(self):
        option=str(input("please enter a command:"))
        if option=="MAP -dim":
            print("{},{},{},{}".format(minX(self.instancesList),minY(self.instancesList),maxX(self.instancesList)-minX(self.instancesList),maxY(self.instancesList)-minY(self.instancesList)))
        if option=="CLI -q":
            self.cliActived=False
        if option[0:14]=="PJ -s -wrk -p>":
            self.saveWork(option[14:len(option)],"wrk")
        if option[0:14]=="PJ -s -rtl -p>":
            self.saveWork(option[14:len(option)],"rtl")
        if option[0:9]=="PJ -o -p>":
            self.openWork(option[9:len(option)])
        if option[0:10]=="OBJ -c -p>":
            inputGived=customLoads("[{}]".format(option[10:len(option)]))
            if inputGived[0]=="animatedImage":
                if inputGived[1] not in self.imgDict:
                    self.imgDict[inputGived[1]]=pygame.image.load(inputGived[1])
                self.objectsList.append([inputGived[0],self.imgDict[inputGived[1]],int(inputGived[2]),int(inputGived[3]),int(inputGived[4]),int(inputGived[5]),convertArrayValuesToNumber(inputGived[6]),int(inputGived[7]),float(inputGived[8]),inputGived[9]])
            elif inputGived[0]=="launchEventObject":
                if inputGived[1] not in self.imgDict:
                    self.imgDict[inputGived[1]]=pygame.image.load(inputGived[1])
                self.objectsList.append([inputGived[0],self.imgDict[inputGived[1]],int(inputGived[2]),int(inputGived[3]),int(inputGived[4]),int(inputGived[5]),convertArrayValuesToNumber(inputGived[6]),int(inputGived[7]),float(inputGived[8]),inputGived[9],inputGived[10],inputGived[11]])
            elif inputGived[0]=="enemy":
                if inputGived[1] not in self.imgDict:
                    self.imgDict[inputGived[1]]=pygame.image.load(inputGived[1])
                self.objectsList.append([inputGived[0],self.imgDict[inputGived[1]],int(inputGived[2]),int(inputGived[3]),int(inputGived[4]),int(inputGived[5]),convertArrayValuesToNumber(inputGived[6]),int(inputGived[7]),float(inputGived[8]),inputGived[9],inputGived[10],inputGived[11]])
    
    def saveWork(self,filename,type):
        savedFile=open(filename+".csv","w")
        miniDict=getElts(self.instancesList)
        if type=="wrk":
            miniDict2=getElts(self.objectsList)
            for j in miniDict2.keys():
                savedFile.write("objectsList,{}\n".format(removeElementFromString(j,"'").replace(" ","")))
        for i in miniDict.keys():
            lineToSave="{},[{}],[{}]\n".format(removeElementFromString(i,"'"),removeElementFromString(compress(miniDict[i][0]),"'"),removeElementFromString(compress(miniDict[i][1]),"'"))
            savedFile.write(lineToSave.replace(" ",""))
        savedFile.close()
    
    def openWork(self,filename):
        self.instancesList=[]
        self.objectsList=[]
        freeVmem(self.imgDict)
        print(self.imgDict.keys())
        openedFile=open(filename+".csv","r") 
        for i in openedFile.readlines():
            concernedList=customLoads("[{}]".format(i.replace("\n","")))
            if concernedList[0]=="animatedImage":
                x=uncompress(concernedList[7])
                y=uncompress(concernedList[8])
                if concernedList[6] not in self.imgDict:
                    self.imgDict[concernedList[6]]=pygame.image.load(concernedList[6])
                for j in range(0,len(x)):
                    self.instancesList.append([concernedList[0],self.imgDict[concernedList[6]],x[j],y[j],int(concernedList[1]),int(concernedList[2]),convertArrayValuesToNumber(concernedList[3]),int(concernedList[4]),float(concernedList[5]),concernedList[6]])
            
            if concernedList[0]=="launchEventObject":
                x=uncompress(concernedList[9])
                y=uncompress(concernedList[10])
                if concernedList[6] not in self.imgDict:
                    self.imgDict[concernedList[6]]=pygame.image.load(concernedList[6])
                for j in range(0,len(x)):
                    self.instancesList.append([concernedList[0],self.imgDict[concernedList[6]],x[j],y[j],int(concernedList[1]),int(concernedList[2]),convertArrayValuesToNumber(concernedList[3]),int(concernedList[4]),float(concernedList[5]),concernedList[6],concernedList[7],bool(concernedList[8])])
            if concernedList[0]=="enemy":
                x=uncompress(concernedList[9])
                y=uncompress(concernedList[10])
                if concernedList[6] not in self.imgDict:
                    self.imgDict[concernedList[6]]=pygame.image.load(concernedList[6])
                for j in range(0,len(x)):
                    self.instancesList.append([concernedList[0],self.imgDict[concernedList[6]],x[j],y[j],int(concernedList[1]),int(concernedList[2]),convertArrayValuesToNumber(concernedList[3]),int(concernedList[4]),float(concernedList[5]),concernedList[6],concernedList[7],bool(concernedList[8])])
            if concernedList[0]=="objectsList":
                if concernedList[1]=="launchEventObject":
                    if concernedList[7] not in self.imgDict:
                        self.imgDict[concernedList[7]]=pygame.image.load(concernedList[7])
                    self.objectsList.append([concernedList[1],self.imgDict[concernedList[7]],self.cursorX,self.cursorY,int(concernedList[2]),int(concernedList[3]),convertArrayValuesToNumber(concernedList[4]),int(concernedList[5]),float(concernedList[6]),concernedList[7],concernedList[8],bool(concernedList[9])])
                elif concernedList[1]=="animatedImage":
                    if concernedList[7] not in self.imgDict:
                        self.imgDict[concernedList[7]]=pygame.image.load(concernedList[7])
                    self.objectsList.append([concernedList[1],self.imgDict[concernedList[7]],self.cursorX,self.cursorY,int(concernedList[2]),int(concernedList[3]),convertArrayValuesToNumber(concernedList[4]),int(concernedList[5]),float(concernedList[6]),concernedList[7]])
                elif concernedList[1]=="enemy":
                    if concernedList[7] not in self.imgDict:
                        self.imgDict[concernedList[7]]=pygame.image.load(concernedList[7])
                    self.objectsList.append([concernedList[1],self.imgDict[concernedList[7]],self.cursorX,self.cursorY,int(concernedList[2]),int(concernedList[3]),convertArrayValuesToNumber(concernedList[4]),int(concernedList[5]),float(concernedList[6]),concernedList[7],concernedList[8],bool(concernedList[9])])
        openedFile.close()

    def main(self):
        pygame.init()
        screen=pygame.display.set_mode((self.resolution[0],self.resolution[1]))
        clock=pygame.time.Clock()
        run=True
        while run:
            for event in pygame.event.get():
                if event.type==pygame.QUIT:
                    run=False
            keyPressed=pygame.key.get_pressed()

            pygame.display.set_caption("{}".format(clock.get_fps()))
            
            if not keyPressed[pygame.K_w]:
                for input in [[pygame.K_LEFT,-3,0],[pygame.K_RIGHT,3,0],[pygame.K_UP,0,-3],[pygame.K_DOWN,0,3]]:
                    if keyPressed[input[0]]:
                        self.cursorX+=input[1]
                        self.cursorY+=input[2]
            else:
                for slowInput in [[self.slowLeft,-1,0],[self.slowRight,1,0],[self.slowUp,0,-1],[self.slowDown,0,1]]:
                    if slowInput[0].verify(keyPressed):
                        self.cursorX+=slowInput[1]
                        self.cursorY+=slowInput[2]
            
            for cameraInput in [[pygame.K_q,-3,0],[pygame.K_d,3,0],[pygame.K_z,0,-3],[pygame.K_s,0,3]]:
                if keyPressed[cameraInput[0]]:
                    self.Camera.x+=cameraInput[1]
                    self.Camera.y+=cameraInput[2]
            
            for object in self.objectsList:
                object[2]=self.cursorX
                object[3]=self.cursorY
            
            if self.removeElement.verify(keyPressed):
                for instanceToRemove in range(len(self.instancesList)-1,-1,-1):
                    if self.instancesList[instanceToRemove][2]<=self.cursorX<=self.instancesList[instanceToRemove][2]+self.instancesList[instanceToRemove][4] and self.instancesList[instanceToRemove][3]<=self.cursorY<=self.instancesList[instanceToRemove][3]+self.instancesList[instanceToRemove][5]:
                        self.instancesList.pop(instanceToRemove)
                        break 


            if keyPressed[pygame.K_a]:
                self.cliActived=True
            if self.cliActived:
                self.cli()

            screen.fill((0,0,0))
            if self.itemIndex<len(self.objectsList)-1 and self.toggleRight.verify(keyPressed):
                self.itemIndex+=1
            if self.itemIndex>0 and self.toggleLeft.verify(keyPressed):
                self.itemIndex-=1

            for instance in self.instancesList:
                if instance[1]!=None:
                    if detectInbound(instance,self.Camera.x,self.Camera.y,self.Camera.width,self.Camera.height):
                        screen.blit(instance[1],(instance[2]-self.Camera.x,instance[3]-self.Camera.y),(instance[6][0][0],instance[6][0][1],instance[6][0][2],instance[6][0][3]))
            
            if len(self.objectsList)!=0:
                if self.placeElement.verify(keyPressed):
                    if self.objectsList[self.itemIndex][0]=="animatedImage":
                        self.instancesList.append([self.objectsList[self.itemIndex][0],self.objectsList[self.itemIndex][1],self.objectsList[self.itemIndex][2],self.objectsList[self.itemIndex][3],self.objectsList[self.itemIndex][4],self.objectsList[self.itemIndex][5],self.objectsList[self.itemIndex][6],self.objectsList[self.itemIndex][7],self.objectsList[self.itemIndex][8],self.objectsList[self.itemIndex][9]])
                    if self.objectsList[self.itemIndex][0]=="launchEventObject":
                        self.instancesList.append([self.objectsList[self.itemIndex][0],self.objectsList[self.itemIndex][1],self.objectsList[self.itemIndex][2],self.objectsList[self.itemIndex][3],self.objectsList[self.itemIndex][4],self.objectsList[self.itemIndex][5],self.objectsList[self.itemIndex][6],self.objectsList[self.itemIndex][7],self.objectsList[self.itemIndex][8],self.objectsList[self.itemIndex][9],self.objectsList[self.itemIndex][10],self.objectsList[self.itemIndex][11]])
                    if self.objectsList[self.itemIndex][0]=="enemy":
                        self.instancesList.append([self.objectsList[self.itemIndex][0],self.objectsList[self.itemIndex][1],self.objectsList[self.itemIndex][2],self.objectsList[self.itemIndex][3],self.objectsList[self.itemIndex][4],self.objectsList[self.itemIndex][5],self.objectsList[self.itemIndex][6],self.objectsList[self.itemIndex][7],self.objectsList[self.itemIndex][8],self.objectsList[self.itemIndex][9],self.objectsList[self.itemIndex][10],self.objectsList[self.itemIndex][11]])
                if self.objectsList[self.itemIndex][1]!=None:
                    screen.blit(self.objectsList[self.itemIndex][1],(self.objectsList[self.itemIndex][2]-self.Camera.x,self.objectsList[self.itemIndex][3]-self.Camera.y),(self.objectsList[self.itemIndex][6][0][0],self.objectsList[self.itemIndex][6][0][1],self.objectsList[self.itemIndex][6][0][2],self.objectsList[self.itemIndex][6][0][3]))
            clock.tick(60)
            pygame.display.flip()
        pygame.quit

l=Main([960,544])
l.main()