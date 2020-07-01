# -*- coding: utf-8 -*-
"""
Created on Mon May 25 17:55:21 2020

@author: Akshat
"""

neighbours = {}
merged = {}

with open("./merges.txt", "r") as file:
	raw = file.readlines()
	for line in raw:
		split = line.split(" ")
		merged[split[0]] = [i.replace("\n", "") for i in split[1:]]

with open("../maps/world.txt", "r") as file:
	raw = file.readlines()
	for line in raw:
		split = line.split(" ")
		neighbours[split[0]] = [i.replace("\n", "") for i in split[1:]]

#Merge countries
for k in merged:
	group = merged[k]
	borders = []
	for i in group:
		borders += [i for i in neighbours[i] if i not in borders
											and i not in group]
		del neighbours[i]
	neighbours[k] = borders

#Remove all countries with 0 neighbours
for k in list(neighbours.keys()):
	if len(neighbours[k]) == 0:
		del neighbours[k]

neigh = ""
for country in neighbours.keys():
	line = country + " "
	for n in neighbours[country]:
		c = n
		for m in merged:
			if n in merged[m] and m not in line:
				c = m
				break;
		if c != "_1":
			line += c + " "
	neigh += line[:-1] + '\n'

neigh = neigh[:-1]

with open("../maps/world.txt", "w") as file:
	file.write(neigh)

with open("../frontend/src/maps/world.txt", "w") as file:
	file.write(neigh)