#This file should be used to push to heroku
#The process is:
#1. stop ignoring internal/game/conquer2.json
#2. git add .
#3. git commit -m "heroku release"
#4. ignore internal/game/conquer2.json
#5. remove all staged files
#6. go to previous commit

from os import system

def comment():
    with open(".gitignore", 'r') as file:
        raw = file.read()
        raw = raw.replace("internal/game/*.json", "#internal/game/*.json")
    with open(".gitignore", 'w') as file:
        file.write(raw)

comment()
system("git add .")
system("git commit -m \"heroku release\"")
system("git push heroku master --force")
system("git reset --hard HEAD~1")
system("git rm -r .gitignore --cached")