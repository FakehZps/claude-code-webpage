const fs = require('fs')
const path = require('path')

const gamesFile = path.join(__dirname, '..', 'content', 'games.json')
const logsDir = path.join(__dirname, '..', 'content', 'logs')
const games = JSON.parse(fs.readFileSync(gamesFile, 'utf-8'))

// Get existing MDX slugs so we don't overwrite them
const existing = new Set(
  fs.readdirSync(logsDir)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''))
)

// Section headings by genre/keyword
function pickHeadings(title, rating) {
  const t = title.toLowerCase()
  if (t.includes('apex') || t.includes('battlefield') || t.includes('call of duty') || t.includes('doom') || t.includes('wolfenstein') || t.includes('titanfall') || t.includes('halo') || t.includes('sniper') || t.includes('gears') || t.includes('bulletstorm') || t.includes('crysis') || t.includes('metal slug'))
    return ['The Setup', 'The Gunplay', 'Final Verdict']
  if (t.includes('assassin') || t.includes('batman') || t.includes('uncharted') || t.includes('spider') || t.includes('ryse') || t.includes('prototype') || t.includes('shadow') || t.includes('sekiro') || t.includes('bloodborne') || t.includes('god of war') || t.includes('tomb raider'))
    return ['The World', 'The Combat', 'Final Verdict']
  if (t.includes('final fantasy') || t.includes('persona') || t.includes('dragon quest') || t.includes('nier') || t.includes('xenoblade') || t.includes('tales') || t.includes('ni no kuni') || t.includes('chrono') || t.includes('trails') || t.includes('yakuza') || t.includes('like a dragon') || t.includes('shin megami'))
    return ['The Story', 'The System', 'Final Verdict']
  if (t.includes('walking dead') || t.includes('wolf among') || t.includes('life is strange') || t.includes('detroit') || t.includes('heavy rain') || t.includes('beyond') || t.includes('game of thrones') || t.includes('batman: season') || t.includes('batman: the enemy') || t.includes('telltale') || t.includes('oxenfree') || t.includes('firewatch') || t.includes('gone home') || t.includes('everybody') || t.includes('what remains') || t.includes('doki doki') || t.includes('danganronpa') || t.includes('zero time') || t.includes('virtue') || t.includes('erica') || t.includes('the quarry') || t.includes('until dawn') || t.includes('the complex') || t.includes('contradiction') || t.includes('road 96') || t.includes('not for broadcast'))
    return ['The Premise', 'The Choices', 'Final Verdict']
  if (t.includes('mario kart') || t.includes('forza') || t.includes('dirt') || t.includes('grid') || t.includes('art of rally') || t.includes('need for speed') || t.includes('wipeout') || t.includes('mini motorways'))
    return ['The Track', 'The Feel', 'Final Verdict']
  if (t.includes('xcom') || t.includes('civilization') || t.includes('endless space') || t.includes('banished') || t.includes('settlers') || t.includes('homeworld') || t.includes('desperados'))
    return ['The Hook', 'The Depth', 'Final Verdict']
  if (t.includes('mario') || t.includes('zelda') || t.includes('bayonetta') || t.includes('little big') || t.includes('captain toad') || t.includes('luigi') || t.includes('bowser') || t.includes('ratchet') || t.includes('lego') || t.includes('tetris') || t.includes('a short hike') || t.includes('sayonara'))
    return ['The Feel', 'The Design', 'Final Verdict']
  if (t.includes('resident evil') || t.includes('horror') || t.includes('darkne') || t.includes('metro') || t.includes('dead light') || t.includes('days gone') || t.includes('last of us') || t.includes('alan wake') || t.includes('blasphemous'))
    return ['The Atmosphere', 'The Fear', 'Final Verdict']
  return ['The Experience', 'The Detail', 'Final Verdict']
}

// Terminal quotes per game (hand-crafted where we have context, else generated)
function terminalQuote(slug, title, excerpt) {
  const t = title.toLowerCase()
  const e = (excerpt || '').toLowerCase()

  if (slug.includes('apex-legends')) return `LEGENDS PROTOCOL: Kill leader detected. Mozambique here.`
  if (t.includes('walking dead')) return `SURVIVAL LOG: Day ${Math.floor(Math.random()*300)+1}. Group morale critical.`
  if (t.includes('assassin')) return `EAGLE VISION: Target synchronised. Memory sequence unlocked.`
  if (t.includes('final fantasy')) return `BATTLE SYSTEM: ATB gauge full. Limit break available.`
  if (t.includes('yakuza') || t.includes('like a dragon') || t.includes('judgment') || t.includes('lost judgment')) return `SUBSTORY UNLOCKED: Someone needs help. Again.`
  if (t.includes('batman')) return `DETECTIVE MODE: Three suspects. One truth.`
  if (t.includes('uncharted')) return `FORTUNE HUNTER LOG: Treasure located. Also someone is shooting at me.`
  if (t.includes('god of war')) return `SPARTAN RAGE: Charging. Atreus, stay close.`
  if (t.includes('zelda') || t.includes('link')) return `NAVI ALERT: Hey! Listen! Dungeon ahead.`
  if (t.includes('persona')) return `SOCIAL LINK RANK UP: Bond strengthened.`
  if (t.includes('xcom')) return `COMMANDER: Soldier lost. The aliens are adapting.`
  if (t.includes('mario kart')) return `RACE TELEMETRY: Blue shell incoming. Brace for impact.`
  if (t.includes('horizon')) return `MACHINE SCAN: Thunderjaw detected. Threat level critical.`
  if (t.includes('witcher')) return `CONTRACT ACCEPTED: Monster sighted. Coin not guaranteed.`
  if (t.includes('bloodborne')) return `INSIGHT GAINED: The nightmare persists. Hunt well, Hunter.`
  if (t.includes('dark souls') || t.includes('sekiro')) return `YOU DIED: Echoes lost. Learn from it.`
  if (t.includes('bioshock')) return `PLASMID ALERT: Would you kindly proceed.`
  if (t.includes('red dead')) return `WANTED LEVEL: Increasing. Honour degraded.`
  if (t.includes('grand theft auto')) return `POLICE DATABASE: Known criminal. Approach with caution.`
  if (t.includes('fallout')) return `VATS ACTIVATED: 94% chance. Fire when ready, Courier.`
  if (t.includes('skyrim') || t.includes('elder scrolls')) return `SHOUT DETECTED: Fus Ro Dah. Enemies scattered.`
  if (t.includes('life is strange')) return `TIMELINE ANOMALY: Rewind engaged. Choose carefully.`
  if (t.includes('oxenfree')) return `STATIC DETECTED: Something is listening on frequency 88.1`
  if (t.includes('deus ex')) return `AUGMENTATION ONLINE: I never asked for this.`
  if (t.includes('cyberpunk')) return `NET ARCHITECTURE: Breach protocol initiated. V is on the case.`
  if (t.includes('death stranding')) return `STRAND SIGNAL: BB stable. Timefall incoming.`
  if (t.includes('control')) return `BUREAU ALERT: Hiss activity detected. Director required.`
  if (t.includes('titanfall')) return `TITAN READY: BT-7274 online. Protocol 3 engaged.`
  if (t.includes('grim fandango')) return `DEPARTMENT OF DEATH: Manny Calavera, travel agent. At your service.`
  if (t.includes('driver') && t.includes('san francisco')) return `SHIFT DETECTED: Jericho located. The chase is on.`
  if (t.includes('far cry')) return `OUTPOST LIBERATED: Area secure. For now.`
  if (t.includes('shadow of mordor') || t.includes('shadow of war')) return `NEMESIS SYSTEM: He remembers you. And he's angrier now.`
  if (t.includes('transistor')) return `TRACE COMPLETE: Function unlocked. Red, time to move.`
  if (t.includes('hotline miami')) return `PHONE MESSAGE: There's a job at the address below. Don't ask questions.`
  if (t.includes('spider-man') || t.includes('spider man')) return `SPIDER-SENSE: Crime detected. Wall-crawling initiated.`
  if (t.includes('last of us')) return `SURVIVOR LOG: Supplies low. Keep moving. Trust no one.`
  if (t.includes('this war of mine')) return `SHELTER STATUS: Food critical. Morale broken.`
  if (t.includes('nier')) return `RESOURCE LOG: Seeking the promised land. Glory to mankind.`
  if (t.includes('doom')) return `RIP AND TEAR: Demon presence at 100%. Slayer status: active.`
  if (t.includes('metal gear')) return `CODEC CALL: Kept you waiting, huh?`
  if (t.includes('shadow of the colossus')) return `DORMIN SPEAKS: Thou art a skilled warrior. The price is steep.`
  if (t.includes('to the moon')) return `MEMORY SEQUENCE: Loading final wish. Have tissues ready.`
  if (t.includes('valiant hearts')) return `FIELD LOG: 1917. Still here. Still fighting.`
  if (t.includes('back to the future')) return `FLUX CAPACITOR: 1.21 gigawatts. Roads? Where we're going we don't need roads.`
  if (t.includes('warhammer') && t.includes('space marine')) return `BATTLE REPORT: Bolter rounds expended: 4,000. Heretics purged: countless.`
  if (t.includes('l.a. noire')) return `CASE FILE: Evidence collected. Suspect nervous. Intuition: lie.`
  if (t.includes('heavy rain')) return `ORIGAMI KILLER: Another victim found. Time is running out.`
  if (t.includes('gravity rush')) return `GRAVITY CALIBRATION: Kat online. The Nevi don't stand a chance.`
  if (t.includes('guacamelee')) return `LUCHADOR STATUS: Mask equipped. Skeleton army defeated.`
  if (t.includes('danganronpa')) return `BLACKENED IDENTIFIED: Class trial complete. Despair reigns.`
  if (t.includes('frozen synapse')) return `SIMULATION: All units locked and loaded. Execute order now.`
  if (t.includes('mario') && !t.includes('kart')) return `STAR POWER: Collected. Bowser won't know what hit him.`
  if (t.includes('saints row')) return `SAINTS HEADQUARTERS: Burt Reynolds just called. He wants his game back.`
  if (t.includes('driver')) return `PURSUIT MODE: Jericho protocol active. City at risk.`
  if (t.includes('chrono trigger')) return `TIME GATE OPENED: Epoch ready. Lavos cannot win.`
  if (t.includes('grim fandango')) return `SCYTHE EQUIPPED: Manny Calavera on the case.`
  if (t.includes('the wolf among us')) return `FABLETOWN CASE FILE: Bigby Wolf investigating. Glamour required.`
  if (t.includes('firewatch')) return `DISPATCH: Delilah, I think I found something. Over.`
  if (t.includes('tetris')) return `LINE CLEARED: Tetrimino sequence optimal. Journey mode active.`
  if (t.includes('dead light')) return `INFECTION RATE: High. Ratman seen again.`
  if (t.includes('pony island')) return `ERROR: Leviathan is experiencing a slight malfunction.`
  if (t.includes('what remains of edith finch')) return `ARCHIVE LOG: Another story told. Another life gone.`
  if (t.includes('inside')) return `EXPERIMENT STATUS: Subject acquired. Facility alert.`
  if (t.includes('tales from the borderlands')) return `ATLAS PROTOCOL: Fiona and Rhys. The vault hunters nobody asked for.`
  if (t.includes('abzû')) return `DIVE LOG: Depth 200m. Bioluminescent entities detected.`
  if (t.includes('the room')) return `PUZZLE LOCK: Mechanism engaged. The truth is inside the box.`
  if (t.includes('octopath')) return `PATH ACTION: Therion recruited. Stealing from the rich.`
  if (t.includes('clair obscur')) return `EXPEDITION 33: Painting complete. Sacrifice accepted.`
  if (t.includes('blue prince')) return `ROOM COUNT: 46. The staircase remains elusive.`
  if (t.includes('indiana jones') || t.includes('indianna jones')) return `ARTIFACT LOCATED: Dr. Jones, we've found the chamber.`
  if (t.includes('blasphemous')) return `MEA CULPA: The True Torment awaits. The Penitent One perseveres.`
  if (t.includes('resident evil')) return `RACCOON CITY ALERT: Mutation detected. Standard protocol insufficient.`
  if (t.includes('sekiro')) return `POSTURE BROKEN: Shinobi execution available. One chance.`
  if (t.includes('cyberpunk')) return `NETRUNNER ALERT: ICE bypassed. Night City is yours.`
  if (t.includes('mini motorways')) return `TRAFFIC SIMULATION: Peak hour approaching. Reroute advised.`
  if (t.includes('diablo')) return `PRIME EVIL DETECTED: Nephalem, proceed to the Rift. Stay a while.`
  if (t.includes('robocop')) return `LAW ENFORCEMENT PROTOCOL: Directive 4 classified. Crime: 0%.`
  if (t.includes('alan wake')) return `MANUSCRIPT PAGE: The darkness is real. Write the ending.`
  if (t.includes('bayonetta')) return `WITCH TIME: Active. Umbra witches do not forgive.`
  if (t.includes('star wars')) return `FORCE SENSITIVITY: Detected. A great disturbance in the Force.`
  if (t.includes('lego')) return `STUD COUNTER: x4 multiplier active. Collect everything.`
  if (t.includes('super mario odyssey')) return `CAPTURE AVAILABLE: Cappy ready. New kingdom detected.`
  if (t.includes('guardians')) return `HUDDLE UP: Drax, Rocket, Groot, Gamora. Plan? Optional.`
  if (t.includes('miles morales') || t.includes('spider-man: miles')) return `WEB-SHOOTER STATUS: Venom blast charged. Miles ready.`
  if (t.includes('cyberpunk')) return `QUICKHACK DEPLOYED: Target neutralised. Reputation increased.`
  if (t.includes('halo')) return `UNSC PRIORITY TRANSMISSION: Chief, the Covenant are closing in.`
  if (t.includes('forza')) return `RACE TELEMETRY: Drivatar detected ahead. Drafting initiated.`
  if (t.includes('dishonored')) return `CHAOS LEVEL: Low. Corvo moves like a ghost.`
  if (t.includes('dragon quest')) return `SLIME ENCOUNTERED: HP 4. Attack with abandon.`
  if (t.includes('fallout')) return `V.A.T.S. ENGAGED: 94% accuracy. Take the shot.`
  if (t.includes('civilization')) return `DIPLOMATIC INCIDENT: Gandhi has nuclear weapons. Again.`
  if (t.includes('shenmue')) return `INVESTIGATION LOG: The sailors. Always the sailors.`
  if (t.includes('mortal kombat')) return `FATALITY DETECTED: Finish him.`
  if (t.includes('injustice')) return `POWER LEVEL: 78%. Hero or villain — choose.`
  if (t.includes('judgment') || t.includes('lost judgment')) return `DETECTIVE MODE: Clue analysed. Suspect cornered.`
  if (t.includes('borderlands')) return `LOOT GENERATED: Legendary drop. The grind continues.`
  if (t.includes('south park')) return `AUTHORITY: Warning. This game contains mature content. A lot of it.`
  if (t.includes('tomb raider')) return `SURVIVAL INSTINCT: Active. Lara Croft: resourceful.`
  if (t.includes('zelda: breath') || t.includes('breath of the wild')) return `SHEIKAH SLATE: Rune activated. The world is yours to explore.`
  if (t.includes('dragon age')) return `WARDEN PROTOCOL: Darkspawn detected. The Blight must end.`
  if (t.includes('prototype')) return `INFECTED ZONE: Mercer consuming biomass. Level rising.`
  if (t.includes('war of the chosen')) return `CHOSEN ALERT: The Warlock approaches. Psionic shields insufficient.`
  if (t.includes('a plague tale')) return `SWARM PROXIMITY: Hugo, stay close. Do not touch the rats.`
  if (t.includes('never alone')) return `SPIRIT WORLD: Nuna and Fox must work together.`
  if (t.includes('shadow of the tomb raider')) return `HUNTER BECOMES HUNTED: Trinity is closing in.`
  if (t.includes('mafia')) return `FAMILY BUSINESS: The city's loyalty can be bought.`
  if (t.includes('days gone')) return `HORDE DETECTED: 500+ Freakers. Deacon, you're outgunned.`
  if (t.includes('death stranding')) return `STRAND PROTOCOL: Connect the knots. BB stable. Moving out.`
  if (t.includes('control')) return `DIRECTOR STATUS: The Board requests your presence.`
  if (t.includes('hellblade')) return `PSYCHOSIS FRACTURE: Voices intensifying. Darkness closing in.`
  if (t.includes('metal gear solid')) return `CODEC CALL: Snake, try to remember what you're fighting for.`
  if (t.includes('the ascent')) return `CONTRACT STATUS: The Ascent Group requires your... participation.`
  if (t.includes('human resource machine')) return `ANNUAL REVIEW: Efficiency at 73%. Management is displeased.`
  if (t.includes('beneath a steel sky')) return `UPLINK SECURED: Foster is back. The Union City Underground lives.`
  if (t.includes('art of rally')) return `STAGE COMPLETE: Bonus time. Road ahead: gravel. Weather: wet.`
  if (t.includes('endless space')) return `ANOMALY DETECTED: Science victory within 40 turns, Admiral.`
  if (t.includes('trails')) return `ORBAL ARTS LEARNED: Jenis Royal Academy awaits, Estelle.`
  if (t.includes('xenoblade')) return `VISION DETECTED: Future threat identified. Shulk, be on guard.`
  if (t.includes('atelier ryza')) return `ALCHEMY POT: Insufficient mana. More synthesis required.`
  if (t.includes('bowser')) return `FURY METER: FULL. Lake Lapcat in danger.`
  if (t.includes('fallout: new vegas')) return `KARMA: Neutral. The Mojave awaits, Courier.`
  if (t.includes('civilization')) return `SCIENCE OUTPUT: +42 per turn. Newton approved.`
  if (t.includes('zelda: link')) return `DREAM GUARDIAN: The Wind Fish sleeps. For now.`
  if (t.includes('danganronpa: trigger') || (t.includes('danganronpa') && t.includes('2'))) return `CLASS TRIAL: Evidence contradicts testimony. Present counter.`
  if (t.includes('god of war: ragnarok') || (t.includes('ragnarok'))) return `FATE LOG: Ragnarok approaches. Atreus, this is necessary.`
  if (t.includes('return to monkey island')) return `ITEM OBTAINED: Rubber chicken with a pulley in the middle.`
  if (t.includes('gris')) return `COLOUR RESTORED: Grief softens. The world blooms again.`
  if (t.includes('trek to yomi')) return `BUSHIDO CODE: Death before dishonour. Hiroki advances.`
  if (t.includes('octopath')) return `PATH CHOSEN: Therion, thief. Road ahead is long.`
  if (t.includes('killer frequency')) return `SIGNAL STRENGTH: 100%. The Whistling Man is listening.`
  if (t.includes('jusant')) return `ALTITUDE: 4,200m. Calliaphone resonating with the tower.`
  if (t.includes('nuclear blaze')) return `FIRE SPREAD: Critical. Hold the line, firefighter.`
  if (t.includes('sayonara')) return `RHYTHM SYNC: 100%. Hearts are wild.`
  if (t.includes('new tales from the borderlands')) return `VAULTLANDERS: Deployed. Anu wants to save the world, apparently.`
  if (t.includes('like a dragon gaiden')) return `ALIAS ACTIVE: Joryu. The dragon stays dead — for now.`
  if (t.includes('opus: echo')) return `SIGNAL ACQUIRED: Jun singing again. The stars align.`
  if (t.includes('road 96')) return `HITCHHIKER DETECTED: Political unrest at 87%. Drive carefully.`
  if (t.includes('not for broadcast')) return `ON AIR IN: 3... 2... 1. Remember: St Bumley runs the truth.`
  if (t.includes('forza motorsport')) return `QUALIFYING: Lap time recorded. Manufacturer loyalty requested.`
  if (t.includes('a plague tale: requiem')) return `REAPER PRESENCE: High. Hugo, we need to keep moving.`
  if (t.includes('dishonored: death')) return `OUTSIDER MARK: Removed. The Void watches regardless.`
  if (t.includes('sins') || t.includes('catherine')) return `NIGHTMARE BLOCK: Level 20. Vincent's conscience weighs heavily.`
  if (t.includes('tekken')) return `IRON FIST TOURNAMENT: Round 1. Mishima bloodline: toxic.`
  if (t.includes('soulcalibur')) return `CURSED SWORD: Soul Edge detected. Nightmare approaches.`
  if (t.includes('mortal kombat 1')) return `NEW ERA: Liu Kang's timeline. But Shao Khan remembers.`
  if (t.includes('bayonetta 3')) return `SINGULARITY DETECTED: Witch arms ready. Viola has a long way to go.`
  if (t.includes('until dawn remake')) return `BUTTERFLY EFFECT: Your choices have consequences. All of them.`
  if (t.includes('diablo iv')) return `LILITH SIGHTING: Daughter of Hatred confirmed. Nephalem, be ready.`
  if (t.includes('assassin') && t.includes('valhalla')) return `VALHALLA: Eivor paddles upstream. England will know the Norse.`
  if (e && e !== 'null') return `OPERATOR LOG: ${excerpt.charAt(0).toUpperCase() + excerpt.slice(1)}.`
  return `SYSTEM LOG: Entry filed. ${title} — mission complete.`
}

function ratingWord(r) {
  if (r >= 9.5) return 'an exceptional'
  if (r >= 9) return 'an excellent'
  if (r >= 8.5) return 'a great'
  if (r >= 8) return 'a solid'
  if (r >= 7.5) return 'a decent'
  if (r >= 7) return 'a reasonable'
  if (r >= 6) return 'a mixed'
  if (r >= 5) return 'a disappointing'
  return 'a poor'
}

function generateBody(game) {
  const { title, platform, rating, excerpt, slug } = game
  const r = rating || 5
  const e = excerpt && excerpt !== 'null' ? excerpt : null
  const [h1, h2, h3] = pickHeadings(title, r)
  const quote = terminalQuote(slug, title, e)
  const rw = ratingWord(r)

  // Platform context
  const platformNote = platform ? ` on ${platform}` : ''

  // Build body paragraphs based on rating tier
  let p1, p2, verdict
  const t = title.toLowerCase()

  if (r >= 9) {
    p1 = `${title} is the kind of game that doesn't let go. Picked it up${platformNote} and found myself completely absorbed — the kind of experience that makes you lose track of time and reminds you why you play games at all.`
    p2 = `Everything here fires on all cylinders. The mechanics are tight, the world rewards exploration, and there's a confidence to the design that keeps pushing you forward. ${e ? `"${e}" captures it well — that's exactly how it feels to play.` : 'Every system supports every other system.'}`
    verdict = `One of the best in its genre. ${title} earns its reputation. Play it.`
  } else if (r >= 8.5) {
    p1 = `${title} lands${platformNote} with enough confidence to leave a real impression. There's a clear vision at work here — the kind of game that knows exactly what it wants to be and executes on it almost flawlessly.`
    p2 = `The highs are consistently high. A few rough edges keep it from perfection, but they're easy to overlook when the core experience is this satisfying. ${e ? `Summed up well by: "${e}".` : 'The polish shows throughout.'}`
    verdict = `Highly recommended. ${title} doesn't waste your time.`
  } else if (r >= 8) {
    p1 = `${title}${platformNote} is a confident, well-made game that delivers on what it promises. Not reinventing anything, but doing its thing with enough craft and care to make the time spent worthwhile.`
    p2 = `There's a lot to like here. The fundamentals are solid and the experience holds together well from start to finish. ${e ? ('The note "' + e + '" says it all, really.') : "It won't blow your mind, but it won't waste your time either."}`
    verdict = `Solid. ${title} is exactly what it needs to be.`
  } else if (r >= 7.5) {
    p1 = `${title}${platformNote} is a decent experience that never quite reaches its potential. There's a good game in here, and it shows through often enough to make the whole thing worthwhile.`
    p2 = `The best moments are genuinely enjoyable. The worst are just... fine. The balance tips positive, but only just. ${e ? `"${e}" — that about covers it.` : 'Worth a playthrough if the genre appeals.'}`
    verdict = `Good but flawed. ${title} is worth your time if you know what you're signing up for.`
  } else if (r >= 7) {
    p1 = `${title}${platformNote} sits comfortably in the "perfectly serviceable" bracket. It works. It's competent. It has moments. None of them will stick with you for long, but you won't regret the time spent.`
    p2 = `The edges are rough and the ambition often outstrips the execution, but there's enough here to see it through. ${e ? `"${e}" is about right as a summary.` : 'Completable and forgettable in equal measure.'}`
    verdict = `Fine. ${title} does its job without distinction.`
  } else if (r >= 6) {
    p1 = `${title}${platformNote} is a frustrating experience — not bad enough to stop, but not good enough to enjoy. The foundations are there, but the execution lets the whole thing down.`
    p2 = `Every good idea seems countered by a bad decision. The pacing drags, the systems feel incomplete, and the moments of genuine fun are too infrequent. ${e ? `"${e}" — that's the kindest thing that can be said.` : 'Play something else first.'}`
    verdict = `Disappointing. ${title} has potential it never fulfils.`
  } else {
    p1 = `${title}${platformNote} is a difficult recommendation. Despite some promising ideas, the experience consistently frustrates more than it entertains. There are better options in almost every direction.`
    p2 = `The core problems are fundamental — not patching, not preference. ${e ? `"${e}" pretty much nails it.` : 'Time that could have been better spent.'} Some things work in isolation, but they can\'t carry the whole.`
    verdict = `Hard to recommend. ${title} is for completionists only.`
  }

  return `## ${h1}

${p1}

> ${quote}

## ${h2}

${p2}

## ${h3}

${verdict}
`
}

function buildFrontmatter(game) {
  const { title, date, completionDate, category, platform, rating, coverImage, excerpt, award } = game
  const safeExcerpt = (excerpt && excerpt !== 'null') ? excerpt : `${title} — filed.`
  const ci = coverImage ? `"${coverImage}"` : 'null'
  const cd = completionDate ? `"${completionDate}"` : 'null'
  const pl = platform ? `"${platform}"` : 'null'
  const awd = award ? `"${award}"` : 'null'
  const rt = rating !== null && rating !== undefined ? rating : 'null'

  return `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
completionDate: ${cd}
category: "review"
platform: ${pl}
rating: ${rt}
coverImage: ${ci}
excerpt: "${safeExcerpt.replace(/"/g, '\\"')}"
award: ${awd}
---
`
}

let written = 0
let skipped = 0

for (const game of games) {
  const { slug } = game
  if (existing.has(slug)) {
    skipped++
    continue
  }
  const content = buildFrontmatter(game) + '\n' + generateBody(game)
  const filePath = path.join(logsDir, `${slug}.mdx`)
  fs.writeFileSync(filePath, content, 'utf-8')
  written++
}

console.log(`Done. Written: ${written}, Skipped (already exist): ${skipped}`)
