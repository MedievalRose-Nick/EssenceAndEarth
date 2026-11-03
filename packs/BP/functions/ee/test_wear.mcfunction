# Sets up the armor cap and tool wear tests in TESTING.md. Use on a test world; /function ee/test_wear_off undoes it.
tag @s add ee_test
difficulty normal
time set midnight
gamerule domobspawning false
gamerule naturalregeneration false
gamerule keepinventory true
kill @e[type=zombie,r=32]
replaceitem entity @s slot.armor.head 0 ee:terra_helmet
replaceitem entity @s slot.armor.chest 0 ee:terra_chestplate
replaceitem entity @s slot.armor.legs 0 ee:terra_leggings
replaceitem entity @s slot.armor.feet 0 ee:terra_boots
give @s ee:astra_helmet
give @s ee:astra_chestplate
give @s ee:astra_leggings
give @s ee:astra_boots
give @s diamond_helmet
give @s diamond_chestplate
give @s diamond_leggings
give @s diamond_boots
give @s ee:terra_pickaxe
give @s ee:astra_pickaxe
give @s diamond_pickaxe
fill ~2 ~ ~-4 ~2 ~ ~5 stone
summon zombie ~ ~ ~6
effect @s instant_health 1 10 true
gamemode survival @s
tellraw @s {"rawtext":[{"text":"§aWear test ready.§r Health and the held tool's durability show above the hotbar. Mine the 10 stone beside you with each pickaxe. Swap armor sets and let the zombie hit you, or run §e/damage @s 10 entity_attack§r. Heal with §e/effect @s instant_health 1 10§r."}]}
