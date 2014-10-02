/*
 *
 *
 *
 */
 var game = cc.Scene.extend({ //setting up the scene object
	ctor:function(difficulty, characters) { //the scene constructor
		this._super();
	},
	
	onEnter:function(){ //this is called right after ctor, generate layers here	
		this._super();		//var fanatsyBackground = new FantasyBackgroundLayer();
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
		this.player = new cc.Sprite("src/grossini.png"); //loading in the sprite
		this.addChild(this.player); //Make the player sprite part of the scene heirarchy
		
		
		this.player.setPosition(0,0); //put him in the corner
		
		this.canMove = true //whether or not the player can move, prevents double movement
		
		var action = cc.moveTo(1,cc.p(100,200)); //move him onto the screne
		this.player.runAction(action);
		
				
		
		cc.eventManager.addListener ({ //whenever you click, move the character to that position
			event: cc.EventListener.MOUSE,
			onMouseDown: function(event) {
				event.getCurrentTarget().moveIt(event.getLocation());
			}
		},this);
	},
	moveIt:function(p) { //functionality for moving
		if(this.canMove){
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
 
 var FantasyInteractiveLayer = cc.Layer.extend({
	player:null,
	ctor:function() {
		this._super();
		// touch bubble
		/*
		var parent = this;
		var touchBubble = cc.Sprite.create("../Assets/art/real/sprites/click_0.png" );
		
		var touchBubbleAnim = cc.Animation.create();
		for ( var i = 0 ; i < 9 ; i ++ ) {
			var frameName = "../Assets/art/real/sprites/click_" + i + ".png" ;
			touchBubbleAnim. addSpriteFrameWithFile ( frameName ) ;
		}
		touchBubbleAnim.setDelayPerUnit ( 1 / 60 ) ;
		touchBubbleAnim.setRestoreOriginalFrame ( false ) ;
		*/
		
        this.player = new cc.Sprite("src/grossini.png");
		
        this.addChild(this.player/*, 0, TAG_SPRITE*/);
		
        this.player.x = 200;
	    this.player.y = 150;

		var action = cc.moveTo(1,cc.p(100,200));
		this.player.runAction(action);

		
		// touch listener
		
		var touchListener = cc.EventListener.create({
			event: cc.EventListener.MOUSE,
			swallowTouches: true,
			onMouseDown: function (event) {
				var action = cc.Animate.create(touchBubbleAnim)
				touchBubble.runAction( action );
				return false;
			}, 
			onMouseMove: function(event) {
				touchBubble.x = event._x;
				touchBubble.y = event._y;
				return false;
			}, 
			onMouseUp: function(event) {
				console.log("OnMouseUp");
				//var action = cc.Animate.create(touchBubbleAnim);
				//touchBubble.runAction( action.reverse() );
				event.getCurrentTarget().parent.click(event.getLocation());
				return false;
			}
		});

		// attach listener to touch bubble
		
		//cc.eventManager.addListener(touchListener, touchBubble);
		//this.addChild(touchBubble);
	
	},
	onEnter:function() {
		var foo = cc.moveTo(1,cc.p(300,300));
		this.player.runAction(foo);
		cc.log("onEnter");
        //this.player.runAction(cc.jumpTo(4, cc.p(300, 48), 100, 4));
	},
	click:function(p){
		p.y = player.y; //do not change the player's vertical coordinates
		console.log("click x:" + p.x + " y:" + p.y);
		//this.player.setPosition(p);
		this.player.runAction(cc.moveTo(1, p));

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