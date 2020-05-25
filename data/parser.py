# -*- coding: utf-8 -*-
"""
Created on Wed May 20 18:55:45 2020

@author: Akshat
"""

import json

with open("country-data.json") as file:
	data = json.load(file)
	del data["World"]

with open("neighbors-modified.json") as file:
	neighbours = json.load(file)

#The desired file format is Code N1 N2 \n Code N1 N2 N3 ...
neigh = ""
names = ""

for country in data.keys():
	names += country + " " + data[country]["name"] + '\n'
	neigh += country + " "
	for n in neighbours[country]["neighbours"]:
		neigh += n + " "
	neigh = neigh[:-1] + '\n'

neigh = neigh[:-1]
names = names[:-1]

with open("../maps/world.txt", 'w') as file:
	file.write(neigh)

with open("./names.txt", 'w') as file:
	file.write(names)
