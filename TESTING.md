# In-game test list

Everything below is built but not yet checked in-game. Tick items off as they pass, and delete a section once it's all done.

Before starting: upload the latest `addon/*.mcaddon` to the server, and use creative mode or `/give` for anything expensive.

# Still to test

## Machine title and test kits (v0.22.1)

- [ ] Seed Reprocessor, Soul Extractor and Essence Furnace titles stay on one line, clear of the fuel bar.
- [ ] `/function ee/kit_machines`, `kit_altar`, `kit_gear`, `kit_farming` and `kit_explore` each give their items. Note any line the content log rejects.

## Fuel from a chest on top (v0.22.0)

- [ ] **Harvester:** coal in a chest on top moves to the fuel slot and the fuel bar fills. Other items stay in the chest.
- [ ] **Seed Reprocessor and Soul Extractor:** a chest on top with coal and valid input fills both slots.
- [ ] **Essence Furnace:** logs in the chest go to the input and are not burned as fuel. Coal goes to the fuel slot.
- [ ] A lava bucket in the chest fuels the machine, and the empty bucket returns to the chest and doesn't block the next fuel.
- [ ] A hopper on top works in place of the chest.
- [ ] A Deepcore pipe side set to Output into the top chest keeps the machine fuelled.

## Armor and tools (v0.21.0)

Quickest setup: `/give @s ee:terra_chestplate`, `/give @s ee:astra_pickaxe`, and a diamond sword with `/give @s diamond_sword` for the altar.

- [ ] **Check this first:** the add-on loads with no content log errors about items, attachables or `minecraft:damage`. All 40 items appear in the creative menu with their own pictures.
- [ ] **Each armor piece shows on the player** in all five colours, in third person, and the vanilla piece doesn't show underneath. Note if parts are misplaced or stretched. The helmet is open under its visor, so note if that shows as a solid block or a hole. The chest should show 1 gem for Terra and 5 for Astra.
- [ ] An enchanted armor piece has the glint.
- [ ] **Armor points:** the armor bar fills as expected. **Does a higher tier actually protect more?** Compare damage from the same mob in Terra and Astra. If they match, Bedrock caps armor as suspected, and this goes in the balance pass.
- [ ] Armor loses durability when hit, and breaks when it runs out.
- [ ] **Mining levels:** each pickaxe tier mines iron, diamond and obsidian with drops. Axes speed up wood and shovels speed up dirt. Nothing mines faster than it should, and swords deal their damage.
- [ ] **Tool wear:** a Terra pickaxe loses 1 durability per block and on a hit. **Note if it loses 2**, which means Bedrock wears it natively too and the script should stop. Astra tools never lose any.
- [ ] Unbreaking makes a tool wear more slowly.
- [ ] **Upgrades:** a diamond sword on the altar, with 2 Terra Gemstones and 2 Terra Ingots on pedestals and 4 pedestals empty, makes a Terra Sword. Terra upgrades to Aqua, and so on up to Astra.
- [ ] An enchanted, damaged, renamed sword keeps all three through an upgrade. Upgrading to Astra drops the damage, as it has no durability.
- [ ] A spare item on an empty pedestal stops any altar craft and says "These items don't make anything". All old seed and dagger recipes still work.
- [ ] Gemstones repair gear on an anvil. Normal enchanting tables and anvils accept the gear, and altar enchanting works on it.
- [ ] Items keep working after a server restart, and the Guide and wiki match.

## Essence Hoe texture (v0.20.1)

- [ ] The hoe shows its new straight blade, in the inventory and held in the hand.

## New machines and altar enchanting (v0.20.0)

Quickest setup: `/give @s ee:seed_reprocessor`, `/give @s ee:soul_extractor`, `/give @s ee:essence_furnace`, `/give @s coal 16`, `/give @s ee:soul_jar`.

- [ ] **Check this first:** the add-on loads with no script errors, and the Harvester still works as before. All machines share one script path now.
- [ ] The Harvester now has the Scythe port front, and the Seed Reprocessor has the Thresher. The Soul Extractor shows a purple jar and the Essence Furnace a firebox. All line up in all four facing directions.
- [ ] Each machine's screen opens with its own title, with fuel and upgrade on the left, then input, arrow and output, and the status line below them. Note anything misplaced, as this layout was never seen in-game. Deepcore's screens and normal chests should be unaffected.
- [ ] The arrow fills as an item is worked on. Note if it looks stretched or blurry.
- [ ] Shift-clicking fuel, an upgrade and the input in any order ends with each in its own slot. **Note if a stack gets stuck in the output slot**, since a full input spills there.
- [ ] **Seed Reprocessor:** a seed becomes 2 of its essence every 10 s with no upgrade. It uses 4,000 fuel per seed, and stops with "Output full" when essence can't fit.
- [ ] **Soul Extractor:** a jar fills from drops at the values in the Guide, and its lore updates. Bone then a zombie drop waits with "Needs a matching jar". Half souls add up correctly, and a jar never overfills. **A filled jar works on the altar.**
- [ ] **Essence Furnace:** a raw iron, sand, cooked food and a log (charcoal) all smelt. A log in the input smelts, and a log in the fuel slot burns. **Spot-check that smelting ids exist on Bedrock**, such as `hardened_clay` and `netherbrick`. A wrong one spawns nothing and can stop the machine, so note any script errors.
- [ ] Upgrades speed all three up and raise their fuel use. At Astra they run several items per tick with no lag.
- [ ] A chest on top feeds the input with only items it accepts, and a chest at the back takes the output. A half-filled jar stays in the Soul Extractor.
- [ ] Breaking each machine drops the block and its contents, but no hidden readouts.
- [ ] **Altar enchanting, book:** a book on the altar, 4 quartz and 4 Experience Essence on the pedestals, then the wand, gives an Enchanted Book of Sharpness I. **Whether scripts can make enchanted books is the biggest unknown.** If not, the altar says it can't take that enchantment, and nothing is used up.
- [ ] **Altar enchanting, gear:** the same with a diamond sword gives Sharpness I. Doing it again gives II, and so on to V, then it refuses. A conflicting enchantment refuses (Smite on a Sharpness sword). Enchants already on the item stay.
- [ ] Taking an enchanted item back off the altar keeps its enchantments, and a nearly-broken tool keeps its damage.
- [ ] Spot-check item ids for a few enchantments, especially Aqua Affinity (`waterlily`), Thorns (`rose_bush`) and Wind Burst (`wind_charge`).
- [ ] The Guide pages and wiki match what happens.

## Anima materials in the Guide (v0.19.1)

- [ ] The Guide's Materials page says 2 Anima Dust makes Anima Ingots and Gemstones, and both recipes work as it says.

## Harvester refit (v0.19.0)

- [ ] **Check this first, with Deepcore installed:** open a Harvester and one of Deepcore's machines. Both should show their own custom screens, and a normal chest should stay normal. **If one add-on's screens turn into plain chests, the two UI edits are clashing.**
- [ ] The Harvester has the Thresher front, vented sides, a hatch on top and an arrow on the back. They line up in all four facing directions.
- [ ] The screen has a fuel slot top left, an upgrade slot bottom left, a bar between them and 21 harvest slots, with nothing overlapping. Note anything misplaced, as the layout was never seen in-game before release.
- [ ] Empty fuel and upgrade slots show faint pictures, which disappear when an item goes in.
- [ ] The bar and the percentage rise with coal and fall with harvests while the screen stays open. Note if the bar looks stretched or blurry, or if the text flickers.
- [ ] The status line is correct for No upgrade, each upgrade, Running, Paused and Out of fuel.
- [ ] Shift-clicking stacks in fills the visible slots and never loses anything. Shift-click many different stacks to test the limit.
- [ ] A Harvester placed before v0.19.0 keeps its fuel and upgrade, and items from its old last slots move to the harvest slots or drop beside it.
- [ ] Breaking it drops the block and items but none of the hidden readout items. They're also not in the creative menu or `/give`.
- [ ] A chest at the back never receives the hidden items.

## Shorter farmland (v0.18.2)

The farmland is now 15/16 of a block tall, like vanilla farmland, using a custom model instead of `geometry.full_block`. Crops now sit one pixel lower to meet it.

- [ ] **Check this first:** all five farmlands load, with nothing stretched or missing. The top sits 1/16 lower than a full block next to a normal block, and the selection box matches it.
- [ ] A full block next to the farmland shows no hole along that top pixel, and blocks under and beside it don't show through.
- [ ] You can walk and jump across a field without catching on the edge, and stand on it without sinking in.
- [ ] Crops still plant, grow, ripen and break on every tier, and touch the soil with no gap or overlap. Check them on vanilla farmland too.
- [ ] Essence farmland next to vanilla farmland is the same height.

## Dewy Loam farmland texture (v0.18.1)

- [ ] **Check this first:** all five farmlands show the new mottled soil, with the top texture on top and the side texture on the sides.
- [ ] A large field shows no seams between blocks.
- [ ] Essence used on placed farmland still swaps its tier, and the new tier's colour shows.

## Deepcore crate pictures (v0.18.0)

Needs Deepcore v4.65.0 or newer.

- [ ] **Check this first:** the add-on loads with no script errors, with and without Deepcore installed. Note any content log complaint about `geometry.dq_crate_icon` without Deepcore, since that geometry comes from its pack.
- [ ] An Essence & Earth item in a Deep Storage Crate shows its own picture instead of a **?**. Try the first and last items too, like a tier essence and a machine upgrade base.
- [ ] The picture goes away when the crate changes item, empties or is mined, and leaves no entity behind.
- [ ] Pictures still show after a server restart. The content log has no `[DQ] dq:add_icon` lines.
- [ ] Block items such as ores and storage blocks still show a **?**. They have no item texture to use.

## Harvester (v0.17.0)

Quickest setup: `/give @s ee:harvester`, `/give @s coal 8`, and a `/give @s ee:ignis_machine_upgrade`. Fertilizer ripens test crops fast.

- [ ] Redstone power pauses it, and it says so. Note if `getRedstonePower` isn't available.

## Deepcore Geo Scanner (v0.16.0)

Needs Deepcore v4.61.0 or newer.

- [ ] **Check this first:** the add-on loads with no script errors, with and without Deepcore installed.
- [ ] A scan lists Essence and Vita, with stone and deepslate counted together.
- [ ] A scan in the Nether lists Anima.
- [ ] The hologram shows each ore in its colour.
- [ ] Ores still show after a server restart.

## Infusion Altar and souls (v0.14.0)

- [ ] **Check this first:** the add-on loads with no script or content log errors. Then craft a pedestal and place an item on it, since the display entity is the biggest unknown.
- [ ] **Item display:** an item on a stand shows above the block, or at least its name shows when you look at it. Note how it looks. Deepcore's notes say an item in a hand bone draws as a tilted 3D model.
- [ ] Clicking the stand (not the entity) still works from every angle. The display entity can't be hit, pushed or set on fire, and doesn't get in the way of walking.
- [ ] Altar, pedestal and wand craft and show their textures and shapes.
- [ ] Use an item on a stand and one goes on, using one from the stack. An empty hand takes it back. Creative mode doesn't use items up.
- [ ] Items on stands survive leaving the world and coming back, and a server restart.
- [ ] Breaking a stand drops the block and, within about 2 seconds, the item it held. No display entity stays behind. Explosions do the same.
- [ ] With 8 pedestals in place, a Vita Seed Base on the altar and 4 iron ingots + 4 Ignis Essence on the pedestals, a wand starts the craft. After 5 seconds iron seeds sit on the altar and the pedestals are empty.
- [ ] Pedestal order doesn't matter. With a pedestal missing, or items that don't fit, the wand shows a message and nothing happens.
- [ ] Taking an item away mid-craft stops it and uses nothing.
- [ ] Redstone power starts the craft, if `getRedstonePower` is available. Note if it isn't.
- [ ] New seeds no longer craft at a table, except Terra. Old seeds in inventories still plant.
- [ ] Soulstone and Anima Ore generate in new Nether chunks. **Anima Ore relies on `final_pass` running after the soulstone, so check it actually appears.** Soulstone drops cobble, and Anima Ore drops 1–3 dust.
- [ ] Furnace chain: cobble → soulstone → smooth → Soul Dust. Bricks → cracked bricks. Soul Glass crafts, and shows see-through.
- [ ] Anima Ingot and Gemstone craft from Vita plus 2 dust. Anima Seed Base crafts.
- [ ] Killing a pig with an Anima Dagger in hand and a Soul Jar in your inventory adds 1 soul, shown on the jar. The dagger loses 1 durability per kill. Other weapons add nothing.
- [ ] A jar holds one mob type, and souls spill into the next jar at the limit. A jar with souls accepts only that type.
- [ ] 8 pig souls + an Anima Seed Base + 4 Aqua Essence and 4 full jars on pedestals makes pig seeds, and the jars go back empty. A jar that's not full doesn't count.
- [ ] Passive and Hostile daggers craft at the altar. They give 1.5 souls from their kind of mob and 1 from others, and show as 6 attack damage. Check whether `minecraft:damage` applies.
- [ ] Zombies, husks, drowned and zombie villagers all count as zombie souls. Cod, salmon, tropical fish and pufferfish count as fish.
- [ ] The Anima crop's essence makes 4 Anima Dust per ring. A Blank Skull now takes Soul Dust.

## Full crop list (v0.13.0)

- [ ] **Check this first:** read the content log after loading. Any recipe with a wrong Bedrock item id shows up here, and those are what to fix. The ones most likely to be wrong are `melon_block`, `waterlily`, `nether_brick`, `snow`, the coral fans, the music discs, and the three head items.
- [ ] The 29 new crops' seeds craft at the altar: air, earth, water, fire, stone, dirt, ice, deepslate, nature, dye, nether, coral, honey, prismarine, sculk, end, experience, pig, chicken, cow, sheep, squid, fish, turtle, armadillo, phantom, rabbit, breeze and ghast.
- [ ] All 11 clusters craft from their four items. The water and fire clusters give the bucket back, or else note that they don't.
- [ ] Terra seeds now craft from 8 Terra Essence around wheat seeds.
- [ ] Mixed recipes craft: sand (fire + dirt), clay (water + dirt), nether wart (nether + nature), andesite, a sapling, a coral, a dye, a concrete, a log.
- [ ] The buckets (water, lava, milk) use up an empty bucket and give back a full one.
- [ ] A Blank Skull recipe makes 4, and 8 essence around one makes each head and skull.
- [ ] A Blank Record crafts, and at least 3 music discs craft from it.
- [ ] 8 experience essence makes 8 droplets, and a droplet + a glass bottle makes a bottle o' enchanting.
- [ ] Retired crops (cobblestone, sand, clay, nether wart): seeds no longer craft, planted ones still grow, and their essence still crafts.
- [ ] Each new mob essence's face reads at normal size.
- [ ] The recipe book and crafting table stay responsive with this many recipes.

## Ores and materials (v0.12.0)

- [ ] **Check this first:** the add-on loads with no script errors or content log errors about features.
- [ ] New chunks have Essence Ore between y -32 and 64, and Vita Ore between y -60 and 24, each in stone and deepslate. Veins are about 8 blocks.
- [ ] Essence Ore drops 2–4 Terra Essence, and Vita Ore drops 1–4 Vita Shards. Old ore in the world keeps working.
- [ ] Most mobs drop Terra Essence about 20% of the time. Slimes, magma cubes, ghasts, phantoms and players never do.
- [ ] Mob essence that lands on farmland doesn't cause extra drops, and neither does ore essence.
- [ ] 4 shards + iron ingot makes a Vita Ingot, and 4 shards + diamond makes a Vita Gemstone.
- [ ] Vita Ingot + 2 tier essence makes that tier's ingot, in any slots, and the same for gemstones.
- [ ] Nuggets, ingot blocks, gemstone blocks, essence blocks and the Vita Block all craft both ways. Blocks show their textures and names.
- [ ] 1 tier essence breaks back into 4 of the tier below.
- [ ] Each accelerator crafts from 4 essence, 4 stone and 1 gemstone, and makes 3.
- [ ] About 10% of ripe resource crops drop Fertilized Essence. The Terra crop never does.
- [ ] Fertilized Essence advances an unripe crop 1 or 2 stages, or 2–5 on vanilla crops, and uses one. Essence Fertilizer ripens a crop and uses one. Neither is used on a ripe crop, and creative mode uses none.
- [ ] Essence Fertilizer crafts from 4 Terra + 4 bone meal + diamond (makes 4), and 4 Terra + 4 Fertilized Essence + diamond (makes 8).

## Machines (Wildbloom)

Read against Wildbloom v0.1.34's code on 2026-10-30. These still need a real run.

- [ ] The Reaper breaks only ripe crops and replants them at stage 0, and the essence, seed and farmland bonus all drop. It keeps the seed too, so expect a surplus of seeds.
- [ ] Quickbloom advances our crops one stage at a time and stops at ripe.
- [ ] Harvestbloom resets ripe crops to stage 0 with no drops, in exchange for mana. Keep it away from farms you want to harvest.
- [ ] The Tiller leaves our seeds and farmland alone ([Wildbloom issue #2](https://github.com/baseballr/Wildbloom/issues/2), fixed in v0.1.34).
- [ ] **Spring ritual:** it looks like it will crash before growing anything, in `growAround` in Wildbloom's `machines.js`, because `c` is used before it's defined. This would affect every crop, including vanilla.

## Wiki

- [ ] The accelerators section, mob crop pages and roadmap all appear on the live site.
- [ ] The download link gets the current version.

# Tested

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
