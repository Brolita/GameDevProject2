/* these classes (js objects) will be for the "real"
 * part of the game, below them will be the classes
 * for the fantasy
 *
 */
 
var DialogueInteractiveLayer = cc.Layer.extend({
	sceneInfo: null,
	previous: 0,
	diaNumber: 0,
	diaText: null,
	texNumber: 0,
	choice: false,
	target: -1,
	ctor:function ( sceneObject ) {
		this._super();

		this.sceneInfo = sceneObject;

		var waitChar = cc.delayTime(1);
		var fadeChar = cc.fadeIn(1);
		var grayChar = cc.tintTo(1, 128,128,128);
		
		var waitDia = cc.delayTime(3);
		var fadeDia = cc.fadeIn(.5);
		
		var parent = this;

		// dialogueBox

		var dialogueBox = cc.Sprite.create("../assets/art/real/sprites/dialogue_box.png");
		dialogueBox.x = cc.director.getWinSize().width/2;
		dialogueBox.y = cc.director.getWinSize().height/4;
		dialogueBox.opacity = 0;
		
		this.addChild(dialogueBox);
		dialogueBox.runAction( cc.Sequence.create(waitDia.clone(), fadeDia.clone()) )
		
		// dialouge

		this.diaText = cc.LabelTTF.create("Something went wrong :(", "calibri", 32, cc.size(900, 210), cc.TEXT_ALIGNMENT_LEFT);
		this.diaText.x = cc.director.getWinSize().width/2;
		this.diaText.y = cc.director.getWinSize().height/4;
		this.diaText.opacity = 0;
		this.diaText.runAction( cc.Sequence.create(waitDia.clone(), fadeDia.clone()) )
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
		
		var animation = cc.Animate.create(touchBubbleAnim)

		// touch listener
		
		var touchListener = cc.EventListener.create({
			event: cc.EventListener.MOUSE,
			onMouseDown: function (event) {
				touchBubble.runAction( animation.clone() );
				return false;
			}, 
			onMouseMove: function(event) {
				touchBubble.x = event._x;
				touchBubble.y = event._y;
				return false;
			}, 
			onMouseUp: function(event) {
				touchBubble.runAction( animation.clone().reverse() );
				parent.click();
				return false;
			}
		});

		// attach listener to touch bubble
		
		cc.eventManager.addListener(touchListener, touchBubble);
		this.addChild(touchBubble);

	}, 
	click: function() {
		if(this.diaText.opacity != 255)
			return;
		if(!this.choice) {
			this.previous = this.diaNumber;
			this.diaNumber = this.sceneInfo.dialogue[this.diaNumber].text[this.texNumber].next;
			this.parseDialogue();
		} else {
			if(this.target != -1) {
				// redo the parseAction because last time we didn't know which happened
				this.choice = false;
				this.texNumber = this.target;
				this.parseAction();
				// then parse the dialogue
				this.diaNumber = this.sceneInfo.dialogue[this.diaNumber].text[this.target].next;
				this.parseDialogue();
			}
		}
	}, 
	parseAction: function() {
		if(this.choice)
			return;
		var action = this.sceneInfo.dialogue[this.diaNumber].text[this.texNumber].action;
		if(action) {
			master[action.target] += action.value;
		}
	},
	parseDialogue: function() {
		if(this.diaNumber == "game") {
			// change to game scene
			return;
		} else if(typeof this.diaNumber === 'string' ) {
			this.parent.changeScene(this.diaNumber);
			return;
		}
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
			} else {
				possible.push(i);
			}
		}
		
		// if theres only one case, then were done
		
		if(possible.length == 1) {
			this.diaText.string = text[possible[0]].value;
			this.texNumber = possible[0];
		} 
		
		// here there must be a choice because there were multiple texts that are possible
		
		else {
			// there are only ever two choices, so we need to create a new text
			this.choice = true;
			
			var parent = this;
			
			// change text of the top
			
			this.diaText.string = text[possible[0]].value;
			
			// make a TTF for the bottom
			
			
			var otherDiaText = cc.LabelTTF.create(text[possible[1]].value, "calibri", 32, cc.size(900, 210), cc.TEXT_ALIGNMENT_LEFT);
			otherDiaText.x = cc.director.getWinSize().width/2;
			otherDiaText.y = cc.director.getWinSize().height/4 - 105;
			
			this.addChild(otherDiaText);
			
			// make choice listener
			
			this.target = -1;
			
			var choiceListener = cc.EventListener.create({
				event: cc.EventListener.MOUSE,
				
				// detecter where the mouse is
				
				onMouseMove: function(event) {
					if(	event._x > (cc.director.getWinSize().width/2 - otherDiaText.width/2) 
					 && event._x < (cc.director.getWinSize().width/2 + otherDiaText.width/2) ) {
						if (event._y > (cc.director.getWinSize().height/4 - 105)
						 && event._y < (cc.director.getWinSize().height/4) ) {
							parent.target = possible[1];
						} else if (event._y > (cc.director.getWinSize().height/4)
						        && event._y < (cc.director.getWinSize().height/4 + 105) ) {
							parent.target = possible[0];
						}
					}
					return false;
				}, 
				
				// when they click, theire last target's dianumber is set, 
				// the other dialogue is destroyed and then the dialogue is reparsed
				
				onMouseUp: function(event) {
					if(parent.target != -1) {
						cc.eventManager.removeListener(this);
						parent.removeChild(otherDiaText);
					}
					return false;
				}
			});
			
			cc.eventManager.addListener(choiceListener, otherDiaText);
		}
		this.parseAction();
	}
});

var DialogueBackgroundLayer = cc.Layer.extend({
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
		console.log(master);
		this._super();
		
		s = master.day[master.currentDay][this.sceneName]
		
		// create background layer
		
		var background = new DialogueBackgroundLayer(s.background, this.sceneName);
		this.addChild(background);
		
		//create interactive layer
		
		var interactive = new DialogueInteractiveLayer(s);
		this.addChild(interactive);
	}, 
	changeScene: function ( sceneName ) {
		var oldScene = this;
		var action = cc.FadeOut.create(3.0); //create a 3 second fade out
		var clean = cc.Action.extend({ // this will actually change the scene
			update: function() {
				cc.director.runScene(new Dialogue(sceneName));
				oldScene.cleanup();
				this.stop();
			}
		});
		this.runAction( cc.Sequence.create( action, new clean() ) );
	}
});