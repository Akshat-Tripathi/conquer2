# -*- coding: utf-8 -*-
"""
Created on Sun Jun 21 17:19:53 2020

@author: Akshat
"""

import json
import pandas as pd

with open("world-110m.json", "r") as file:
	js = json.load(file)["objects"]["ne_110m_admin_0_countries"]["geometries"]
	game_countries = [country["properties"]["ISO_A2"] for country in js]
	game_countries[38] = "CP" #38 is North Cyprus
	game_countries[145] = "ZZ" #145 is Somaliland
	game_countries += ["NONE"]

raw = pd.read_csv("borders.csv")
del raw["country_name"], raw["country_border_name"]

countries = list(raw["country_code"])
bordering = list(raw["country_border_code"])

del raw

borders = {}

def add(dictionary, k, v):
	if k in game_countries and v in game_countries:
		if not dictionary.get(k):
			dictionary[k] = set()
		dictionary[k].add(v)


for i in range(len(countries)):
	name = countries[i]
	#eliminates NA
	if type(name) == float:
		name = "NA"
	border = bordering[i]

	if type(border) == float and not borders.get(name):
		border = "NONE"

	add(borders, name, border)
	add(borders, border, name)

del bordering, countries

# =============================================================================
# Write to a file with format: COUNTRY: BORDER1 BORDER2 ... BORDERn\n
# =============================================================================
with open("world.txt", "w") as file:
	file.write("\n".join(
		[" ".join([name] + list(borders[name])) for name in borders.keys()]
	))