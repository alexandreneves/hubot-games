# HANGMAN

## WORD RULES

* bigger than 1 char

## (possible) SCORE METRIC

### WIN

* time = time remaining / total
* lives = lives remaining / total
* guess = lettersToDiscover / wordLetterCount

result = time*0.3 + lives*0.3 + guess*0.4

### LOSS

result = 1 - lettersGuessed / wordLetterCount
