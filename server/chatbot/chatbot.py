import sys,os,time
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

'''
Beacause program will be called by nodejs server( in /home/kevin/ararara-server layer)
so when we want to call this program, we have to use the "relatively" directory path
'''

chatbot = ChatBot(
"KevinBOT",
#trainer='chatterbot.trainers.ChatterBotCorpusTrainer',
database = "./server/chatbot/KevinBOT_DB.json"
)


print(chatbot.get_response(sys.argv[1]))