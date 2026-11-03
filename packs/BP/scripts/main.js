import { system, world, BlockVolume, EnchantmentTypes, EntityInitializationCause, EquipmentSlot, GameMode, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// NS, ESSENCE (the tier-1 essence), BALANCE, ALTAR_RECIPES, SOULS, ACCELERATOR_RANGE, GUIDE_PAGES, FARMLAND_TIER, CROP_TIER and ESSENCE_FARMLAND placeholders are filled in from crops.json at build time.
const GROWTH = "__NS__:growth";
const MAX_STAGE = 3;
const {
  growChance: GROW_CHANCE, // per random tick, and per accelerator tick
  grassEssenceChance: GRASS_CHANCE,
  cropEssenceChance: CROP_CHANCE,
  logEssenceChance: LOG_CHANCE,
  mobEssenceChance: MOB_CHANCE,
  secondaryChance: SECONDARY_CHANCE, // second essence and second seed, on any essence farmland
  matchingFarmlandChance: MATCHING_CHANCE, // added when the farmland's tier matches the crop's
  terraCropYield: TERRA_YIELD, // average essence per harvest, by farmland tier
  farmlandRefundChance: REFUND_CHANCE,
  altarTicks: ALTAR_TICKS,
  attunedSoulMultiplier: ATTUNED_SOULS,
  harvester: HARVESTER_BALANCE,
  seedReprocessor: REPROCESSOR_BALANCE,
  soulExtractor: EXTRACTOR_BALANCE,
  essenceFurnace: FURNACE_BALANCE,
  tinkeringTable: TABLE_BALANCE,
  awakening: { vesselCapacity: VESSEL_CAPACITY, cognizantDust: COGNIZANT_DUST, bossEssence: BOSS_ESSENCE, eliteTag: ELITE_TAG, eliteEssence: ELITE_ESSENCE },
} = __BALANCE__;

// Accelerator id -> how many blocks above itself it reaches.
const ACCELERATOR_RANGE = __ACCELERATOR_RANGE__;

// Farmland id -> its tier, crop id -> its tier, and tier essence id -> the farmland it makes.
const FARMLAND_TIER = __FARMLAND_TIER__;
const CROP_TIER = __CROP_TIER__;
const ESSENCE_FARMLAND = __ESSENCE_FARMLAND__;

// Tier-1 essence also has a small chance to drop from grass and ripe vanilla crops,
// which is how every world gets started.
const GRASS = new Set(["minecraft:short_grass", "minecraft:tall_grass", "minecraft:fern", "minecraft:large_fern"]);
// Item a harvested vanilla crop drops -> smallest stack that means it was ripe.
// Unripe wheat and beetroot drop only seeds; unripe carrots and potatoes drop exactly 1.
const RIPE_DROP = { "minecraft:wheat": 1, "minecraft:beetroot": 1, "minecraft:carrot": 2, "minecraft:potato": 2 };
const FARMLAND = new Set(["minecraft:farmland", ...Object.keys(FARMLAND_TIER)]);

// Sickle id -> how many blocks out from the broken crop it sweeps, and every hoe, starter and tiered.
const SICKLES = __SICKLES__;
const HOES = new Set(__HOES__);
// Vanilla crop block -> the item that replants it. Vanilla crops are ripe at growth 7.
const VANILLA_SEEDS = { "minecraft:wheat": "minecraft:wheat_seeds", "minecraft:carrots": "minecraft:carrot", "minecraft:potatoes": "minecraft:potato", "minecraft:beetroot": "minecraft:beetroot_seeds" };
const isOurCrop = (id) => id.startsWith("__NS__:") && id.endsWith("_crop");
const isCrop = (id) => id in VANILLA_SEEDS || isOurCrop(id);
const growthState = (id) => (isOurCrop(id) ? GROWTH : "growth");
const isRipe = (permutation) => {
  const id = permutation?.type.id;
  return !!id && isCrop(id) && permutation.getState(growthState(id)) === (isOurCrop(id) ? MAX_STAGE : 7);
};

// Tools harvest with `destroy` so their drops take the same path as machines' (see entitySpawn below).
function harvest(dimension, { x, y, z }) {
  dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
}

function wear(player, amount) {
  if (player.getGameMode() === GameMode.Creative) return;
  const equip = player.getComponent("minecraft:equippable");
  const tool = equip?.getEquipment(EquipmentSlot.Mainhand);
  const durability = tool?.getComponent("minecraft:durability");
  if (!durability) return;
  if (durability.damage + amount > durability.maxDurability) {
    equip.setEquipment(EquipmentSlot.Mainhand);
    player.playSound("random.break");
    return;
  }
  durability.damage += amount;
  equip.setEquipment(EquipmentSlot.Mainhand, tool);
}

// Unbreaking gives each point of wear the same chance to be skipped as vanilla.
function wearHeld(player, amount) {
  const tool = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
  const unbreaking = tool?.getComponent("minecraft:enchantable")?.getEnchantment("unbreaking")?.level ?? 0;
  let worn = 0;
  for (let i = 0; i < amount; i++) if (Math.random() < 1 / (unbreaking + 1)) worn++;
  if (worn) wear(player, worn);
}

// ponytail: an Astra sickle can run 224 setblocks in one tick; spread them over a few ticks if that stutters.
function sweep(player, dimension, { x, y, z }, reach) {
  let harvested = 1; // the crop the player broke
  for (let dx = -reach; dx <= reach; dx++)
    for (let dz = -reach; dz <= reach; dz++) {
      const location = { x: x + dx, y, z: z + dz };
      if (!isRipe(dimension.getBlock(location)?.permutation)) continue;
      harvest(dimension, location);
      harvested++;
    }
  wearHeld(player, harvested);
}

// Sickles never break an unripe crop.
world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const { block, itemStack } = event;
  if (itemStack?.typeId in SICKLES && isCrop(block.typeId) && !isRipe(block.permutation)) event.cancel = true;
});

// Takes one seed back out of a harvest's drops, so the hoe's replant costs what replanting by hand does.
// ponytail: wheat and beetroot can drop no seeds, which makes that replant free; harmless, and vanilla already gives plenty.
function takeSeed(dimension, location, seed) {
  const center = { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 };
  for (const entity of dimension.getEntities({ location: center, maxDistance: 1.5, type: "minecraft:item" })) {
    const stack = entity.getComponent("minecraft:item")?.itemStack;
    if (stack?.typeId !== seed) continue;
    entity.remove();
    if (stack.amount > 1) drop(dimension, seed, entity.location, stack.amount - 1);
    return;
  }
}

// Our tiered tools wear through scripts, like the sickle and hoe. Unbreaking gives the same chance to skip wear as vanilla.
const GEAR_TOOLS = new Set(__GEAR_TOOLS__);
function wearGearTool(player) {
  const tool = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
  if (GEAR_TOOLS.has(tool?.typeId)) wearHeld(player, 1);
}
world.afterEvents.playerBreakBlock.subscribe(({ player }) => wearGearTool(player));
world.afterEvents.entityHurt.subscribe(({ damageSource }) => {
  const player = damageSource.damagingEntity;
  if (player?.typeId === "minecraft:player" && damageSource.cause === "entityAttack") wearGearTool(player);
});

function useOne(player, count = 1) {
  if (player.getGameMode() === GameMode.Creative) return;
  const equip = player.getComponent("minecraft:equippable");
  const item = equip?.getEquipment(EquipmentSlot.Mainhand);
  if (!item) return;
  if (item.amount > count) {
    item.amount -= count;
    equip.setEquipment(EquipmentSlot.Mainhand, item);
  } else {
    equip.setEquipment(EquipmentSlot.Mainhand);
  }
}

// Tier essence used on farmland turns it into that tier. Swapping essence farmland can refund some of the old tier's essence.
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, itemStack, player, isFirstEvent } = event;
  const farmland = ESSENCE_FARMLAND[itemStack?.typeId];
  if (!farmland || !FARMLAND.has(block.typeId) || block.typeId === farmland) return;
  event.cancel = true;
  if (!isFirstEvent) return; // holding the button repeats the event
  const { dimension, location, typeId: old } = block;
  system.run(() => {
    dimension.getBlock(location)?.setType(farmland);
    dimension.playSound("dig.sand", location);
    if (player.isValid) useOne(player);
    if (old !== "minecraft:farmland" && Math.random() < REFUND_CHANCE)
      drop(dimension, old.replace(/_farmland$/, "_essence"), { x: location.x + 0.5, y: location.y + 1.5, z: location.z + 0.5 });
  });
});

// Fertilized Essence advances a crop 1-2 stages (vanilla crops 2-5 of their 7), and Essence Fertilizer ripens it.
const FERTILIZERS = { "__NS__:fertilized_essence": false, "__NS__:essence_fertilizer": true };
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, itemStack, player, isFirstEvent } = event;
  const ripens = FERTILIZERS[itemStack?.typeId];
  if (ripens === undefined || !isCrop(block.typeId) || isRipe(block.permutation)) return;
  event.cancel = true;
  if (!isFirstEvent) return; // holding the button repeats the event
  const { dimension, location } = block;
  system.run(() => {
    const crop = dimension.getBlock(location);
    if (!crop || !isCrop(crop.typeId) || isRipe(crop.permutation)) return;
    const state = growthState(crop.typeId);
    const top = isOurCrop(crop.typeId) ? MAX_STAGE : 7;
    const step = isOurCrop(crop.typeId) ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 4);
    crop.setPermutation(crop.permutation.withState(state, ripens ? top : Math.min(crop.permutation.getState(state) + step, top)));
    dimension.spawnParticle("minecraft:crop_growth_emitter", crop.center());
    if (player.isValid) useOne(player);
  });
});

// Hoes harvest and replant a ripe crop, or till dirt and grass with air above it, as vanilla hoes do.
// A Tilling augment tills the square around it too while sneaking.
const TILLABLE = new Set(["minecraft:grass_block", "minecraft:dirt", "minecraft:grass_path"]);
const canTill = (block) => TILLABLE.has(block?.typeId) && !!block.above()?.isAir;
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, itemStack, player, isFirstEvent } = event;
  if (!HOES.has(itemStack?.typeId)) return;
  const ripe = isRipe(block.permutation);
  if (!ripe && !canTill(block)) return;
  event.cancel = true;
  if (!isFirstEvent) return; // holding the button repeats the event
  const { dimension, location, permutation } = block;
  system.run(() => {
    if (!player.isValid) return;
    if (ripe) {
      harvestAndReplant(dimension, location, permutation);
      wearHeld(player, 1);
      return;
    }
    const tilled = reshape(dimension, location, canTill, "minecraft:farmland", player.isSneaking ? heldArea(player, "till") : 0);
    if (!tilled) return;
    dimension.playSound("dig.gravel", location);
    wearHeld(player, tilled);
  });
});

function harvestAndReplant(dimension, location, ripe) {
  const id = ripe.type.id;
  const seed = VANILLA_SEEDS[id] ?? id.replace(/_crop$/, "_seeds");
  harvest(dimension, location);
  dimension.getBlock(location)?.setPermutation(ripe.withState(growthState(id), 0));
  system.run(() => takeSeed(dimension, location, seed)); // the drops exist from the next tick
}

const GUIDE = "__NS__:essence_guide";
const GUIDE_PAGES = __GUIDE_PAGES__; // [{ title, body }]
const GOT_GUIDE = "__NS__:got_guide"; // player tag, so the free copy only comes once

async function showGuide(player) {
  const menu = new ActionFormData().title("Essence Guide").body("Grow your resources. Pick a topic.");
  for (const { title } of GUIDE_PAGES) menu.button(title);
  const { canceled, selection } = await menu.show(player);
  if (canceled) return;
  const { title, body } = GUIDE_PAGES[selection];
  const page = await new ActionFormData().title(title).body(body).button("Back").show(player);
  if (!page.canceled) await showGuide(player);
}

world.afterEvents.itemUse.subscribe(({ itemStack, source }) => {
  if (itemStack.typeId === GUIDE) showGuide(source);
});

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn || player.hasTag(GOT_GUIDE)) return;
  player.addTag(GOT_GUIDE);
  const left = player.getComponent("minecraft:inventory")?.container.addItem(new ItemStack(GUIDE));
  if (left) player.dimension.spawnItem(left, player.location); // full inventory
});

// Grass: only players cut it, and it often drops nothing, so this one stays a player event.
world.afterEvents.playerBreakBlock.subscribe(({ block, brokenBlockPermutation: broken, itemStackBeforeBreak: tool, player, dimension }) => {
  if (tool?.typeId in SICKLES && isRipe(broken)) sweep(player, dimension, block.location, SICKLES[tool.typeId]);
  if (player.getGameMode() === GameMode.Creative) return;
  if (GRASS.has(broken.type.id) && Math.random() < GRASS_CHANCE) drop(dimension, "__ESSENCE__", block.center());
});

// Mobs that drop Terra Essence: every walking or swimming mob, as bosses and flyers don't count.
const NO_MOB_ESSENCE = new Set(["minecraft:player", "minecraft:slime", "minecraft:magma_cube", "minecraft:ghast", "minecraft:phantom", "minecraft:ender_dragon"]);
world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (NO_MOB_ESSENCE.has(deadEntity.typeId) || Math.random() >= MOB_CHANCE) return;
  try {
    drop(deadEntity.dimension, "__ESSENCE__", deadEntity.location);
  } catch {
    // already gone, or an unloaded chunk
  }
});

// Bosses killed with one of our tiered tools drop that tier's essence, and with an Astra sword, Cognizant Dust as well.
// Hollowdeep's bosses count too, and its elites (tagged with their affix) drop a little essence. Without Hollowdeep, none of them exist.
const GEAR_ESSENCE = __GEAR_ESSENCE__; // tiered tool -> its tier's essence
const COGNIZANT_SWORD = "__NS__:astra_sword";
world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
  const held = damageSource.damagingEntity?.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.typeId;
  if (!held || !(held in GEAR_ESSENCE)) return;
  try {
    const [min, max] = BOSS_ESSENCE[deadEntity.typeId] ?? (deadEntity.getTags().some((t) => t.startsWith(ELITE_TAG)) ? ELITE_ESSENCE : []);
    if (min === undefined) return;
    const { dimension, location } = deadEntity;
    drop(dimension, GEAR_ESSENCE[held], location, min + Math.floor(Math.random() * (max - min + 1)));
    if (held === COGNIZANT_SWORD && COGNIZANT_DUST[deadEntity.typeId]) drop(dimension, "__NS__:cognizant_dust", location, COGNIZANT_DUST[deadEntity.typeId]);
  } catch {
    // already gone, or an unloaded chunk
  }
});

// Crops are judged by what they drop rather than who broke them, so harvesting machines
// (anything that breaks blocks with drops, like `setblock ... destroy`) roll the same chances as players.
// A harvest drop appears inside the crop's block, right above the farmland; items a player throws appear
// at head height, so they never match.
const ours = new Set(); // ids of item entities this script spawned, so they don't roll again

function drop(dimension, item, location, amount = 1) {
  ours.add(dimension.spawnItem(new ItemStack(item, amount), location).id);
}

// Wildbloom's Logger flower breaks logs with `setblock ... destroy`, and reaches 6 blocks out and up a whole tree.
// Nothing marks who broke a log, so any log item dropping near a Logger counts.
// ponytail: logs a player chops near a Logger roll too; needs Wildbloom to send a script event to tell them apart.
function nearLogger(dimension, { x, y, z }) {
  const { min, max } = dimension.heightRange;
  const volume = new BlockVolume(
    { x: Math.floor(x) - 8, y: Math.max(min, Math.floor(y) - 32), z: Math.floor(z) - 8 },
    { x: Math.floor(x) + 8, y: Math.min(max - 1, Math.floor(y) + 8), z: Math.floor(z) + 8 },
  );
  try {
    return !dimension.getBlocks(volume, { includeTypes: ["wb:fn_logger"] }, true).getBlockLocationIterator().next().done;
  } catch {
    return false; // Wildbloom isn't installed
  }
}

world.afterEvents.entitySpawn.subscribe(({ entity, cause }) => {
  if (cause !== EntityInitializationCause.Spawned || entity.typeId !== "minecraft:item") return;
  if (ours.delete(entity.id) || !entity.isValid) return; // picked up or merged in the same tick
  const stack = entity.getComponent("minecraft:item")?.itemStack;
  if (!stack) return;
  if (stack.typeId.startsWith("minecraft:") && stack.typeId.endsWith("_log")) {
    // Rolled first so the search only runs on the logs that win.
    if (Math.random() < LOG_CHANCE && nearLogger(entity.dimension, entity.location)) drop(entity.dimension, "__ESSENCE__", entity.location);
    return;
  }
  const { x, y, z } = entity.location;
  let soil;
  try {
    soil = entity.dimension.getBlock({ x: Math.floor(x), y: Math.floor(y) - 1, z: Math.floor(z) })?.typeId;
  } catch {
    return; // unloaded chunk
  }
  if (!FARMLAND.has(soil)) return;

  if (stack.amount >= (RIPE_DROP[stack.typeId] ?? Infinity)) {
    if (Math.random() < CROP_CHANCE) drop(entity.dimension, "__ESSENCE__", entity.location);
  } else if (stack.typeId.startsWith("__NS__:") && stack.typeId.endsWith("_essence")) {
    // Our crops only drop essence when ripe, so its appearance on essence farmland is a ripe harvest.
    const tier = FARMLAND_TIER[soil];
    const id = stack.typeId.replace(/_essence$/, "");
    const cropTier = CROP_TIER[`${id}_crop`];
    if (!tier || !cropTier) return; // vanilla farmland gives no extras, and tier essence other than the essence crop's isn't a harvest
    const chance = SECONDARY_CHANCE + (tier === cropTier ? MATCHING_CHANCE : 0);
    // The Terra crop's essence scales with the farmland's tier instead of rolling for a second.
    const extra = stack.typeId === "__ESSENCE__" ? TERRA_YIELD[tier - 1] - 1 + Math.random() : Math.random() < chance ? 1 : 0;
    if (extra >= 1) drop(entity.dimension, stack.typeId, entity.location, Math.floor(extra));
    if (Math.random() < chance) drop(entity.dimension, `${id}_seeds`, entity.location);
  }
});

function canGrow(block) {
  // Machines can setType a crop onto any soil, past the placement filter. It just won't grow there.
  return FARMLAND.has(block.below()?.typeId) && block.permutation.getState(GROWTH) < MAX_STAGE;
}

function grow(block) {
  if (canGrow(block)) block.setPermutation(block.permutation.withState(GROWTH, block.permutation.getState(GROWTH) + 1));
}

// Vanilla crops have 8 stages to our 4, and advance at wheat's best-case chance per tick.
function acceleratorTick(block) {
  const id = block.typeId;
  if (isOurCrop(id)) {
    if (Math.random() < GROW_CHANCE) grow(block);
    return;
  }
  const stage = block.permutation.getState("growth");
  if (stage < 7 && Math.random() < 1 / 3) block.setPermutation(block.permutation.withState("growth", stage + 1));
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("__NS__:crop", {
    onRandomTick({ block }) {
      if (Math.random() < GROW_CHANCE) grow(block);
    },
  });
  // Altar and pedestals: use an item to place it, and an empty hand to take it back.
  blockComponentRegistry.registerCustomComponent("__NS__:stand", {
    onPlayerInteract({ block, player }) {
      if (!player) return;
      const equip = player.getComponent("minecraft:equippable");
      const hand = equip?.getEquipment(EquipmentSlot.Mainhand);
      if (hand?.typeId === WAND) {
        if (block.typeId === ALTAR || block.typeId === AWAKENING_ALTAR) startInfusion(block, player);
        return;
      }
      if (block.typeId === VESSEL) return useVessel(block, player, hand);
      const held = standItem(block);
      if (held) {
        const left = player.getComponent("minecraft:inventory")?.container.addItem(held);
        if (left) block.dimension.spawnItem(left, block.center());
        setStandItem(block);
      } else if (hand) {
        const one = hand.clone();
        one.amount = 1;
        setStandItem(block, one);
        useOne(player);
      }
    },
  });
  blockComponentRegistry.registerCustomComponent("__NS__:harvester", {
    onTick({ block }) {
      try {
        harvesterTick(block);
      } catch {
        // unloaded chunk
      }
    },
  });
  blockComponentRegistry.registerCustomComponent("__NS__:processor", {
    onTick({ block }) {
      try {
        processorTick(block);
      } catch {
        // unloaded chunk
      }
    },
  });
  blockComponentRegistry.registerCustomComponent("__NS__:tinkering_table", {
    onTick({ block }) {
      try {
        tableTick(block);
      } catch {
        // unloaded chunk
      }
    },
  });
  blockComponentRegistry.registerCustomComponent("__NS__:accelerator", {
    // Speeds up the first crop above it, within its range.
    onTick({ block }) {
      try {
        for (let up = 2; up <= ACCELERATOR_RANGE[block.typeId] + 2; up++) {
          const above = block.above(up);
          if (!above) return;
          if (isCrop(above.typeId)) return acceleratorTick(above);
        }
      } catch {
        // above the world or in an unloaded chunk
      }
    },
  });
});

// ---------- Infusion Altar ----------
// A stand's item lives in a hidden entity's inventory, so it survives restarts, and the entity draws it above the block.
const ALTAR = "__NS__:infusion_altar";
const PEDESTAL = "__NS__:infusion_pedestal";
const AWAKENING_ALTAR = "__NS__:awakening_altar";
const AWAKENING_PEDESTAL = "__NS__:awakening_pedestal";
const VESSEL = "__NS__:essence_vessel";
const STANDS = new Set([ALTAR, PEDESTAL, AWAKENING_ALTAR, AWAKENING_PEDESTAL, VESSEL]);
const WAND = "__NS__:wand";
const DISPLAY = "__NS__:item_display";
const PEDESTAL_OFFSETS = [[3, 0], [0, 3], [-3, 0], [0, -3], [2, 2], [2, -2], [-2, 2], [-2, -2]];
const ALTAR_RECIPES = __ALTAR_RECIPES__;
const ENCHANT_RECIPES = __ENCHANT_RECIPES__; // [{ enchant, ingredients }]
const BOOK = "minecraft:book";

const displayLocation = ({ x, y, z }) => ({ x: x + 0.5, y: y + 1, z: z + 0.5 });

function displayOf(block) {
  return block.dimension.getEntities({ type: DISPLAY, location: displayLocation(block.location), maxDistance: 0.5 })[0];
}

function standItem(block) {
  return displayOf(block)?.getComponent("minecraft:inventory")?.container.getItem(0);
}

function setStandItem(block, stack) {
  let display = displayOf(block);
  if (!stack) {
    display?.remove();
    return;
  }
  display ??= block.dimension.spawnEntity(DISPLAY, displayLocation(block.location));
  display.getComponent("minecraft:inventory").container.setItem(0, stack);
  display.nameTag = (stack.nameTag ?? stack.typeId.split(":")[1].replaceAll("_", " ")) + (stack.getLore()[0] ? `\n${stack.getLore()[0]}` : "");
  if (block.typeId === VESSEL) display.nameTag += ` ${stack.amount}/${VESSEL_CAPACITY}`;
  display.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${stack.typeId}`);
}

// Breaking a stand by any means leaves its display behind, so this sweep drops the item and clears the entity.
system.runInterval(() => {
  for (const name of ["overworld", "nether", "the_end"]) {
    const dimension = world.getDimension(name);
    for (const display of dimension.getEntities({ type: DISPLAY })) {
      try {
        const { x, y, z } = display.location;
        const id = dimension.getBlock({ x: Math.floor(x), y: Math.floor(y) - 1, z: Math.floor(z) })?.typeId;
        if (id === undefined || STANDS.has(id)) continue;
        const item = display.getComponent("minecraft:inventory")?.container.getItem(0);
        if (item) dimension.spawnItem(item, display.location);
        display.remove();
      } catch {
        // unloaded chunk
      }
    }
  }
}, 40);

const fullJar = (stack, soul) => stack?.typeId === JAR && stack.getDynamicProperty(SOUL_TYPE) === soul && stack.getDynamicProperty(SOUL_COUNT) >= SOULS[soul].need;

// Pedestal order doesn't matter: each ingredient takes the first unused pedestal that fits it. Spare items stop the craft, as it would use them up.
function matchRecipe(recipe, items) {
  if (items.filter(Boolean).length !== recipe.ingredients.length) return false;
  const free = items.map((_, i) => i);
  for (const ingredient of recipe.ingredients) {
    const slot = free.findIndex((i) => (typeof ingredient === "string" ? items[i]?.typeId === ingredient : fullJar(items[i], ingredient.soul)));
    if (slot < 0) return false;
    free.splice(slot, 1);
  }
  return true;
}

const infusing = new Map(); // altar location key -> { dimension, location, ticks, recipe }
const locationKey = ({ x, y, z }, dimension) => `${dimension.id}:${x},${y},${z}`;
const pedestalsOf = (altar) => PEDESTAL_OFFSETS.map(([dx, dz]) => altar.dimension.getBlock({ x: altar.location.x + dx, y: altar.location.y, z: altar.location.z + dz }));

// The input with this enchantment one level higher, or nothing if it can't take it. A plain book becomes an enchanted book.
function enchanted(input, enchant) {
  try {
    const type = EnchantmentTypes.get(enchant);
    const result = input.typeId === BOOK ? new ItemStack("minecraft:enchanted_book") : input.clone();
    const enchantable = result.getComponent("minecraft:enchantable");
    if (!type || !enchantable) return undefined;
    const level = (enchantable.getEnchantment(type)?.level ?? 0) + 1;
    if (level > type.maxLevel) return undefined;
    if (level > 1) enchantable.removeEnchantment(type);
    if (!enchantable.canAddEnchantment({ type, level })) return undefined;
    enchantable.addEnchantment({ type, level });
    return result;
  } catch {
    return undefined; // Bedrock refused it
  }
}

// A gear upgrade keeps what the piece already had. The new tier may be unbreakable, or have less durability than the damage to carry over.
function upgraded(input, id) {
  const output = new ItemStack(id);
  output.nameTag = input.nameTag;
  const damage = input.getComponent("minecraft:durability")?.damage ?? 0;
  const durability = output.getComponent("minecraft:durability");
  if (durability) durability.damage = Math.min(damage, durability.maxDurability - 1);
  const enchantable = output.getComponent("minecraft:enchantable");
  for (const enchantment of input.getComponent("minecraft:enchantable")?.getEnchantments() ?? []) {
    if (enchantable?.canAddEnchantment(enchantment)) enchantable.addEnchantment(enchantment);
  }
  for (const key of [AUGMENT, TOKEN]) output.setDynamicProperty(key, input.getDynamicProperty(key));
  output.setLore(input.getLore());
  return output;
}

// ---------- Awakening Altar ----------
// Pedestals on the sides and vessels on the diagonals. Each vessel holds one element, and a craft takes `essences` from each of the four.
const ELEMENTS = ["air", "earth", "water", "fire"].map((e) => `__NS__:${e}_essence`);
const AWAKENING_RECIPES = __AWAKENING_RECIPES__; // [{ input, ingredients, essences, output }]
const itemName = (id) => id.split(":")[1].replace(/(^|_)(\w)/g, (_, sep, c) => (sep ? " " : "") + c.toUpperCase());

function findAwakening(altar, input) {
  const around = pedestalsOf(altar);
  const pedestals = around.slice(0, 4), vessels = around.slice(4);
  const missing = pedestals.filter((b) => b?.typeId !== AWAKENING_PEDESTAL).length + vessels.filter((b) => b?.typeId !== VESSEL).length;
  if (missing) return { problem: `${missing} of the 4 pedestals and 4 vessels are missing or in the wrong place. Pedestals go on the sides, vessels on the diagonals.` };
  const recipe = AWAKENING_RECIPES.find((r) => r.input === input.typeId && matchRecipe(r, pedestals.map(standItem)));
  if (!recipe) return { problem: "These items don't make anything." };
  const amounts = vessels.map(standItem);
  const short = ELEMENTS.filter((e) => !amounts.some((s) => s?.typeId === e && s.amount >= recipe.essences));
  if (short.length) return { problem: `The vessels need ${recipe.essences} each of ${short.map(itemName).join(", ")}.` };
  return { recipe, pedestals, vessels };
}

// A vessel takes as much of one element as fits, and gives it all back to an empty hand.
function useVessel(vessel, player, hand) {
  const held = standItem(vessel);
  const say = (text) => player.onScreenDisplay.setActionBar(text);
  if (!hand) {
    if (!held) return;
    const left = player.getComponent("minecraft:inventory")?.container.addItem(held);
    if (left) vessel.dimension.spawnItem(left, vessel.center());
    setStandItem(vessel);
    return;
  }
  if (!ELEMENTS.includes(hand.typeId)) return say("Only Air, Earth, Water or Fire Essence go in a vessel.");
  if (held && held.typeId !== hand.typeId) return say(`This vessel holds ${itemName(held.typeId)}. Take it out with an empty hand first.`);
  const moved = Math.min(VESSEL_CAPACITY - (held?.amount ?? 0), hand.amount);
  if (moved <= 0) return say(`This vessel is full: ${VESSEL_CAPACITY} ${itemName(hand.typeId)}.`);
  const stack = hand.clone();
  stack.amount = (held?.amount ?? 0) + moved;
  setStandItem(vessel, stack);
  useOne(player, moved);
  say(`${itemName(stack.typeId)} ${stack.amount}/${VESSEL_CAPACITY}`);
}

function findRecipe(altar) {
  const input = standItem(altar);
  if (!input) return { problem: "Put something on the altar first." };
  if (altar.typeId === AWAKENING_ALTAR) return findAwakening(altar, input);
  const pedestals = pedestalsOf(altar);
  const missing = pedestals.filter((b) => b?.typeId !== PEDESTAL).length;
  if (missing) return { problem: `${missing} of the 8 pedestals are missing or in the wrong place.` };
  const items = pedestals.map(standItem);
  const recipe = ALTAR_RECIPES.find((r) => r.input === input.typeId && matchRecipe(r, items));
  if (recipe) return { recipe, pedestals };
  const enchant = ENCHANT_RECIPES.find((r) => matchRecipe(r, items));
  if (!enchant) return { problem: "These items don't make anything." };
  return enchanted(input, enchant.enchant) ? { recipe: enchant, pedestals } : { problem: "This can't take that enchantment, or it's already at the highest level." };
}

function startInfusion(altar, player) {
  const key = locationKey(altar.location, altar.dimension);
  if (infusing.has(key)) return;
  const { recipe, problem } = findRecipe(altar);
  if (!recipe) {
    player.onScreenDisplay.setActionBar(problem);
    return;
  }
  infusing.set(key, { dimension: altar.dimension, location: altar.location, type: altar.typeId, ticks: 0, recipe });
  altar.dimension.playSound("block.enchanting_table.use", altar.center());
}

function finishInfusion(altar, recipe, { pedestals, vessels = [] }) {
  const input = standItem(altar);
  const output = recipe.enchant ? enchanted(input, recipe.enchant) : recipe.upgrade ? upgraded(input, recipe.output) : new ItemStack(recipe.output);
  if (!output) return;
  for (const pedestal of pedestals) {
    const item = standItem(pedestal);
    // A soul jar goes back on its pedestal, empty.
    if (item?.typeId === JAR) setStandItem(pedestal, new ItemStack(JAR));
    else setStandItem(pedestal);
    pedestal.dimension.spawnParticle("minecraft:basic_smoke_particle", pedestal.center());
  }
  for (const vessel of vessels) {
    const stack = standItem(vessel);
    if (stack.amount > recipe.essences) {
      stack.amount -= recipe.essences;
      setStandItem(vessel, stack);
    } else setStandItem(vessel);
    vessel.dimension.spawnParticle("minecraft:basic_smoke_particle", vessel.center());
  }
  setStandItem(altar, output);
  altar.dimension.spawnParticle("minecraft:crop_growth_emitter", altar.center());
  altar.dimension.playSound("random.levelup", altar.center());
}

const INFUSION_STEP = 5;
system.runInterval(() => {
  for (const [key, job] of infusing) {
    try {
      const altar = job.dimension.getBlock(job.location);
      const found = altar?.typeId === job.type ? findRecipe(altar) : {};
      if (found.recipe !== job.recipe) {
        infusing.delete(key); // something was taken away, so the craft stops
        continue;
      }
      job.ticks += INFUSION_STEP;
      for (const pedestal of [...found.pedestals, ...(found.vessels ?? [])]) job.dimension.spawnParticle("minecraft:villager_happy", { ...pedestal.center(), y: pedestal.location.y + 1.2 });
      if (job.ticks >= ALTAR_TICKS) {
        infusing.delete(key);
        finishInfusion(altar, job.recipe, found);
      }
    } catch {
      infusing.delete(key); // the chunk unloaded
    }
  }
}, INFUSION_STEP);

// ---------- Souls ----------
const JAR = "__NS__:soul_jar";
const SOUL_TYPE = "__NS__:soul_type";
const SOUL_COUNT = "__NS__:soul_count";
const SOULS = __SOULS__;
const SOUL_OF_MOB = Object.fromEntries(Object.entries(SOULS).flatMap(([soul, { mobs }]) => mobs.map((mob) => [mob, soul])));
const DAGGERS = { "__NS__:anima_dagger": null, "__NS__:passive_anima_dagger": true, "__NS__:hostile_anima_dagger": false };
const soulTitle = (soul) => soul.replace(/(^|_)(\w)/g, (_, sep, c) => (sep ? " " : "") + c.toUpperCase());

// Adds up to `amount` souls to a jar stack and returns how many went in.
function fillJar(stack, soul, amount) {
  const need = SOULS[soul].need;
  const count = stack.getDynamicProperty(SOUL_COUNT) ?? 0;
  const added = Math.min(need - count, amount);
  if (added <= 0) return 0;
  stack.setDynamicProperty(SOUL_TYPE, soul);
  stack.setDynamicProperty(SOUL_COUNT, count + added);
  stack.setLore([`${soulTitle(soul)} Souls: ${+(count + added).toFixed(1)} / ${need}`]);
  return added;
}

// The game doesn't redraw a slot when only an item's data and lore change, so the jar leaves its slot for a tick to force it.
// ponytail: a jar is lost if its owner disconnects during that one tick; store it on the player first if that ever bites.
function refreshSlot(player, container, slot) {
  system.run(() => {
    if (!player.isValid) return;
    const stack = container.getItem(slot);
    if (stack?.typeId !== JAR) return;
    container.setItem(slot);
    system.run(() => {
      if (!player.isValid) return;
      if (container.getItem(slot)) {
        const left = container.addItem(stack);
        if (left) player.dimension.spawnItem(left, player.location);
      } else {
        container.setItem(slot, stack);
      }
    });
  });
}

// Pours souls into the player's jars, starting with ones that already hold this mob type, as far as they'll go.
function addSouls(player, soul, amount) {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) return;
  const slots = [];
  for (let i = 0; i < container.size; i++) {
    const stack = container.getItem(i);
    if (stack?.typeId !== JAR) continue;
    const type = stack.getDynamicProperty(SOUL_TYPE);
    if (type === soul) slots.unshift(i);
    else if (type === undefined) slots.push(i);
  }
  for (const i of slots) {
    if (amount <= 0) return;
    const stack = container.getItem(i);
    const added = fillJar(stack, soul, amount);
    if (added <= 0) continue;
    amount -= added;
    container.setItem(i, stack);
    refreshSlot(player, container, i);
  }
}

world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
  const player = damageSource.damagingEntity;
  if (player?.typeId !== "minecraft:player") return;
  const dagger = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.typeId;
  if (!dagger || !(dagger in DAGGERS)) return;
  // ponytail: wears by one per kill, since scripts can't see each hit; add entityHurt if daggers last too long.
  wear(player, 1);
  const soul = SOUL_OF_MOB[deadEntity.typeId];
  if (!soul) return;
  const attuned = DAGGERS[dagger];
  addSouls(player, soul, attuned !== null && attuned === SOULS[soul].passive ? ATTUNED_SOULS : 1);
});

// ---------- Harvester ----------
// Its items live in a hidden entity inside the block, which opens like a chest (the way Deepcore's machine screens do).
// The entity only has a real hitbox while someone looks at the block with an empty hand, so any tool or a sneak mines the block.
// ponytail: /kill @e deletes what's stored; keep items in the block's saved state, as Deepcore does, if that ever bites.
const HARVESTER = "__NS__:harvester";
const HARVESTER_SCREEN = "__NS__:harvester_screen";
const MACHINE_UPGRADES = __MACHINE_UPGRADES__; // upgrade item -> { name, time, fuel, tank, range }
const FUEL_SLOT = 0;
const UPGRADE_SLOT = 1;
const FIRST_OUTPUT_SLOT = 2;
const OUTPUT_END = 23; // slots from here on aren't drawn by the screen, and hold its readouts
const FUEL_GAUGE_SLOT = 23;
const STATUS_SLOT = 24;
const FUEL_GAUGE_LEVELS = 14;
const SCREEN_ITEM = "__NS__:ui_";
const FUEL = "__NS__:fuel";
const SCAN = "__NS__:scan";
const FACING = "minecraft:cardinal_direction";
const DIRECTIONS = { north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, east: { x: 1, z: 0 }, west: { x: -1, z: 0 } };
const LOOK_DISTANCE = 6;
const progress = new Map(); // screen entity id -> ticks towards the next operation
const screens = new Map(); // block key -> screen entity, so each machine doesn't search for its own every tick
const openScreens = new Map(); // screen entity id -> screen entity with its hitbox on

const screenKey = ({ dimension, location: { x, y, z } }) => `${dimension.id} ${x} ${y} ${z}`;

function screenOf(block) {
  const key = screenKey(block);
  const known = screens.get(key);
  if (known?.isValid) return known;
  const { x, y, z } = block.location;
  const screen = block.dimension.getEntities({ type: HARVESTER_SCREEN, location: { x: x + 0.5, y, z: z + 0.5 }, maxDistance: 0.5 })[0];
  if (screen) screens.set(key, screen);
  return screen;
}

function machineScreen(block, title) {
  const screen = screenOf(block) ?? block.dimension.spawnEntity(HARVESTER_SCREEN, { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 });
  if (screen.nameTag !== title) screen.nameTag = title; // includes machines from before the screen had a layout
  return screen;
}

function harvesterSettings(container) {
  const upgrade = MACHINE_UPGRADES[container.getItem(UPGRADE_SLOT)?.typeId];
  const range = HARVESTER_BALANCE.range + (upgrade?.range ?? 0);
  return {
    name: upgrade?.name ?? "No upgrade",
    range,
    ticks: HARVESTER_BALANCE.operationTicks * (upgrade?.time ?? 1),
    fuel: HARVESTER_BALANCE.fuelPerHarvest * (upgrade?.fuel ?? 1),
    tank: HARVESTER_BALANCE.tank * (upgrade?.tank ?? 1),
  };
}

const burnTicks = (stack) => HARVESTER_BALANCE.fuels[stack.typeId] ?? (stack.hasTag("minecraft:logs") || stack.hasTag("minecraft:planks") ? HARVESTER_BALANCE.woodBurnTicks : 0);

// ponytail: a whole item goes in once the tank has room, so the tank can overfill; MA burns it in slowly, and nothing is lost either way.
function refuel(screen, container, tank) {
  const stack = container.getItem(FUEL_SLOT);
  const fuel = screen.getDynamicProperty(FUEL) ?? 0;
  if (!stack || fuel >= tank) return;
  const ticks = burnTicks(stack);
  if (!ticks) return;
  screen.setDynamicProperty(FUEL, fuel + ticks * HARVESTER_BALANCE.fuelPerBurnTick);
  if (stack.typeId === "minecraft:lava_bucket") {
    container.setItem(FUEL_SLOT, new ItemStack("minecraft:bucket"));
  } else if (stack.amount > 1) {
    stack.amount -= 1;
    container.setItem(FUEL_SLOT, stack);
  } else {
    container.setItem(FUEL_SLOT);
  }
}

// A chest, barrel or hopper on top keeps the fuel slot stocked, which lets hoppers and pipes fuel the machine. Empty lava buckets go back up.
function fuelFromAbove(block, container, isInput) {
  const { x, y, z } = block.location;
  const above = block.dimension.getBlock({ x, y: y + 1, z })?.getComponent("minecraft:inventory")?.container;
  if (!above) return;
  const current = container.getItem(FUEL_SLOT);
  if (current?.typeId === "minecraft:bucket") container.setItem(FUEL_SLOT, above.addItem(current));
  if (container.getItem(FUEL_SLOT)) return;
  for (let i = 0; i < above.size; i++) {
    const item = above.getItem(i);
    if (!item || !burnTicks(item) || isInput?.(item)) continue;
    container.setItem(FUEL_SLOT, item);
    above.setItem(i);
    return;
  }
}

// Puts a stack in the output slots and returns how many didn't fit. addItem would also fill the fuel and upgrade slots.
function storeOutput(container, stack, end = OUTPUT_END) {
  let left = stack.amount;
  for (let i = FIRST_OUTPUT_SLOT; i < end && left; i++) {
    const item = container.getItem(i);
    if (!item?.isStackableWith(stack) || item.amount >= item.maxAmount) continue;
    const moved = Math.min(left, item.maxAmount - item.amount);
    item.amount += moved;
    container.setItem(i, item);
    left -= moved;
  }
  for (let i = FIRST_OUTPUT_SLOT; i < end && left; i++) {
    if (container.getItem(i)) continue;
    const item = stack.clone();
    item.amount = left;
    container.setItem(i, item);
    left = 0;
  }
  return left;
}

// A harvest's drops, including the bonus rolls, all exist two ticks later.
function collectDrops(dimension, { x, y, z }, screen) {
  system.runTimeout(() => {
    if (!screen.isValid) return;
    const container = screen.getComponent("minecraft:inventory").container;
    for (const entity of dimension.getEntities({ location: { x: x + 0.5, y: y + 0.5, z: z + 0.5 }, maxDistance: 1.5, type: "minecraft:item" })) {
      const stack = entity.getComponent("minecraft:item")?.itemStack;
      if (!stack) continue;
      const left = storeOutput(container, stack);
      if (left === stack.amount) continue; // full, so the rest stays on the ground
      const { location } = entity;
      entity.remove();
      if (left) drop(dimension, stack.typeId, location, left);
    }
  }, 2);
}

// A chest or barrel touching the machine's back takes one output stack per tick, which lets hoppers and pipes reach the harvest.
function emptyIntoChest(block, container, facing) {
  const { x, y, z } = block.location;
  const chest = block.dimension.getBlock({ x: x - facing.x, y, z: z - facing.z })?.getComponent("minecraft:inventory")?.container;
  if (!chest) return;
  for (let i = FIRST_OUTPUT_SLOT; i < OUTPUT_END; i++) {
    const item = container.getItem(i);
    if (!item) continue;
    container.setItem(i, chest.addItem(item));
    return;
  }
}

// One block per operation, walking the square in front of the machine at its own height. Returns the fuel it used.
function harvesterOperation(block, screen, settings, facing) {
  const { range } = settings;
  const side = range * 2 + 1;
  const scan = (screen.getDynamicProperty(SCAN) ?? 0) % (side * side);
  screen.setDynamicProperty(SCAN, scan + 1);
  const { x, y, z } = block.location;
  const location = {
    x: x + facing.x * (range + 1) + (scan % side) - range,
    y,
    z: z + facing.z * (range + 1) + Math.floor(scan / side) - range,
  };
  const crop = block.dimension.getBlock(location);
  if (!crop || !isCrop(crop.typeId)) return 0;
  if (!isRipe(crop.permutation)) return HARVESTER_BALANCE.fuelPerScan;
  harvestAndReplant(block.dimension, location, crop.permutation);
  collectDrops(block.dimension, location, screen);
  return settings.fuel;
}

function harvesterTick(block) {
  const screen = machineScreen(block, HARVESTER_BALANCE.screenTitle);
  const container = screen.getComponent("minecraft:inventory").container;
  const settings = harvesterSettings(container);
  const facing = DIRECTIONS[block.permutation.getState(FACING)];
  refuel(screen, container, settings.tank);
  fuelFromAbove(block, container);
  emptyIntoChest(block, container, facing);
  if (!(block.getRedstonePower?.() > 0)) harvesterWork(block, screen, settings, facing);
  updateReadouts(block, screen, container, settings);
}

function harvesterWork(block, screen, settings, facing) {
  let fuel = screen.getDynamicProperty(FUEL) ?? 0;
  if (fuel < settings.fuel) return;
  let ticks = (progress.get(screen.id) ?? 0) + HARVESTER_BALANCE.tickEvery;
  while (ticks >= settings.ticks && fuel >= settings.fuel) {
    ticks -= settings.ticks;
    fuel -= harvesterOperation(block, screen, settings, facing);
  }
  progress.set(screen.id, ticks);
  screen.setDynamicProperty(FUEL, fuel);
}

const fuelPercent = (fuel, settings) => Math.min(100, Math.floor((fuel / settings.tank) * 100));

// Rewrites a readout only when it changes. Anything else found in the slot, like harvest from before the
// screen had a layout or a shift-clicked stack, goes to the harvest slots, or to the ground if they're full.
function setReadout(screen, container, slot, id, name, outputEnd = OUTPUT_END) {
  const held = container.getItem(slot);
  if (held?.typeId === id && held.nameTag === name) return;
  if (held && !held.typeId.startsWith(SCREEN_ITEM)) {
    const left = storeOutput(container, held, outputEnd);
    if (left) {
      held.amount = left;
      screen.dimension.spawnItem(held, screen.location);
    }
  }
  const readout = new ItemStack(id);
  readout.nameTag = name;
  container.setItem(slot, readout);
}

function updateReadouts(block, screen, container, settings) {
  const fuel = screen.getDynamicProperty(FUEL) ?? 0;
  const side = settings.range * 2 + 1;
  const level = fuel > 0 ? Math.max(1, Math.min(FUEL_GAUGE_LEVELS, Math.floor((fuel / settings.tank) * FUEL_GAUGE_LEVELS))) : 0;
  const state = fuel < settings.fuel ? "§4Out of fuel" : block.getRedstonePower?.() > 0 ? "§6Paused" : "§2Running";
  setReadout(screen, container, FUEL_GAUGE_SLOT, `${SCREEN_ITEM}fuel_${level}`, `§8${fuelPercent(fuel, settings)}%`);
  setReadout(screen, container, STATUS_SLOT, `${SCREEN_ITEM}blank`, `§8${settings.name} · ${side}×${side} · ${(settings.ticks / 20).toFixed(1)}s · ${state}`);
  // Full slots the screen doesn't draw, or a shift-click could lose a stack in them.
  for (let i = STATUS_SLOT + 1; i < container.size; i++) setReadout(screen, container, i, `${SCREEN_ITEM}blank`, "§r");
}

function harvesterStatus(block, screen) {
  const settings = harvesterSettings(screen.getComponent("minecraft:inventory").container);
  const side = settings.range * 2 + 1;
  const fuel = screen.getDynamicProperty(FUEL) ?? 0;
  const state = fuel < settings.fuel ? " · §cOut of fuel§r" : block.getRedstonePower?.() > 0 ? " · Paused" : "";
  return `Harvester · ${settings.name} ${side}×${side} · Fuel ${fuelPercent(fuel, settings)}%${state}`;
}

// ---------- Seed Reprocessor, Soul Extractor and Essence Furnace ----------
// One input and one output, on the Harvester's screen entity, fuel and upgrades. Their slots start where the Harvester's harvest does.
const INPUT_SLOT = 2;
const OUTPUT_SLOT = 3;
const FILLER_START = 4;
const PROGRESS_SLOT = 22;
const PROGRESS_LEVELS = 7;
const REPROCESS = __REPROCESS__; // seed -> essence
const SMELTING = FURNACE_BALANCE.recipes;
const SOUL_ITEMS = EXTRACTOR_BALANCE.items; // item -> [soul, how many it's worth]

// The output slot with `amount` of an item added, or nothing if there's no room.
function added(output, id, amount) {
  if (!output) return new ItemStack(id, amount);
  if (output.typeId !== id || output.amount + amount > output.maxAmount) return undefined;
  const stack = output.clone();
  stack.amount += amount;
  return stack;
}

const PROCESSORS = {
  "__NS__:seed_reprocessor": {
    name: "Seed Reprocessor", balance: REPROCESSOR_BALANCE,
    accepts: (input) => input.typeId in REPROCESS,
    craft: (input, output) => added(output, REPROCESS[input.typeId], REPROCESSOR_BALANCE.essencePerSeed),
  },
  "__NS__:soul_extractor": {
    name: "Soul Extractor", balance: EXTRACTOR_BALANCE, holdsJars: true,
    accepts: (input) => input.typeId in SOUL_ITEMS,
    craft(input, jar) {
      if (jar?.typeId !== JAR) return undefined;
      const [soul, worth] = SOUL_ITEMS[input.typeId];
      if ((jar.getDynamicProperty(SOUL_TYPE) ?? soul) !== soul) return undefined;
      const filled = jar.clone();
      return fillJar(filled, soul, worth) > 0 ? filled : undefined;
    },
    // A jar stays until it's full, so it keeps filling. Anything else in the slot can leave.
    finished(stack) {
      if (stack.typeId !== JAR) return true;
      const soul = stack.getDynamicProperty(SOUL_TYPE);
      return soul !== undefined && fullJar(stack, soul);
    },
  },
  "__NS__:essence_furnace": {
    name: "Essence Furnace", balance: FURNACE_BALANCE,
    accepts: (input) => input.typeId in SMELTING || input.hasTag("minecraft:logs"),
    craft: (input, output) => added(output, SMELTING[input.typeId] ?? "minecraft:charcoal", 1),
  },
};
const TABLE = "__NS__:tinkering_table";
const MACHINE_BLOCKS = new Set([HARVESTER, TABLE, ...Object.keys(PROCESSORS)]);

function processorSettings(machine, container) {
  const upgrade = MACHINE_UPGRADES[container.getItem(UPGRADE_SLOT)?.typeId];
  const ticks = machine.balance.operationTicks * (upgrade?.time ?? 1);
  return {
    name: upgrade?.name ?? "No upgrade",
    ticks,
    fuel: machine.balance.fuelPerTick * (upgrade?.fuel ?? 1) * ticks,
    tank: HARVESTER_BALANCE.tank * (upgrade?.tank ?? 1),
  };
}

// A shift-click drops items in the first open slot, whatever it is, so each one gets moved to where it belongs.
function sortSlots(machine, container) {
  const move = (from, to) => {
    if (container.getItem(to)) return;
    container.setItem(to, container.getItem(from));
    container.setItem(from);
  };
  for (const slot of [FUEL_SLOT, UPGRADE_SLOT, INPUT_SLOT]) {
    const stack = container.getItem(slot);
    if (!stack) continue;
    if (slot === UPGRADE_SLOT) {
      if (!(stack.typeId in MACHINE_UPGRADES)) move(slot, !machine.accepts(stack) && burnTicks(stack) ? FUEL_SLOT : INPUT_SLOT);
    } else if (stack.typeId in MACHINE_UPGRADES) move(slot, UPGRADE_SLOT);
    else if (machine.holdsJars && stack.typeId === JAR) move(slot, OUTPUT_SLOT);
    else if (slot === FUEL_SLOT && !burnTicks(stack)) move(slot, INPUT_SLOT);
    else if (slot === INPUT_SLOT && !machine.accepts(stack) && burnTicks(stack)) move(slot, FUEL_SLOT);
  }
}

// A chest or barrel on top feeds the input, and one at the back takes the output.
function moveThroughChests(block, machine, container, facing) {
  const { x, y, z } = block.location;
  const above = block.dimension.getBlock({ x, y: y + 1, z })?.getComponent("minecraft:inventory")?.container;
  if (above && !container.getItem(INPUT_SLOT)) {
    for (let i = 0; i < above.size; i++) {
      const item = above.getItem(i);
      if (!item || !machine.accepts(item)) continue;
      container.setItem(INPUT_SLOT, item);
      above.setItem(i);
      break;
    }
  }
  const output = container.getItem(OUTPUT_SLOT);
  const behind = block.dimension.getBlock({ x: x - facing.x, y, z: z - facing.z })?.getComponent("minecraft:inventory")?.container;
  if (output && behind && (machine.finished?.(output) ?? true)) container.setItem(OUTPUT_SLOT, behind.addItem(output));
}

function processorWork(machine, screen, container, settings) {
  let fuel = screen.getDynamicProperty(FUEL) ?? 0;
  let ticks = (progress.get(screen.id) ?? 0) + HARVESTER_BALANCE.tickEvery;
  while (true) {
    const input = container.getItem(INPUT_SLOT);
    const result = input && machine.accepts(input) ? machine.craft(input, container.getItem(OUTPUT_SLOT)) : undefined;
    if (!result || fuel < settings.fuel) {
      ticks = 0;
      break;
    }
    if (ticks < settings.ticks) break;
    ticks -= settings.ticks;
    fuel -= settings.fuel;
    container.setItem(OUTPUT_SLOT, result);
    if (input.amount > 1) {
      input.amount -= 1;
      container.setItem(INPUT_SLOT, input);
    } else {
      container.setItem(INPUT_SLOT);
    }
  }
  progress.set(screen.id, ticks);
  screen.setDynamicProperty(FUEL, fuel);
}

function processorState(block, machine, screen, container, settings) {
  const fuel = screen.getDynamicProperty(FUEL) ?? 0;
  if (fuel < settings.fuel) return "§4Out of fuel";
  if (block.getRedstonePower?.() > 0) return "§6Paused";
  const input = container.getItem(INPUT_SLOT);
  if (!input) return "§8Waiting";
  if (!machine.accepts(input)) return "§4Can't use that";
  return machine.craft(input, container.getItem(OUTPUT_SLOT)) ? "§2Running" : machine.holdsJars ? "§4Needs a matching jar" : "§4Output full";
}

function updateProcessorReadouts(block, machine, screen, container, settings) {
  const fuel = screen.getDynamicProperty(FUEL) ?? 0;
  const level = fuel > 0 ? Math.max(1, Math.min(FUEL_GAUGE_LEVELS, Math.floor((fuel / settings.tank) * FUEL_GAUGE_LEVELS))) : 0;
  const done = Math.min(PROGRESS_LEVELS, Math.floor(((progress.get(screen.id) ?? 0) / settings.ticks) * (PROGRESS_LEVELS + 1)));
  const readout = (slot, id, name) => setReadout(screen, container, slot, id, name, FIRST_OUTPUT_SLOT);
  for (let i = FILLER_START; i < container.size; i++) {
    if (i === PROGRESS_SLOT || i === FUEL_GAUGE_SLOT || i === STATUS_SLOT) continue;
    readout(i, `${SCREEN_ITEM}blank`, "§r");
  }
  readout(PROGRESS_SLOT, `${SCREEN_ITEM}progress_${done}`, "§r");
  readout(FUEL_GAUGE_SLOT, `${SCREEN_ITEM}fuel_${level}`, `§8${fuelPercent(fuel, settings)}%`);
  readout(STATUS_SLOT, `${SCREEN_ITEM}blank`, `§8${settings.name} · ${(settings.ticks / 20).toFixed(2)}s · ${processorState(block, machine, screen, container, settings)}`);
}

function processorTick(block) {
  const machine = PROCESSORS[block.typeId];
  const screen = machineScreen(block, machine.balance.screenTitle);
  const container = screen.getComponent("minecraft:inventory").container;
  const settings = processorSettings(machine, container);
  const facing = DIRECTIONS[block.permutation.getState(FACING)];
  sortSlots(machine, container);
  refuel(screen, container, settings.tank);
  fuelFromAbove(block, container, machine.accepts);
  moveThroughChests(block, machine, container, facing);
  if (!(block.getRedstonePower?.() > 0)) processorWork(machine, screen, container, settings);
  updateProcessorReadouts(block, machine, screen, container, settings);
}

function machineStatus(block, screen) {
  if (block.typeId === TABLE) return `Tinkering Table · ${tableState(screen.getComponent("minecraft:inventory").container)}`;
  const machine = PROCESSORS[block.typeId];
  if (!machine) return harvesterStatus(block, screen);
  const container = screen.getComponent("minecraft:inventory").container;
  const settings = processorSettings(machine, container);
  return `${machine.name} · ${settings.name} · Fuel ${fuelPercent(screen.getDynamicProperty(FUEL) ?? 0, settings)}% · ${processorState(block, machine, screen, container, settings)}`;
}

// Shows a machine's status while it's looked at, and gives its screen a hitbox only for an empty hand.
system.runInterval(() => {
  const looked = new Map(); // screen entity id -> { screen, open }
  for (const player of world.getPlayers()) {
    const block = player.getBlockFromViewDirection({ maxDistance: LOOK_DISTANCE })?.block;
    if (!MACHINE_BLOCKS.has(block?.typeId)) continue;
    const screen = screenOf(block);
    if (!screen) continue;
    player.onScreenDisplay.setActionBar(machineStatus(block, screen));
    const open = !player.isSneaking && !player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
    looked.set(screen.id, { screen, open: open || looked.get(screen.id)?.open });
  }
  for (const { screen, open } of looked.values()) {
    if (open && !openScreens.has(screen.id)) {
      screen.triggerEvent("__NS__:open");
      openScreens.set(screen.id, screen);
    } else if (!open) {
      // Also runs for a screen left open by a restart, which isn't in openScreens.
      screen.triggerEvent("__NS__:close");
      openScreens.delete(screen.id);
    }
  }
  for (const [id, screen] of openScreens) {
    if (looked.has(id)) continue;
    if (screen.isValid) screen.triggerEvent("__NS__:close");
    openScreens.delete(id);
  }
}, 4);

// Breaking a machine by any means leaves its screen behind, so this sweep drops what it held and clears the entity.
system.runInterval(() => {
  for (const name of ["overworld", "nether", "the_end"]) {
    const dimension = world.getDimension(name);
    for (const screen of dimension.getEntities({ type: HARVESTER_SCREEN })) {
      try {
        const { x, y, z } = screen.location;
        const id = dimension.getBlock({ x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) })?.typeId;
        if (id === undefined || MACHINE_BLOCKS.has(id)) continue;
        const container = screen.getComponent("minecraft:inventory").container;
        for (let i = 0; i < container.size; i++) {
          const item = container.getItem(i);
          if (item && !item.typeId.startsWith(SCREEN_ITEM) && !isShownCopy(container, i)) dimension.spawnItem(item, screen.location);
        }
        progress.delete(screen.id);
        screen.remove();
      } catch {
        // unloaded chunk
      }
    }
  }
}, 40);

// ---------- Tinkering Table ----------
// Gear goes in the left slot and an augment in the right one. A fitted augment is saved on the gear, and a copy of it shows in
// the right slot while the gear is in: taking the copy out takes the augment off, and taking the gear out takes it along.
// The gear and the copy share a token, so a copy taken out in the same tick as its gear can be found and removed (see below).
const AUGMENTS = __AUGMENTS__; // augment item -> { name, tier, needs, on, onText, effect?, amplifier?, keep?, clears?, damage?, flight?, noFall? }
const GEAR_PIECES = __GEAR_PIECES__; // our armor and tools -> { tier, piece }
const AUGMENT = "__NS__:augment"; // on gear: the fitted augment's item id
const TOKEN = "__NS__:augment_token"; // on gear, and on the copy of its augment shown in the table
const GEAR_SLOT = 0;
const AUGMENT_SLOT = 1;
const shownTokens = new Map(); // screen entity id -> token of the copy it showed last tick

const isShownCopy = (container, slot) => {
  const token = slot === AUGMENT_SLOT && container.getItem(slot)?.getDynamicProperty(TOKEN);
  return !!token && container.getItem(GEAR_SLOT)?.getDynamicProperty(TOKEN) === token;
};

// Fits an augment to gear, or takes it off with no id, and returns the new token.
function fitAugment(gear, id) {
  const token = id && `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  gear.setDynamicProperty(AUGMENT, id);
  gear.setDynamicProperty(TOKEN, token);
  gear.setLore(id ? [`§r§7Augment: ${AUGMENTS[id].name}`] : []);
  return token;
}

// Why an augment won't go on the gear, or nothing if it will.
function fitProblem(gear, augment) {
  const piece = GEAR_PIECES[gear.typeId];
  const a = AUGMENTS[augment.typeId];
  if (!piece) return "This gear can't take augments";
  if (!a) return "That isn't an augment";
  if (!a.on.includes(piece.piece)) return `${a.name} only fits ${a.onText}`;
  if (piece.tier < a.tier) return `${a.name} needs ${a.needs} gear or higher`;
  return undefined;
}

function tableState(container) {
  const gear = container.getItem(GEAR_SLOT);
  const augment = container.getItem(AUGMENT_SLOT);
  const fitted = gear?.getDynamicProperty(AUGMENT);
  if (!gear) return "Put armor or a sword on the left";
  if (fitted) return `§2Fitted: ${AUGMENTS[fitted]?.name ?? fitted}`;
  if (!augment) return GEAR_PIECES[gear.typeId] ? "Put an augment on the right" : "§4This gear can't take augments";
  return `§4${fitProblem(gear, augment)}`;
}

function tableTick(block) {
  const screen = machineScreen(block, TABLE_BALANCE.screenTitle);
  const container = screen.getComponent("minecraft:inventory").container;
  // A shift-click fills the first open slot, so an augment can land on the left.
  const left = container.getItem(GEAR_SLOT);
  const right = container.getItem(AUGMENT_SLOT);
  if (AUGMENTS[left?.typeId] && (!right || right.typeId in GEAR_PIECES)) {
    container.setItem(GEAR_SLOT, right);
    container.setItem(AUGMENT_SLOT, left);
  }
  const gear = container.getItem(GEAR_SLOT);
  let augment = container.getItem(AUGMENT_SLOT);
  const last = shownTokens.get(screen.id);
  const token = gear?.getDynamicProperty(TOKEN);
  shownTokens.delete(screen.id);
  if (last && augment?.getDynamicProperty(TOKEN) === last && token !== last) {
    container.setItem(AUGMENT_SLOT); // its gear was taken out, and the augment went with it
    augment = undefined;
  }
  if (token) {
    if (augment?.getDynamicProperty(TOKEN) === token) {
      shownTokens.set(screen.id, token);
    } else if (last === token) {
      fitAugment(gear); // the copy was taken out, or swapped for another augment
      container.setItem(GEAR_SLOT, gear);
    } else if (!augment) {
      const copy = new ItemStack(gear.getDynamicProperty(AUGMENT));
      copy.setDynamicProperty(TOKEN, token);
      container.setItem(AUGMENT_SLOT, copy);
      shownTokens.set(screen.id, token);
    }
  }
  if (gear && !gear.getDynamicProperty(TOKEN) && augment && !fitProblem(gear, augment)) {
    const fitted = fitAugment(gear, augment.typeId);
    container.setItem(GEAR_SLOT, gear);
    augment.setDynamicProperty(TOKEN, fitted);
    container.setItem(AUGMENT_SLOT, augment);
    shownTokens.set(screen.id, fitted);
  }
  for (let i = AUGMENT_SLOT + 1; i < container.size; i++) if (i !== STATUS_SLOT) setReadout(screen, container, i, `${SCREEN_ITEM}blank`, "§r", FIRST_OUTPUT_SLOT);
  setReadout(screen, container, STATUS_SLOT, `${SCREEN_ITEM}blank`, `§8${tableState(container)}`, FIRST_OUTPUT_SLOT);
}

// ---------- Augments ----------
const WORN = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet];
const EFFECT_TICKS = 60; // renewed every second, so an effect ends soon after its gear comes off
const NIGHT_VISION_TICKS = 400; // Night Vision flickers in its last 10 seconds
const ABSORPTION_TICKS = 9600; // MA's, and like MA it's only renewed once it runs out
const HEALTH_BOOST = "__NS__:health_boost"; // on a player: the Health Boost level this script gave them, so it can be taken away
const LIFT = 4; // Flight climbs with Levitation V
const moving = new Map(); // player id -> { clears, flight, noFall }, for the checks that run every tick

// A copy that left the table with its gear (both taken out within one tick) is removed once its player holds both.
function removeLooseCopies(player) {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) return;
  const equip = player.getComponent("minecraft:equippable");
  const tokens = new Set(WORN.map((slot) => equip?.getEquipment(slot)?.getDynamicProperty(TOKEN)));
  const copies = [];
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    const token = item?.getDynamicProperty(TOKEN);
    if (!token) continue;
    if (item.typeId in AUGMENTS) copies.push([i, token]);
    else tokens.add(token);
  }
  for (const [i, token] of copies) if (tokens.has(token)) container.setItem(i);
}

function applyAugments(player) {
  const equip = player.getComponent("minecraft:equippable");
  const effects = {};
  const move = { clears: new Set() };
  for (const slot of WORN) {
    const a = AUGMENTS[equip?.getEquipment(slot)?.getDynamicProperty(AUGMENT)];
    if (!a) continue;
    if (a.effect) effects[a.effect] = Math.max(effects[a.effect] ?? 0, a.amplifier);
    for (const effect of a.clears ?? []) move.clears.add(effect);
    move.flight ||= a.flight;
    move.noFall ||= a.noFall;
  }
  if (move.clears.size || move.flight || move.noFall) moving.set(player.id, move);
  else moving.delete(player.id);

  // Health Boost lasts while it's worn and goes when it isn't, and is never topped up, as that can knock health down.
  const boost = effects.health_boost;
  delete effects.health_boost;
  const given = player.getDynamicProperty(HEALTH_BOOST);
  if (given !== undefined && given !== boost) {
    player.removeEffect("health_boost");
    player.setDynamicProperty(HEALTH_BOOST);
  }
  if (boost !== undefined && !player.getEffect("health_boost")) {
    player.addEffect("health_boost", 20000000, { amplifier: boost, showParticles: false });
    player.setDynamicProperty(HEALTH_BOOST, boost);
  }
  for (const [effect, amplifier] of Object.entries(effects)) {
    if (effect === "absorption") {
      if (!player.getEffect(effect)) player.addEffect(effect, ABSORPTION_TICKS, { amplifier, showParticles: false });
      continue;
    }
    player.addEffect(effect, effect === "night_vision" ? NIGHT_VISION_TICKS : EFFECT_TICKS, { amplifier, showParticles: false });
  }
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    try {
      applyAugments(player);
      removeLooseCopies(player);
    } catch {
      // left the game
    }
  }
}, 20);

function jumpHeld(player) {
  try {
    return player.inputInfo.getButtonState("Jump") === "Pressed";
  } catch {
    return !!player.isJumping;
  }
}

// Bedrock has no way for an add-on to let a player fly, so Flight is made of Levitation and Slow Falling, as Deepcore's jetpack is.
// Holding jump climbs. Letting go hovers, by catching each start of a fall with a moment of Levitation. Sneaking sinks slowly.
function fly(player) {
  const mode = player.getGameMode();
  if (mode === GameMode.Creative || mode === GameMode.Spectator) return;
  const quiet = { showParticles: false };
  if (jumpHeld(player) && !player.isSneaking) {
    player.addEffect("levitation", 3, { amplifier: LIFT, ...quiet });
    return;
  }
  if (player.getEffect("levitation")?.amplifier === LIFT) player.removeEffect("levitation");
  if (player.isOnGround) return;
  if (!player.isSneaking && player.getVelocity().y < -0.02) player.addEffect("levitation", 2, { amplifier: 0, ...quiet });
  else player.addEffect("slow_falling", 6, { amplifier: 0, ...quiet });
}

// No Fall Damage: Slow Falling, but only once a fall gets going, so jumps don't float.
function breakFall(player) {
  if (!player.isOnGround && player.getVelocity().y < -0.4) player.addEffect("slow_falling", 10, { amplifier: 0, showParticles: false });
}

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const move = moving.get(player.id);
    if (!move) continue;
    try {
      for (const effect of move.clears) if (player.getEffect(effect)) player.removeEffect(effect);
      if (move.flight) fly(player);
      if (move.noFall) breakFall(player);
    } catch {
      // left the game
    }
  }
}, 1);

// Strength adds MA's flat damage to a sword's hits on mobs. It comes straight off the mob's health, because a second hit this soon
// would be cut down by its hurt cooldown. Only a killing blow is dealt as damage, so the kill still counts as the player's.
// ponytail: mobs only, as taking health directly would skip a player's armor; add a PvP path if players ask for it.
world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
  const player = damageSource.damagingEntity;
  if (player?.typeId !== "minecraft:player" || damageSource.cause !== "entityAttack" || hurtEntity.typeId === "minecraft:player") return;
  const bonus = AUGMENTS[player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.getDynamicProperty(AUGMENT)]?.damage;
  const health = bonus && hurtEntity.isValid && hurtEntity.getComponent("minecraft:health");
  if (!health || health.currentValue <= 0) return;
  if (health.currentValue > bonus) health.setCurrentValue(health.currentValue - bonus);
  else hurtEntity.applyDamage(1000, { cause: "magic", damagingEntity: player });
});

// Area augments, from MA. Mining breaks a square on the face hit, unless sneaking. Attack hits the mobs around the target.
// Tilling (with the hoes above) and Pathing work on a square while sneaking. Every extra block or hit wears the tool by 1.
function heldArea(player, kind) {
  const a = AUGMENTS[player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.getDynamicProperty(AUGMENT)];
  return a?.area === kind ? a.reach : 0;
}

// The square around a block, flat across the axis given, without the block itself.
function* square({ x, y, z }, axis, reach) {
  for (let i = -reach; i <= reach; i++)
    for (let j = -reach; j <= reach; j++) {
      if (!i && !j) continue;
      yield axis === "y" ? { x: x + i, y, z: z + j } : axis === "x" ? { x, y: y + i, z: z + j } : { x: x + i, y: y + j, z };
    }
}

// Turns a block, and the flat square around it, into another block where `can` allows. Returns how many changed.
function reshape(dimension, center, can, into, reach) {
  let changed = 0;
  for (const location of [center, ...square(center, "y", reach)]) {
    const block = dimension.getBlock(location);
    if (!can(block)) continue;
    block.setType(into);
    changed++;
  }
  return changed;
}

// Mining only takes blocks the tool is made for, and leaves containers, machines and unbreakable blocks alone.
// `loot ... mainhand` uses the held tool, so Fortune and Silk Touch apply.
// ponytail: no experience from area-mined ores, and no hardness check (MA skips blocks much harder than the one hit); add if missed.
const DIGS = { pickaxe: "minecraft:is_pickaxe_item_destructible", axe: "minecraft:is_axe_item_destructible", shovel: "minecraft:is_shovel_item_destructible" };
const NO_AREA_MINING = new Set([
  "minecraft:bedrock", "minecraft:barrier", "minecraft:end_portal_frame", "minecraft:reinforced_deepslate",
  HARVESTER, ALTAR, PEDESTAL, "__NS__:tinkering_table", "__NS__:seed_reprocessor", "__NS__:soul_extractor", "__NS__:essence_furnace",
]);
world.afterEvents.playerBreakBlock.subscribe(({ block, brokenBlockPermutation: broken, itemStackBeforeBreak: tool, player, dimension }) => {
  const a = AUGMENTS[tool?.getDynamicProperty(AUGMENT)];
  const tag = DIGS[GEAR_PIECES[tool?.typeId]?.piece];
  if (a?.area !== "mine" || !tag || player.isSneaking || !broken.hasTag(tag)) return;
  // The face hit is taken from where the player looks: mostly down or up mines flat, otherwise a wall.
  const view = player.getViewDirection();
  const [ax, ay, az] = [Math.abs(view.x), Math.abs(view.y), Math.abs(view.z)];
  const axis = ay >= ax && ay >= az ? "y" : ax >= az ? "x" : "z";
  const creative = player.getGameMode() === GameMode.Creative;
  let mined = 0;
  for (const location of square(block.location, axis, a.reach)) {
    const target = dimension.getBlock(location);
    if (!target || NO_AREA_MINING.has(target.typeId) || !target.hasTag(tag) || target.getComponent("minecraft:inventory")) continue;
    const { x, y, z } = location;
    if (!creative) player.runCommand(`loot spawn ${x} ${y} ${z} mine ${x} ${y} ${z} mainhand`);
    target.setType("minecraft:air");
    mined++;
  }
  wearHeld(player, mined);
});

// Attack's extra hits are magic damage from the player, so they still count as player kills but don't set off this or Strength again.
world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
  const player = damageSource.damagingEntity;
  if (player?.typeId !== "minecraft:player" || damageSource.cause !== "entityAttack" || !hurtEntity.isValid) return;
  const reach = heldArea(player, "attack");
  if (!reach) return;
  let hit = 0;
  const near = hurtEntity.dimension.getEntities({ location: hurtEntity.location, maxDistance: reach * 1.5 + 0.5, excludeFamilies: ["player", "inanimate"], excludeTypes: ["minecraft:item", "minecraft:xp_orb"] });
  for (const mob of near) {
    if (mob.id === hurtEntity.id || !mob.getComponent("minecraft:health") || mob.getComponent("minecraft:is_tamed")) continue;
    if (mob.applyDamage(5 + 5 * reach, { cause: "magic", damagingEntity: player })) hit++;
  }
  if (!hit) return;
  player.dimension.playSound("game.player.attack.strong", player.location);
  wearHeld(player, hit);
});

const PATHABLE = new Set(["minecraft:grass_block", "minecraft:dirt", "minecraft:coarse_dirt", "minecraft:podzol", "minecraft:mycelium", "minecraft:dirt_with_roots"]);
const canPath = (block) => PATHABLE.has(block?.typeId) && !!block.above()?.isAir;
world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, player, isFirstEvent } = event;
  if (!player.isSneaking || !heldArea(player, "path") || !canPath(block)) return;
  event.cancel = true;
  if (!isFirstEvent) return; // holding the button repeats the event
  const { dimension, location } = block;
  system.run(() => {
    if (!player.isValid) return;
    const made = reshape(dimension, location, canPath, "minecraft:grass_path", heldArea(player, "path"));
    if (!made) return;
    dimension.playSound("use.grass", location);
    wearHeld(player, made);
  });
});

// Deepcore's Geo Scanner only counts ores it's told about (github.com/baseballr/Deepcore/issues/8).
// It keeps them in memory, so they go again on every load. Nothing happens if Deepcore isn't installed or isn't listening.
const DEEPCORE_ORES = __DEEPCORE_ORES__;
system.runTimeout(() => {
  const overworld = world.getDimension("overworld");
  for (const o of DEEPCORE_ORES) overworld.runCommand(`scriptevent dq:add_ore ${JSON.stringify(o)}`);
}, 20);

// Deepcore's crates show a ? for our items until we say which picture each one is (ee:dq_icons, built in tools/build.mjs).
// It keeps them in memory, so they go again on every load. Nothing happens if Deepcore isn't installed.
const DEEPCORE_ICONS = __DEEPCORE_ICONS__;
system.runTimeout(() => {
  const overworld = world.getDimension("overworld");
  for (const i of DEEPCORE_ICONS) overworld.runCommand(`scriptevent dq:add_icon ${JSON.stringify(i)}`);
}, 20);

// Deepcore can't read the game's recipes, so its Network Crafter only makes ours if we send them (github.com/baseballr/Deepcore/issues/7).
// It keeps them in memory, so they go again on every load. Nothing happens if Deepcore isn't installed or isn't listening.
const DEEPCORE_RECIPES = __DEEPCORE_RECIPES__;
system.runTimeout(() => {
  const overworld = world.getDimension("overworld");
  for (const r of DEEPCORE_RECIPES) overworld.runCommand(`scriptevent dq:add_recipe ${JSON.stringify(r)}`);
}, 20);

// Readout for /function ee/test_wear: health and the held tool's durability, plus each hit's damage after armor.
system.runInterval(() => {
  for (const player of world.getPlayers({ tags: ["ee_test"] })) {
    const health = player.getComponent("minecraft:health")?.currentValue ?? 0;
    const tool = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
    const d = tool?.getComponent("minecraft:durability");
    const wear = d ? ` | ${tool.typeId.replace(/^\w+:/, "")} ${d.maxDurability - d.damage}/${d.maxDurability}` : "";
    player.onScreenDisplay.setActionBar(`Health ${health.toFixed(1)}${wear}`);
  }
}, 5);
world.afterEvents.entityHurt.subscribe(({ hurtEntity, damage, damageSource }) => {
  if (hurtEntity.typeId === "minecraft:player" && hurtEntity.hasTag("ee_test"))
    hurtEntity.sendMessage(`Took ${damage.toFixed(2)} damage from ${damageSource.cause}`);
});
