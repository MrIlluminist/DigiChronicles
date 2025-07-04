from pyscript import display
import sqlite3

connection = sqlite3.connect("./assets/data/DigiChronicles.db")
display('Decks', target='d')