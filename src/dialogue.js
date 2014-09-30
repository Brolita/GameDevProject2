/* these classes (js objects) will be for the "real"
 * part of the game, below them will be the classes 
 * for the fantasy 
 *
 */
var Interactive = cc.Layer.extend({
	ctor:function ( dialogueObject ) {
		this._super();
		
		var touchBubble = cc.Sprite.create("../assets/art/real/sprites/click_0.png" );
		
		var touchBubbleAnim = cc.Animation.create();
		for ( var i = 0 ; i < 9 ; i ++ ) {         
			var frameName = "../assets/art/real/sprites/click_" + i + ".png" ; 
			touchBubbleAnim. addSpriteFrameWithFile ( frameName ) ;
		}
		touchBubbleAnim.setDelayPerUnit ( 1 / 60 ) ; 
		touchBubbleAnim.setRestoreOriginalFrame ( false ) ; 
		
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
				return false;
			}
		});
		
		cc.eventManager.addListener(touchListener, touchBubble);
		this.addChild(touchBubble);
	}
	
});

var BackgroundLayer = cc.Layer.extend({
	ctor:function () {
		this._super();
		var background = cc.Sprite.create("../assets/art/real/backgrounds/background.png");
		background.x = cc.director.getWinSize().width/2;
		background.y = cc.director.getWinSize().height/2;
		this.addChild( background );
	}
});

var Scene = cc.Scene.extend({
	name:null,
	data:null,
	onEnter:function () {
		this._super();
		var background = new BackgroundLayer();
		this.addChild(background);
		var interactive = new Interactive();
		this.addChild(interactive);
	}
});