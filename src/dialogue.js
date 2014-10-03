/* these classes (js objects) will be for the "real"
 * part of the game, below them will be the classes
 * for the fantasy
 *
 * flow:
 * initalization
 *  create background layer 
 *   fade in background
 *  create interactive layer
 *   create character
 *    fade in each
 *    gray each
 *   fade in dialogue
 *    parse dialogue for info
 *     number of choices
 *     value of text
 *     white character
 *  --wait on click--
 *   case: left click
 *    case: 1 choice 
 *     run action
 *     advance dialogue
 *    case: 2 choice
 *     case: targeted a choice
 *      run action
 *      advance dialogue
 *   case: right click
 *    case: previous not null (-1)
 *     set dialogue to pervious
 *     set previous to null
 *
 */
 
var DialogueInteractiveLayer = cc.Layer.extend({
	sceneInfo: null,
	previous: -1,
	diaNumber: 0,
	diaText: null,
	texNumber: 0,
	choice: false,
	target: -1,
	characters: null,
	ctor:function ( sceneObject ) {
		this._super();
		this.cascadeColor = true;
		this.cascadeOpacity = true;

		this.sceneInfo = sceneObject;
		
		var waitDia = cc.delayTime(3);
		var fadeDia = cc.fadeIn(.5);
		
		var parent = this;

		// characters
		
		// init character object 
		
		this.characters = {
			Emily:null, //remove after testing
			you:null, // remove after testing
			Ken:null,
			Mara:null,
			Clark:null,
			Preston:null,
			Jackie:null,
			number: 0
		}
		
		// load init characters
		
		for (var i in sceneObject.characters) {
			this.characterChange(sceneObject.characters[i], true);
		}
		
		// dialogueBox

		var dialogueBox = cc.Sprite.create("../assets/art/real/sprites/dialogue_box.png");
		dialogueBox.x = cc.director.getWinSize().width/2;
		dialogueBox.y = cc.director.getWinSize().height/4;
		dialogueBox.zIndex = 1;
		dialogueBox.opacity = 0;
		
		this.addChild(dialogueBox);
		dialogueBox.runAction( cc.Sequence.create(waitDia.clone(), fadeDia.clone()) )
		
		// dialouge

		this.diaText = cc.LabelTTF.create("Something went wrong :(", "calibri", 32, cc.size(900, 210), cc.TEXT_ALIGNMENT_LEFT);
		this.diaText.x = cc.director.getWinSize().width/2;
		this.diaText.y = cc.director.getWinSize().height/4;
		this.diaText.zIndex = 1;
		this.diaText.opacity = 0;
		this.diaText.runAction( cc.Sequence.create(waitDia.clone(), fadeDia.clone()) )
		this.parseDialogue(true);
		
		this.addChild(this.diaText);

		// touch bubble
		
		var touchBubble = cc.Sprite.create("../assets/art/real/sprites/click_0.png" );
		touchBubble.zIndex = 5;
		
		var touchBubbleAnim = cc.Animation.create();
		for ( var i = 0 ; i < 9 ; i ++ ) {
			var frameName = "../assets/art/real/sprites/click_" + i + ".png" ;
			touchBubbleAnim.addSpriteFrameWithFile ( frameName ) ;
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
				parent.click(event);
				return false;
			}
		});

		// attach listener to touch bubble
		
		cc.eventManager.addListener(touchListener, touchBubble);
		this.addChild(touchBubble);
	}, 
	characterChange: function(dialogueObject, intro) {
		intro = intro || false;
		var addNum = 0;
		if( this.characters[dialogueObject.characterName] ) {
			// existed before this (a sprite change)
			var oldc = this.characters[dialogueObject.characterName];
			addNum = oldc.addNum;
			oldc.runAction( cc.sequence( oldc.fadeChar.clone().reverse(), oldc.deleteChar ) );
		} else {
			// didn't exist before this (an entrance)
			addNum = this.characters.number;
			this.characters.number ++;
		}
		
		// this is the character class, since character are only made in this scope
		// it is defined here
		
		var character = cc.Sprite.extend({
			ctor: function(s) {
				this._super();
				this.initWithFile(s);
			},
			fadeChar: cc.fadeIn(.33),
			grayChar: cc.tintTo(.33, 128,128,128),
			whiteChar: cc.tintTo(.33, 255,255,255),
			deleteChar: cc.callFunc(this.deleteSelf, this),
			addNum:null,
			deleteSelf: function() {
				this.parent.removeChild(this);
				this.cleanup();
			}
		});
		
		// we make a new sprite with initalization
		
		var c = new character( dialogueObject.sprite );
		c.addNum = addNum;
		
		c.y = 4*cc.director.getWinSize().height/7;
		c.zIndex = 0;
		
		// if they're not talking this scene, we gray them out as well
		
		if(this.previous != -1 && this.sceneInfo.dialogue[this.previous].characterName != dialogueObject.characterName) {
			c.setColor( new cc.Color(128,128,128,255) );
		}
		
		// we set opacity to 0 so we can fade them in
		
		c.opacity = 0;
		
		// add them to the scene and to the characters list
		
		this.characters[dialogueObject.characterName] = c;
		this.addChild(c);
		
		// if this is the intro to a scene, the first characters have a bit of a 
		// more complex set of actions
		
		if(intro) {
			c.setColor( new cc.Color(128,128,128,255) );
			if(this.sceneInfo.dialogue[this.diaNumber].characterName == dialogueObject.characterName)  {
				c.runAction( cc.sequence(cc.delayTime(1),c.fadeChar.clone(),cc.delayTime(1.66),c.whiteChar.clone()) );
			} else {
				c.runAction( cc.sequence(cc.delayTime(1),c.fadeChar.clone()) );
			}
		}
		
		// otherwise, we are just going to fade them in as normal
		
		else {
			c.runAction( c.fadeChar.clone() );
		}
		
		// here is how we place the characters, the idea being that entrance 
		// numbers influence positioning, the numbers aren't super important
		
		for(key in this.characters) {
			if(!this.characters[key]) continue;
			if(this.characters[key].addNum == 0) {	
				if(this.characters.number == 1) this.characters[key].x = 640;
				if(this.characters.number == 2) this.characters[key].x = 400;
				if(this.characters.number == 3) this.characters[key].x = 300;
			} else if (this.characters[key].addNum == 1) {
				if(this.characters.number == 2) this.characters[key].x = 880;
				if(this.characters.number == 3) this.characters[key].x = 980;
			} else if (this.characters[key].addNum == 2) {
				this.characters[key].x = 640;
			}
		}
	},
	click: function(event) {
		//console.log(" diaNumber: " + this.diaNumber + " target: " + this.target + " choice: " + this.choice + " previous: " + this.previous);
		if(this.diaText.opacity != 255)
			return;
		if(event._button == 0) {
			if(!this.choice) {
				// advance and log history
				this.parseAction();
				this.previous = this.diaNumber;
				this.diaNumber = this.sceneInfo.dialogue[this.diaNumber].text[this.texNumber].next;
				this.parseDialogue();
			} else {
				if(this.target != -1) {
					this.previous = -1;
					// redo the parseAction because last time we didn't know which happened
					this.choice = false;
					this.texNumber = this.target;
					this.parseAction();
					// then parse the dialogue
					this.diaNumber = this.sceneInfo.dialogue[this.diaNumber].text[this.target].next;
					this.parseDialogue();
				}
			}
		} else if(event._button == 2) {
			if(this.previous != -1) {
				// reset choice listening info
				this.choice = false;
				this.target = -1;
				// move dialogue bak a space
				this.diaNumber = this.previous;
				this.parseDialogue();
				this.previous = -1;
			}
		}
	}, 
	parseAction: function() {
		
		// if the user has been prompted with a choice this cycle, we ignore 
		// actions until they choose
		
		if(this.choice)
			return;
		
		// if theres an action, preform it
		
		var action = this.sceneInfo.dialogue[this.diaNumber].text[this.texNumber].action;
		if(action) {
			master[action.target] += action.value;
		}
		
		// if theres an exit, preform it
		
		var exit = this.sceneInfo.dialogue[this.diaNumber].text[this.texNumber].exit;
		if(exit) {
			
			// fade them away
			
			this.characters[exit].runAction(  cc.sequence( this.characters[exit].fadeChar.clone().reverse(), this.characters[exit].deleteChar ) );
			
			// reset the entrance numbers to be correct
			
			var oldNum = this.characters[exit].addNum;
			for(key in this.characters) {
				if(!this.characters[key]) continue;
				if(key == "number") continue;
				if(key == exit) continue;
				if(this.characters[key].addNum > oldNum) this.characters[key].addNum--;
			}
			this.characters.number--;
			
			// and finally, unset the character in the characters list
			
			this.characters[exit] = null;
		}
	},
	parseDialogue: function(intro) {
		intro = intro || false;
	
		if(this.diaNumber == "game") {
			cc.director.runScene(new game());
			return;	
		} else if(typeof this.diaNumber === 'string' ) {
			this.parent.changeScene(this.diaNumber);
			return;
		}
		
		// detect entrances 
		
		if( this.sceneInfo.dialogue[this.diaNumber].enter ) {
			this.characterChange({
				"characterName":this.sceneInfo.dialogue[this.diaNumber].enter,
				// THIS NEEDS TO BE CHANGED TO DEFAULT AFTER TESTING
				"sprite": "../assets/art/real/portraits/" + this.sceneInfo.dialogue[this.diaNumber].enter + "_normal.png"
			})
		}
		
		// call character change (we dont do this during the intro)
		if(!intro) {
			this.characterChange( this.sceneInfo.dialogue[this.diaNumber] );
			if (this.characters[this.sceneInfo.dialogue[this.diaNumber].characterName].color.r != 255) {
				this.characters[this.sceneInfo.dialogue[this.diaNumber].characterName].runAction (
					this.characters[this.sceneInfo.dialogue[this.diaNumber].characterName].whiteChar.clone()
				);
			}
			
			for(key in this.characters) {
				if(!this.characters[key]) continue;
				if(key == "number") continue;
				if(key == this.sceneInfo.dialogue[this.diaNumber].characterName) continue;
				this.characters[key].runAction (this.characters[key].grayChar.clone());
			}
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
			otherDiaText.zIndex = 2;
			
			this.addChild(otherDiaText);
			
			// make choice listener
			
			// set target to "null"
			
			this.target = -1;
			
			// create a hover b	ackground
			
			var hoverBackground = cc.DrawNode.create();
			hoverBackground.zIndex = 3; 	
			
			this.addChild(hoverBackground);
			
			
			var choiceListener = cc.EventListener.create({
				event: cc.EventListener.MOUSE,
				
				// detecter where the mouse is
				
				onMouseMove: function(event) {
					if(	event._x > (cc.director.getWinSize().width/2 - otherDiaText.width/2) 
					 && event._x < (cc.director.getWinSize().width/2 + otherDiaText.width/2) ) {
						if (event._y > (cc.director.getWinSize().height/4 - 105)
						 && event._y < (cc.director.getWinSize().height/4) ) {
							parent.target = possible[1];
							
							// set hoverbackground behind new hover
							
							hoverBackground.clear();
							var origin = new cc.Point( 
								cc.director.getWinSize().width/2 - 480,
								cc.director.getWinSize().height/4 - 115
							);  var destination = new cc.Point(
								cc.director.getWinSize().width/2 + 480,
								cc.director.getWinSize().height/4
							);
							var color = new cc.Color(255,255,255,64)
							hoverBackground.drawRect(origin, destination, color, 0, new cc.Color(0,0,0,0) );
							
						} else if (event._y > (cc.director.getWinSize().height/4)
						        && event._y < (cc.director.getWinSize().height/4 + 105) ) {
							parent.target = possible[0];

							// set hoverbackground behind new hover
							
							hoverBackground.clear();
							var origin = new cc.Point( 
								cc.director.getWinSize().width/2 - 480,
								cc.director.getWinSize().height/4
							);  var destination = new cc.Point(
								cc.director.getWinSize().width/2 + 480,
								cc.director.getWinSize().height/4 + 115
							);
							var color = new cc.Color(255,255,255,64)
							hoverBackground.drawRect(origin, destination, color, 0, new cc.Color(0,0,0,0) );
							
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
						parent.removeChild(hoverBackground);
					}
					return false;
				}
			});
			
			cc.eventManager.addListener(choiceListener, otherDiaText);
		}
	}
});

var DialogueBackgroundLayer = cc.Layer.extend({
	ctor:function ( backgroundSprite, sceneName ) {
		this._super();
		this.cascadeColor = true;
		this.cascadeOpacity = true;
		
		// background
		
		var background = cc.Sprite.create( backgroundSprite );
		background.x = cc.director.getWinSize().width/2;
		background.y = cc.director.getWinSize().height/2;
		background.opacity = 0;
		this.addChild( background );
		var action = cc.fadeIn(1.0)
		background.runAction( action );
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
		
		// create background layer
		
		var background = new DialogueBackgroundLayer(s.background, this.sceneName);
		this.addChild(background);
		
		//create interactive layer
		
		var interactive = new DialogueInteractiveLayer(s);
		this.addChild(interactive);
	}, 
	changeScene: function ( sceneName ) {
		var oldScene = this;
		var clean = function() {
			cc.director.runScene(new Dialogue(sceneName));
			oldScene.cleanup();
			this.stop();
		}
		this.cascadeColor = true;
		this.cascadeOpacity = true;
		this.runAction( cc.Sequence.create( cc.fadeOut(.33), cc.callFunc(clean) ) );
	}
});