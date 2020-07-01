# -*- coding: utf-8 -*-
"""
Created on Mon May 25 21:06:22 2020

@author: Akshat
"""

situation = {}
neighbours = {}

with open("./situation.txt", "r") as file:
	raw = file.readlines()
	for line in raw:
		split = line.split(" ")
		situation[split[0]] = [i.replace("\n", "") for i in split[1:]]

with open("../maps/world.txt", "r") as file:
	raw = file.readlines()
	for line in raw:
		split = line.split(" ")
		neighbours[split[0]] = [i.replace("\n", "") for i in split[1:]]


for s in situation:
	countries = ""
	for country in situation[s]:
		countries += country
		for neighbour in neighbours[country]:
			countries += " " + neighbour
		countries += "\n"
	with open("../maps/" + s + ".txt", "w") as file:
		file.write(countries[:-1])
	with open("../frontend/src/maps/" + s + ".txt", "w") as file:
		file.write(countries[:-1])