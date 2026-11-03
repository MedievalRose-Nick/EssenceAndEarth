# Sets up the Tinkering Table and augment tests in TESTING.md. Use on a test world; /function ee/test_augments_off undoes it.
gamerule keepinventory true
gamerule domobspawning false
time set day
gamemode survival @s
clear @s
# A stone floor with the table beside you, and an Infusion Altar with its 8 pedestals in front.
fill ~-5 ~-1 ~-3 ~5 ~-1 ~13 stone
fill ~-5 ~ ~-3 ~5 ~4 ~13 air
setblock ~2 ~ ~ ee:tinkering_table
setblock ~ ~ ~8 ee:infusion_altar
setblock ~3 ~ ~8 ee:infusion_pedestal
setblock ~-3 ~ ~8 ee:infusion_pedestal
setblock ~ ~ ~11 ee:infusion_pedestal
setblock ~ ~ ~5 ee:infusion_pedestal
setblock ~2 ~ ~10 ee:infusion_pedestal
setblock ~2 ~ ~6 ee:infusion_pedestal
setblock ~-2 ~ ~10 ee:infusion_pedestal
setblock ~-2 ~ ~6 ee:infusion_pedestal
# Gear: the right tiers for the fitting rules, plus diamond, which takes nothing.
give @s ee:astra_chestplate
give @s ee:aether_leggings
give @s ee:terra_leggings
give @s ee:astra_helmet
give @s ee:astra_boots
give @s ee:astra_sword
give @s ee:aether_sword
give @s diamond_chestplate
# Augments to fit.
give @s ee:flight_augment
give @s ee:speed_iii_augment
give @s ee:health_boost_v_augment
give @s ee:absorption_v_augment
give @s ee:night_vision_augment
give @s ee:no_fall_damage_augment
give @s ee:poison_resistance_augment
give @s ee:strength_ii_augment
give @s ee:strength_iii_augment
# Altar recipes: Speed I from a Blank Augment, and a Blank Augment to craft.
give @s ee:wand
give @s ee:blank_augment
give @s sugar 4
give @s ee:aqua_essence 4
give @s ee:vita_shard 6
give @s iron_ingot 3
give @s crafting_table
# For Strength and the resistances.
give @s ee:soul_jar
summon zombie ~ ~ ~-2
effect @s instant_health 1 10 true
tellraw @s {"rawtext":[{"text":"§aAugment test ready.§r The Tinkering Table is on your right and the altar is in front. Fit augments, then try them: §e/tp @s ~ ~30 ~§r for No Fall Damage and Flight, §e/effect @s poison 20§r for Poison Resistance, and the zombie behind you for Strength. For the altar, put the Blank Augment on it, 4 sugar and 4 Aqua Essence on the pedestals, and use the wand."}]}
