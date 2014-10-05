/*
 * Game.js
 * 
 * Controls the fantasy-world portion of the game
 * The main scene is the game "scene" which contains 
 * both a background layer and a Gameplay layer
 *
 */
 
 /*
 * game scene, contains the layers for this gamess.
 */
var game = cc.Scene.extend({ //setting up the scene object
	ctor:function(difficulty, characters) { //construct an instance of this game scene
		this._super();
		
		//create the object that contains all the levels
		this.levelContainer = new this.LevelContainer(this.LevelConstructor);
	},
	
	// initialize the space of chipmunk
    initPhysics:function() {
		//use these variables for setting up the scene
		var g_groundHeight = 57;
		var g_runnerStartX = 80;
	
        //make the space object where all the physics components of the world reside
        this.space = new cp.Space();
        //add gravity to the physical space
        this.space.gravity = cp.v(0, -350);

        // make floor objects
        var wallBottom = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, g_groundHeight),// start point
            cp.v(4294967295, g_groundHeight),// MAX INT:4294967295
            0);// thickness of wall
        this.space.addStaticShape(wallBottom);
    },
	
	//Level class, contained within levelContainer, has all of the properties of each level
	LevelConstructor: cc.Sprite.extend({ 
		//initialize this object, save the background for this level
		ctor:function(background){
			this._super();
			this.initWithFile(background);
			this._background = background;
		},
		
		//return the background for this level, used so that the background layer can access
		//the background
		getBackground:function(){
			return this._background
		}
	}),
	
	//creates and holds all of the level objects
	LevelContainer: cc.Node.extend({
		//initialize this instance and create all of the levels
		ctor:function(LevelConstructor){
			this.levels = []; //create the level array
			this.levels.push(new LevelConstructor("Assets/art/real/sprites/dialogue_box.png"));
			this.levels.push(new LevelConstructor("Assets/art/fantasy/Sketches/IMAG0786_1.jpg"));
			this.levels.push(new LevelConstructor("Assets/art/real/backgrounds/background.png"));
			
		},
		
		//return the level at this index, unless the index is out of range.
		getLevel:function(index){
			//if the index is out of range, put the index in range and then return the object
			//at the in range index
			if(index <0){
				index = 0;
			}
			else if(index > this.levels.length-1){
				index = this.levels.length-1;
			}
			return this.levels[index]
		}
	}),
	
	//Set up the current level, use the this.level variable to find out which level should be
	//set up, get the level object and pass it to both layers
	levelSetup:function(){
		var levelDetails = this.levelContainer.getLevel(this.level); //get constructor from container
		this.backgroundLayer.setLevel(levelDetails);//set the backgroundLayer
		
		this.gameplayLayer.setLevel(levelDetails);//set the gameplayLayer
	},
	
	//go to the next level
	increaseLevel:function(){
		this.level++; //increment level value
		this.levelSetup(); //setup the new level
	},
	
	//go to the previous level
	decreaseLevel:function(){
		this.level--; //decrement level value
		this.levelSetup(); //setup previous level
	},
	
	//Set up the layers and add them as children to the game scene
	onEnter:function(){ //this is called right after ctor	
		this._super();		
		this.initPhysics();
		
		this.level = 0; //have the level start out as 0
		
		this.gameplayLayer = new ActionsgameplayLayer();
		this.backgroundLayer = new FantasyBackgroundLayer();
		this.addChild(this.backgroundLayer);
		this.addChild(this.gameplayLayer); 
	}
 });
 
//this is the layer where all the actual gameplay happens
var ActionsgameplayLayer = cc.Layer.extend ({
	player:null, //our reference to the player
	
	//Constructor setup the game space
	ctor:function(){
		this._super();
		
		var winSize = cc.director.getWinSize(); //used later in calculations

		//add physics to the world
		this.space = new cp.Space();
		this.space.gravity = cp.v(0,-200); //set the gravity
		
		this.lastClick = Date.now() - 100; //get time of last click used to determine if the player
		//should jump, or just moce
		
		this.makePlayer(); //create the player
		
		this.scheduleUpdate(); //tell cocos to routinely call update function
		
		//add the event listeners
		cc.eventManager.addListener ({ 
		
			//mouse event listener, key method of player interaction. One click means move to 
			//click location. Two clicks means jump
			event: cc.EventListener.MOUSE,
			onMouseDown: function(event) {
				var now = Date.now();
				
				if(this.lastJump == null){
					cc.log("setting lastjump");
					this.lastJump = now;
				}
				
				if ((now - this.lastClick) < 1000 && (now - this.lastJump) > 1000){
					this.lastJump = now;
					event.getCurrentTarget().jumpIt(event.getLocation());
				}
				else{
					event.getCurrentTarget().moveIt(event.getLocation());
				}
				this.lastClick = now;
			}
		},this);
		
		
		this.space.addCollisionHandler( 1, 2,
			this.collisionBegin.bind(this),
			this.collisionPre.bind(this),
			this.collisionPost.bind(this),
			this.collisionSeparate.bind(this)
			);
		
		this.initFrame("down");
		
		
	},
	
	
	
	setLevel:function(levelDetails){ //set the new level details
		//set up all the enemies
		
		//set up all the obstacles
	},

	onExit : function() {
		this.space.removeCollisionHandler( 1, 2 );
	},
	
	collisionBegin : function ( arbiter, space ) {

		var shapes = arbiter.getShapes();
		var collTypeA = shapes[0].collision_type;
		var collTypeB = shapes[1].collision_type;
		return true;
	},

	collisionPre : function ( arbiter, space ) {
		return true;
	},

    collisionPost : function ( arbiter, space ) {
	},

    collisionSeparate : function ( arbiter, space ) {
    },
	
	makeFireball:function(){
		var g_groundHeight = 57; //position of ground
		
		this.fireBall = new cc.PhysicsSprite("src/grossini.png"); //loading in the sprite
		var contentSize = this.fireBall.getContentSize();
		contentSize.width = 100;
		contentSize.height = 100;

		this.fireBody = new cp.Body(1, cp.momentForBox(1, contentSize.width, contentSize.height));
        //3. set the position of the runner
        this.fireBody.p = cc.p(600, g_groundHeight + contentSize.height / 2);
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
	
	createPhysicsSprite : function( pos, file, collision_type ) {
		var body = new cp.Body(1, cp.momentForBox(1, 48, 108) );
		body.setPos(pos);
		this.space.addBody(body);
		var shape = new cp.BoxShape( body, 48, 108);
		shape.setElasticity( 0.5 );
		shape.setFriction( 0.5 );
		shape.setCollisionType( collision_type );
		this.space.addShape( shape );

		var sprite = new cc.PhysicsSprite(file);
		sprite.setBody( body );
		return sprite;
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
			this.player.stopAllActions(); //prevent double movement [uber bad]
			this.player.fixedHeight = this.player.y; //set the fixed player height, the bottom point in jump
			p.y = this.player.fixedHeight; //fix the player's y position
			
			var jumps = (Math.abs(this.player.x - p.x) )/1000
			var action = cc.MoveTo.create(2*jumps,p);
			this.player.runAction(action);
		}
	},
	jumpIt:function(p) { //functionality for jumping. Launch the player in the air, but do not
		//change their x coordinates
		if(this.player.canMove){
			this.player.stopAllActions(); //prevent double movement [uber bad]
			this.player.fixedHeight = this.player.y + 500; //set the fixed player height, the bottom point in jump
			p.y = this.player.fixedHeight; //fix the player's y position
			p.x = this.player.x
			//jumping added
			var jumps = (Math.abs(this.player.x - p.x) )/1000
			var action = cc.MoveTo.create(jumps + 1,p);
			this.player.runAction(action);
		}
	}
 });
 
//background layer. Controls the background layer in the fantasy world
var FantasyBackgroundLayer = cc.Layer.extend({
	ctor:function() {
		this._super();
		this.helloworld = cc.Sprite.create("../Assets/art/real/sprites/dialogue_box.png");
		this.helloworld.x = cc.director.getWinSize().width/2;
		this.helloworld.y = cc.director.getWinSize().height/2;
		this.addChild(this.helloworld);
	},
	
	setLevel:function(levelDetails){//set up the new level with the levelDetails passed
		this.removeChild(this.helloworld);
		this.helloworld = cc.Sprite.create(levelDetails.getBackground());
		this.helloworld.x = cc.director.getWinSize().width/2;
		this.helloworld.y = cc.director.getWinSize().height/2;
		this.addChild(this.helloworld);
	}
 });


/*
 *
 * EVERY THING ABOVE IS CODING SPACE FOR WILL
 *
 * EVERY THING BELOW IS CODING SPACE FOR COREY
 *
 */
 
var rect = function(x,y,w,h) {
	var n = cc.Node.create();
	n.x = x;
	n.y = y;
	n.w = w;
	n.w = h;
	return n;
};
 
function rectCollision(r1, r2) {
	return !(r2.x > r1.x + r1.w || 
     r2.x + r2.w < r1.x || 
     r2.y + r2.h > r1.y ||
     r2.y < r1.y + r1.h);
}

var myTestScene = cc.Scene.extend({
	ctor: function() {
		this._super();
		var a = createTest();
		a.x = 800;
		a.y = 300;
		this.addChild(a);
	}
})
 
customAction = cc.Node.extend({
	ctor: function(obj) {
		this._super();
		this._run = false;
		this.frame = 0;
		this.target = obj.target;
		this._update = obj.update;
		this.animate = obj.animate;
		this.onenable = obj.onenable;
		this.ondisable = obj.ondisable;
		this.start = function() {
			this._run = true;
			this.target.currentAction = this;
			this.onenable();
		}
		this.stop = function() {
			this.frame = 0;
			this._run = false;
			this.ondisable();
		}
		this.scheduleUpdate();
	},
	update: function() {
		if(this._run) {
			this.frame++;
			this._update();
		}
	}
});
 
function createTest() {
	
	var testIdle = cc.Animation.create();
	testIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_0.png" );
	testIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_1.png" );
	testIdle.setDelayPerUnit(1 / 24);
	
	var testAttack = cc.Animation.create();
	testAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_0.png" );
	testAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_1.png" );
	testAttack.setDelayPerUnit(1 / 24);
	
	var testWalk = cc.Animation.create();
	testWalk.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_0.png" );
	testWalk.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_1.png" );
	testWalk.setDelayPerUnit(1 / 24);
	
	var testAI = cc.Node.extend({
		currentAction: null,
		data:{},
		ctor: function(animations, entity) {
			this._super();
			
			this.idle = new customAction({
				update: function() {},
				onenable: function() {},
				ondisable: function() {},
				animate: function() {
					this.target.animator.play("idle");
				},
				target:this
			});
			this.walk = new customAction({
				update: function() {
					// move forward 3px
					this.target.entity.x += (this.target.entity.scaleX) * 5;
				},
				onenable: function() {
					// turn them around
					this.target.entity.scaleX *= -1;
				},
				ondisable: function() {},
				animate: function() {
					this.target.animator.play("walk");
				},
				target:this
			}),
			this.attack = new customAction({
				update: function() {
					if(this.frame == 1) {
						this.hitbox = this.target.entity.hitbox.addCollider(0,-30,60,60);
					}
				},
				onenable: function() {},
				ondisable: function() {
					this.target.entity.hitbox.removeChild(this.hitbox);
				},
				animate: function() {
					this.target.animator.play("attack");
				},
				target:this
			}),
			
			this.addChild(this.idle);
			this.addChild(this.walk);
			this.addChild(this.attack);
			
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.addChild( this.animator );
			
			this.main();
		},
		
		main: function() {
			// this is the base case
			// callback is called at the end of every animation
			// this.entity
			// this.animator
			// collisionMaster.enemies and collisionMaster.characters 
			this.data.count = 0;
			this.idle.start();
			this.callback()
		},
		
		callback: function() {
			// this function is called after an animation 
			// that was called is finished
			this.currentAction.animate();
			this.data.count ++;
			if(this.data.count == 0) {
				this.currentAction.stop();
				this.idle.start();
			} else if (this.data.count == 3) {
				this.currentAction.stop();
				this.walk.start();
			} else if(this.data.count == 25) {
				this.currentAction.stop();
				this.attack.start();
				this.data.count = -1;
			}
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
	hitbox:null,
	hurtbox:null,
	ctor: function(args) {
		this._super();
		
		this.health = new HealthConstructor(args.health, this);
		this.addChild(this.health);
		
		this.controller = new args.controller(args.animations, this);
		this.addChild(this.controller);
		
		this.hitbox = new ColliderConstructor("hitbox", this);
		this.addChild(this.hitbox);
		
		this.hurtbox = new ColliderConstructor("hurtbox", this);
		this.addChild(this.hurtbox);
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
	play: function(animationName) {
		if(!animationName in this.animations) {
			console.log("No animation by the name " + animationName);
			return;
		}
		this.stopActionByTag(this.__animation_tag);
		var anim = cc.Animate.create(this.animations[animationName]);
		var seq = cc.sequence(
			anim,
			cc.callFunc(this.controller.callback, this.controller)
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
		this.getActionByTag(this.__animation_tag)._actions[0].setDelayPerUnit(1 / 24);
	}
});

var ColliderConstructor = cc.Node.extend({
	type: null,
	entity: null,
	ignored: null,
	ctor: function(t, entity) {
		this.entity = entity;
		if(t == "hitbox") {
			this.type = false;
		} else {
			this.type = true;
		}
		this._super();
		this.ignored = [];
	},
	addCollider: function(nodeorx,y,w,h) {
		if(typeof nodeorx == "number") {
			var n = rect(nodeorx,y,w,h);
			this.addChild(n);
			return n;
		} else {
			this.addChild(nodeorx)
			return nodeonx;
		}
	},
	removeCollider: function(node) {
		this.removeChild(node);
		node.cleanup();
	},
	getAll: function() {
		return this._children;
	},
	hit: function(collider, damage) {
		if(collider.__instanceId in this.ignored) return;
		if(this.type) {
			this.entitiy.health.damage(damage);
		}
		this.ignored.push(collider.__instanceId);
	},
});

