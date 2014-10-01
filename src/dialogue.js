/* these classes (js objects) will be for the "real"
 * part of the game, below them will be the classes
 * for the fantasy
 *
 */
 
var Interactive = cc.Layer.extend({
	sceneInfo: null,
	diaNumber: 0,
	diaText: null,
	texNumber: 0,
	ctor:function ( sceneObject ) {
		this._super();

		this.sceneInfo = sceneObject;

		var parent = this;

		// dialogueBox

		var dialogueBox = cc.Sprite.create("../assets/art/real/sprites/dialogue_box.png");
		dialogueBox.x = cc.director.getWinSize().width/2;
		dialogueBox.y = cc.director.getWinSize().height/4;

		this.addChild(dialogueBox);
		
		// dialouge

		this.diaText = cc.LabelTTF.create("Something went wrong :(", "calibri", 40);
		//this.diaText.lineWidth = 960;
		this.diaText.x = cc.director.getWinSize().width/2;
		this.diaText.y = cc.director.getWinSize().height/4 + 110;
	
		
		this.parseDialogue();
		
		this.addChild(this.diaText);

		// touch bubble
		
		var touchBubble = cc.Sprite.create("../assets/art/real/sprites/click_0.png" );
		
		var touchBubbleAnim = cc.Animation.create();
		for ( var i = 0 ; i < 9 ; i ++ ) {
			var frameName = "../assets/art/real/sprites/click_" + i + ".png" ;
			touchBubbleAnim. addSpriteFrameWithFile ( frameName ) ;
		}
		touchBubbleAnim.setDelayPerUnit ( 1 / 60 ) ;
		touchBubbleAnim.setRestoreOriginalFrame ( false ) ;

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
				var action = cc.Animate.create(touchBubbleAnim);
				touchBubble.runAction( action.reverse() );
				parent.click();
				return false;
			}
		});

		// attach listener to touch bubble
		
		cc.eventManager.addListener(touchListener, touchBubble);
		this.addChild(touchBubble);

	}, 
	click: function() {
		if(this.texNumber != -1) {
			this.diaNumber = this.sceneInfo.dialogue[this.diaNumber].text[this.texNumber].next;
			if(this.diaNumber == "game") {
				// change to game scene
			} else if(typeof this.diaNumber === 'string' ) {
				this.parent.changeScene(this.diaNumber);
			} else {
				this.parseDialogue();
			}
		}
	}, 
	parseDialogue: function() {
		var text = this.sceneInfo.dialogue[this.diaNumber].text;
		
		// first we check if if heres only once item, because then its easy 	
		
		if(text.length == 1) {
			this.diaText.string = text[0].value;
			this.texNumber = 0;
		}
		
		// next we check against cases
		
		var possible = [];
		for(i in text) {
			if(text[i].case) {
				if(text[i].case.cmp == '>') {
					if(master[text[i].case.target] > text[i].case.value) possible.push(i);
				} else if(text[i].case.cmp == '=') {
					if(master[text[i].case.target] == text[i].case.value) possible.push(i);
				} else {
					if(master[text[i].case.target] < text[i].case.value) possible.push(i);
				}
			}
			possible.push(i);
		}
		
		// if theres only one case, then were done
		
		if(possible.length == 1) {
			this.diaText.string = text[possible[0]].value;
			this.texNumber = possible[0];
		} 
		
		// here there must be a choice because there were multiple texts that are possible
		
		else {
			this.texNumber = -1;
		}
	}
});

var BackgroundLayer = cc.Layer.extend({
	ctor:function ( backgroundSprite, sceneName ) {
		this._super();
		
		// background
		
		var background = cc.Sprite.create( backgroundSprite );
		background.x = cc.director.getWinSize().width/2;
		background.y = cc.director.getWinSize().height/2;
		background.opacity = 0;
		this.addChild( background );
		var action = cc.fadeIn(1.0)
		background.runAction( action );
		
		// scene into
		
		//var sc
	}
});

var Dialogue = cc.Scene.extend({
	characterCount: 0,
	sceneName: null,
	ctor: function( sceneName ) {
		this._super();
		this.sceneName = sceneName;
	}, 
	onEnter:function () {
		this._super();
		
		s = master.day[master.currentDay][this.sceneName]
		
		var background = new BackgroundLayer(s.background, this.sceneName);
		this.addChild(background);
		
		var interactive = new Interactive(s);
		this.addChild(interactive);
	}, 
	changeScene: function ( sceneName ) {
		var oldScene = this;
		var action = cc.FadeOut.create(3.0); //create a 3 second fade out
		var clean = cc.Action.extend({ // this will actually change the scene
			update: function() {
				cc.director.runScene(new Scene(sceneName));
				oldScene.cleanup();
				this.stop();
			}
		});
		this.runAction( cc.Sequence.create( action, new clean() ) );
	}
});