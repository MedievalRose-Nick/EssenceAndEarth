# Sets up the Divus gear tests in TESTING.md. Use on a test world; /function ee/test_awakening_off undoes it.
gamerule keepinventory true
gamerule domobspawning false
time set day
gamemode survival @s
clear @s
fill ~-8 ~ ~-2 ~8 ~6 ~14 air
fill ~-8 ~-1 ~-2 ~8 ~-1 ~14 stone
# The altar 6 blocks ahead, pedestals on its sides and vessels on its diagonals.
setblock ~ ~ ~6 ee:awakening_altar
setblock ~3 ~ ~6 ee:awakening_pedestal
setblock ~-3 ~ ~6 ee:awakening_pedestal
setblock ~ ~ ~9 ee:awakening_pedestal
setblock ~ ~ ~3 ee:awakening_pedestal
setblock ~2 ~ ~8 ee:essence_vessel
setblock ~-2 ~ ~8 ee:essence_vessel
setblock ~2 ~ ~4 ee:essence_vessel
setblock ~-2 ~ ~4 ee:essence_vessel
# A Tinkering Table on your right.
setblock ~4 ~ ~1 ee:tinkering_table
give @s ee:wand
give @s ee:astra_sword
give @s ee:astra_chestplate
give @s ee:astra_pickaxe
give @s ee:divus_ingot 6
give @s ee:divus_gemstone 6
give @s ee:air_essence 64
give @s ee:air_essence 64
give @s ee:earth_essence 64
give @s ee:earth_essence 64
give @s ee:water_essence 64
give @s ee:water_essence 64
give @s ee:fire_essence 64
give @s ee:fire_essence 64
give @s ee:mining_i_augment
give @s ee:strength_i_augment
give @s ee:strength_ii_augment
give @s ee:attack_i_augment
give @s ee:haste_i_augment
give @s ee:speed_i_augment
give @s diamond_sword
tellraw @s {"rawtext":[{"text":"§aDivus gear test ready.§r The altar is ahead and a Tinkering Table on your right. Fit the Mining augment to the Astra Pickaxe first, then awaken it: fill each vessel with 40 of a different element, put the piece on the altar and 2 Divus Ingots and 2 Divus Gemstones on the pedestals, then use the wand."}]}
