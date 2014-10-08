/*
 * Game.js
 * 
 * Controls the fantasy-world portion of the game
 * The main scene is the game "scene" which contains 
 * both a background layer and a Gameplay layer
 *
 */
 
 /*
 * Test code, for reference
 */
/*
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
 
var rect = function(x,y,w,h, hit) {
	var n = cc.DrawNode.create();
	n.test = true;
	n.x = x;
	n.y = y;
	n.w = w;
	n.h = h;
	//if(hit) {
	//	n.drawRect(new cc.Point(x,y),new cc.Point(x+w, y+h),new cc.Color(255,0,0,50), 0,new cc.Color(0,0,0,0));
	//} else {
	//	n.drawRect(new cc.Point(x,y),new cc.Point(x+w, y+h),new cc.Color(255,255,0,50), 0,new cc.Color(0,0,0,0));
	//}
	return n;
};
 
function rectCollision(r1, r2) {
	if(!r1 || !r2) return false;
	var x1 = r1.convertToWorldSpace(r1).x;
	var x2 = r2.convertToWorldSpace(r2).x;
	var w1 = r1.w;
	if(r1.parent && r1.parent.entity) {
		if(Math.abs(r1.convertToWorldSpace(r1).y - r2.convertToWorldSpace(r2).y) > 50) return false;
		if(r1.parent.entity.scaleX == 1) {
			x1 += w1;
		}
	} 
	var w2 = r2.w
	if(r2.parent.entity) {
		if(r2.parent.entity.scaleX == 1) {
			x2 += w2;
		}
	} 
	
	return ((x1 <= x2 && (x2 < (x1 + w1)) || (x2 <= x1 && x1 < (x2 + w2))));
}

var myTestScene = cc.Scene.extend({
	collisionMaster: {
		enemies: [],
		characters: [],
		p_enemies: [],
		p_characters: [],
		boss:null,
		collision: function() {
			//for each i, enemy and j, characters
			for (var j = 0; j < this.characters.length; j++) {
				for (var i = 0; i < this.enemies.length; i++) { 
					var enemy = this.enemies[i];
					var character = this.characters[j];
					for( var l = 0; l < character.hurtbox.getAll().length; l++) {
						if(!enemy) {
							break;
						}
						for(var k = 0; k < enemy.hitbox.getAll().length; k++) { 
							var hitbox = enemy.hitbox.getAll()[k];
							var hurtbox = character.hurtbox.getAll()[l];
							// here check if hitbox hits hurtbox, and if
							// so, call hit on both of them
							if(rectCollision(hitbox, hurtbox) ) {
								enemy.hitbox.hit(hurtbox);
								character.hurtbox.hit(hitbox);
								character.controller.Flinch();
								//enemy.controller.animator.delay();
								if(!enemy) {
									break;
								}
							}
						}
					}
					for( var l = 0; l < character.hitbox.getAll().length; l++) {
						if(!enemy) {
							break;
						}
						for(var k = 0; k < enemy.hurtbox.getAll().length; k++) { 
							var hitbox = character.hitbox.getAll()[k];
							var hurtbox = enemy.hurtbox.getAll()[l];
							// here check if hitbox hits hurtbox, and if
							// so, call hit on both of them
							if( rectCollision(hitbox, hurtbox) ) {
								character.hitbox.hit(hurtbox);
								enemy.hurtbox.hit(hitbox);
								enemy.controller.Flinch(character);
								//character.controller.animator.delay();
								if(!enemy) {
									break;
								}
							}
						}
					}
				}
			}
			for (var j = 0; j < this.p_characters.length; j++) {
				for (var i = 0; i < this.enemies.length; i++) { 
					var enemy = this.enemies[i];
					var hitbox = this.p_characters[j];
					for( var l = 0; l < character.hurtbox.getAll().length; l++) {
						if(!enemy) {
							break;
						}
						for(var k = 0; k < enemy.hurtbox.getAll().length; k++) {
							var hurtbox = enemy.hurtbox.getAll()[l];
							// here check if hitbox hits hurtbox, and if
							// so, call hit on both of them
							if(rectCollision(hitbox, hurtbox) ) {
								hitbox.hit(hurtbox);
								enemy.hurtbox.hit(hitbox);
								enemy.controller.Flinch();
								//enemy.controller.animator.delay();
								if(!enemy) {
									break;
								}
							}
						}
					}
				}
			}
			for (var j = 0; j < this.p_enemies.length; j++) {
				for (var i = 0; i < this.characters.length; i++) { 
					var character = this.characters[i];
					var hitbox = this.p_enemies[j];
					for( var l = 0; l < character.hurtbox.getAll().length; l++) {
						var hurtbox = character.hurtbox.getAll()[l];
						if(rectCollision(hitbox, hurtbox) ) {
							hitbox.hit(hurtbox);
							character.hurtbox.hit(hitbox);
							character.controller.Flinch();
							//enemy.controller.animator.delay();
							if(!enemy) {
								break;
							}
						}
					}
				}
			}
		},
		removeRefereces: function(hitbox) {
			if(!hitbox) return;
			for( var i in this.characters) { 
				var character = this.characters[i];
				for( var j in character.hurtbox.ignored) {
					if (character.hurtbox.ignored[i] == hitbox.__instanceId) {
						character.hurtbox.ignored.splice(i, 1);
						break;
					}
				}
			}
			for( var i in this.enemies) { 
				var enemy = this.enemies[i];
				for( var j in enemy.hurtbox.ignored) {
					if (character.hurtbox.ignored[i] == hitbox.__instanceId) {
						character.hurtbox.ignored.splice(i, 1);
						break;
					}
				}
			}
		}
	},

	ctor: function() {
		this._super();
		this.constructed =false;
		
		this.frame = 0;
		
		this.scheduleUpdate();
		
		this.mara = createMara(this);
		this.addChild(this.mara);
		this.collisionMaster.characters.push(this.mara);
		
		this.jackie = createJackie(this);
		this.addChild(this.jackie);
		this.collisionMaster.characters.push(this.jackie);
		
		this.clark = createClark(this);
		this.addChild(this.clark);
		this.collisionMaster.characters.push(this.clark);
		
		this.preston= createPreston(this);
		this.addChild(this.preston);
		this.collisionMaster.characters.push(this.preston);
		
		this.player = createKen(this);
		this.player.x = 300;
		this.player.y = 300;
		this.addChild(this.player);
		this.collisionMaster.characters.push(this.player);
		
		this.level = 0;
		this.initFrame("right");
		this.addEnemies();
		//this.collisionMaster.enemies.push(createEnemy(this));
		//this.collisionMaster.enemies[1].x = 900;
		//this.collisionMaster.enemies[1].y = 300;
		//this.addChild(this.collisionMaster.enemies[1]);
		
		this.lastClick = Date.now() - 100; //get time of last click used to determine if the player
        
        var parent = this;
        cc.eventManager.addListener ({ 
        
            //mouse event listener, key method of player interaction. One click means move to 
            //click location. Two clicks means jump
            event: cc.EventListener.MOUSE,
            onMouseDown: function(event) {
                var now = Date.now();
                if(this.lastJump == null){
                    this.lastJump = now;
                }
                
                if ((now - this.lastClick) < 500 && (now - this.lastJump) > 1000){
                    this.lastJump = now;
                    //cc.log("attack (on jump code) this.parent:" + parent + " this.player:" + parent.player);
                    parent.player.controller.attackIt(event.getLocation());
                    //event.getCurrentTarget().jumpIt(event.getLocation());
                }
                else{
					if(!parent.player.attacking) {
                    //cc.log("movement this.parent:" + parent + " this.player:" + parent.player + "parent.player.moveIt:" + parent.player.moveIt);
						parent.player.controller.moveIt(event.getLocation());
                    //event.getCurrentTarget().moveIt(event.getLocation());
					}
                }
                this.lastClick = now;
            }
        },this);
		
		this.constructed = true;
	},
	
	addEnemies:function(){
		//remove all the enemies
		for(i = 0; i < this.collisionMaster.enemies.length; i++){
			this.collisionMaster.enemies[i].x = -50;
		}
		
		
		switch(this.level){
			case 0: //empty
				break;
			case 1: //A
				this.collisionMaster.enemies.push(createEnemyA(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 800;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				break;
			case 2: //AA
				this.collisionMaster.enemies.push(createEnemyA(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 800;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				
				this.collisionMaster.enemies.push(createEnemyA(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 900;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				
				break;
			case 3: //B
				this.collisionMaster.enemies.push(createEnemyB(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 800;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				break;
			case 4: //AB
				this.collisionMaster.enemies.push(createEnemyA(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 800;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				
				this.collisionMaster.enemies.push(createEnemyB(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 900;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				break;
			case 5:  //AAB
				this.collisionMaster.enemies.push(createEnemyA(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 800;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				
				this.collisionMaster.enemies.push(createEnemyA(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 900;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				
				this.collisionMaster.enemies.push(createEnemyB(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 1000;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				break;
			case 6: // ABB
				this.collisionMaster.enemies.push(createEnemyA(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 800;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				
				this.collisionMaster.enemies.push(createEnemyB(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 900;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				
				this.collisionMaster.enemies.push(createEnemyB(this));
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 1000;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				break;
			case 7: //empty
				break;
			case 8: //boss
				this.collisionMaster.boss = createBoss(this);
				this.collisionMaster.enemies.push(this.collisionMaster.boss);
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].x = 1000;
				this.collisionMaster.enemies[this.collisionMaster.enemies.length-1].y = 300;
				this.addChild(this.collisionMaster.enemies[this.collisionMaster.enemies.length-1]);
				break;
			
			
		}
	},
	
	initFrame:function(dirFrom){		
		//set background with this.level
		
		//add the enemies
		this.addEnemies();
		
		
		//set the player and companion positions
		switch(dirFrom){
			case "right":
				this.player.setPosition(140,this.player.y); //put him in the corner
				this.mara.setPosition(75,this.player.y );
				this.jackie.setPosition(110, this.player.y);
				this.preston.setPosition(90, this.player.y);
				this.clark.setPosition(60, this.player.y);
				break;
			case "left":
				this.player.setPosition(900,this.player.y); //put him in the corner
				//this.jackie.setPosition(1000,this.player.y);
				break;
		}
		this.player.canMove = true //whether or not the player can move, prevents double movement	
	},
	
	increaseLevel:function(){
		this.level++; //increment level value
	},
	
	//go to the previous level
	decreaseLevel:function(){
		this.level--; //decrement level value
	},
	
	update: function() {
		//code for checking if enemies are offscreen, similar code can be implemented for allies
		for( i =0; i < this.collisionMaster.enemies.length; i++){
			if(this.collisionMaster.enemies[i].x <150){
				this.collisionMaster.enemies[i].x = 150;
			}
			else if(this.collisionMaster.enemies[i].x > 1000){
				this.collisionMaster.enemies[i].x = 1000;
			}
		}
		
		if(this.collisionMaster.enemies.length == 0){
			if(this.player.x > 1200){
				this.increaseLevel();
				this.initFrame("right");
			}
			else if(this.player.x < 50){
				this.decreaseLevel();
				this.initFrame("left");
			}
		}
	
		this.collisionMaster.collision();
	}
})
 
customAction = cc.Node.extend({
	ctor: function(obj) {
		this._super();
		this._run = false;
		this.frame = 0;
		this.entity = obj.target.entity;
		this.controller = obj.target;
		this.animator = obj.target.animator;
		this._update = obj.update ? obj.update : function () {};
		this.animate = obj.animate ? obj.animate : function() {};
		this.onenable = obj.onenable ? obj.onenable : function() {};
		this.ondisable = obj.ondisable ? obj.ondisable : function() {};
		this.start = function() {
			this._run = true;
			this.controller.currentAction = this;
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
 
function createTest(parent) {
	/* Here is an example AI contruction
	 * First we must create the animations
	 */
	 
	cc.log("creating test");
	 
	var testIdle = cc.Animation.create();
	testIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_0.png" );
	testIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_1.png" );
	testIdle.setDelayPerUnit(1 / 15);
	
	var testAttack = cc.Animation.create();
	testAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_0.png" );
	testAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_1.png" );
	testAttack.setDelayPerUnit(1 / 15);
	
	var testWalk = cc.Animation.create();
	testWalk.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_0.png" );
	testWalk.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_1.png" );
	testWalk.setDelayPerUnit(1 / 15);
	
	/* now we create an AI constructor
	 * by extending the node class
	 */
	
	var testAI = cc.Node.extend({
		/* this first 8 lines must be the same for 
		 * each AI you create, they are the basic 
		 * construction principales 
		 */
		currentAction: null,
		data:{},
		ctor: function(animations, entity) {
			this._super();
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.addChild( this.animator );
			
			/* here you create your AI behaviors
			 * you have access to this.frame, 
			 * this.entity, this.animator
			 */
			
			this.idle = new customAction({
				// pass in the custom action function
				// an update function to be called on active frames
				update: function() {},
				// an onenable function called on this.start()
				onenable: function() {},
				// an ondisable function called on this.stop()
				ondisable: function() {},
				// an animate function that tells me how to animate
				animate: function() {
					this.animator.play("run");
				},
				// and target:this at the end
				target:this
			});
			this.walk = new customAction({
				update: function() {
					// move forward 3px
					this.entity.x += (this.entity.scaleX) * 1;
				},
				onenable: function() {
					// turn them around
					this.entity.turnaround();
					this.entity.health.damage(1);
				},
				ondisable: function() {},
				animate: function() {
					this.animator.play("walk");
				},
				target:this
			});
			this.attack = new customAction({
				update: function() {
					// on the second frame (frame 1 is first, not 0)
					// animations are 15 fps, but frame in update is 
					// out of 60 (the fps the game runs at)
					if(this.frame == 4) {
						// create a hitbox relative coordinates      x, y, w, h, damage
						this.hitbox = this.entity.hitbox.addCollider(0,0,60,60, 100);
					}
				},
				onenable: function() {},
				ondisable: function() {
					// remove the hitbox
					this.entity.hitbox.removeCollider(this.hitbox);
					this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					this.hitbox = null;
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			}),
			
			// add all the behaviors as children
			this.addChild(this.idle);
			this.addChild(this.walk);
			this.addChild(this.attack);
			
			// at then end, call main
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
			// use that a processing step
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
			
			// make sure at the end to call this.currentAction.animate at the end
			this.currentAction.animate();
		}
	});
	
	// finally, at the end return a new entity, with the health, animations, and
	// the controller constructor we just made
	
	return new entity({
		health: 10,
		animations: {
			idle: testIdle,
			walk: testWalk,
			attack: testAttack,
		}, 
		controller: testAI,
		parent: parent
	});
}

function createBoss(parent) {
	var bossGroundAttack = cc.Animation.create();
	for (var i = 0; i < 14; i++) {
		if(i < 10){
			bossGroundAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Slap_Attack/Boss_Slap_Attack_000" + i + "_" + (i + 1) + ".png" );
		}
		else{
			bossGroundAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Slap_Attack/Boss_Slap_Attack_00" + i + "_" + (i + 1) + ".png" );
		}
	}
	bossGroundAttack.setDelayPerUnit(1 / 15);
	
	var bossFireBallAttack = cc.Animation.create();
	for(var i = 0; i < 8; i++){
		bossFireBallAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Fireball/Boss_Flying_Fireball_000" + i + "_" + (i + 1) + ".png" );
	}
	bossFireBallAttack.setDelayPerUnit(1 / 15);
	
	var bossFireWalkAttack = cc.Animation.create();
	for(var i = 0; i < 8; i++){
		bossFireWalkAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Fire_Walk/Boss_Fire_Walk_000" + i + "_" + (i + 1) + ".png" );
	}
	bossFireWalkAttack.setDelayPerUnit(1 / 15);

	var bossFireWalkAttack2 = cc.Animation.create();
	for(var i = 0; i < 8; i++){
		bossFireWalkAttack2.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Walk_Without_Fire/Boss_Walk_Without_Fire_000" + i + "_" + (i + 1) + ".png" );
	}
	bossFireWalkAttack2.setDelayPerUnit(1 / 15);
	
	var bossIdle = cc.Animation.create();
	bossIdle.setDelayPerUnit(1 / 15);
	
	var bossAirIdle = cc.Animation.create();
	for(var i = 0; i < 8; i++){
		bossFireWalkAttack2.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Flight_Loop/Boss_Flight_Loop_000" + i + "_" + (i + 1) + ".png" );
	}
	
	bossAirIdle.setDelayPerUnit(1 / 15);
	
	var bossFall = cc.Animation.create();;
	for(var i = 0; i < 8; i++){
		bossFall.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Wing_Dissolve/Boss_Wing_Dissolve_000" + i + "_" + (i + 1) + ".png" );
	}
	bossFall.setDelayPerUnit(1 / 15);
	
	var bossBurst = cc.Animation.create();
	//Boss wing animation
	for(var i =0; i < 17; i++){
		
		if(i < 10){
			bossBurst.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Wing_Anim/Boss_Wing_Anim_000" + i + "_" + (i + 1) + ".png" );
		}
		else{
			bossBurst.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Wing_Anim/Boss_Wing_Anim_00" + i + "_" + (i + 1) + ".png" );
		}
	}
	
	for(var i =0; i < 14; i++){
		
		if(i < 10){
			bossBurst.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Jump/Boss_Jump_000" + i + "_" + (i + 1) + ".png" );
		}
		else{
			bossBurst.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Boss_Jump/Boss_Jump_00" + i + "_" + (i + 1) + ".png" );
		}
	}
	//Boss jump animation
	bossBurst.setDelayPerUnit(1 / 15);
	
	var bossAI = cc.Node.extend({
		currentAction: null,
		data:{},
		Flinch: function(cause) {
			//console.log(this.data);
			if(this.data.phase == 0) {
				if(this.data.recentdamage < 4) {
					this.data.recentdamage ++;
				} else {
					this.animator.stop();
					this.currentAction.stop();
					this.data.idlecount = 0;
					this.recentdamage = 0;
					this.idle.start();
					this.callback();
				}
				if(this.entity.health._value <= 0) {
					this.entity.health.damage(this.entity.health._value - 50);
					this.data.phase = 1;
					this.data.phasetrigger = true;
				}
			} else if(this.data.phase == 1 || this.data.phase == 3) {
				if(this.data.recentdamage < 2) {
					this.data.recentdamage ++;
				} else {
					if(this.entity.y == 500) {
						this.animator.stop();
						this.currentAction.stop();
						this.fall.start();
						this.callback();
					}
				}
				if(this.entity.health._value <= 0) {
					this.entity.health.damage(this.entity.health._value - 50);
					this.data.phase ++;
					this.data.phasetrigger = true;
					this.callback();
				}
			} else if(this.data.phase == 2) {
				if(cause == this.entity.scene.jackie) {
					this.data.recentdamage ++;
				} else if(this.data.recentdamage == 2) {
					this.animator.stop();
					this.currentAction.stop();
					this.data.idlecount = 0;
					this.recentdamage = 0;
					this.idle.start();
					this.callback();
				}
				if(this.entity.health._value <= 0) {
					this.entity.health.damage(this.entity.health._value - 35);
					this.data.phase = 3;
					this.data.phasetrigger = true;
				}
			} else if(this.data.phase == 4) {
				if(this.entity.health._value <= 0) {
					this.animator.stop();
					this.currentAction.stop();
					// end the game in a fade out
				}
			}
		},
		ctor: function(animations, entity) {
			this._super();
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.addChild( this.animator );
			
			this.entity.hurtbox.addCollider(-25,-30,130,180);
			this.entity.health.healthBar.y += 30;
			
			this.entity.scaleX = 1;
			
			this.animator.y += 30;
			
			this.idle = new customAction({
				update: function() {
					this.entity.controller.data.recentdamage = 0;
				},
				animate: function() {
					this.animator.play("idle");
				},
				target:this
			});
			
			this.airidle = new customAction({
				animate: function() {
					this.animator.play("airidle");
				},
				target:this
			});
			
			this.airidle2 = new customAction({
				animate: function() {
					this.animator.play("airidle");
				},
				target:this
			});
			
			this.attack1 = new customAction({
				update: function() {
					if(this.frame == 16) {
						this.hitbox = this.entity.hitbox.addCollider(-40,-30, 80, 100, 10)
					} else if (this.frame == 23) {
						this.entity.hitbox.removeCollider(this.hitbox);
						this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					} else if (this.frame == 26) {
						this.hitbox = this.entity.hitbox.addCollider(-40,-30, 80, 100, 10)
					} else if (this.frame == 32) {
						this.entity.hitbox.removeCollider(this.hitbox);
						this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					} else if (this.frame == 37) {
						this.hitbox = this.entity.hitbox.addCollider(-40,-30, 80, 100, 10)
					} else if (this.frame == 44) {
						this.entity.hitbox.removeCollider(this.hitbox);
						this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					} else if (this.frame == 50) {
						this.hitbox = this.entity.hitbox.addCollider(-40,-30, 80, 100, 10)
					} else if (this.frame == 56) {
						this.entity.hitbox.removeCollider(this.hitbox);
						this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					} else if (this.frame == 62) {
						this.hitbox = this.entity.hitbox.addCollider(-40,-30, 80, 100, 10)
					} else if (this.frame == 68) {
						this.entity.hitbox.removeCollider(this.hitbox);
						this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					} else if (this.frame == 74) {
						this.hitbox = this.entity.hitbox.addCollider(-40,-30, 80, 100, 10)
					} else if (this.frame == 80) {
						this.entity.hitbox.removeCollider(this.hitbox);
						this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
						this.hitbox = null;
					}
				},
				ondisable: function() {
					if(this.hitbox) {
						this.entity.hitbox.removeCollider(this.hitbox);
						this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
						this.hitbox = null;
					}
				},
				animate: function() {
					this.animator.play("attack1");
				},
				target:this
			});
			
			this.burst = new customAction({
				animate: function() {
					this.animator.play("burst");
				},
				ondisable: function() {
					this.entity.y = 500;
				},
				update: function() {
					if(this.frame == 1)
						this.entity.y += 65;
					if(this.frame == 65) 
						this.entity.y -= 65;
					if(this.frame > 65 && this.frame <74) 
						this.entity.y += 25;
					this.entity.controller.data.recentdamage = 0;
				},
				target:this
			});
			
			this.fall = new customAction({
				update: function() {
					this.entity.y -=25 /3;
				},
				ondisable: function() {
					this.entity.y = 300;
				},
				animate: function() {
					this.animator.play("fall");
				},
				target: this
			});
			
			function fireball(boss, t) {
				var a = new cc.Node.create();
				var s = cc.Sprite.create("assets/art/fantasy/fireball.png");
				a.addChild(s);
				a.x = boss.x;
				a.y = boss.y; 
				var distance = Math.sqrt( (t.x - boss.x)*(t.x - boss.x) + (t.y - boss.y)*(t.y - boss.y) );
				a.movex = (t.x - boss.x) / distance;
				s.setRotation(Math.acos(a.movex) * 180 / Math.PI);
				a.movey = (t.y - boss.y) / distance;
				a.scaleX = .5 * boss.scaleX;
				a.scaleY = .5;
				a.update = function() {
					a.x += a.scaleX * 34 * a.movex;
					a.y += a.scaleX * 34 * a.movey;
					if(a.x < 0 || a.x > cc.winSize.width) {
						s.opacity = 0;
						a.removeChild(s);
						s.cleanup()
						if(a.parent)
							a.parent.removeChild(this);
						a.cleanup();
					}
				}
				a.scheduleUpdate();
				boss.parent.addChild(a);
			}
			
			this.attack2 = new customAction({
				update: function() {
					if(this.frame == 13) {
						console.log(this.target);
						fireball(this.entity, this.target);
					}
				}, 
				animate: function() {
					this.animator.play("fireball");
				},
				target:this
			});
			
			this.attack3 = new customAction({
				update: function() {
					if(this.frame == 13) {
						for(var i in this.entity.scene.collisionMaster.characters) {
							this.entity.scene.collisionMaster.characters[i].damage(4);
						}
					}
				},
				animate: function() {
					this.play("fireball");
				},
				target:this
			});
		
			this.preattack4 = new customAction({
				update: function() {
					for(var i in this.entity.scene.collisionMaster.characters) {
						this.entity.scene.collisionMaster.characters[i].x -= 200;
						if(this.entity.scene.collisionMaster.characters[i].x <= 30) {
							this.entity.scene.collisionMaster.characters[i].x = 30;
						}
					}
				},
				animate: function() {
					console.log("hello");
					this.animator.play("preattack4");
				},
				target: this
			});
		
			this.attack4 = new customAction({
				onenable: function() {
					this.hitbox = this.entity.hitbox.addCollider(-75,-15,50,300, 1000);
					this.entity.health.damage(this.entity.health._value - 15);
				},	
				update: function() {
					this.entity.x += -1;
				},
				animate: function() {
					this.animator.play("attack4");
				},
				target:this
			});
		
			this.addChild(this.idle);
			this.addChild(this.airidle);
			this.addChild(this.burst);
			this.addChild(this.fall);
			this.addChild(this.attack1);
			this.addChild(this.attack2);
			this.addChild(this.attack3);
			this.addChild(this.attack4);
			this.addChild(this.preattack4);
			
			this.main();
		},
		main: function() {
			this.data.idlecount = 0;
			this.data.recentdamage = 0;
			this.data.phase = 0;
			this.idle.start();
			this.callback();
		},
		callback: function() {
			if(this.data.phasetrigger) {
				this.data.phasetrigger = false;
				if(this.data.phase == 1 || this.data.phase == 3) {
					this.currentAction.stop();
					this.burst.start();
				} if(this.data.phase == 4) {
					this.currentAction.stop();
					this.preattack4.start();
				}
			} else if(this.currentAction == this.preattack4) {
				this.currentAction.stop();
				this.attack4.start();
				this.firewall = cc.Sprite.create("assets/art/fantasy/firewall.png");
				this.firewall.x = -115;
				this.firewall.y = 100;
				this.addChild(this.firewall);
			} else if(this.currentAction == this.idle) {
				if(this.data.idlecount < 5) {
					this.currentAction.stop();
					this.attack1.start();
				} else {
					this.data.idlecount++;
				}
			} else if (this.currentAction == this.attack1) {
				this.currentAction.stop();
				this.idle.start();
				this.data.idlecount = 0;
			} else if(this.currentAction == this.burst) {
				this.currentAction.stop();
				this.airidle.start();
			} else if (this.currentAction == this.airidle) {
				this.currentAction.stop();
				var i = Math.floor(this.entity.scene.collisionMaster.characters.length * Math.random())
				this.attack2.target = this.entity.scene.collisionMaster.characters[i];
				this.attack2.start();
			} else if (this.currentAction == this.attack2) {
				this.currentAction.stop();
				this.airidle.start();
			} else if (this.currentAction == this.fall) {
				if(this.entity.y <= 300) {
					this.currentAction.stop();
					this.idle.start();
					this.data.idlecount = -3;
				}
			} else if (this.currentAction == this.attack3) {
				this.currentAction.stop();
				this.airidle2.start();
			}  else if (this.currentAction == this.airidle2) {
				this.currentAction.stop();
				this.attack3.start();
			}
		this.currentAction.animate();
		}
	});
	
	return new entity({
		health: 50,
		animations: { 
			attack1: bossGroundAttack,
			fireball: bossFireBallAttack,
			attack4: bossFireWalkAttack,
			preattack4: bossFireWalkAttack2,
			idle: bossIdle,
			airidle: bossAirIdle,
			fall: bossFall,
			burst: bossBurst
		}, 
		controller: bossAI,
		parent: parent
	});
}

function createEnemyA(parent) {
	/* Here is an example AI contruction
	 * First we must create the animations
	 */
	 
	var enemyIdle = cc.Animation.create();
	enemyIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_0.png" );
	enemyIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_1.png" );
	enemyIdle.setDelayPerUnit(1 / 15);
	
	var enemyAttack = cc.Animation.create();
	enemyAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_0.png" );
	enemyAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_1.png" );
	enemyAttack.setDelayPerUnit(1 / 15);
	
	var enemyRun = cc.Animation.create();
	enemyRun.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_0.png" );
	enemyRun.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_1.png" );
	enemyRun.setDelayPerUnit(1 / 15);
	
	var enemyFlinch = cc.Animation.create();
	enemyFlinch.setDelayPerUnit(1 / 15);
	
	var enemyDown = cc.Animation.create();
	enemyDown.setDelayPerUnit(1 / 15);
	
	/* now we create an AI constructor
	 * by extending the node class
	 */
	
	var enemyAI = cc.Node.extend({
		/* this first 8 lines must be the same for 
		 * each AI you create, they are the basic 
		 * construction principales 
		 */
		currentAction: null,
		data:{},
		Flinch:function() {
			this.animator.stop();
			this.currentAction.stop();
			this.flinch.start();
			this.callback();
			//this.animator.delay();
		},
		ctor: function(animations, entity) {
			this._super();
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.addChild( this.animator );
			
			this.entity.hurtbox.addCollider(-15,-30,60,120, false);
			
			this.idle = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				// and target:this at the end
				target:this
			}); //
			this.run = new customAction({
				update: function() {
					// move forward
					if(this.entity.x > 30 && this.entity.x < 1250) {
						this.entity.x += this.entity.scaleX * 5;
					}  else {
						if(this.entity.x <= 30) {
							this.entity.x = 30.1
						}
						if(this.entity.x >= 1250) {
							this.entity.x = 1249.1;
						}
					}
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			this.attack = new customAction({
				update: function() {
					if(this.frame == 1) {
						// create a hitbox relative coordinates       x, y, w, h, damage
						this.hitbox = this.entity.hitbox.addCollider(0,-30,60,120, 3);
					}
				},
				ondisable: function() {
					// remove the hitbox
					this.entity.hitbox.removeCollider(this.hitbox);
					this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					this.hitbox = null;
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			// flinch behavior
			this.flinch = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			
			// add all the behaviors as children
			this.addChild(this.idle);
			this.addChild(this.run);
			this.addChild(this.attack);
			this.addChild(this.flinch);
			
			// at then end, call main
			this.main();
		},
		
		main: function() {
			this.data.idlecount =  10;
			this.data.count = this.data.idlecount;
			this.idle.start();
			this.callback()
		},
		
		callback: function() {
			if(this.currentAction == this.flinch) {
				if(this.entity.health._value <= 0){//kill this enemy
					this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					
					var indexToScrap = this.entity.scene.collisionMaster.enemies.indexOf(this.entity);
					if(indexToScrap < 0){
						return;
					}
					
					var s = cc.Sprite.create("assets/art/fantasy/animations/test/testIdle_0.png");
					s.x = this.entity.x;
					s.y = this.entity.y;
					s.del = function() {
						s.cleanup();
					}
					this.entity.scene.addChild(s);
					s.scaleX = .41;
					s.scaleY = .41;
					s.runAction( cc.sequence ( cc.fadeOut(.5), cc.callFunc(s.del, s) ) );
					
					var deadMan = this.entity.scene.collisionMaster.enemies[indexToScrap];
					this.entity.scene.collisionMaster.enemies[indexToScrap].y = 9999;
					this.entity.scene.collisionMaster.enemies.splice(indexToScrap,1);
					deadMan.cleanup();
					this.animator.stop();

				}
			
				if(!this.data.flinch) {
					this.data.flinch = 1;
				} else if(this.data.flinch < 3) {
					this.data.flinch ++;
				} else {
					this.data.flinch = 0;
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			}
		
			else if(this.data.count < this.data.idlecount) {
				if(this.data.count == 0) {
					this.currentAction.stop();
					this.idle.start();
				}
				this.data.count ++;
			} else {
				var close = 100000;
				var j = 0;
				for( i in this.entity.scene.collisionMaster.characters ) {
					if(Math.abs(this.entity.scene.collisionMaster.characters[i].x - this.entity.x) < close) {
						close = Math.abs(this.entity.scene.collisionMaster.characters[i].x - this.entity.x);
						j = i;
					}
				}
				var closest = this.entity.scene.collisionMaster.characters[j];
				
				if(this.entity.health._value < 6) {
					this.entity.scaleX = closest.x < this.entity.x ? 1 : -1;
					this.currentAction.stop();
					this.run.start();
				} else if (Math.abs(closest.x - this.entity.x) < 75){
					this.entity.scaleX = closest.x < this.entity.x ? -1 : 1;
					this.currentAction.stop();
					this.attack.start();
					this.data.count = 0;
				} else {
					this.entity.scaleX = closest.x < this.entity.x ? -1 : 1;
					this.currentAction.stop();
					this.run.start();
				}
			}
			
		
			this.currentAction.animate();
		}
	});
	
	// finally, at the end return a new entity, with the health, animations, and
	// the controller constructor we just made
	
	return new entity({
		health: 50,
		animations: {
			idle: enemyIdle,
			run: enemyRun,
			attack: enemyAttack,
			flinch: enemyFlinch,
			down: enemyDown
		}, 
		controller: enemyAI,
		parent: parent
	});
}

function createEnemyB(parent) {
	/* Here is an example AI contruction
	 * First we must create the animations
	 */
	 
	var enemyIdle = cc.Animation.create();
	enemyIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_0.png" );
	enemyIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_1.png" );
	enemyIdle.setDelayPerUnit(1 / 15);
	
	var enemyAttack = cc.Animation.create();
	enemyAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_0.png" );
	enemyAttack.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testAttack_1.png" );
	enemyAttack.setDelayPerUnit(1 / 15);
	
	var enemyRun = cc.Animation.create();
	enemyRun.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_0.png" );
	enemyRun.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testWalk_1.png" );
	enemyRun.setDelayPerUnit(1 / 15);
	
	var enemyFlinch = cc.Animation.create();
	enemyFlinch.setDelayPerUnit(1 / 15);
	
	var enemyDown = cc.Animation.create();
	enemyDown.setDelayPerUnit(1 / 15);
	
	/* now we create an AI constructor
	 * by extending the node class
	 */
	
	var enemyAI = cc.Node.extend({
		/* this first 8 lines must be the same for 
		 * each AI you create, they are the basic 
		 * construction principales 
		 */
		currentAction: null,
		data:{},
		Flinch:function() {
			if(this.entity.health._value <= 0) {
				this.animator.stop();
				this.currentAction.stop();
				this.flinch.start();
				this.callback();
			}
			//this.animator.delay();
		},
		ctor: function(animations, entity) {
			this._super();
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.animator.scaleX = .58;
			this.animator.scaleY = .58;
			this.addChild( this.animator );
			
			this.entity.hurtbox.addCollider(-21,-42,85,170);
			
			this.idle = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				// and target:this at the end
				target:this
			}); //
			this.run = new customAction({
				update: function() {
					// move forward
					if(this.entity.x > 30 && this.entity.x < 1250) {
						this.entity.x += this.entity.scaleX * 5;
					} else {
						if(this.entity.x <= 30) {
							this.entity.x = 30.1
						}
						if(this.entity.x >= 1250) {
							this.entity.x = 1249.1;
						}
					}
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			this.attack = new customAction({
				update: function() {
					if(this.frame == 3) {
						// create a hitbox relative coordinates       x, y, w, h, damage
						this.hitbox = this.entity.hitbox.addCollider(0,-30,60,120, 10);
					}
				},
				ondisable: function() {
					// remove the hitbox
					this.entity.hitbox.removeCollider(this.hitbox);
					this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					this.hitbox = null;
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			// flinch behavior
			this.flinch = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			
			// add all the behaviors as children
			this.addChild(this.idle);
			this.addChild(this.run);
			this.addChild(this.attack);
			this.addChild(this.flinch);
			
			// at then end, call main
			this.main();
		},
		
		main: function() {
			this.data.idlecount =  10;
			this.data.count = this.data.idlecount;
			this.idle.start();
			this.callback()
		},
		callback: function() {
			if(this.currentAction == this.flinch) {
				if(this.entity.health._value <= 0){//kill this enemy
					this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					
					var indexToScrap = this.entity.scene.collisionMaster.enemies.indexOf(this.entity);
					if(indexToScrap < 0){
						return;
					}
					
					var s = cc.Sprite.create("assets/art/fantasy/animations/test/testIdle_0.png");
					s.x = this.entity.x;
					s.y = this.entity.y;
					s.del = function() {
						s.cleanup()
						delete s;
					}
					this.entity.scene.addChild(s);
					s.scaleX = .41;
					s.scaleY = .41;
					s.runAction( cc.sequence ( cc.fadeOut(.5), cc.callFunc(s.del, s) ) );
					
					var deadMan = this.entity.scene.collisionMaster.enemies[indexToScrap];
					this.entity.scene.collisionMaster.enemies[indexToScrap].y = 9999;
					this.entity.scene.collisionMaster.enemies.splice(indexToScrap,1);
					deadMan.cleanup();
					this.animator.stop();

				}
				if(!this.data.flinch) {
					this.data.flinch = 1;
				} else if(this.data.flinch < 5) {
					this.data.flinch ++;
				} else {
					this.data.flinch = 0;
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			}
		
			else if(this.data.count < this.data.idlecount) {
				if(this.data.count == 0) {
					this.currentAction.stop();
					this.idle.start();
				}
				this.data.count ++;
			} else {
				var close = 100000;
				var j = 0;
				for( i in this.entity.scene.collisionMaster.characters ) {
					if(Math.abs(this.entity.scene.collisionMaster.characters[i].x - this.entity.x) < close) {
						close = Math.abs(this.entity.scene.collisionMaster.characters[i].x - this.entity.x);
						j = i;
					}
				}
				var closest = this.entity.scene.collisionMaster.characters[j];
				
				if (Math.abs(closest.x - this.entity.x) < 100){
					this.entity.scaleX = closest.x < this.entity.x ? -1 : 1;
					this.currentAction.stop();
					this.attack.start();
					this.data.count = 0;
				} else {
					this.entity.scaleX = closest.x < this.entity.x ? -1 : 1;
					this.currentAction.stop();
					this.run.start();
				}
			}
		
			this.currentAction.animate();
		}
	});
	
	// finally, at the end return a new entity, with the health, animations, and
	// the controller constructor we just made
	
	return new entity({
		health: 100,
		animations: {
			idle: enemyIdle,
			run: enemyRun,
			attack: enemyAttack,
			flinch: enemyFlinch,
			down: enemyDown
		}, 
		controller: enemyAI,
		parent: parent
	});
}

function createKen(parent){ //ken is the player character and is controlled by tapping
    //load in the animations
    var kenIdle = cc.Animation.create();
    kenIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_0.png" );
    kenIdle.addSpriteFrameWithFile( "Assets/art/fantasy/animations/test/testIdle_1.png" );
    kenIdle.setDelayPerUnit(1 / 15);
    
    var kenAttack = cc.Animation.create();
    for (var i = 0; i < 5; i++){
		kenAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Ken_Attack/Ken_Attack_000" + i + "_" + (i + 1) + ".png");
	}
	
	kenAttack.setDelayPerUnit(1 / 15);
    
    var kenRun = cc.Animation.create();
    for (var i = 0; i < 6; i++) {
		kenRun.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Ken_Run_Cycle/Ken_Run_Cycle_000" + i + "_Group-" + (i + 1) + ".png" );
	}
    kenRun.setDelayPerUnit(1 / 15);
    
    var kenFlinch = cc.Animation.create();
	kenFlinch.setLoops(5);
    
    this.attackReady = false;
    var kenAI = cc.Node.extend({
        currentAction: null,
        data:{},
		Flinch: function() {
			this.animator.stop();
			this.animator.play("flinch");
		},
        ctor: function(animations, entity) {
            this._super();
            this.entity = entity;
			
			this.entity.attacking = false;
    
            this.animator = new AnimatorConstructor(animations, this);
            this.addChild( this.animator );
            
			this.entity.hurtbox.addCollider(-15,-30,60,120);
			
			this.animator.play("idle");
        },
        attackIt: function(p){
            this.attackReady = true;
			this.entity.stopAllActions();
			this.entity.attacking = true;
			this.entity.scaleX = this.entity.x < p.x ? 1 : -1;
			this.animator.play("attack");
			this.hitbox = this.entity.hitbox.addCollider(0,-30, 75, 120, 5);
        },
        
        moveIt: function(p){
            this.walkReady = true;
            this.entity.stopAllActions();
            this.entity.fixedHeight = this.entity.y;
            p.y = this.entity.fixedHeight;
			this.t = true;
			
			p.x += this.entity.x < p.x ? -30 : 30;
			
            var jumps = (Math.abs(this.entity.x - p.x))/1000;
			if(Math.abs(this.entity.x - p.x) > 30) 
				this.entity.scaleX = this.entity.x < p.x ? 1 : -1;
            var action = cc.MoveTo.create(3*jumps,p);
            this.entity.runAction( cc.sequence(action, cc.callFunc(this.landed, this) ) );
			this.animator.play("run");
        },
		
		landed: function() {
			this.t = false;
			this.animator.stop();
			this.callback();
		},
		callback: function() {
			if(this.entity.health._value <= 0) {
				this.entity.health.damage(this.entity.health._value);
			}
			if(this.hitbox) {
				this.entity.attacking = false;
				this.entity.hitbox.removeCollider(this.hitbox);
				this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
				this.hitbox = null;
			}
			if(this.t) {
				this.animator.play("run");
			} else {
				this.animator.play("idle");
			}
		}
    });
    
    // finally, at the end return a new entity, with the health, animations, and
    // the controller constructor we just made
    
    return new entity({
        health: 100,
        animations: {
            idle: kenIdle,
            run: kenRun,
            attack: kenAttack,
			flinch: kenFlinch
        }, 
        controller: kenAI,
        parent: parent
    });
    
}

function createMara(parent) {
	var maraIdle = cc.Animation.create();
	maraIdle.setDelayPerUnit(1 / 15);

	var maraAttack = cc.Animation.create();
	for (var i = 1; i < 13; i++) {
		maraAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Mara_Attack/Mara_Attack_00" + (i<10?"0"+i:i) + "_" + (i + 1) + ".png" );
	}
	maraAttack.setDelayPerUnit(1 / 15);
	
	var maraSmoke = cc.Animation.create();
	for (var i = 0; i < 6; i++) {
		maraSmoke.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Mara_SmokeScreen/Mara_SmokeScreen_000" + i + "_" + (i + 1) + ".png" );
	}
	maraSmoke.setDelayPerUnit(1 / 15);
	
	var maraRun = cc.Animation.create();
	for (var i = 0; i < 6; i++) {
		maraRun.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Mara_Run_Cycle/Mara_Run_Cycle_000" + i + "_" + (i + 1) + ".png" );
	}
	maraRun.setDelayPerUnit(1 / 15);
	
	var maraFlinch = cc.Animation.create();
	maraFlinch.setDelayPerUnit(1 / 15);
	
	var maraDown = cc.Animation.create();
	maraDown.setDelayPerUnit(1 / 15);
	
	var maraAI = cc.Node.extend({
		currentAction: null,
		data:{},
		Flinch:function() {
			this.animator.stop();
			this.currentAction.stop();
			this.flinch.start();
			this.callback();
			//this.animator.delay();
		},
		ctor: function(animations, entity) {
			var smoke = function(scene, e) {
				var smokeAnim = cc.Animation.create();
				for (var i = 6; i < 9; i++) {
					smokeAnim.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Mara_SmokeScreen/Mara_SmokeScreen_000" + i + "_" + (i + 1) + ".png" );
				}
				smokeAnim.setDelayPerUnit(1 / 15);
				var s = cc.Sprite.create();
				scene.addChild(s);
				s.x = e.entity.x;
				s.y = e.entity.y;
				s.del = function() {
					this.parent.removeChild(this);
					delete this;
				}
				s.runAction ( cc.sequence( new cc.Animate.create(smokeAnim), cc.callFunc(s.del, s) ) );
			}
			this._super();
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.addChild( this.animator );
			
			this.entity.hurtbox.addCollider(-15,-30,60,120);
			
			this.idle = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				// and target:this at the end
				target:this
			}); 
			this.smokescreen  = new customAction({
				animate: function() {
					this.entity.controller.y += 15;
					this.animator.play("smoke");
				},
				ondisable: function() {
					this.entity.controller.y -= 15;
					smoke(this.entity.scene, this);
					this.entity.x = this.target.x + (this.target.scaleX) * -30;
					this.entity.scaleX = this.target.scaleX;
					if(this.target == this.entity.scene.collisionMaster.boss) {
						console.log("hello");
						this.entity.x = this.target.x + (this.target.scaleX) * 90;
						this.entity.scaleX = -1;
					}
				},
				target:this
			});
			this.attack = new customAction({
				update: function() { 
					if(this.frame == 17) {
						this.hitbox = this.entity.hitbox.addCollider(0,-30, 100, 120, 20);
					}
				},
				ondisable: function() {
					this.entity.hitbox.removeCollider(this.hitbox);
					this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					this.hitbox = null;
				},
				animate: function() {
					this.animator.play("attack");
				},
				target:this
			});
			this.run = new customAction({
				update: function() {
					// move forward 3px
					if(this.entity.x > 30 && this.entity.x < 1250) {
						this.entity.x += this.entity.scaleX * 5;
					} else {
						if(this.entity.x <= 30) {
							this.entity.x = 30.1
						}
						if(this.entity.x >= 1250) {
							this.entity.x = 1249.1;
						}
					}
					
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			// flinch behavior
			this.flinch = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			//down behavior
			this.down = new customAction({
				onenable: function() {
					this.entity.health.damage(this.entity.health._value);
				},
				update: function() {
					this.entity.health.damage(this.entity.health._value);
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			
			// add all the behaviors as children
			this.addChild(this.idle);
			this.addChild(this.run);
			this.addChild(this.smokescreen);
			this.addChild(this.attack);
			this.addChild(this.flinch);
			this.addChild(this.down);
			
			// at then end, call main
			this.main();
		},
		
		main: function() {
			this.data.idlecount =  2 * (5 - master["Mara"]);
			this.data.count = 0;
			this.data.flinch = 0;
			this.data.down = 0;
			this.data.runcount = 3;
			this.idle.start();
			this.callback();
		},
		callback: function() {
			if(this.entity.scene.collisionMaster.boss && this.entity.scene.collisionMaster.boss.y == 500) {
				this.entity.scaleX = Math.random() < .5 ? -1 : 1;
				this.currentAction.stop();
				this.run.start();
			} else if(this.currentAction == this.down) {
				if( this.data.down < 60 ) {
					this.data.down ++;
				} else {
					this.data.down = 0;
					this.entity.health.damage( -this.entity.health.maxHealth / 4);
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			} else if(this.currentAction == this.smokescreen) {
				this.currentAction.stop();
				this.attack.start();
				this.data.count = 0;
			} else if(this.currentAction == this.attack) {
				this.entity.scaleX = -this.entity.scaleX;
				this.currentAction.stop();
				this.data.runcount = 0;
				this.run.start();
			} else if(this.data.runcount < 2) {
				this.currentAction.stop();
				this.data.runcount ++;
				this.run.start();
			} else if(this.currentAction == this.flinch) {
				if(this.entity.health._value <= 0) {
					this.data.down = 0;
					this.currentAction.stop();
					this.down.start();
				} else if(this.data.flinch < 5) {
					this.data.flinch ++;
				} else {
					this.data.flinch = 0;
					this.currentAction.stop();
					var closest = 100000;
					for( var i in this.entity.scene.collisionMaster.enemies ) {
						if( Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x) < Math.abs(closest)) {
							closest = this.entity.scene.collisionMaster.enemies[i].x - this.entity.x;
						}
					}
					this.entity.scaleX = closest < 0 ? -1 : 1;
					this.run.start();
					this.data.count = this.data.idlecount;
				}
			} else if(this.data.count < this.data.idlecount) {
				if(this.data.count == 0) {
					this.currentAction.stop();
					this.idle.start();
				}
				this.data.count ++;
			} else {
				var lowest = 100000;
				var i = -1;
				for(var j in this.entity.scene.collisionMaster.enemies) {
					if(this.entity.scene.collisionMaster.enemies[j].health._value < lowest  && Math.abs(this.entity.scene.collisionMaster.enemies[j].y - this.entity.y) < 20) {
						lowest = this.entity.scene.collisionMaster.enemies[j].health._value
						i = j;
					}
				}
				if(i != -1) {
					this.lowestHealth = this.entity.scene.collisionMaster.enemies[i];
					this.currentAction.stop();
					this.idle.start();
					this.smokescreen.target = (function(d) {
						var x = Math.abs(d.lowestHealth.x - d.entity.x);
						if(x < 400){
							return d.lowestHealth;
						}
						return null;
					})(this);
					if(this.smokescreen.target != null){
						this.currentAction.stop();
						this.smokescreen.start();
						this.lowestHealth = null;
					} else {
						this.currentAction.stop();
						this.entity.scaleX = this.lowestHealth.x < this.entity.x ? -1 : 1;
						this.run.start();
					}
				} else {
					this.currentAction.stop();
					this.idle.stop()
				}
			}
			
			// make sure at the end to call this.currentAction.animate at the end
			this.currentAction.animate();
		}
	});
	
	// finally, at the end return a new entity, with the health, animations, and
	// the controller constructor we just made
	
	return new entity({
		health: 30,
		animations: {
			idle: maraIdle,
			run: maraRun,
			smoke: maraSmoke,
			attack: maraAttack,
			flinch: maraFlinch,
			down: maraDown
		}, 
		controller: maraAI,
		parent: parent
	});
}

function createPreston(parent) {
	var prestonIdle = cc.Animation.create();
	
	var prestonRun = cc.Animation.create();
	for (var i = 0; i < 6; i++) {
		prestonRun.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Preston_Run_Cycle/Preston_Run_Cycle_000" + i + "_" + (i + 1) + "-copy.png" )
	}
	prestonRun.setDelayPerUnit ( 1 / 15 ) ;
	
	var prestonAttack = cc.Animation.create();
	for(var i = 0; i < 11; i++){
		if(i < 10){
			prestonAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Preston_Attack/Preston_Attack_000" + i + "_" + (i + 1) + ".png");
		}else{
			prestonAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Preston_Attack/Preston_Attack_00" + i + "_" + (i + 1) + ".png");
		}
	}
	prestonAttack.setDelayPerUnit(1/15);
	
	var prestonFlinch = cc.Animation.create();
	
	var prestonDown = cc.Animation.create();
	
	var prestonAI = cc.Node.extend({
		currentAction: null,
		data:{},
		Flinch:function() {
			this.animator.stop();
			this.currentAction.stop();
			this.flinch.start();
			this.callback();
			//this.animator.delay();
		},
		ctor: function(animations, entity) {
			this._super();
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.addChild( this.animator );
			
			this.entity.hurtbox.addCollider(-15,-30,60,120);
			// makes arrow
			var arrow = function(pres, target) {
				var a = rect(-30,-10,64,26, true);
				var s = cc.Sprite.create("assets/art/fantasy/Sprites/arrow.png");
				a.addChild(s);
				a.damage = 3;
				a.scaleX = .25;
				a.scaleY = .25;
				s.x = 8*-a.x;
				s.y = 4*-a.y;
				s.scaleX = 1.41;
				s.scaleY = 1.41;
				a.x = pres.x + a.x;
				a.y = pres.y + a.y; 
				if(target) {
					var distance = Math.sqrt( (target.x - pres.x)*(target.x - pres.x) + (target.y - pres.y)*(target.y - pres.y) );
					a.movex = (target.x - pres.x) / distance;
					s.setRotation(Math.acos(a.movex) * -180 / Math.PI);
					a.movey = (target.y - pres.y) / distance;
					a.scaleX = .25*pres.scaleX;
				} else {
					pres.scene.collisionMaster.removeRefereces(this);	
					s.cleanup()
					a.removeChild(s);
					a.cleanup();
				}
				a.w *= a.scaleX;
				a.h *= a.scaleY;
				a.update = function() {
					a.x += a.scaleX * 34 * a.movex;
					a.y += a.scaleX * 34 * a.movey;
					if(a.x < 0 || a.x > cc.winSize.width) {
						pres.scene.collisionMaster.removeRefereces(this);	
						pres.scene.collisionMaster.p_characters.splice(i, 1);
						s.opacity = 0;
						a.removeChild(s);
						s.cleanup()
						a.parent.removeChild(this);
						a.cleanup();
					}
				}
				a.scheduleUpdate();
				a.hit = function() {
					pres.scene.collisionMaster.removeRefereces(this);	
					var i = pres.scene.collisionMaster.p_characters.indexOf(this);
					pres.scene.collisionMaster.p_characters.splice(i, 1);
					s.opacity = 0;
					a.removeChild(s);
					s.cleanup()
					a.parent.removeChild(this);
					a.cleanup();				
				}
				pres.scene.collisionMaster.p_characters.push(a);
				pres.parent.addChild(a)
			}
			// idle behavior
			this.idle = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			// run behavior
			this.run = new customAction({
				update: function() {
					if(this.entity.x > 30 && this.entity.x < 1250) {
						this.entity.x += this.entity.scaleX * 5;
					}  else {
						if(this.entity.x <= 30) {
							this.entity.x = 30.1
						}
						if(this.entity.x >= 1250) {
							this.entity.x = 1249.1;
						}
					}
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			// attack behavior
			this.attack = new customAction({
				update: function() {
					if(this.frame == 9) {
						arrow(this.entity, this.target);
					}
				},
				animate: function() {
					this.animator.play("attack");
				},
				target:this
			});
			// flinch behavior
			this.flinch = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			// down behavior
			this.down = new customAction({
				onenable: function() {
					this.entity.health.damage(-this.entity.health._value);
				},
				update: function() {
					this.entity.health.damage(this.entity.health._value);
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			
			this.addChild(this.idle);
			this.addChild(this.run);
			this.addChild(this.attack);		
			this.addChild(this.flinch);
			this.addChild(this.down);
			
			this.main()
		},
		main: function() {
			this.data.idlecount = 6;
			this.data.count = this.data.idlecount;
			this.data.flinch = 0;
			this.data.down = 0;
			this.idle.start();
			this.callback()
		},
		callback: function() {
			if(this.currentAction == this.down) {
				if( this.data.down < 60 ) {
					this.data.down ++;
				} else {
					this.data.down = 0;
					this.entity.health.damage( -this.entity.health.maxHealth / 4);
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			} else if(this.currentAction == this.flinch) {
				if(!this.data.flinch) {
					this.data.flinch = 1;
				} else if(this.data.flinch < 5) {
					this.data.flinch ++;
				} else {
					this.data.flinch = 0;
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			}
		
			else if(this.data.count < this.data.idlecount) {
				if(this.data.count == 0) {
					this.currentAction.stop();
					this.idle.start();
				}
				this.data.count ++;
			} else {
				var tooClose = 0;
				var distance = 250;
				var odistance;
				var furthest = 100000;
				var index = -1;
				var j = 0;
				for( var i in this.entity.scene.collisionMaster.enemies ) {
					if( Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x) < distance ) {
						tooClose = this.entity.scene.collisionMaster.enemies[i].x < this.entity.x ? -1: 1;
						distance = Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x);
					}
					if( Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x) < furthest ) {
						furthest = Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x);
						index = i;
						j = this.entity.scene.collisionMaster.enemies[i].x < this.entity.x ? -1: 1;
					}
				}
				if(tooClose == -1) {
					this.entity.scaleX = 1;
					this.currentAction.stop();
					this.run.start();
				} else if(tooClose == 1) {
					this.entity.scaleX = -1;
					this.currentAction.stop();
					this.run.start();
				} else if(j == 0) {
					this.entity.scaleX = 1;
					this.currentAction.stop();
					this.idle.start();
				} else{
					if(Math.abs(furthest) < 500) {
						this.entity.scaleX = j;
						this.currentAction.stop();
						this.attack.start();
						this.attack.target = this.entity.scene.collisionMaster.enemies[index];
						this.data.count = 0;
					} else {
						this.entity.scale = distance < 0 ? -1 : 1;
						this.currentAction.stop();
						this.run.start();
					}
				}
			}
			this.currentAction.animate();
		}
	});
	return new entity({
		health: 50,
		animations: {
			idle: prestonIdle,
			run: prestonRun,
			attack: prestonAttack,
			flinch: prestonFlinch
		},
		controller: prestonAI,
		parent: parent
	})
} 

function createJackie(parent) {
	var jackieIdle = cc.Animation.create();
	
	var jackieRun = cc.Animation.create();
	for (var i = 0; i < 6; i++) {
		jackieRun.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Jackie_Run_Cycle/Jackie_Run_Cycle_000" + i + "_" + (i + 1) + ".png" );
	}
	jackieRun.setDelayPerUnit(1 / 15);
	
	var jackieAttack = cc.Animation.create();
	
	for(var i = 0; i < 8; i++){
		jackieAttack.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Jackie_Attack/Jackie_Attack_000" + i + "_" + (i + 1) + ".png");
	}
	jackieAttack.setDelayPerUnit(1/15);
	
	var jackieFlinch = cc.Animation.create();
	
	var jackieDown = cc.Animation.create();
	
	var jackieAI = cc.Node.extend({
		currentAction: null,
		data:{},
		Flinch:function() {
			
			cc.log("2503: jackie is flinching this.entity.hurtbox:" + this.entity.hurtbox );
			if(this.currentAction != this.attack) {
				this.animator.stop();
				this.currentAction.stop();
				this.flinch.start();
				this.callback();
			}
			//this.animator.delay();
		},
		ctor: function(animations, entity) {
			this._super();
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.addChild( this.animator );
			
			this.entity.hurtbox.addCollider(-15,-30,60,120);
			this.entity.hurtbox.tag = "jackie";
			
			// idle behavior
			this.idle = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			// run behavior
			this.run = new customAction({
				update: function() {
					if(this.entity.x > 30 && this.entity.x < 1250) {
						this.entity.x += this.entity.scaleX * 5;
					}  else {
						if(this.entity.x <= 30) {
							this.entity.x = 30.1
						}
						if(this.entity.x >= 1250) {
							this.entity.x = 1249.1;
						}
					}
					if(this.entity.scene.collisionMaster.boss && this.entity.scene.collisionMaster.boss.y == 500) return;
					var distance = 100;
					for( var i in this.entity.scene.collisionMaster.enemies ) {
						if( Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x) < distance) {
							closest = Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x);
							this.animator.stop();
							this.entity.controller.callback();
						}
					}
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			this.attack = new customAction({
				onenable: function() {
					this.entity.controller.y = 34 * .41;
				},
				update: function() {
					if(this.frame == 13) {
						this.hitbox = this.entity.hitbox.addCollider(0,-30, 120, 120, 10);
					}
				},
				ondisable: function() {
					this.entity.controller.y = 0;
					this.entity.hitbox.removeCollider(this.hitbox);
					this.entity.scene.collisionMaster.removeRefereces(this.hitbox);
					this.hitbox = null;
				},
				animate: function() {
					this.animator.play("attack");
				},
				target:this
			});
			this.flinch = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			this.down = new customAction({
				onenable: function() {
					this.entity.health.damage(-this.entity.health._value);
				},
				update: function() {
					this.entity.health.damage(this.entity.health._value);
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			
			this.addChild(this.idle);
			this.addChild(this.run);
			this.addChild(this.attack);
			this.addChild(this.flinch);
			this.addChild(this.down);
			
			this.main();
		},
		main: function() {
			this.data.idlecount =  2 * (4 - master["Jackie"]);
			this.data.count = this.data.idlecount;
			this.data.flinch = 0;
			this.data.down = 0;
			this.idle.start();
			this.callback();
		},
		callback: function() {
			if(this.entity.health._value <= 0) {
				this.currentAction.stop();
				this.down.start();
			}
			if(this.entity.scene.collisionMaster.boss && this.entity.scene.collisionMaster.boss.y == 500) {
				this.entity.scaleX = Math.random() < .5 ? -1 : 1;
				this.currentAction.stop();
				this.run.start();
			} else if(this.currentAction == this.down) {
				if( this.data.down < 60 ) {
					this.data.down ++;
				} else {
					this.data.down = 0;
					this.entity.health.damage( -this.entity.health.maxHealth / 4);
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			} else if(this.currentAction == this.flinch) {
				if(!this.data.flinch) {
					this.data.flinch = 1;
				} else if(this.data.flinch < 5) {
					this.data.flinch ++;
				} else {
					this.data.flinch = 0;
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			} else if(this.data.count < this.data.idlecount) {
				if(this.data.count == 0) {
					this.currentAction.stop();
					this.idle.start();
				}
				this.data.count ++;
			} else {
				
				var tooFar = 0;
				var distance = 100;
				var closest = 100000;
				for( var i in this.entity.scene.collisionMaster.enemies ) {
					if( Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x) < closest && this.entity.scene.collisionMaster.enemies[i].y == this.entity.y ) {
						closest = Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x);
						tooFar = this.entity.scene.collisionMaster.enemies[i].x < this.entity.x ? -1: 1;
					}
				}
				var j = tooFar;
				if(closest < distance) {
					tooFar = 0; 
				}

				
				if(tooFar == -1) {
					this.entity.scaleX = -1;
					this.currentAction.stop();
					this.run.start();
				} else if(tooFar == 1) {
					this.entity.scaleX = 1;
					this.currentAction.stop();
					this.run.start();
				} else if(j == 0) {
					this.entity.scaleX = 1;
					this.currentAction.stop();
					this.idle.start();
				} else {
					this.entity.scaleX = j;
					this.currentAction.stop();
					this.attack.start();
					this.data.count = 0;
				}
			}
			this.currentAction.animate();
		}
	});
	return new entity ({
		health: 200,
		animations: {
			idle: jackieIdle,
			run: jackieRun,
			attack: jackieAttack,
			flinch: jackieFlinch,
			down: jackieDown
		},
		controller: jackieAI,
		parent: parent
	})
}

function createClark(parent) {
	var clarkIdle = cc.Animation.create();
	
	var clarkRun = cc.Animation.create();
	for (var i = 0; i < 6; i++) {
		clarkRun.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Clark_Run_Cycle/Clark_Run_Cycle_000" + i + "_" + (i + 1) + ".png" );
	}
	clarkRun.setDelayPerUnit(1 / 15);
	
	var clarkHeal = cc.Animation.create();
	for (var i = 0; i < 22; i++) {
		if(i < 10){
			clarkHeal.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Clark_Attack/Clark_Attack_000" + i + "_" + (i + 1) + ".png" );
		}
		else{
			clarkHeal.addSpriteFrameWithFile("assets/art/fantasy/Sprites/Clark_Attack/Clark_Attack_00" + i + "_" + (i + 1) + ".png" );
		}
	}
	clarkHeal.setDelayPerUnit(1 / 15);
	
	
	var clarkFlinch = cc.Animation.create();
	
	var clarkDown = cc.Animation.create();
	
	var clarkAI = cc.Node.extend({
		currentAction: null,
		data:{},
		Flinch:function() {
			this.animator.stop();
			this.currentAction.stop();
			this.flinch.start();
			this.callback();
		},
		ctor: function(animations, entity) {
			this._super();
			this.entity = entity;
	
			this.animator = new AnimatorConstructor(animations, this);
			this.addChild( this.animator );
			
			this.entity.hurtbox.addCollider(-15,-30,60,120);
			
			// idle behavior
			this.idle = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			// run behavior
			this.run = new customAction({
				update: function() {
					if(this.entity.x > 30 && this.entity.x < 1250) {
						this.entity.x += this.entity.scaleX * 5;
					} else {
						if(this.entity.x <= 30) {
							this.entity.x = 30.1
						}
						if(this.entity.x >= 1250) {
							this.entity.x = 1249.1;
						}
					}
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			this.heal = new customAction({
				update: function() {
					this.entity.scaleX = this.entity.x < this.playerHealth.entity.x ? 1 : -1;
					if(this.frame > 15 && this.frame < 61) {
						if(this.entity.scene.collisionMaster.boss && this.entity.scene.collisionMaster.boss.controller.data.phase == 3) {
							for( var i in this.entity.scene.collisionMaster.characters ) {
								this.entity.scene.collisionMaster.characters[i].health.damage(-.1);
							}
						} else {
							this.playerHealth.damage(-1);
							if(this.playerHealth._value == this.playerHealth.maxHealth) {
								this.animator.stop();
								this.entity.controller.callback();
							}
						}
					}
				},
				animate: function() {
					this.animator.play("heal");
				},
				target:this
			});
			this.flinch = new customAction({
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			this.down = new customAction({
				onenable: function() {
					this.entity.health.damage(-this.entity.health._value);
				},
				update: function() {
					this.entity.health.damage(this.entity.health._value);
				},
				animate: function() {
					this.animator.play("run");
				},
				target:this
			});
			
			this.addChild(this.idle);
			this.addChild(this.run);
			this.addChild(this.heal);
			this.addChild(this.flinch);
			this.addChild(this.down);
			
			this.main();
		}, 
		main: function() {
			this.data.idlecount =  2 * (4 - master["Clark"]);
			this.data.count = this.data.idlecount;
			this.data.flinch = 0;
			this.data.down = 0; 
			this.idle.start();
			this.callback();
		},
		callback: function() {
			if(this.entity.scene.collisionMaster.boss && this.entity.scene.collisionMaster.boss.y == 500) {
				this.entity.scaleX = Math.random() < .5 ? -1 : 1;
				this.currentAction.stop();
				this.run.start();
			} else if(this.currentAction == this.down) {
				if( this.data.down < 60 ) {
					this.data.down ++;
				} else {
					this.data.down = 0;
					this.entity.health.damage( -this.entity.health.maxHealth / 4);
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			} else if(this.currentAction == this.flinch) {
				if(this.data.flinch < 5) {
					this.data.flinch ++;
				} else {
					this.data.flinch = 0;
					this.currentAction.stop();
					this.idle.start();
					this.data.count = this.data.idlecount;
				}
			} else if(this.data.count < this.data.idlecount) {
				if(this.data.count == 0) {
					this.currentAction.stop();
					this.idle.start();
				}
				this.data.count ++;
			} else {
				var tooClose = 0;
				var distance = 250;
				for( var i in this.entity.scene.collisionMaster.enemies ) {
					if( Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x) < distance ) {
						tooClose = this.entity.scene.collisionMaster.enemies[i].x < this.entity.x ? -1: 1;
						distance = Math.abs(this.entity.scene.collisionMaster.enemies[i].x - this.entity.x);
					}
				}
				if(tooClose == -1) {
					this.entity.scaleX = 1;
					this.currentAction.stop();
					this.run.start();
				} else if(tooClose == 1) {
					this.entity.scaleX = -1;
					this.currentAction.stop();
					this.run.start();
				} else {
					var lowest = 10000;
					var lowestTarget = -1;
					var distance;
					for( var i in this.entity.scene.collisionMaster.characters ) {
						if(this.entity.scene.collisionMaster.characters[i].health._value < lowest && 
						 this.entity.scene.collisionMaster.characters[i].health._value !=
						 this.entity.scene.collisionMaster.characters[i].health.maxHealth &&
						 this.entity.scene.collisionMaster.characters[i].health._value != 0) {
							lowest = this.entity.scene.collisionMaster.characters[i].health._value;
							lowestTarget = i;
							distance = this.entity.scene.collisionMaster.characters[i].x - this.entity.x
						}
					}
					if(lowestTarget != -1) {
						if(Math.abs(distance) < 400) {
							this.heal.playerHealth = this.entity.scene.collisionMaster.characters[lowestTarget].health;
							this.currentAction.stop();
							this.heal.start();
							this.data.count = 0;
						} else {
							this.entity.scale = distance < 0 ? -1 : 1;
							this.currentAction.stop();
							this.run.start();
						}
					} else {
						this.currentAction.stop();
						this.idle.start();
					}
				}
			}
			this.currentAction.animate();
		}
	});
	return new entity({
		health: 75,
		animations: {
			idle: clarkIdle,
			run: clarkRun,
			heal: clarkHeal,
			flinch: clarkFlinch,
			down: clarkDown
		},
		controller: clarkAI,
		parent: parent
	})
}

var entity = cc.Sprite.extend({
	health:null,
	controller:null,
	hitbox:null,
	hurtbox:null,
	target:null,
	ctor: function(args) {
		this._super();
		
		this.scene = args.parent
		
		this.health = new HealthConstructor(args.health, this);
		this.addChild(this.health);
		
		this.hitbox = new ColliderConstructor("hitbox", this);
		this.addChild(this.hitbox);
		
		this.hurtbox = new ColliderConstructor("hurtbox", this);
		this.addChild(this.hurtbox);
		
		this.controller = new args.controller(args.animations, this);
		this.addChild(this.controller);
	},
	turnaround: function() {
		this.scaleX *= -1;
		this.health.scaleX *= -1;
	},
	deleteSelf: function() {
		this.cleanup();
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
		if(this._value == 0) {
			this.entity.deleteSelf
		}
		var ratio = (this._value / this.maxHealth);
		this.healthBar.clear(); 
		var r = ratio > .5 ? Math.floor((1 - 2*ratio) * 255) : 255;
		var g = ratio < .5 ? Math.floor((2*ratio) * 255) : 255;
		this.healthBar.drawRect(
			new cc.Point(-40,100),
			new cc.Point(80*ratio - 40, 130),
			new cc.Color(r, g, 0, 255),
			3,
			new cc.Color(0,0,0,0)
		);
		
		
		/* draw nodes do not extend opacity functionality
         *		
		var h = cc.DrawNode.create();
		h.drawRect(
			new cc.Point(80*ratio - 40, 100),
			new cc.Point(80*oldratio - 40, 130),
			new cc.Color(255, 0, 0, 255),
			0,
			new cc.Color(0,0,0,0)
		);
		this.addChild(h);
		deleteSelf = cc.callFunc(this._h_del, this);
		this._h_del = function() {
				h.cleanup();
		}
		h.runAction( cc.fadeOut(.3) );
		 */
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
		this.scaleX = .41;
		this.scaleY = .41;
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
			this.getActionByTag(this.__animation_tag)._actions[0]._animation._delayPerUnit = 1;
			this.runAction ( cc.sequence( cc.delayTime(.05), cc.callFunc(this._unsetDelay, this) ) );
			if(this.controller.currentAction)
				this.controller.currentAction._run = true;
		}
	},
	_unsetDelay: function() {
		console.log("_unset called");
		this.getActionByTag(this.__animation_tag)._actions[0]._animation._delayPerUnit = 1 / 15;
		if(this.controller.currentAction)
			this.controller.currentAction._run = true;
	},
	stop: function() {
		this.stopActionByTag(this.__animation_tag);
	}
});

var ColliderConstructor = cc.Node.extend({
	type: null,
	entity: null,
	ignored: null,
	all: null,
	ctor: function(t, entity) {
		if(this.tag != null && this.tag == "jackie"){
			cc.log("jackie collider constructed");
		}
		this.entity = entity;
		if(t == "hitbox") {
			this.type = false;
		} else {
			this.type = true;
		}
		this._super();
		this.ignored = [];
		this.all = [];
	},
	addCollider: function(nodeorx,y,w,h,damage) {
		if(typeof nodeorx == "number") {
			var n = rect(nodeorx,y,w,h, !this.type);
			this.addChild(n);
			this.all.push(n);
			if(damage) n.damage = damage;
			return n;
		} else {
			this.addChild(nodeorx)
			return nodeonx;
		}
	},
	addIgnore: function(id) {
		this.ignored.push(id.__instanceId);
	},
	removeCollider: function(node) {
		this.removeChild(node);
		this.all.splice(this.all.indexOf(node), 1);
		if(node)
			node.cleanup();
	},
	getAll: function() {
		return this.all;
	},
	hit: function(collider) {
		if(this.tag != null && this.tag == "jackie"){
			cc.log("jackie attacked");
			cc.log("before: this.entity.health = " + this.entity.health);
			this.entity.health.damage(collider.damage);
			cc.log("after: this.entity.health = " + this.entity.health);
		}
	
		if(this.ignored.indexOf(collider.__instanceId) == -1) {
			if(collider.damage) {
				this.entity.health.damage(collider.damage);
			}
			this.ignored.push(collider.__instanceId);
		}
	},
});

