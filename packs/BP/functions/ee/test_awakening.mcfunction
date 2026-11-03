# Sets up the Divus and Awakening Altar tests in TESTING.md. Use on a test world; /function ee/test_awakening_off undoes it.
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
# Accelerator check: a Divus accelerator under farmland on your left, with an Iron crop on top.
setblock ~-6 ~-1 ~1 ee:divus_accelerator
setblock ~-6 ~ ~1 ee:terra_farmland
setblock ~-6 ~1 ~1 ee:iron_crop
give @s ee:wand
give @s ee:astra_block
give @s ee:cognizant_dust 8
give @s ee:air_essence 64
give @s ee:earth_essence 64
give @s ee:water_essence 64
give @s ee:fire_essence 64
give @s ee:astra_machine_upgrade
give @s ee:divus_ingot 4
give @s ee:divus_essence 8
give @s ee:vita_ingot
give @s ee:vita_gemstone
give @s stone 4
give @s ee:astra_sword
give @s ee:terra_pickaxe
give @s ee:witherproof_block 16
give @s soul_sand 4
give @s wither_skeleton_skull 3
effect @s instant_health 1 10 true
tellraw @s {"rawtext":[{"text":"§aAwakening test ready.§r The altar is ahead, with pedestals on its sides and vessels on its diagonals. Fill each vessel with a different element, put the Astra Block on the altar and 4 Cognizant Dust on the pedestals, then use the wand. Build the Wither somewhere you don't mind losing."}]}
