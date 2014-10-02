/**
 * A brief explanation for "project.json":
 * Here is the content of project.json file, this is the global configuration for your game, you can modify it to customize some behavior.
 * The detail of each field is under it.
 {
    "project_type": "javascript",
    // "project_type" indicate the program language of your project, you can ignore this field

    "debugMode"     : 1,
    // "debugMode" possible values :
    //      0 - No message will be printed.
    //      1 - cc.error, cc.assert, cc.warn, cc.log will print in console.
    //      2 - cc.error, cc.assert, cc.warn will print in console.
    //      3 - cc.error, cc.assert will print in console.
    //      4 - cc.error, cc.assert, cc.warn, cc.log will print on canvas, available only on web.
    //      5 - cc.error, cc.assert, cc.warn will print on canvas, available only on web.
    //      6 - cc.error, cc.assert will print on canvas, available only on web.

    "showFPS"       : true,
    // Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.

    "frameRate"     : 60,
    // "frameRate" set the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.

    "id"            : "gameCanvas",
    // "gameCanvas" sets the id of your canvas element on the web page, it's useful only on web.

    "renderMode"    : 0,
    // "renderMode" sets the renderer type, only useful on web :
    //      0 - Automatically chosen by engine
    //      1 - Forced to use canvas renderer
    //      2 - Forced to use WebGL renderer, but this will be ignored on mobile browsers

    "engineDir"     : "frameworks/cocos2d-html5/",
    // In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir",
    // but if you are using a single engine file, you can ignore it.

    "modules"       : ["cocos2d"],
    // "modules" defines which modules you will need in your game, it's useful only on web,
    // using this can greatly reduce your game's resource size, and the cocos console tool can package your game with only the modules you set.
    // For details about modules definitions, you can refer to "../../frameworks/cocos2d-html5/modulesConfig.json".

    "jsList"        : [
    ]
    // "jsList" sets the list of js files in your game.
 }
 *
 */
 
//cursor disabled: document.getElementsByTagName("body")[0].style.cursor = "none";
 
var res = [
	"Assets/art/real/sprites/dialogue_box.png",
	"Assets/art/fantasy/Sketches/IMAG0786_1.jpg"
];

var master = {"day": [{"firstScene": "scene1", "scene2": {"dialogue": [{"text": [{"value": "scene 3", "next": "scene3"}, {"value": "end the day", "next": "game"}], "sprite": "../assets/art/real/portraits/you_normal.png", "charaterName": "you"}], "characters": [{"sprite": "../assets/art/real/portraits/you_normal.png", "charaterName": "you"}], "background": "../assets/art/real/backgrounds/background.png"}, "scene1": {"dialogue": [{"text": [{"value": "ahhh an example make it \ngo away", "next": 1}], "sprite": "../assets/art/real/portraits/Emily_normal.png", "charaterName": "Emily"}, {"text": [{"action": {"target": "Emily", "value": 1}, "value": "say yes", "next": 3}, {"action": {"target": "Emily", "value": 0}, "value": "say no", "next": 4}], "sprite": "../assets/art/real/portraits/you_normal.png", "charaterName": "you"}, {"text": [{"value": "yes", "next": 5}], "sprite": "../assets/art/real/portraits/Emily_happy.png", "charaterName": "Emily"}, {"text": [{"value": "no", "next": 5}], "sprite": "../assets/art/real/portraits/Emily_sad.png", "charaterName": "Emily"}, {"text": [{"value": "converged", "next": 6}], "sprite": "../assets/art/real/portraits/you_normal.png", "charaterName": "you"}, {"text": [{"case": {"target": "Emily", "value": 0, "cmp": "<"}, "value": "said yes", "next": 7}, {"case": {"target": "Emily", "value": 0, "cmp": "="}, "value": "said no", "next": 7}], "sprite": "../assets/art/real/portraits/you_normal.png", "charaterName": "you"}, {"text": [{"value": "end scene", "next": "scene2"}], "sprite": "../assets/art/real/portraits/Emily_normal.png", "charaterName": "Emily"}], "characters": [{"sprite": "../assets/art/real/portraits/Emily_normal.png", "charaterName": "Emily"}, {"sprite": "../assets/art/real/portraits/you_normal.png", "charaterName": "you"}], "background": "../assets/art/real/backgrounds/background.png"}}, {"firstScene": "", "scene3": {"dialogue": [{"text": [{"value": "game time", "next": "game"}], "sprite": "../assets/art/real/portraits/you_normal.png", "charaterName": "you"}], "characters": [{"sprite": "../assets/art/real/portraits/you_normal.png", "charaterName": "you"}], "background": "../assets/art/real/backgrounds/background.png"}}]};

master["Mara"] = 0;
master["Clark"] = 0;
master["Jackie"] = 0;
master["Preston"] = 0;
master["currentDay"] = 0;

(function loadManager ( ) {
	for (i in master.day) {
		for (key in master.day[i]) {
			if (!master.day[i][key].background in res) {
				res.push(master.day[i][key].background);
			}
			for (j in master.day[i][key].dialogue) {
				if (!master.day[i][key].dialogue[j].sprite in res) {
					//res.push(master.day[i][key].dialogue[j].sprite);
				}
			}
		}
	}
	for (var i = 0; i < 9; i++) {
		res.push("../assets/art/real/sprites/click_" + i + ".png");
	}
	cc.game.run()
})();
 
cc.game.onStart = function(){
    cc.view.adjustViewPort(true);
    cc.view.setDesignResolutionSize(1280, 720, cc.ResolutionPolicy.SHOW_ALL);
    cc.view.resizeWithBrowserSize(true);
    //load resources
    cc.LoaderScene.preload(res, function () {
        cc.director.runScene(new game());//cc.director.runScene(new Dialogue(master.day[master.currentDay].firstScene));
    }, this);
};