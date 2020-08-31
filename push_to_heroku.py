#This file should be used to push to heroku
#The process is:
#1. stop ignoring internal/game/conquer2.json
#2. git add .
#3. git commit -m "heroku release"
#4. ignore internal/game/conquer2.json
#5. remove all staged files
#6. go to previous commit

from os import system

def comment(set):
    old = ''
    new = '#'
    if not set:
        old, new = new, old
    with open(".gitignore", 'r') as file:
        raw = file.read()
        raw = raw.replace(old + "internal/game/*.json", new + "internal/game/*.json")
    with open(".gitignore", 'w') as file:
        file.write(raw)

def toggle_sourcemap():
    sourcemap = "\nGENERATE_SOURCEMAP=false"
    with open(".env", "w") as file:
        txt = file.read()
        if sourcemap in txt:
            txt.replace(sourcemap, "")
        else:
            txt += sourcemap
        file.write(txt)

comment(True)
toggle_sourcemap()
system("git add .")
system("git commit -m \"heroku release\"")
system("git push heroku master --force")
system("git reset --soft HEAD~1")
system("git rm -r --cached internal/game/*.json")
toggle_sourcemap()
comment(False)
system("git add .gitignore")