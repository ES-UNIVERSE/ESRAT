import time
import json
import os
import telebot
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load configuration
try:
    with open('config.json') as config_file:
        config = json.load(config_file)
    BOT_TOKEN = config['bot_token']
    ADMIN_IDS = config['admin_ids']
except FileNotFoundError:
    logging.error("config.json file not found.")
    exit(1)
except json.JSONDecodeError:
    logging.error("Error decoding JSON from config.json.")
    exit(1)

bot = telebot.TeleBot(BOT_TOKEN)

# Buttons
btn_attack = telebot.types.KeyboardButton("Attack")
btn_start = telebot.types.KeyboardButton("START Attack")
btn_stop = telebot.types.KeyboardButton("Stop Attack")

@bot.message_handler(commands=['start'])
def start(message):
    logging.info(f"Received /start command from {message.chat.id}")
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True)
    markup.add(btn_attack, btn_start, btn_stop)
    bot.send_message(message.chat.id, "Choose an option:", reply_markup=markup)

@bot.message_handler(func=lambda message: message.text == "Attack")
def attack(message):
    bot.send_message(message.chat.id, "Starting the attack... Please enter the target IP and port (format: IP:PORT)")

@bot.message_handler(func=lambda message: message.text == "Stop Attack")
def stop_attack(message):
    # Logic to stop the attack
    bot.send_message(message.chat.id, "Stopping the attack...")

# Start polling
try:
    logging.info("Bot is polling...")
    bot.polling()
except Exception as e:
    logging.error(f"Error occurred: {e}")
