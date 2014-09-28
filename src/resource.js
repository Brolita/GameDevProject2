/* this file guarentees that all pictures and 
 * assets will have been downloaded before 
 * the game starts. there is some threading here
 * so I'd recommed contacting me before making 
 * changes -Corey
 */

function begin() {

	var dialogue = {};
	 
	function loadManager () {
		if (this.readyState == 4 && this.status == 200) {
			for (key in this.responce) {
				if (key != sceneOrder) {
					if (!this.responce[key].background in manager.resources) {
						manager.resources.append(this.responce[key].background);
					}
					for (i in this.responce[key].dialogue) {
						if (!this.responce[key].dialogue[i].sprite in manager.resources) {
							manager.resources.append(this.responce[key].dialogue[i].sprite);
						}
					}
				}
			}
			manager.beginLoad();
			dialogue = this.responce;
		}
	}

	var manager = {
		resources: [
			"../assets/art/real/sprites/onTouch.png",
			"../assets/art/real/sprites/dialogueBox.png",
		];
		load: 0
		beginLoad: function() {
			for (i in this.resources) {
				var nxhr = new XMLHttpRequest();
				nxhr.onreadystatechange = function callback() {
					if (this.readyState == 4 && this.status == 200) {
						manager.load++;
						if(manager.load == manager.resources.length) {
							main(dialouge);
						}
					}
				};
				nxhr.open("GET",this.resources[i]);
				nxhr.send()
			}
		}
	}

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = loadManager;
	xhr.open("GET", "../assets/writing/dialogue.json");
	xhr.responceType("json");
	xhr.send();
}

begin();