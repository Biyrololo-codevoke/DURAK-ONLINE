from player import Player
from game import Game
from game_board import GameBoard


game = Game(1)
print(game)

player_1 = Player(1)
print(player_1)

game.join_player(player_1)
print(game)

player_2 = Player(2)
print(player_2)

game.join_player(player_2)
print(game)

print("player 1 deck: ", player_1.deck)
print("player 2 deck: ", player_2.deck)

print(game.board)
