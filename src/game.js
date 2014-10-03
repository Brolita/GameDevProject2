/*
 *
 *
 *
 */
 
var GAME_DEBUG_MODE = false;
 
var game = cc.Scene.extend({ //setting up the scene object
	ctor:function(difficulty, characters) { //the scene constructor
		this._super();
	},
	
	// init space of chipmunk
    initPhysics:function() {
		var g_groundHight = 57;
		var g_runnerStartX = 80;
	
        //1. new space object 
        this.space = new cp.Space();
        //2. setup the  Gravity
        this.space.gravity = cp.v(0, -350);

        // 3. set up Walls
        var wallBottom = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, g_groundHight),// start point
            cp.v(4294967295, g_groundHight),// MAX INT:4294967295
            0);// thickness of wall
        this.space.addStaticShape(wallBottom);
    },
	
	onEnter:function(){ //this is called right after ctor, generate layers here	
		this._super();		//var fanatsyBackground = new FantasyBackgroundLayer();
		this.initPhysics();
		
		var demoLayer = new ActionsDemoLayer();
		var backgroundLayer = new FantasyBackgroundLayer();
		this.addChild(backgroundLayer);
		this.addChild(demoLayer); 
	}
 });
 
 

 var ActionsDemoLayer = cc.Layer.extend ({
	player:null, //our reference to the player
	ctor:function(){
		this._super();
		//add physics to the world
		this.space = new cp.Space();
		
		this.space.gravity = cp.v(0,-200);
		
		this.makePlayer();
		this.makeFireball();
		
		
		this.scheduleUpdate();
		
		cc.eventManager.addListener ({ //whenever you click, move the character to that position
			event: cc.EventListener.MOUSE,
			onMouseDown: function(event) {
				event.getCurrentTarget().moveIt(event.getLocation());
			}
		},this);
		
		this.initFrame("down");
	},
	
	makeFireball:function(){
		var g_groundHeight = 57; //position of ground
		
		this.fireBall = new cc.PhysicsSprite("src/grossini.png"); //loading in the sprite
		var contentSize = this.fireBall.getContentSize();
		contentSize.width = 100;
		contentSize.height = 100;
		cc.log("contentSize.width: " + contentSize.width + " contentSize.height: " + contentSize.height);
        
		this.fireBody = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
        //3. set the position of the runner
        this.fireBody.p = cc.p(80, g_groundHeight + contentSize.height / 2);
        //5. add the created body to space
        this.space.addBody(this.fireBody);
        this.fireShape = new cp.BoxShape(this.fireBody, contentSize.width - 14, contentSize.height);
        //7. add shape to space
        this.space.addShape(this.fireShape);
        this.fireBall.setBody(this.fireBody);
		this.addChild(this.fireBall); //Make the player sprite part of the scene heirarchy
		
		this.fireBody.p.y = 999;
		
	},
	
	makePlayer:function(){
		var g_groundHeight = 57; //position of ground
		
		this.player = new cc.PhysicsSprite("src/grossini.png"); //loading in the sprite
		var contentSize = this.player.getContentSize();
		contentSize.width = 100;
		contentSize.height = 100;
		cc.log("contentSize.width: " + contentSize.width + " contentSize.height: " + contentSize.height);
        
		this.playerBody = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
        //3. set the position of the runner
        this.playerBody.p = cc.p(80, g_groundHeight + contentSize.height / 2);
        //5. add the created body to space
        this.space.addBody(this.playerBody);
        this.playerShape = new cp.BoxShape(this.playerBody, contentSize.width - 14, contentSize.height);
        //7. add shape to space
        this.space.addShape(this.playerShape);
        this.player.setBody(this.playerBody);
		this.addChild(this.player); //Make the player sprite part of the scene heirarchy
		
	},
	
	initFrame:function(dirFrom){		
		//create a floor
		var floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, cp.v(0, 0), cp.v(1100, 0), 0));
        floor.setElasticity(1);
        floor.setFriction(1);
		
		switch(dirFrom){
			case "down":
				this.player.setPosition(600,600); //put him in the corner
				break;
			case "right":
				this.player.setPosition(110,70); //put him in the corner
				break;
			case "left":
				this.player.setPosition(900,70); //put him in the corner
				break;
		}
		this.player.canMove = true //whether or not the player can move, prevents double movement
		
		
		
		
	
	},
	
	update:function(dt){
		if(this.player.y < -200){//transition down
			this.initFrame("down");
		}
		if(this.player.x > 1000){ //transition right
			this.initFrame("right");
		}
		else if(this.player.x < 100){ //transition left
			this.initFrame("left")
		}
		this.space.step(dt);
	},
	moveIt:function(p) { //functionality for moving
		if(this.player.canMove){
			cc.log("this.player.x:" + this.player.x + " this.player.y:" + this.player.y);
			this.player.stopAllActions(); //prevent double movement [uber bad]
			this.player.fixedHeight = this.player.y; //set the fixed player height, the bottom point in jump
			//console.log("this.player.fixedHeight:" + this.player.fixedHeight + " this.player.y" + this.player.y);
		
		
			//console.log("before alteration p.x: " + p.x + " p.y: " + p.y);
			p.y = this.player.fixedHeight; //fix the player's y position
			
			var jumps = (Math.abs(this.player.x - p.x) )/100
			//console.log("after alteration p.x: " + p.x + " p.y: " + p.y);
			
			var action = cc.MoveTo.create(2*jumps,p);
			this.player.runAction(action);
		}
	}
 });
 
var FantasyBackgroundLayer = cc.Layer.extend({
	ctor:function() {
		this._super();
		var helloworld = cc.Sprite.create("../Assets/art/real/sprites/dialogue_box.png");
		helloworld.x = cc.director.getWinSize().width/2;
		helloworld.y = cc.director.getWinSize().height/2;
		this.addChild(helloworld);
	}
 });
 

//copied directly from demo code

var TestScene = cc.Scene.extend({
    ctor:function (bPortrait) {
        this._super();
        this.init();

        var label = cc.LabelTTF.create("Main Menu", "Arial", 20);
        var menuItem = cc.MenuItemLabel.create(label, this.onMainMenuCallback, this);

        var menu = cc.Menu.create(menuItem);
        menu.x = 0;
        menu.y = 0;
        menuItem.x = winSize.width - 50;
        menuItem.y = 25;

        if(!window.sideIndexBar){
            this.addChild(menu, 1);
        }
    },
    onMainMenuCallback:function () {
        var scene = cc.Scene.create();
        var layer = new TestController();
        scene.addChild(layer);
        var transition = cc.TransitionProgressRadialCCW.create(0.5,scene);
		
		var ts = new TestScene();
		
        director.runScene(ts);
    },

    runThisTest:function () {
        // override me
    }

});

/*var ClickAndMoveTestScene = TestScene.extend({
    runThisTest:function () {
        var layer = new MainLayer();

        this.addChild(layer);
        director.runScene(this);
    }
});	*/


//end direct copy from click demo
 
 var FantasyParallaxLayer;
 var FantasyInteractiveLayer; 
 
/*
 *
 *
 *
 *
 *
 */
 
 
var gameMaster = {
	enemies: [],
	characters: [],
	collision: function() {
		//for each i, enemy and j, characters
		for (var i in enemies) { 
			for (var j in characters) {
				var enemy = this.enemies[i];
				var characters = this.characters[j];
				for(var k in enemy.hitbox.getAll()) { 
					for( var l in character.hurtbox.getAll()) {
						var hitbox = enemy.hitbox.getAll()[k];
						var hurtbox = character.hurtbox.getAll()[l];
						// here check if hitbox hits hurtbox, and if
						// so, call hit on both of them
						
					}
				}
				for(var k in enemy.hurtbox.getAll()) { 
					for( var l in character.hitbox.getAll()) {
						var hitbox = character.hitbox.getAll()[k];
						var hurtbox = enemy.hurtbox.getAll()[l];
						// here check if hitbox hits hurtbox, and if
						// so, call hit on both of them
						
					}
				}
			}
		}
	}
}
 
 
 
