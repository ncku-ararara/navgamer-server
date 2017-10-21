import sys,os,time
from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

start = time.time()

chatbot = ChatBot(
"KevinBOT",
trainer='chatterbot.trainers.ChatterBotCorpusTrainer',
database="./server/chatbot/KevinBOT_DB.json"
)

''' Training the existed corpus
chatbot.set_trainer(ChatterBotCorpusTrainer)
chatbot.train("chatterbot.corpus.chinese")
'''

# Train by existed chinese
chatbot.train("chatterbot.corpus.chinese")

# Training user-defined data
# chatbot.train("./data/ganhua.yml") # run by manually 
chatbot.train("./server/chatbot/data/conversations.yml"); # run by program
chatbot.train("./server/chatbot/data/ganhua.yml"); # run by program
chatbot.train("./server/chatbot/data/greetings.yml"); # run by program
chatbot.train("./server/chatbot/data/navgamer.yml"); # run by program

end = time.time();

print("[所耗費時間: " + '{:.2f}'.format(end - start) + " ]")
print(chatbot.get_response(sys.argv[1]))
