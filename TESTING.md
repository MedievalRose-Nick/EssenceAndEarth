# In-game test list

Everything below is built but not yet checked in-game. Tick items off as they pass, and delete a section once it's all done.

Before starting: upload the latest `addon/*.mcaddon` to the server, and use creative mode or `/give` for anything expensive.

# Still to test

## Deepcore smelts Soulstone (v1.2.1)

- [ ] A Deepcore Electric Furnace turns Soulstone Cobble into Soulstone, Soulstone into Smooth Soulstone, Smooth Soulstone into Soul Dust, and Soulstone Bricks into Cracked Soulstone Bricks.
- [ ] The server log shows no `dq:add_smelt` warnings.

## Soulstone crop (tier 2) (v1.2.0)

- [ ] Soulstone Seeds craft at the altar: Vita Seed Base, 4 Soulstone and 4 Aqua Essence.
- [ ] The crop grows on farmland, and the server log shows no EssenceAndEarth_BP errors.
- [ ] A ring of 8 Soulstone Essence makes 24 Soulstone Cobble. Coal Essence in the middle makes 20 Soulstone instead, and Fire Essence makes 8 Soul Dust.

## Vita crop (tier 3) (v1.1.0)

```
/give @s ee:vita_seed_base
/give @s ee:vita_shard 4
/give @s ee:ignis_essence 4
```

- [ ] A Vita Seed Base on the altar, with 4 Ignis Essence and 4 Vita Shards on the pedestals, makes Vita Seeds.
- [ ] Vita Seeds grow on farmland and drop Vita Essence plus the seeds back when ripe.
- [ ] 8 Vita Essence in a ring crafts 4 Vita Shards.

## Pale Astra and boss drops at your feet (v0.28.3)

- [x] A Wither killed with the Astra or Divus Sword, including with `/damage @e[type=wither] 1000 entity_attack entity @s`, drops its Cognizant Dust and essence at the killer's feet, where its death explosion can't destroy them.
- [x] Astra is pale lavender, clearly apart from Divus. Since v1.0.0 its guard and pommel take the pickaxe head's deeper purple, with a dark line between the guard and the blade.

## Killer gone before its death is handled (v0.28.2)

```
/kill @s
```

- [ ] `/kill` on yourself, in any dimension, logs no `InvalidEntityError` from main.js.

## Hollowdeep bosses and elites (v0.27.1)

Needs Hollowdeep on the same world. Without it, nothing here happens. An elite is any mob with an `hd_aff_` tag, so the `tag` line turns a zombie into one.

```
/give @s ee:terra_sword
/give @s ee:astra_sword
/give @s diamond_sword
/summon hollowdeep:tomb_regent                      also forge_tyrant, winter_matriarch, briar_colossus
/summon zombie
/tag @e[type=zombie,c=1] add hd_aff_test            makes the nearest zombie an elite
/scriptevent hollowdeep:drops                       vault check
```

- [ ] Killing a Hollowdeep rift boss (Tomb Regent, Forge Tyrant, Winter Matriarch or Briar Colossus) with a Terra-to-Astra sword or tool drops 1 to 3 of that tool's tier essence. With an Astra sword it also drops 3 Cognizant Dust.
- [ ] Killing an elite (a mob with an affix in its name) with a tiered sword drops 1 tier essence. A plain rift mob drops nothing extra, apart from the usual Terra Essence chance.
- [ ] A kill with a vanilla weapon drops none of this.
- [ ] **Vault (v0.27.2):** `/scriptevent hollowdeep:drops` lists `ee:cognizant_dust: 100% x2-3, tier 1+`. After clearing a rift, each vault chest apart from the relic chest has 2 or 3 Cognizant Dust: one chest at tier I, two at II and III, three at IV and V.

# Tested

## Flight hover and starter tool enchanting (v0.28.1)

Use the `/function ee/test_augments` world for Flight, and the `/function ee/test_tools` world for the hoe.

```
/function ee/test_augments
/tp @s ~ ~30 ~
/give @s ee:essence_hoe
/give @s obsidian 4
/give @s ee:experience_essence 4
```

- [x] **Flight:** holding jump climbs, and letting go holds you at that height, bobbing a little at most, where before it dropped a block at a time. Sneaking sinks slowly, and letting go of sneak holds the new height. Note how smooth it is, and whether landing from high up hurts. It does nothing in creative mode.
- [x] **Altar enchanting:** the Essence Hoe and Essence Sickle now take Unbreaking (4 obsidian and 4 Experience Essence), and so do the tiered sickles and hoes. Efficiency and Mending work too. The enchantment carries over when a starter is upgraded to Terra.

## Divus gear (v0.28.0)

Quickest setup, on a test world: stand somewhere flat and run `/function ee/test_divus_gear`. It clears your inventory, builds the Awakening Altar with a Tinkering Table on your right, and gives you everything below. `/function ee/test_awakening_off` puts the game rules back.

```
/function ee/test_divus_gear
/summon wither                                      Cognizant Dust check, with the awakened Divus Sword
/give @s ee:essence_guide                           Guide pages
/function ee/test_awakening_off
```

- [x] **Check this first:** the add-on loads with no script or content log errors. The Tinkering Table screen shows the gear slot and two augment slots side by side.
- [x] **Colour:** Divus is now deep purple with gold sparkles on the essence. It should be easy to tell apart from Astra (light violet) and Anima (dusty purple), in the inventory and on worn armor.
- [x] **Awakening:** put Mining I on the Astra Pickaxe at the table. Fill each vessel with 40 of one element. The pickaxe on the altar, with 2 Divus Ingots and 2 Divus Gemstones on the pedestals, makes a Divus Pickaxe after 5 seconds, and each vessel is left empty. The pickaxe keeps Mining I, its enchantments and its name.
- [x] Do the same with the chestplate and sword. Each Divus piece also needs exactly 40 of each element. With less, the altar says which element is short.
- [x] **Stats:** the Divus Sword hits for 29, the Divus Chestplate gives 12 armor, and Divus tools never lose durability. The pickaxe mines faster than the Astra one.
- [x] **Two augments:** on the Divus Sword, Strength I goes in the middle slot and Attack I in the right slot. Both work: extra damage and hits around the target. The tooltip lists both.
- [x] Strength II won't go in the second slot while Strength I is fitted, and the bottom line says "It already has Strength I".
- [x] Taking one augment out removes only that one. Taking the sword out takes both, and neither copy is left behind in your inventory.
- [x] On an Astra piece, an augment in the right slot doesn't fit, and the line says "Only Divus gear takes a second augment".
- [x] Haste I and the Mining augment carried over from Astra still work on Divus gear. Speed I on the chestplate fails with "only fits leggings".
- [x] **Cognizant Dust:** killing the Wither with the Divus Sword drops 6 Cognizant Dust and 1 to 3 Divus Essence.
- [x] The Guide's Armor and Tools, Tinkering Table and Altar Recipes: Divus pages, and the wiki's Divus Gear page, read well.

## Divus and the Awakening Altar (v0.27.0)

Quickest setup, on a test world: stand somewhere flat and run `/function ee/test_awakening`. It clears your inventory, builds the altar with its pedestals and vessels, and gives you everything below. `/function ee/test_awakening_off` puts the game rules back.

```
/function ee/test_awakening
/give @s ee:harvester                               Divus Machine Upgrade check
/give @s coal 16
/give @s ee:infusion_altar                          check it still works
/give @s tnt 4                                      Witherproof check
/give @s flint_and_steel
/summon wither                                      or build it from the soul sand and skulls you're given
/summon ender_dragon                                dragon check, best done in the End
/give @s ee:essence_guide
/function ee/test_awakening_off
```

- [x] **Check this first:** the add-on loads with no script or content log errors. The Awakening Altar, pedestal and vessel show soulstone with orange or glass tops, and the Infusion Altar still works.
- [x] **Vessels:** using 64 Air Essence on a vessel puts in 40 and leaves 24 in your hand. The action bar says "Air Essence 40/40", and looking at the vessel shows the same. Using more says it's full, and using Earth Essence says it holds Air. An empty hand takes all 40 back. Breaking a vessel drops its essence.
- [x] **Divus Block:** with one element in each vessel (at least 10 each), an Astra Block on the altar and 4 Cognizant Dust on the pedestals, the wand makes a Divus Block after 5 seconds. Each vessel loses exactly 10.
- [x] **Problems:** with a pedestal and a vessel swapped, with two vessels of the same element, or with too little essence, the wand says what's wrong and nothing is used up.
- [x] **Divus Machine Upgrade:** an Astra Machine Upgrade on the altar, 4 Divus Ingots on the pedestals and 20 of each element make one. In a Harvester it reaches 15×15 and its screen says Divus.
- [x] **Crafting:** a Divus Block breaks into 9 Divus Essence, and 9 make it back. A Vita Ingot or Gemstone with 2 Divus Essence makes a Divus Ingot or Gemstone. 4 Divus Essence, 4 stone and a Divus Gemstone make 3 Divus Growth Accelerators.
- [x] **Accelerator:** the Divus Growth Accelerator under the farmland on your left grows the Iron crop. Note the Divus colour on the essence, materials and accelerator.
- [x] **Cognizant Dust:** killing the Wither with the Astra sword drops 6 Cognizant Dust and 1 to 3 Astra Essence. Killing it with any other weapon drops no dust. **Also check the Ender Dragon** if you can: 10 dust and 2 to 4 essence. **Note whether the dragon drops anything at all**, since it dies after a long animation and the kill may not count as yours.
- [x] A Terra Pickaxe kill on the Wither drops 1 to 3 Terra Essence and no dust.
- [x] **Witherproof Block:** TNT next to it leaves it standing. **The real test:** build the Wither inside a box of Witherproof Blocks. If the Wither breaks them, report it, and we drop the Witherproof idea.
- [x] The Guide's Divus and Awakening, Cognizant Dust and Altar Recipes: Divus pages read well, and the wiki has the Awakening Altar and Divus pages.

## Area augments (v0.26.0)

Quickest setup, on a test world: stand somewhere flat and run `/function ee/test_tools`. It also covers the v0.25.0 sickle and hoe checks below. `/function ee/test_tools_off` puts the game rules back. Run each `/enchant` while holding the tool it's for.

```
/function ee/test_tools
/give @s ee:terra_pickaxe                           wrong-piece and Fortune checks
/give @s ee:terra_axe
/give @s ee:essence_hoe                             Tilling shouldn't fit it
/enchant @s fortune 3
/enchant @s silk_touch
/give @s chest                                      area mining should skip it
/give @s ee:aether_pickaxe                          durability check, with Mining I
/give @s ee:mining_i_augment
/give @s ee:soul_jar
/summon wolf                                        tame it with bones for the Attack check
/give @s bone 10
/function ee/test_tools_off
```

- [x] **Fitting:** Mining fits a pickaxe, axe or shovel, Attack a sword, Tilling a tiered hoe (not the Essence Hoe), and Pathing a shovel. Each says so when put on the wrong piece.
- [x] **Mining IV** on an Astra pickaxe breaks 9×9 on a wall facing you, and 9×9 flat when you mine straight down. **Note if the square ever lies the wrong way**, such as when looking slightly up or down at a wall. Sneaking mines one block.
- [x] Mining drops what the pickaxe would: Fortune gives extra raw iron, and Silk Touch gives the ore. It skips chests, machines and bedrock, and an axe with Mining only takes wood. Area-mined ores give no experience.
- [x] **Attack III** on a sword: hitting one zombie in a group hurts the others too, and kills still fill a Soul Jar. Tamed wolves and other players aren't hit.
- [x] **Tilling IV:** sneaking and using the hoe on dirt tills 9×9. Without sneaking it tills one block.
- [x] **Pathing IV:** sneaking and using the shovel on grass or dirt makes 9×9 of path. **Also check that a tiered shovel makes a single path without sneaking**, as it isn't a vanilla shovel.
- [x] Each extra block or hit costs 1 durability on a Terra-to-Aether tool. **Note any stutter** at 9×9.

## Tiered sickles and hoes (v0.25.0)

Use the `/function ee/test_tools` world from above. The altar checks need the altar from `/function ee/test_augments`, or place one with the commands below. Altar enchanting takes 4 of the enchantment's item (obsidian for Unbreaking) and 4 Experience Essence.

```
/give @s ee:terra_gemstone 2                        Essence Sickle to Terra Sickle
/give @s ee:terra_ingot 2
/give @s ee:terra_hoe
/give @s ee:infusion_altar
/give @s ee:infusion_pedestal 8
/give @s ee:wand
/enchant @s unbreaking 3                            hold the Terra Sickle
/give @s obsidian 4                                 altar Unbreaking
/give @s ee:experience_essence 4
/give @s ee:essence_guide
```

- [x] The Essence Sickle and Hoe now look plain steel, and the Terra to Astra sickles and hoes each show their tier's crystal colour, in the inventory and in the hand.
- [x] **Upgrading:** an Essence Sickle on the altar, with 2 Terra Gemstones and 2 Terra Ingots, makes a Terra Sickle. The same works for the hoe, and for each tier after. Damage, enchantments and names carry over.
- [x] **Reach:** a Terra Sickle harvests every ripe crop in a 7×7 around the crop you break, and an Astra Sickle 15×15. Unripe crops are left alone. **Note any stutter** with the Astra Sickle on a full field.
- [x] **Wear:** a Terra Sickle loses 1 durability per crop harvested. An Astra Sickle and Hoe never lose any. Unbreaking III on a Terra Sickle makes it lose about a quarter as much.
- [x] **Hoes:** every hoe, including the Essence Hoe, still harvests and replants a ripe crop. Right-clicking grass, dirt or a path with air above turns it into farmland and costs 1 durability. Dirt under a block doesn't till.
- [x] The Guide's Tools and Armor and Tools pages, and the wiki's Tools pages, list the new tiers.

## Tinkering Table and augments (v0.24.0)

Quickest setup, on a test world: stand somewhere open and run `/function ee/test_augments`. It clears your inventory, then builds a floor with a Tinkering Table and an Infusion Altar, and gives you the gear, augments and altar ingredients. `/function ee/test_augments_off` puts the game rules back.

```
/function ee/test_augments
/give @s ee:harvester                               other machine screens still open
/tp @s ~ ~30 ~                                      Flight and No Fall Damage
/give @s splash_potion 1 25                         Poison
/give @s splash_potion 1 34                         Weakness
/give @s splash_potion 1 17                         Slowness
/give @s pufferfish                                 Nausea and Hunger
/summon wither_skeleton                             Wither
/give @s ee:ignis_leggings                          augment kept through an altar upgrade
/give @s ee:aether_gemstone 2
/give @s ee:aether_ingot 2
/give @s ee:speed_i_augment
/function ee/test_augments_off
```

- [x] **Check this first:** the add-on loads with no script or content log errors, and the other machines still open their own screens.
- [x] The table opens with an empty hand and shows its title, a gear slot with a faint chestplate, an augment slot with a faint shard, and a status line. Note anything misplaced, as the layout hasn't been seen in-game.
- [x] **Fitting:** an Astra chestplate, then Flight, says "Fitted: Flight" and the chestplate's tooltip says "Augment: Flight". Shift-clicking either one in first works too.
- [x] **Removing:** taking the augment back out gives the augment back, and the gear loses its tooltip line. Taking the gear out leaves nothing behind in the right slot.
- [x] **No duplicates:** spam shift-click on the gear and the augment to take both out as fast as possible. You should never end up with the gear still fitted and a spare augment. Report it if you do.
- [x] **Rules:** Speed III on Terra leggings says it needs Aether gear. Flight on leggings says it only fits a chestplate. Diamond armor says it can't take augments.
- [x] Breaking the table with fitted gear inside drops the gear and no spare augment.
- [x] A fitted piece keeps its augment through an altar upgrade, such as Ignis to Aether leggings.
- [x] **Health Boost V** adds 10 hearts while worn, doesn't knock health down every second, and the hearts go when it comes off. **Absorption** gives its hearts once and only renews after the effect runs out.
- [x] **Effects:** Speed, Haste, Jump Boost, Night Vision (no flicker), Water Breathing, Fire Resistance and Slow Falling all work, show no particles, and end a few seconds after taking the piece off.
- [x] **Resistances:** a splash potion of Poison, Weakness or Slowness, or a pufferfish for Nausea and Hunger, is cleared at once. A Wither skeleton's Wither too.
- [x] **No Fall Damage:** jumping feels normal, and a fall from 30 blocks does no damage.
- [x] **Strength:** an Astra sword with Strength III kills a zombie in one hit, and the kill still fills a Soul Jar or drops loot as a player kill. It doesn't add damage to players. An Aether sword with Strength II loses 1 durability per hit, not 2.
- [x] Each augment's altar recipe works, including Strength III with diamond swords and the Blank Augment crafting recipe. The Guide and wiki pages match.

## Shift-click into machines (v0.23.1)

```
/give @s ee:seed_reprocessor
/give @s lava_bucket
/give @s ee:iron_seeds 16
/give @s ee:terra_machine_upgrade
```

- [x] With lava in the fuel slot, Y on controller (or shift-click) puts seeds in the Seed Reprocessor's seed slot, not the upgrade slot.
- [x] An upgrade shift-clicked in still lands in the upgrade slot.


## Soul Jar display (v0.22.4)

- [x] The first kill with an Anima Dagger shows on the jar straight away, in creative and survival, with the inventory closed and open.
- [x] Several quick kills all count, and no jar goes missing.

## Crate picture model (v0.22.2)

- [x] A new world without Deepcore loads with no `ee:dq_icons` geometry or `geometry.default` errors.
- [x] With Deepcore, our items on crates still show their pictures, the same size and in the same place.

## Machine title and test kits (v0.22.1)

- [x] Seed Reprocessor, Soul Extractor and Essence Furnace titles stay on one line, clear of the fuel bar.

## Fuel from a chest on top (v0.22.0)

- [x] **Harvester:** coal in a chest on top moves to the fuel slot and the fuel bar fills. Other items stay in the chest.
- [x] **Seed Reprocessor and Soul Extractor:** a chest on top with coal and valid input fills both slots.
- [x] **Essence Furnace:** logs in the chest go to the input and are not burned as fuel. Coal goes to the fuel slot.
- [x] A lava bucket in the chest fuels the machine, and the empty bucket returns to the chest and doesn't block the next fuel.
- [x] A hopper on top works in place of the chest.
- [x] A Deepcore pipe side set to Output into the top chest keeps the machine fuelled.

## Armor and tools (v0.21.0)

Quickest setup: `/give @s ee:terra_chestplate`, `/give @s ee:astra_pickaxe`, and a diamond sword with `/give @s diamond_sword` for the altar.

- [x] **Check this first:** the add-on loads with no content log errors about items, attachables or `minecraft:damage`. All 40 items appear in the creative menu with their own pictures.
- [x] **Each armor piece shows on the player** in all five colours, in third person, and the vanilla piece doesn't show underneath. Note if parts are misplaced or stretched. Since v0.23.0 the armor uses diamond's shapes in crystal colours, so it should sit exactly as diamond armor does, with the face showing through the helmet and no boots or leggings stretched. The Essence Hoe and Sickle use the new colours too.
- [x] An enchanted armor piece has the glint.
- [x] Armor loses durability when hit, and breaks when it runs out.
- [x] **Mining levels:** each pickaxe tier mines iron, diamond and obsidian with drops. Axes speed up wood and shovels speed up dirt. Nothing mines faster than it should, and swords deal their damage.
- [x] Unbreaking makes a tool wear more slowly.
- [x] **Upgrades:** a diamond sword on the altar, with 2 Terra Gemstones and 2 Terra Ingots on pedestals and 4 pedestals empty, makes a Terra Sword. Terra upgrades to Aqua, and so on up to Astra.
- [x] An enchanted, damaged, renamed sword keeps all three through an upgrade. Upgrading to Astra drops the damage, as it has no durability.
- [x] A spare item on an empty pedestal stops any altar craft and says "These items don't make anything". All old seed and dagger recipes still work.
- [x] Gemstones repair gear on an anvil. Normal enchanting tables and anvils accept the gear, and altar enchanting works on it.
- [x] Items keep working after a server restart, and the Guide and wiki match.
- [x] **Armor points:** the armor bar fills as expected. **Does a higher tier actually protect more?** Compare damage from the same mob in Terra and Astra. If they match, Bedrock caps armor as suspected, and this goes in the balance pass.
- [x] **Tool wear:** a Terra pickaxe loses 1 durability per block and on a hit. **Note if it loses 2**, which means Bedrock wears it natively too and the script should stop. Astra tools never lose any.

## Essence Hoe texture (v0.20.1)

- [x] The hoe shows its new straight blade, in the inventory and held in the hand.

## New machines and altar enchanting (v0.20.0)

Quickest setup: `/give @s ee:seed_reprocessor`, `/give @s ee:soul_extractor`, `/give @s ee:essence_furnace`, `/give @s coal 16`, `/give @s ee:soul_jar`.

- [x] **Check this first:** the add-on loads with no script errors, and the Harvester still works as before. All machines share one script path now.
- [x] The Harvester now has the Scythe port front, and the Seed Reprocessor has the Thresher. The Soul Extractor shows a purple jar and the Essence Furnace a firebox. All line up in all four facing directions.
- [x] Each machine's screen opens with its own title, with fuel and upgrade on the left, then input, arrow and output, and the status line below them. Note anything misplaced, as this layout was never seen in-game. Deepcore's screens and normal chests should be unaffected.
- [x] The arrow fills as an item is worked on. Note if it looks stretched or blurry.
- [x] Shift-clicking fuel, an upgrade and the input in any order ends with each in its own slot. **Note if a stack gets stuck in the output slot**, since a full input spills there.
- [x] **Seed Reprocessor:** a seed becomes 2 of its essence every 10 s with no upgrade. It uses 4,000 fuel per seed, and stops with "Output full" when essence can't fit.
- [x] **Soul Extractor:** a jar fills from drops at the values in the Guide, and its lore updates. Bone then a zombie drop waits with "Needs a matching jar". Half souls add up correctly, and a jar never overfills. **A filled jar works on the altar.**
- [x] **Essence Furnace:** a raw iron, sand, cooked food and a log (charcoal) all smelt. A log in the input smelts, and a log in the fuel slot burns. **Spot-check that smelting ids exist on Bedrock**, such as `hardened_clay` and `netherbrick`. A wrong one spawns nothing and can stop the machine, so note any script errors.
- [x] Upgrades speed all three up and raise their fuel use. At Astra they run several items per tick with no lag.
- [x] A chest on top feeds the input with only items it accepts, and a chest at the back takes the output. A half-filled jar stays in the Soul Extractor.
- [x] Breaking each machine drops the block and its contents, but no hidden readouts.
- [x] **Altar enchanting, book:** a book on the altar, 4 quartz and 4 Experience Essence on the pedestals, then the wand, gives an Enchanted Book of Sharpness I. **Whether scripts can make enchanted books is the biggest unknown.** If not, the altar says it can't take that enchantment, and nothing is used up.
- [x] **Altar enchanting, gear:** the same with a diamond sword gives Sharpness I. Doing it again gives II, and so on to V, then it refuses. A conflicting enchantment refuses (Smite on a Sharpness sword). Enchants already on the item stay.
- [x] Taking an enchanted item back off the altar keeps its enchantments, and a nearly-broken tool keeps its damage.
- [x] Spot-check item ids for a few enchantments, especially Aqua Affinity (`waterlily`), Thorns (`rose_bush`) and Wind Burst (`wind_charge`).
- [x] The Guide pages and wiki match what happens.

## Anima materials in the Guide (v0.19.1)

- [x] The Guide's Materials page says 2 Anima Dust makes Anima Ingots and Gemstones, and both recipes work as it says.

## Harvester refit (v0.19.0)

- [x] **Check this first, with Deepcore installed:** open a Harvester and one of Deepcore's machines. Both should show their own custom screens, and a normal chest should stay normal. **If one add-on's screens turn into plain chests, the two UI edits are clashing.**
- [x] The Harvester has the Thresher front, vented sides, a hatch on top and an arrow on the back. They line up in all four facing directions.
- [x] The screen has a fuel slot top left, an upgrade slot bottom left, a bar between them and 21 harvest slots, with nothing overlapping. Note anything misplaced, as the layout was never seen in-game before release.
- [x] Empty fuel and upgrade slots show faint pictures, which disappear when an item goes in.
- [x] The bar and the percentage rise with coal and fall with harvests while the screen stays open. Note if the bar looks stretched or blurry, or if the text flickers.
- [x] The status line is correct for No upgrade, each upgrade, Running, Paused and Out of fuel.
- [x] Shift-clicking stacks in fills the visible slots and never loses anything. Shift-click many different stacks to test the limit.
- [x] A Harvester placed before v0.19.0 keeps its fuel and upgrade, and items from its old last slots move to the harvest slots or drop beside it.
- [x] Breaking it drops the block and items but none of the hidden readout items. They're also not in the creative menu or `/give`.
- [x] A chest at the back never receives the hidden items.

## Shorter farmland (v0.18.2)

The farmland is now 15/16 of a block tall, like vanilla farmland, using a custom model instead of `geometry.full_block`. Crops now sit one pixel lower to meet it.

- [x] **Check this first:** all five farmlands load, with nothing stretched or missing. The top sits 1/16 lower than a full block next to a normal block, and the selection box matches it.
- [x] A full block next to the farmland shows no hole along that top pixel, and blocks under and beside it don't show through.
- [x] You can walk and jump across a field without catching on the edge, and stand on it without sinking in.
- [x] Crops still plant, grow, ripen and break on every tier, and touch the soil with no gap or overlap. Check them on vanilla farmland too.
- [x] Essence farmland next to vanilla farmland is the same height.

## Dewy Loam farmland texture (v0.18.1)

- [x] **Check this first:** all five farmlands show the new mottled soil, with the top texture on top and the side texture on the sides.
- [x] A large field shows no seams between blocks.
- [x] Essence used on placed farmland still swaps its tier, and the new tier's colour shows.

## Deepcore crate pictures (v0.18.0)

Needs Deepcore v4.65.0 or newer.

- [x] **Check this first:** the add-on loads with no script errors, with and without Deepcore installed.
- [x] An Essence & Earth item in a Deep Storage Crate shows its own picture instead of a **?**. Try the first and last items too, like a tier essence and a machine upgrade base.
- [x] The picture goes away when the crate changes item, empties or is mined, and leaves no entity behind.
- [x] Pictures still show after a server restart. The content log has no `[DQ] dq:add_icon` lines.
- [x] Block items such as ores and storage blocks still show a **?**. They have no item texture to use.

## Deepcore Geo Scanner (v0.16.0)

Needs Deepcore v4.61.0 or newer.

- [x] **Check this first:** the add-on loads with no script errors, with and without Deepcore installed.
- [x] A scan lists Essence and Vita, with stone and deepslate counted together.
- [x] A scan in the Nether lists Anima.
- [x] The hologram shows each ore in its colour.
- [x] Ores still show after a server restart.

## Infusion Altar and souls (v0.14.0)

- [x] **Check this first:** the add-on loads with no script or content log errors. Then craft a pedestal and place an item on it, since the display entity is the biggest unknown.
- [x] **Item display:** an item on a stand shows above the block, or at least its name shows when you look at it. Note how it looks. Deepcore's notes say an item in a hand bone draws as a tilted 3D model.
- [x] Clicking the stand (not the entity) still works from every angle. The display entity can't be hit, pushed or set on fire, and doesn't get in the way of walking.
- [x] Altar, pedestal and wand craft and show their textures and shapes.
- [x] Use an item on a stand and one goes on, using one from the stack. An empty hand takes it back. Creative mode doesn't use items up.
- [x] Items on stands survive leaving the world and coming back, and a server restart.
- [x] Breaking a stand drops the block and, within about 2 seconds, the item it held. No display entity stays behind. Explosions do the same.
- [x] With 8 pedestals in place, a Vita Seed Base on the altar and 4 iron ingots + 4 Ignis Essence on the pedestals, a wand starts the craft. After 5 seconds iron seeds sit on the altar and the pedestals are empty.
- [x] Pedestal order doesn't matter. With a pedestal missing, or items that don't fit, the wand shows a message and nothing happens.
- [x] Taking an item away mid-craft stops it and uses nothing.
- [x] New seeds no longer craft at a table, except Terra. Old seeds in inventories still plant.
- [x] Soulstone and Anima Ore generate in new Nether chunks. **Anima Ore relies on `final_pass` running after the soulstone, so check it actually appears.** Soulstone drops cobble, and Anima Ore drops 1–3 dust.
- [x] Furnace chain: cobble → soulstone → smooth → Soul Dust. Bricks → cracked bricks. Soul Glass crafts, and shows see-through.
- [x] Anima Ingot and Gemstone craft from Vita plus 2 dust. Anima Seed Base crafts.
- [x] Killing a pig with an Anima Dagger in hand and a Soul Jar in your inventory adds 1 soul, shown on the jar. The dagger loses 1 durability per kill. Other weapons add nothing.
- [x] A jar holds one mob type, and souls spill into the next jar at the limit. A jar with souls accepts only that type.
- [x] 8 pig souls + an Anima Seed Base + 4 Aqua Essence and 4 full jars on pedestals makes pig seeds, and the jars go back empty. A jar that's not full doesn't count.
- [x] Passive and Hostile daggers craft at the altar. They give 1.5 souls from their kind of mob and 1 from others, and show as 6 attack damage. Check whether `minecraft:damage` applies.
- [x] Zombies, husks, drowned and zombie villagers all count as zombie souls. Cod, salmon, tropical fish and pufferfish count as fish.
- [x] The Anima crop's essence makes 4 Anima Dust per ring. A Blank Skull now takes Soul Dust.

## Full crop list (v0.13.0)

- [x] **Check this first:** read the content log after loading. Any recipe with a wrong Bedrock item id shows up here, and those are what to fix. The ones most likely to be wrong are `melon_block`, `waterlily`, `nether_brick`, `snow`, the coral fans, the music discs, and the three head items.
- [x] The 29 new crops' seeds craft at the altar: air, earth, water, fire, stone, dirt, ice, deepslate, nature, dye, nether, coral, honey, prismarine, sculk, end, experience, pig, chicken, cow, sheep, squid, fish, turtle, armadillo, phantom, rabbit, breeze and ghast.
- [x] All 11 clusters craft from their four items. The water and fire clusters give the bucket back, or else note that they don't.
- [x] Terra seeds now craft from 8 Terra Essence around wheat seeds.
- [x] Mixed recipes craft: sand (fire + dirt), clay (water + dirt), nether wart (nether + nature), andesite, a sapling, a coral, a dye, a concrete, a log.
- [x] The buckets (water, lava, milk) use up an empty bucket and give back a full one.
- [x] A Blank Skull recipe makes 4, and 8 essence around one makes each head and skull.
- [x] A Blank Record crafts, and at least 3 music discs craft from it.
- [x] 8 experience essence makes 8 droplets, and a droplet + a glass bottle makes a bottle o' enchanting.
- [x] Retired crops (cobblestone, sand, clay, nether wart): seeds no longer craft, planted ones still grow, and their essence still crafts.
- [x] Each new mob essence's face reads at normal size.
- [x] The recipe book and crafting table stay responsive with this many recipes.

## Ores and materials (v0.12.0)

- [x] **Check this first:** the add-on loads with no script errors or content log errors about features.
- [x] New chunks have Essence Ore between y -32 and 64, and Vita Ore between y -60 and 24, each in stone and deepslate. Veins are about 8 blocks.
- [x] Essence Ore drops 2–4 Terra Essence, and Vita Ore drops 1–4 Vita Shards. Old ore in the world keeps working.
- [x] Most mobs drop Terra Essence about 20% of the time. Slimes, magma cubes, ghasts, phantoms and players never do.
- [x] Mob essence that lands on farmland doesn't cause extra drops, and neither does ore essence.
- [x] 4 shards + iron ingot makes a Vita Ingot, and 4 shards + diamond makes a Vita Gemstone.
- [x] Vita Ingot + 2 tier essence makes that tier's ingot, in any slots, and the same for gemstones.
- [x] Nuggets, ingot blocks, gemstone blocks, essence blocks and the Vita Block all craft both ways. Blocks show their textures and names.
- [x] 1 tier essence breaks back into 4 of the tier below.
- [x] Each accelerator crafts from 4 essence, 4 stone and 1 gemstone, and makes 3.
- [x] About 10% of ripe resource crops drop Fertilized Essence. The Terra crop never does.
- [x] Fertilized Essence advances an unripe crop 1 or 2 stages, or 2–5 on vanilla crops, and uses one. Essence Fertilizer ripens a crop and uses one. Neither is used on a ripe crop, and creative mode uses none.
- [x] Essence Fertilizer crafts from 4 Terra + 4 bone meal + diamond (makes 4), and 4 Terra + 4 Fertilized Essence + diamond (makes 8).

## Machines (Wildbloom)

Read against Wildbloom v0.1.34's code on 2026-10-30. These still need a real run.

- [x] The Reaper breaks only ripe crops and replants them at stage 0, and the essence, seed and farmland bonus all drop. It keeps the seed too, so expect a surplus of seeds.
- [x] Quickbloom advances our crops one stage at a time and stops at ripe.
- [x] Harvestbloom resets ripe crops to stage 0 with no drops, in exchange for mana. Keep it away from farms you want to harvest.
- [x] The Tiller leaves our seeds and farmland alone ([Wildbloom issue #2](https://github.com/baseballr/Wildbloom/issues/2), fixed in v0.1.34).
- [x] **Spring ritual:** it looks like it will crash before growing anything, in `growAround` in Wildbloom's `machines.js`, because `c` is used before it's defined. This would affect every crop, including vanilla.

## Wiki

- [x] The accelerators section, mob crop pages and roadmap all appear on the live site.
- [x] The download link gets the current version.

## Anima Dust without ore (v0.17.1)

- [x] 4 Aqua Blocks in a plus around soul sand makes 4 Anima Dust, and the recipe unlocks once you hold an Aqua Block.
- [x] The Guide's Materials page mentions the recipe.

## Harvester (v0.17.0)

Quickest setup: `/give @s ee:harvester`, `/give @s coal 8`, and a `/give @s ee:ignis_machine_upgrade`. Fertilizer ripens test crops fast.

- [x] **Check this first:** place one and tap it with an empty hand. A screen titled Harvester should open. **The hitbox switching is the biggest unknown.** Note if the screen won't open, or if the block can't be mined.
- [x] A pickaxe mines it from every side, and so does sneaking. Anything held in the hand stops the screen opening.
- [x] Its front faces where you stood when you placed it. Check all four directions, and that the back plate is opposite.
- [x] With coal in slot 1, looking at it shows its fuel going up. With no fuel it shows "Out of fuel" and does nothing.
- [x] With 2 crops ripe in the 3x3 starting one block in front of it, both get harvested and replanted at stage 0. Unripe crops are left alone, and crops at other heights too.
- [x] Drops land in the machine, minus one seed. Bonus essence and second seeds still happen on essence farmland. Slots 1 and 2 never fill with harvest.
- [x] Vanilla wheat, carrots, potatoes and beetroot work too.
- [x] Each upgrade in slot 2 shows the right area and speed. Removing it goes back to 3x3. An item that isn't an upgrade does nothing.
- [x] Coal, charcoal, a coal block, a lava bucket (gives the bucket back), a blaze rod, sticks, a log and planks all add fuel. **Logs and planks rely on item tags, so check them.** Other items in slot 1 are ignored.
- [x] A chest or barrel touching the back fills from the machine, and a hopper under it carries on from there. Blocks on other sides aren't used.
- [x] Once storage is full with no chest, drops stay on the ground and the crops keep replanting.
- [x] Items and fuel survive leaving the world and a server restart. After a restart it can still be mined.
- [x] Breaking it, or blowing it up, drops the block and everything inside within about 2 seconds, and leaves no entity behind.
- [x] Two players can use one together. One holding a tool doesn't stop the other opening it.
- [x] Several machines with Astra upgrades don't cause noticeable lag. Note how far away they keep running, and whether Deepcore's chunk loader keeps them running.
- [x] Redstone power pauses it, and it says so. Note if `getRedstonePower` isn't available.
- [x] The machines recipes all craft, and the Guide and wiki pages match what happens.

## Deepcore Network Crafter (v0.16.0)

Needs Deepcore v4.61.0 or newer.

- [x] **Check this first:** the add-on loads with no script errors, with and without Deepcore installed.
- [x] With an Assembler on the network, an Essence & Earth item shows in the Network Crafter and can be ordered.
- [x] An order that needs a higher tier essence makes it from lower tier essence in storage (4 into 1).
- [x] Recipes still show after a server restart.

## Tool textures (v0.15.1)

- [x] The sickle and hoe show their new outlined look, in the inventory and held in the hand.

## Vita Shards without ore (v0.15.0)

- [x] 4 Terra Blocks in a plus around a flint makes 4 Vita Shards, and the recipe unlocks once you hold a Terra Block.
- [x] The Guide's Materials page mentions the recipe.

## Altar recipes in the Guide (v0.14.1)

- [x] The Guide has an Altar Recipes page for each tier and for daggers, and the longest ones scroll.
- [x] Item names read properly, and a recipe made from its page works at the altar.
- [x] The Infusion Altar page explains how to make both seed bases.

## Bedrock risk checks (v0.11.1)

Nothing in the add-on uses these yet. They decide how the later gear and machine phases get built.

Already answered by reading Deepcore v4.58's package:

- **Machine storage and screens work.** Its `dq:machine_screen` is an invisible, undamageable entity with a `minecraft:inventory`, sitting in the machine's block.
- **Item displays work.** Its `dq:crate_view` entity shows items. A note in its `crate.js` says an item held in a hand bone draws as a tilted 3D model, so it moved to flat icons picked by entity properties.
- **Custom armor works.** It ships a wearable suit with attachables.

Still needs testing in-game:

- [x] **Crystal wear:** can a crafting recipe return a damaged tool? Try a shaped recipe with a damaged item as an ingredient. Until this is settled, tier upgrades stay at 4 essence with no Infusion Crystal.
- **Flight is settled:** on 2026-11-02 the user confirmed `/ability` doesn't work on Bedrock, even on a new world, so there's no flight augment.

## Farming rebalance (v0.11.0)

- [x] **Check this first:** the add-on loads on the server with no script errors in the log.
- [x] Time a crop with no accelerators, ideally a few. **Expect about 24 minutes.**
- [x] One accelerator directly under the farmland ripens a crop in **about 3.5 minutes**, and two take about half that.
- [x] **Accelerators already placed before this update keep working.** If they do nothing, breaking and replacing one should start it. Note which happens.
- [x] A Terra accelerator reaches a crop 9 blocks up from its range start, with other blocks between, and an Astra one reaches 45. It speeds up only the first crop above it.
- [x] Accelerators also speed up wheat, carrots, potatoes and beetroot.
- [x] 50 or so accelerators cause no noticeable lag.
- [x] Seeds plant on vanilla farmland and every essence farmland tier. A crop grows on all of them, including higher-tier seeds on Terra Farmland.
- [x] A crop on vanilla farmland pops off cleanly if the farmland dries back to dirt.
- [x] Ripe crops on vanilla farmland drop exactly 1 essence and 1 seed.
- [x] Over many harvests, second essence and second seed each drop about 10% of the time on non-matching essence farmland, and 20% on matching.
- [x] A ripe Terra crop averages 1, 1.5, 2, 2.5 and 3 essence from Terra up to Astra Farmland, with no separate essence item.
- [x] Using tier essence on vanilla farmland converts it, uses one essence, and keeps the crop on top. Creative mode uses none.
- [x] Using a different tier's essence on essence farmland swaps it, returning the old essence about 25% of the time. The same tier's essence does nothing and isn't used.
- [x] 1 dirt + 1 tier essence crafts that tier's farmland, in any slots.
- [x] Bone meal does nothing on our crops and isn't used up. It still works on vanilla crops.
- [x] Spider and skeleton show both recipes in the recipe book, and each gives the right item.
- [x] Copper, iron and gold now craft ingots, and netherite crafts ingots rather than scrap.
- [x] The sickle and hoe still work, and the hoe's seed removal still takes one seed when a second seed drops.
- [x] A retired bone meal crop still grows, and its essence still crafts bone meal.
- [x] The Guide's pages and the wiki match what happens in-game.

## Essence Guide (v0.9.0)

- [x] **Check this first:** the add-on loads on the server with no script errors in the log, and older features such as bone meal still work. The new `@minecraft/server-ui` dependency could stop all the scripts if its version doesn't match.
- [x] The guide crafts from 1 book + 1 Terra Essence, in any slots, and shows its texture.
- [x] Using it from the hand opens the menu, and every topic and Back button works.
- [x] Each player gets one free copy on joining, and no second copy after dying or rejoining. With a full inventory, it drops at their feet.
- [x] Long pages scroll, and the text reads well on a small screen.

## Essence tools (v0.8.0)

- [x] The sickle crafts from 3 Aqua Essence + 2 sticks, and the hoe from 2 Aqua Essence + 2 sticks. Both show their textures and hold as a tool in the hand.
- [x] Breaking a ripe crop with the sickle harvests only the ripe crops in the 3×3, on essence and vanilla crops (wheat, carrots, potatoes, beetroot).
- [x] The sickle refuses to break an unripe crop, and breaks other blocks normally.
- [x] Right-clicking a ripe crop with the hoe drops the harvest and replants it at stage 0, leaving one fewer seed in the drops, including on vanilla crops.
- [x] Right-clicking an unripe crop with the hoe does nothing.
- [x] Farmland bonus essence and vanilla crop Terra Essence still drop from tool harvests.
- [x] Durability falls by 1 per crop harvested and by nothing extra from the game itself. The tool breaks at zero with the sound, and creative mode uses none.
- [x] Aqua Essence repairs both tools in an anvil.

## Terra Essence from grass and Loggers (v0.7.4)

- [x] Hand-cut grass drops Terra Essence about 20% of the time (raised in v0.10.2).
- [x] A Wildbloom Logger cutting trees drops Terra Essence for about 5% of logs, including logs high up a tall tree.
- [x] Chopping logs far from any Logger never drops essence.
- [x] Felling a tree causes no noticeable lag.

## Terra Essence from vanilla crops (v0.7.3)

- [x] Ripe vanilla crops, harvested by hand or by the reaper, drop Terra Essence about 15% of the time (roughly 15 per 100 harvests).

## Mod tag (v0.7.2)

- [x] Items and blocks (farmland, accelerators) show a blue `@ESSENCE&EARTH` line under their name in the inventory.
- [x] Block names show properly, not as `tile.ee:...`.

## Crop rendering (v0.7.1)

- [x] Crops no longer flicker or show hatching when you walk around them, at every growth stage.
- [x] Crop planes show from both sides, with no invisible angles.

## Mob crops (v0.7.0)

- [x] Each crop grows, and shows its colour when ripe. Enderman is purple, wither is pale blue, and their essence stays dark.
- [x] Each mob essence shows its face in the inventory, and is recognisable at normal size.
- [x] Bone meal seeds can no longer be crafted.
- [x] A crafted wither skeleton skull works for summoning a wither.

## Growth accelerators (v0.6.0)

- [x] Each shows the right name and tier colour, with white sparks around the roots.
- [x] Each drops itself when mined.

## Farmland (v0.5.0)

- [x] Seeds won't plant on dirt or grass.
- [x] Breaking farmland pops the crop on top, and the farmland drops itself.
