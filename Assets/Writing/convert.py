import json 

#convery.py
dr = open("dialogue.txt", "r")
rs = open("dialogue.json", "w")
a = {}
a["sceneOrder"] = []
cur = {}
q = ''
read = False
l = ''

b = dr.readline()
while b != '':	
	if b.find('"') == -1:
		if b.find('#') != -1:
			b = b[:b.find('#')]
		else:
			b = b[:b.find('\n')]
		b = b.strip().strip(' ')
	
	if ">>" in b:
		a[b[3:]] = []
		l = b[3:]
		a["sceneOrder"].append(l)
		
	elif "value" not in cur:
		cur["value"] = int(b)
	elif "sprite" not in cur:
		cur["sprite"] = b
	elif "characterName" not in cur:
		cur["characterName"] = b
	elif b.find('"') != -1 or read:
		read = True
		if b.find('"') != -1 and q != '':
			q += b[:b.find('"')].replace('\n','')
			if "text" not in cur:
				cur["text"] = []
			obj = {}
			obj["value"] = q
			cur["text"].append(obj)
			read = False
			q = ''
		elif b.find('"') != -1:
			q += b[b.find('"') + 1:]
			if b.count('"') == 2:
				q = b[b.find('"') + 1:].replace('"\n','')
				if "text" not in cur:
					cur["text"] = []
				obj = {}
				obj["value"] = q
				cur["text"].append(obj)
				read = False
				q = ''
		else:
			q += b
	elif b != '':
		i = 0
		while "next" in cur["text"][i]:
			i += 1
		cur["text"][i]["next"] = int(b)
	else:
		a[l].append(cur)
		cur = {}
		
	b = dr.readline()
json.dump(a, rs)
