import json 
import sys

#convery.py
read = open("dialogue.txt", "r")
write = open("dialogue.json", "w")
a = {}
a["day"] = []
currentDay = {}
sceneName = ''
currentScene = {}
dialogueNumber = None
currentDialogue = {}
currentText = {}
currentCharacter = {}
quote = ''
reading = False

line = read.readline()
i = 0;
def clean(li):
	l = li[:]
	if '"' not in l and not reading:
		if '#' in l:
			l = l[:l.find('#')]
		l = l.strip().replace(' ', '')
	return l

while line != '':	
	i+= 1
	line = clean(line)

	if line is '':
		if currentDialogue:
			currentScene["dialogue"].append(currentDialogue)
			currentDialogue = {}
	elif '<<' in line:    # new day 
		if currentDay:
			if currentScene:
				currentDay[sceneName] = currentScene;
				currentScene = {};
			a["day"].append(currentDay)
		currentDay = {}
		line = read.readline()
		line = clean(line)
		currentDay["firstScene"] = line[2:]
	
	elif '>>' in line:    # new scene
		if currentScene:
			currentDay[sceneName] = currentScene
		sceneName = line[2:]
		currentScene = {}
		currentScene["dialogue"] = []
		line = read.readline()
		line = clean(line)
		currentScene["background"] = "../assets/art/real/backgrounds/" + line[2:] + ".png"
		line = read.readline()
		line = clean(line)
		currentScene["characters"] = []
		while '>>' in line:
			i+= 1;
			if currentCharacter:
				currentCharacter["sprite"] = "../assets/art/real/portraits/" + currentCharacter["characterName"] + '_' + line[2:] + ".png"
				currentScene["characters"].append(currentCharacter)
				currentCharacter = {}
			else:
				currentCharacter["characterName"] = line[2:]
			line = read.readline()
			line = clean(line)
	
	elif not currentDialogue and line != '':  # new dialogue
		try:
			int(line)
		except ValueError:
			print "Error: Line " + str(i) + ": Expected dialogue number, read " + line
			
			sys.exit(0)
		dialogueNumber = int(line)
		currentDialogue["text"] = []
	elif "enter" in line:
		currentDialogue["enter"] = line[line.find("enter") + 5:]
	elif "characterName" not in currentDialogue:  # get characterName
		currentDialogue["characterName"] = line
	elif "sprite" not in currentDialogue: # get sprite
		currentDialogue["sprite"] = "../assets/art/real/portraits/" + currentDialogue["characterName"] + '_' + line + ".png"
	
	else:  #new text
		if '"' in line:
			if line.count('"') == 2:
				currentText["value"] = line.strip().strip('"')
				
			elif not reading:
				reading = True
				quote = line[line.find('"') + 1:]
			else:
				reading = False
				quote += line[:line.find('"')]
				currentText["value"] = quote
				quote = ""
		elif reading:
			quote += line
		elif "exit" in line:
			currentText["exit"] = line[line.find("exit") + 4:]
		elif "case:" in line:
			currentText["case"] = {}
			if "Mara" in line:
				currentText["case"]["target"] = "Mara"
			elif "Clark" in line:
				currentText["case"]["target"] = "Clark"
			elif "Jackie" in line:
				currentText["case"]["target"] = "Jackie"
			elif "Preston" in line:
				currentText["case"]["target"] = "Preston"
			elif "Emily" in line:
				currentText["case"]["target"] = "Emily"
			else:
				print "Error: Line " + str(i) + ": Epected name in case, read " + line
				sys.exit(0)
			if '>' in line:
				currentText["case"]["cmp"] = ">"
				try:
					int(line[line.find('>') + 1:])
				except ValueError:
					print "Error: Line " + str(i) + ": Epected value to compare to in case, read " + line
					sys.exit(0)
				currentText["case"]["value"] = int(line[line.find('>')+1:])
			elif '<' in line:
				currentText["case"]["cmp"] = "<"
				try:
					int(line[line.find('<')+1:])
				except ValueError:
					print "Error: Line " + str(i) + ": Epected value to compare to in case, read " + line
					sys.exit(0)
				currentText["case"]["value"] = int(line[line.find('<')+1:])
			elif '=' in line:
				currentText["case"]["cmp"] = "="
				try:
					int(line[line.find('=')+1:])
				except ValueError:
					print "Error: Line " + str(i) + ": Epected value to compare to in case, read " + line
					sys.exit(0)
				currentText["case"]["value"] = int(line[line.find('=')+1:])
			else:
				print "Error: Line " + str(i) + ": Expected comparator in case, read " + line
				sys.exit(0)
			
		elif ("Mara" in line or "Clark" in line or "Jackie" in line or "Preston" in line or "Emily" in line) and '+' in line:
			currentText["action"] = {}
			if "Mara" in line:
				currentText["action"]["target"] = "Mara"
			elif "Clark" in line:
				currentText["action"]["target"] = "Clark"
			elif "Jackie" in line:
				currentText["action"]["target"] = "Jackie"
			elif "Preston" in line:
				currentText["action"]["target"] = "Preston"
			elif "Emily" in line:
				currentText["action"]["target"] = "Emily"
			
			try:
				int(line[line.find('+')+1:])
			except ValueError:
				print "Error: Line " + i + ": Epected number after +, read " + line
				sys.exit(0)
			currentText["action"]["value"] = int(line[line.find('+')+1:])
		
		else:
			try:
				currentText["next"] = int(line)
			except ValueError:
				currentText["next"] = line
			currentDialogue["text"].append(currentText)
			currentText = {}
			
	line = read.readline()
			
if currentScene:
	currentDay[sceneName] = currentScene
	
if currentDay:
	a["day"].append(currentDay)
	
json.dump(a, write)
