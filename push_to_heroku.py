#This file should be used to push to heroku
#The process is:
#1. stop ignoring internal/game/conquer2.json and remove the sourcemap from yarn build
#2. git add .
#3. git commit -m "heroku release"
#4. ignore internal/game/conquer2.json
#5. remove all staged files
#6. go to previous commit and add the sourcemap back

from os import system

def comment(set):
    old = ''
    new = '#'
    if not set:
        old, new = new, old
    with open(".gitignore", 'r+') as file:
        raw = file.read()
        raw = raw.replace(old + "internal/game/*.json", new + "internal/game/*.json")
        file.seek(0)
        file.write(raw)
        file.truncate()

def toggle_sourcemap():
    sourcemap = "\nGENERATE_SOURCEMAP=false"
    with open(".env", "r+") as file:
        txt = file.read()
        if sourcemap in txt:
            txt = txt.replace(sourcemap, "")
        else:
            txt += sourcemap
        file.seek(0)
        print(txt)
        file.write(txt)
        file.truncate()

comment(True)
toggle_sourcemap()
system("git add .")
system("git commit -m \"heroku release\"")
system("git push heroku master --force")
system("git reset --soft HEAD~1")
system("git rm -r --cached internal/game/*.json")
toggle_sourcemap()
comment(False)
system("git add .gitignore .env")