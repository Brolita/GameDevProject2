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
	
	if b == '':
		if "value" in cur and "sprite" in cur and "characterName" in cur and "text" in cur:
			if "dialogue" not in a[l]:
				a[l]["dialogue"] = []
			a[l]["dialogue"].append(cur)
			cur = {}
	
	elif ">>" in b:
		if l not in a or "background" in a[l]:
			a[b[3:]] = {}
			l = b[3:]
			a["sceneOrder"].append(l)
		else:
			a[l]["background"] =  "../assets/art/real/backgrounds/" + b[3:] + ".png";
	
	elif "value" not in cur:
		cur["value"] = int(b)
	elif "characterName" not in cur:
		cur["characterName"] = b
	elif "sprite" not in cur:
		cur["sprite"] = "../assets/art/real/portraits/" + cur["characterName"] + '_' + b + ".png";
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
	else:
		i = 0
		while "next" in cur["text"][i]:
			i += 1
		cur["text"][i]["next"] = int(b)
	
	b = dr.readline()
	print b
json.dump(a, rs)
