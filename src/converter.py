import json, requests,os
from collections import defaultdict

key = "AIzaSyAahF8_1YLrWbirfQnfAqpzybXbtdazg9I"
def make_new():
	return {
		"type": "FeatureCollection",
		"features":[]
	}

def make_path(locs):
	return {"type":"Feature",
		"geometry":{
			"type": "LineString",
			"coordinates": locs
		},
	}
def extract_first(path):
	return path["geometry"]["coordinates"][0]

def do_api(text):
	# import random
	# return [random.randint(-100, 100),random.randint(-50, 50)]
	payload = {"key": key, "query":text}
	r = requests.get("https://maps.googleapis.com/maps/api/place/textsearch/json", params=payload)
	print(text, r.status_code)
	try:
		if not r.ok:
			print(r.status_code)
			print(text)
			print(r.text)
			return [0,0]
		else:
			latlng = r.json()["results"][0]["geometry"]["location"]
			return [latlng["lng"], latlng["lat"]]
	except: 
		return [0, 0]

def wrap_one():
	return {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [],
		},
		"properties": {},
	}

def do_one(prev, new):
	# print(prev, new)
	modified = False
	p = prev["properties"]
	if "location" not in p or p["location"] != new["Locatie"]:
		# print("1")
		modified = True
		#api call
		prev["geometry"]["coordinates"] = do_api(new["Locatie"])

	for m in mapping:
		if m in new and (mapping[m] not in p or p[mapping[m]] != new[m]):
			# print(m)
			modified=True
			p[mapping[m]] = new[m]
	# print(prev, new)
	return modified, new["Fotos"], prev["geometry"]["coordinates"]

def do_inner(prevInner, new):
	modified=False
	fotos = []
	locs = []
	if len(prevInner) != len(new):
		prevInner.clear()
		for n in new:
			prev = wrap_one()
			prevInner.append(prev)
			_, fot, loc = do_one(prev, n)
			fotos.extend(fot)
			locs.append(loc)
		return True, fotos, make_path(locs)


	for prevl,n in zip(prevInner, new):
		mod, fot, loc = do_one(prevl, n)
		# print(mod)
		modified |= mod
		fotos.extend(fot)
		locs.append(loc)

	return modified, fotos, make_path(locs)

mapping = {
	"Naam":"name",
	"Beschrijving":"description",
	"Startdatum":"start",
	"Einddatum":"end",
	"Fotos":"fotos",
	"Deelnemers":"participants",
	"Locatie": "location"
}
def def_value():
	return {
		"type": "Feature",
		"geometry": {
			"type": "Point",
			"coordinates": [-1, -1],
		},
		"properties": {
			"name": "",
			"description":"",
			"start": "",
			"end": "",
			"fotos": [],
			"participants":"",
			"location":"",
			"locations": make_new(),
			"trace": {},
		},
	}

output = ".\\output_dry.json"
with open(output, encoding='utf-8') as f:
	data = f.read()
obj = eval(data)

data = defaultdict(def_value)
for item in obj["features"]:
	data[item["properties"]["name"]] = item

directory = ".\\vakanties zip"
for filename in os.listdir(directory):
	file = os.path.join(directory, filename)
	if not os.path.isfile(file): continue
	print("opening", filename)
	with open(file, encoding='utf-8') as f:
		new = eval(f.read())
	file = new["Naam"]
	prev = data[file]
	prevdata = prev["properties"]
	modified = False
	# if prevdata["location"] != new["Locatie"]:
	# 	modified = True
	# 	#api call
	# 	prev["geometry"]["coordinates"] = do_api(new["Locatie"])
	for m in mapping:
		if m in new and new[m] != prevdata[mapping[m]]:
			modified = True
			prevdata[mapping[m]] = new[m]

	mod, fotos,path = do_inner(prevdata["locations"]["features"], new["Locaties"])
	prevdata["path"] = path
	prev["geometry"]["coordinates"] = extract_first(path)

	modified |=mod

	if "fotos" not in prev or prev["fotos"] != fotos:
		modified = True
		prev["fotos"]=fotos

	if modified:
		print("modified", file)
		prev["properties"] = prevdata
obj["features"]=list(data.values())


with open(output, "w") as f:
	f.write(json.dumps(obj))