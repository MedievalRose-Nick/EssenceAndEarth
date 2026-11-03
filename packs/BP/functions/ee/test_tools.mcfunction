# Sets up the sickle, hoe and area augment tests in TESTING.md. Use on a test world; /function ee/test_tools_off undoes it.
gamerule keepinventory true
gamerule domobspawning false
time set day
gamemode survival @s
clear @s
fill ~-20 ~ ~-8 ~20 ~8 ~18 air
# A 17x17 field of ripe wheat in front, dirt on your left, and a stone wall with ores on your right.
fill ~-8 ~-1 ~2 ~8 ~-1 ~18 farmland
fill ~-8 ~ ~2 ~8 ~ ~18 wheat ["growth"=7]
fill ~-20 ~-1 ~-8 ~-10 ~-1 ~8 dirt
fill ~10 ~-1 ~-8 ~20 ~-1 ~8 stone
fill ~12 ~ ~-4 ~16 ~4 ~4 stone
fill ~12 ~1 ~-1 ~12 ~3 ~1 iron_ore
setblock ~2 ~ ~ ee:tinkering_table
# Sickles and hoes, and gear for the area augments.
give @s ee:essence_sickle
give @s ee:terra_sickle
give @s ee:astra_sickle
give @s ee:essence_hoe
give @s ee:astra_hoe
give @s ee:astra_pickaxe
give @s ee:astra_shovel
give @s ee:astra_sword
give @s ee:mining_iv_augment
give @s ee:tilling_iv_augment
give @s ee:pathing_iv_augment
give @s ee:attack_iii_augment
summon zombie ~-2 ~ ~-5
summon zombie ~ ~ ~-5
summon zombie ~2 ~ ~-5
summon zombie ~ ~ ~-7
effect @s instant_health 1 10 true
tellraw @s {"rawtext":[{"text":"§aTool test ready.§r Ripe wheat is in front, dirt on your left, a stone wall on your right, zombies behind and the Tinkering Table beside you. Fit the augments, then: break wheat with each sickle, sneak and use the hoe and shovel on the dirt, mine the wall with the pickaxe, and hit a zombie with the sword."}]}
