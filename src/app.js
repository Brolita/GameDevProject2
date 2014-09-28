function main ( data ) {
/* these classes (js objects) will be for the "real"
 * part of the game, below them will be the classes 
 * for the fantasy 
 *
 */
	var Dialogue = cc.Sprite.extend({
		
	});
 
	var Interative = cc.Layer.extend({
		sprite:null,
		ctor:function ( dialogueObject ) {
			this._super();
			var touchListener = cc.EventListener.create({
				event: cc.EventListener.TOUCH_ONE_BY_ONE,
				swallowTouches:true, //this allows event escaping by returning true
				onTouchBegan: function () {
				
				},
				onTouchMoved: function() {
				
				},
				onTouchEnded: function() {
				
				}
			});
		}
		
	});
	
	var Background = cc.Layer.extend({
		sprite:null,
		ctor:function ( backgroundSprite ) {
			this._super();
			this.sprite = backgroundSprite;
		}
	});

	var Scene = cc.Scene.extend({
		name:null,
		data:null,
		ctor: function( sceneName, sceneData ) {
			this._super();
			this.name = sceneName;
			this.data = sceneData;
		},
		onEnter:function () {
			this._super();
			var background = new Background( this.data.background );
			this.addChild(background);
			var interactive = new Interactive( this.data.dialogue );
			this.addChild(interactive);
		}
	});
}