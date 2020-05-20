countries = []
with open("frontend/src/country-data.csv", "r") as f:
    lines = f.readlines()
    for line in lines:
        countries.append(line.split(";", maxsplit=2)[1])

writef = open("country-names.csv", "w")
for country in countries:
    writef.write(country + '\n')
writef.close()
