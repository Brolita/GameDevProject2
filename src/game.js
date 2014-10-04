/*
 *
 *
 *
 */
 
var GAME_DEBUG_MODE = false;
 
var game = cc.Scene.extend({ //setting up the scene object
	ctor:function(difficulty, characters) { //the scene constructor
		this._super();
		this.levelContainer = new this.LevelContainer(this.LevelConstructor);
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
	
	LevelConstructor: cc.Sprite.extend({ //Level class, controlled by levelContainer
		ctor:function(background){
			this._super();
			this.initWithFile(background);
			this._background = background;
			console.log("this._background = " + this._background);
		},
		
		getBackground:function(){
			return this._background
		}
	}),
	
	LevelContainer: cc.Node.extend({
		ctor:function(LevelConstructor){
			this.levels = [];
			
			console.log("this.levelConstructor:" + LevelConstructor);
			this.levels.push(new LevelConstructor("Assets/art/real/sprites/dialogue_box.png"));
			this.levels.push(new LevelConstructor("Assets/art/fantasy/Sketches/IMAG0786_1.jpg"));
			this.levels.push(new LevelConstructor("Assets/art/real/backgrounds/background.png"));
			
		},
		
		getLevel:function(index){//return the level information, do not allow for index errors
			if(index <0){
				index = 0;
			}
			else if(index > this.levels.length-1){
				index = this.levels.length-1;
			}
			return this.levels[index]
		}
	}),
	
	
	levelSetup:function(){
		var levelDetails = this.levelContainer.getLevel(this.level); //get constructor from container
		cc.log("levelDetails.getBackground" + levelDetails.getBackground());
		
		this.backgroundLayer.setLevel(levelDetails);//set the backgroundLayer
		
		this.demoLayer.setLevel(levelDetails);//set the demoLayer
	},
	
	increaseLevel:function(){
		this.level++;
		this.demoLayer.level = this.level;
		this.levelSetup();
	},
	
	decreaseLevel:function(){
		this.level--;
		this.demoLayer.level = this.level;
		this.levelSetup();
	},
	
	onEnter:function(){ //this is called right after ctor, generate layers here		
		this._super();		//var fanatsyBackground = new FantasyBackgroundLayer();
		this.initPhysics();
		
		this.level = 0;
		
		this.demoLayer = new ActionsDemoLayer();
		this.backgroundLayer = new FantasyBackgroundLayer();
		this.addChild(this.backgroundLayer);
		this.addChild(this.demoLayer); 
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
	
	setLevel:function(levelDetails){ //set the new level details
		//set up all the enemies
		
		//set up all the obstacles
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
		cc.log("level:" + this.level);
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
			this.parent.increaseLevel();//this.level += 1;
			this.initFrame("down");
		}
		if(this.player.x > 1000){ //transition right
			this.parent.increaseLevel();//this.level += 1;
			this.initFrame("right");
		}
		else if(this.player.x < 100){ //transition left
			this.parent.decreaseLevel();
			this.initFrame("left");//this.level -= 1;
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
			
			var jumps = (Math.abs(this.player.x - p.x) )/1000
			//console.log("after alteration p.x: " + p.x + " p.y: " + p.y);
			
			var action = cc.MoveTo.create(2*jumps,p);
			this.player.runAction(action);
		}
	}
 });
 
var FantasyBackgroundLayer = cc.Layer.extend({
	ctor:function() {
		this._super();
		this.helloworld = cc.Sprite.create("../Assets/art/real/sprites/dialogue_box.png");
		this.helloworld.x = cc.director.getWinSize().width/2;
		this.helloworld.y = cc.director.getWinSize().height/2;
		this.addChild(this.helloworld);
	},
	
	setLevel:function(levelDetails){//set up the new level
		this.removeChild(this.helloworld);
		this.helloworld = cc.Sprite.create(levelDetails.getBackground());
		cc.log("this.helloworld = " + this.helloworld);
		this.helloworld.x = cc.director.getWinSize().width/2;
		this.helloworld.y = cc.director.getWinSize().height/2;
		this.addChild(this.helloworld);
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
 * EVERY THING ABOVE IS CODING SPACE FOR WILL
 *
 * EVERY THING BELOW IS CODING SPACE FOR COREY
 *
 */
 
var rect = function(x,y,w,h) {
	this._point = new cc.Point(x,y);
	this._size = new cc.Size(w,h);
	return this;
};
 

var myTestScene = cc.Scene.extend({
	ctor: function() {
		createTest();
	}
})
 
function createTest() {
	
	var testIdle = cc.Animation.create();
	testIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_0.png" );
	testIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_1.png" );
	testIdle.setDelayPerUnit( 1 / 60);
	
	var testAttack = cc.Animation.create();
	testAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_0.png" );
	testAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_1.png" );
	testAttack.setDelayPerUnit( 1 / 60);
	
	var testWalk = cc.Animation.create();
	testWalk.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_0.png" );
	testWalk.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_1.png" );
	testWalk.setDelayPerUnit( 1 / 60);
	
	var testAI = cc.Node.extend({
		idle: cc.Action.extend({
			ctor: function() {
				this._super();
			},
			update: function(dt) {
				
			}
		}),
		walk: cc.Action.extend({
			ctor: function() {
				this._super();
			},
			update: function(dt) {
				
			}
		}),
		attack: cc.Action.extend({
			ctor: function() {
				this._super();
			},
			update: function(dt) {
				
			}
		}),
		
		ctor: function() {
			this._super();
			
			ControllerConstructor(arguments[0], arguments[1], this);
		},
		
		main: function() {
			// this.entity
			// this.animator
			// collisionMaster.enemies and collisionMaster.characters 
			console.log("hello world")
			this.animator.play("idle", this.callback1, this);
		},
		
		callback1: function() {
			console.log("hello world 2.0");
		}
	});
	
	return new entity({
		health: 10,
		animations: {
			idle: testIdle,
			walk: testWalk,
			attack: testAttack,
		}, 
		controller: testAI,
		
	});
}
 
var collisionMaster = {
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

var entity = cc.Sprite.extend({
	health:null,
	controller:null,
	collider:null,
	ctor: function(args) {
		this.health = new HealthConstructor(args.health, this);
		this.addChild(this.health);
		
		this.controller = new args.controller(args.animations, this);
		this.addChild(this.controller);
		
		//this.collider = new ColliderConstructor( /*fill in args */ );
		
	}
});

var HealthConstructor = cc.Node.extend({
	_value:0,
	maxHealth:null,
	healthBar:null,
	entity:null,
	ctor:function(health, entity) {
		this.entity = entity
		this._super();
		if(health === undefined) {
			console.log("entity needs a health argument");
		}
		this.maxHealth = health;
		this._value = health;
		this.healthBar = cc.DrawNode.create();
		this.damage(0);
		this.addChild(this.healthBar);
	},
	damage:function(hit) {
		var oldratio = (this._value / this.maxHealth);
		this._value -= hit;
		var ratio = (this._value / this.maxHealth);
		this.healthBar.clear();
		this.healthBar.drawRect(
			new cc.Point(-40,100),
			new cc.Point(80*ratio - 40, 130),
			new cc.Color(255*(1 - Math.sqrt(ratio)), 255*Math.sqrt(ratio), 0, 255),
			4,
			new cc.Color(0,0,0,255)
		);
		var healthChunk = cc.DrawNode.extend({
			ctor: function() {
				this._super();
				this.cascadeColor = true;
				this.cascadeOpacity = true;
			},
			deleteSelf: cc.callFunc(this._del, this),
			_del: function() {
				this.cleanup();
			}
		});
		var h = new healthChunk();
		h.drawRect(
			new cc.Point(80*ratio - 40, 102),
			new cc.Point(80*oldratio - 40, 128),
			new cc.Color(255, 0, 0, 255),
			0,
			new cc.Color(0,0,0,0)
		);
		h.runAction( cc.sequence( cc.delayTime(.2), cc.fadeOut(.3), h.deleteSelf ) );
		this.addChild(h);
	}
});

var ControllerConstructor = function(animations, entity, AI) {
	console.log(arguments);
	AI.entity = entity;
	
	AI.animator = new AnimatorConstructor(animations, this);
	AI.addChild( AI.animator );
	
	AI.main();
}

var AnimatorConstructor = cc.Sprite.extend({
	controller: null,
	animations: null,
	__animation_tag: null,
	ctor: function(animations, controller) {
		this._super();
		this.__animation_tag = Math.floor(Math.random() * 1000000);
		this.controller = controller;
		this.animations = animations;
	},
	play: function(animationName, callbackFunction, caller) {
		if(!animationName in this.animations) {
			console.log("No animation by the name " + animationName);
			return;
		}
		console(this);
		this.stopActionByTag(this.__animation_tag);
		var seq = cc.sequence(
			cc.Animate.create(this.animations[animationName]),
			cc.callFunc(callbackFunction, caller)
		);
		seq.tag = this.__animation_tag;
		this.runAction(seq);
	},
	delay: function() {
		if(this.getActionByTag(this.__animation_tag)) {
			this.getActionByTag(this.__animation_tag)._actions[0].setDelayPerUnit(1);
			this.runAction ( cc.sequence( cc.delayTime(.05), cc.callFunc(this._unsetDelay, this) ) );
		}
	},
	_unsetDelay: function() {
		this.getActionByTag(this.__animation_tag)._actions[0].setDelayPerUnit(1 / 60);
	}
});

