/* this file guarentees that all pictures and 
 * assets will have been downloaded before 
 * the game starts. there is some threading here
 * so I'd recommed contacting me before making 
 * changes -Corey
 */


function loadManager () {
	if (this.readyState == 4 && this.status == 200) {
		for (key in this.responce) {
			if (key != sceneOrder) {
				if (!this.responce[key].background in g_resources) {
					g_resources.append(this.responce[key].background);
				}
				for (i in this.responce[key].dialogue) {
					if (!this.responce[key].dialogue[i].sprite in g_resources) {
						g_resources.append(this.responce[key].dialogue[i].sprite);
					}
				}
			}
		}
		manager.beginLoad();
		dialogue = this.responce;
	}
}

var = g_resources: [
];


var xhr = new XMLHttpRequest();
xhr.onreadystatechange = loadManager;
xhr.open("GET", "../assets/writing/dialogue.json");
xhr.responceType("json");
xhr.send();