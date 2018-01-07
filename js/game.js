// TODO: [X]Ajouter message erreur à l'intro si nom incorrect
// TODO: [X]Ajouter random au gold/xp
// TODO: [X]Ajouter random aux attaques
// TODO: [X]Ajouter locked locations
// TODO: []Ajouter level bonus (health/attack)
// TODO: []Ajouter Contenu

//CONSTANTS
var fadingTime=500;

var game={
    state:"introduction",
    log:[],
    updateObj:undefined,
    init:function(){
        //initialize
        this.updateLocations();
    },
    
    update:function(){
        //check if showed values are correct
        player.hp=between(player.hp,0,player.totalHp)
        player.xp=between(player.xp,0,player.totalXp)
        
        //level up
        if(player.xp>=player.totalXp){
            player.level++;
            player.xp=0;
            player.totalXp=Math.floor(10*Math.pow(1.2,player.level-1));
            game.updateLocations();
        }
        
        if(player.state=="battle"){
            player.enemy.hp=between(player.enemy.hp,0,player.enemy.totalHp);   
        }
        
        this.updateText();
    },
    
    updateText:function(){
        //update player text
        var healthBar=Math.floor((player.hp/player.totalHp)*100);
        $(".healthBar").width(healthBar+"%");
        
        id("playerHp",player.hp)
        id("playerTotalHp",player.totalHp)
        
        id("playerWeapon",player.weapon.name)
        id("playerAtk",player.weapon.atk)
        
        id("playerArmor",player.armor.name)
        id("playerDef",player.armor.def)
        
        id("playerGold",player.gold)
        
        id("playerLevel",player.level)
        
        var xpBar=Math.floor((player.xp/player.totalXp)*100);
        
        $(".xpBar").width(xpBar+"%")
        id("playerXp",player.xp)
        id("playerTotalXp",player.totalXp)
        
        //update location text
        id("locationName1",capitalize(player.location.name))
        id("locationDesc",capitalize(player.location.description))
        
        var logs="";
        while(game.log.length>6){
            game.log.splice(0,1);    
        }
        
        for(var i=0;i<game.log.length;i++){
            logs+=game.log[i]+"<br>";
        }
        id("locationLog",logs);
        
        id("locationName2",player.location.name)
        
        //event
        if(player.state=="battle"){
            
            $("#eventActive").css("display","inline-block");
            $("#exploreButton").addClass("hide");
            
            id("eventTitle","Fighting "+player.enemy.name);
            
            console.log(player.name)
            id("nameFirst",capitalize(player.name));
            id("descFirst","You");
            
            id("hpFirst",'('+player.hp+'/'+player.totalHp+')');
            
            
            
            var enemyBar=Math.floor((player.enemy.hp/player.enemy.totalHp)*100);
            $(".enemyBar").width(enemyBar+"%");
            
            id("weaponFirst",player.weapon.name+" ("+player.weapon.atk+" atk)");
            id("armorFirst",player.armor.name+" ("+player.armor.def+" def)");
            
            id("nameSecond",capitalize(player.enemy.name));
            id("descSecond",player.enemy.desc);
            id("hpSecond",'('+player.enemy.hp+'/'+player.enemy.totalHp+')');
            
        }else{
            $("#eventActive").css("display","none");
            if(player.location.events!=undefined){
                $("#exploreButton").removeClass("hide");
            }else{
                $("#exploreButton").addClass("hide");
            }
        }
        
        
        
    },
    
    updateLocations:function(){
        //events
        $("#eventsList").html("");
        if(player.location.customs!=undefined){
            for (var i=0;i<player.location.customs.length;i++){
                var event=player.location.customs[i];
                
                var functionCalled="";
                
                var valid=true;
                if(event[5]==1){
                    valid=false;
                }
                
                if(event[1]=="heal"){
                    var gold=event[2];
                    var heal=event[3];
                    functionCalled="heal("+gold+","+heal+")";
                }
                
                if(event[1]=="buy"){
                    var item=JSON.stringify(event[4]);
                    var xp=event[3];
                    var gold=event[2];
                    functionCalled="buy("+gold+","+item+","+xp+")";
                }
                
                if(valid){
                    $("#eventsList").append(
                    "<button class='button buttonBlue' onclick='"+functionCalled+"'>"+event[0]+"</button><br>")
                }
                
            }
        }
        
        
        //locations
        $("#locationList").html("");
        
        var locked=false;
        
        for (var property in locations) {
            if (locations.hasOwnProperty(property) && player.location!=locations[property] && locked==false) {
                if(locations[property].level>player.level){
                    locked=true;
                    $("#locationList").append(
                    "<button class='locked button buttonGreen'>"+capitalize(locations[property].name)+" (Locked until level "+locations[property].level+")</button><br>")
                }else{
                    $("#locationList").append(
                    "<button class='button buttonGreen' onclick='changeLocation(\""+property+"\")'>"+capitalize(locations[property].name)+"</button><br>")
                }
                
            }
        }
        
        
    }
}

var player={
    name:"",
    state:"free",
    location:locations.village,
    enemy:undefined,
    hp:10,
    totalHp:10,
    
    weapon:{
        name:"Fists",
        atk:2,
    },
    
    armor:{
        name:"Leather clothes",
        def:1,
    },
    
    gold:10,
    
    level:1,
    xp:0,
    totalXp:10,
}


function explore(){
    if(player.state=="free"){
        var rand=ran(0,100);
        
        var loc=player.location;
        var event=undefined;
        for(var i=0;i<loc.events.length;i++){
            if(rand<=loc.events[i][2]){
                event=loc.events[i];
                break;
            }
        }
        if(event!=undefined){
            if(event[0]=="enemy"){
                $("#eventAttack,#eventRun,#hpFirstAll,#hpSecondAll").removeClass("hide");
                player.state="battle";
                player.enemy=event[1];
                game.log.push("You have encountered <b>"+event[1].name+"</b>!");

                fadeInDiv("eventActive",fadingTime);
            }
        }else{
            game.log.push("You found nothing.");
        }
        
        game.update();
    }   
}


function attack(){
    if(player.state=="battle"){
        //player attack
        var variableDmg=Math.ceil(ran(-player.weapon.atk/4,player.weapon.atk/4));
        
        var dmg=variableDmg+player.weapon.atk-player.enemy.def;
        if(dmg<0){dmg=0;}
        var enemyDead=false;
        var playerDead=false;
        player.enemy.hp-=dmg;
        if(player.enemy.hp<=0){
            //defeated
            enemyDead=true;
            //random xp/gold
            var tempXp=Math.ceil(ran(-player.enemy.xp/4,player.enemy.xp/4)+player.enemy.xp);
            if(tempXp<0){
                tempXp=0;
            }
            
            var tempGold=Math.ceil(ran(-player.enemy.gold/4,player.enemy.gold/4)+player.enemy.gold);
            if(tempGold<0){
                tempGold=0;
            }
            
            player.xp+=tempXp;
            player.gold+=tempGold;
            
            game.log.push("<b>"+capitalize(player.enemy.name)+"</b> was defeated! You gained <b>"+tempXp+"</b> xp and <b>"+tempGold+"</b> gold!")
            
            
            $("#eventActive").fadeOut(fadingTime,function(){
                player.enemy.hp=player.enemy.totalHp;
                player.state="free";
                game.update();
            })
            
        }
        
        if(!enemyDead){
            //enemy attack
            var variableEneDmg=Math.ceil(ran(-player.enemy.atk/4,player.enemy.atk/4));
            var eneDmg=player.enemy.atk-player.armor.def;
            if(eneDmg<0){eneDmg=0;}
            player.hp-=eneDmg;
            if(player.hp<=0){
                //defeated
                playerDead=true;
            }
            
            if(!playerDead){
                game.log.push("You dealt <span class='dmg'>"+dmg+"</span> damage to <b>"+player.enemy.name+"</b>.")
                game.log.push("You received <span class='dmg'>"+eneDmg+"</span> damage!")
            }else{
                //player dead
            }
        }
        
        
        game.update();
    }
}


function run(){
    $("#eventActive").fadeOut(fadingTime,function(){
        player.enemy.hp=player.enemy.totalHp;
        player.state="free";
        game.log.push("You ran away from the fight.")
        game.update();
    })
}


function changeLocation(location){
    if(player.state=="free"){
        $("#change").fadeOut(fadingTime);
        $("#location").fadeOut(fadingTime,function(){
            if(player.location!=locations[location]){
               game.log.push("You travelled to "+locations[location].name+".");
            }
            player.location=locations[location];
            game.updateText();
            game.updateLocations();
            $("#location").fadeIn(fadingTime);
            $("#change").fadeIn(fadingTime);
        })
    }
}



function introVerify(){
    var name= $("#introName").val();
    if(verifierString(name)){
        player.name=name;
        
        $("#playerName").html(capitalize(name));
        fadeOutInDiv("introduction","player,#location,#event,#change",fadingTime)

        game.updateText();
        game.updateObj=setInterval(game.update.bind(game),1000);
    }else{
        document.getElementById("introName").focus();
        $("#introError").html("Invalid name");
    }
}



//events

function heal(gold,hp){
    if(player.gold>=gold){
        player.gold-=gold;
        player.hp+=hp;
        game.log.push("You healed <span class='dmg'>"+hp+"</span> hp for <b>"+gold+"</b> gold!")
    }else{
        game.log.push("You don't have enough gold.")
    }
    game.update();
}


function buy(gold,item,xp){
    if(player.gold>=gold){
        player.gold-=gold;
        if(item!=undefined){
            var objItem=item;
            if(objItem.atk!=undefined){
                player.weapon=objItem;
            }else{
                player.armor=objItem;
            }
            game.log.push("You equipped "+objItem.name+" for <b>"+gold+"</b> gold!");
            //remove event?
            for(var i=0;i<player.location.customs.length;i++){
                var custom=player.location.customs[i]
                if(custom[4]!=undefined){
                    if(custom[4].name==objItem.name && custom[5]==0){
                        custom[5]=1;
                        break;
                    }
                }
            }
            game.updateLocations();
        }else{
            player.xp+=xp;
            game.log.push("You gained <b>"+xp+"</b> xp for <b>"+gold+"</b> gold!")
        }
    }else{
        game.log.push("You don't have enough gold.")
    }
    game.update();
}



function fadeOutInDiv(id,id2,dur,delay){
    var del=0;
    if(delay!=undefined){del=delay;}
    $("#"+id).fadeOut(dur).delay(del).queue(function(){
        $("#"+id2).fadeIn(dur);
    });
}

function fadeOutDiv(id,dur){
    $("#"+id).fadeOut(dur);
}

function fadeInDiv(id,dur){
    $("#"+id).fadeIn(dur);
}

function id(id,val){
    $("#"+id).html(val);
}

function between(val,min,max){
    if(val<min){val=min}
    if(val>max){val=max}
    return val;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function ran(min,max){
    {return Math.floor(Math.random()*(max-min+1)+min);}
}

function verifierString(str){
    var regex=/^\S/;
    var vide=false;
    if(str!="" && regex.exec(str)){
        vide=true;
    }
    return vide;
}

game.init();