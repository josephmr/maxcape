import collectionItems from './config/collection-log-items.json';
import quests from './config/quests.json';

export const SKILLS = [
	'Attack',
	'Hitpoints',
	'Mining',
	'Strength',
	'Agility',
	'Smithing',
	'Defence',
	'Herblore',
	'Fishing',
	'Ranged',
	'Thieving',
	'Cooking',
	'Prayer',
	'Crafting',
	'Firemaking',
	'Magic',
	'Fletching',
	'Woodcutting',
	'Runecraft',
	'Slayer',
	'Farming',
	'Construction',
	'Hunter'
] as const;

export const DIARY_AREAS = [
	'Ardougne',
	'Desert',
	'Falador',
	'Fremennik',
	'Kandarin',
	'Karamja',
	'Kourend & Kebos',
	'Lumbridge & Draynor',
	'Morytania',
	'Varrock',
	'Western Provinces',
	'Wilderness'
] as const;

export const DIARY_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Elite'] as const;

// Boss names mirror the names produced by the RuneLite tracker and the local icon catalogue.
export const BOSSES = [
	'Abyssal Sire',
	'Alchemical Hydra',
	'Amoxliatl',
	'Araxxor',
	'Artio',
	'Barrows',
	'Brutus',
	'Bryophyta',
	'Callisto',
	"Calvar'ion",
	'Cerberus',
	'Chambers of Xeric',
	'Chambers of Xeric: Challenge Mode',
	'Chaos Elemental',
	'Chaos Fanatic',
	'Commander Zilyana',
	'Corporeal Beast',
	'Corrupted Hunllef',
	'Crazy Archaeologist',
	'Crystalline Hunllef',
	'Dagannoth Prime',
	'Dagannoth Rex',
	'Dagannoth Supreme',
	'Deranged Archaeologist',
	'Doom of Mokhaiotl',
	'Duke Sucellus',
	'General Graardor',
	'Giant Mole',
	'Grotesque Guardians',
	'Herbiboar',
	'Hespori',
	'Hueycoatl',
	'Kalphite Queen',
	'King Black Dragon',
	'Kraken',
	"Kree'arra",
	"K'ril Tsutsaroth",
	'Leviathan',
	'Lunar Chests',
	'Mad Angel',
	'Maggot King',
	'Mimic',
	'Nex',
	'Nightmare',
	'Obor chests',
	"Phosani's Nightmare",
	'Phantom Muspah',
	'Royal Titans',
	'Sarachnis',
	'Scorpia',
	'Scurrius',
	'Shellbane Gryphon',
	'Skotizo',
	'Sol Heredit',
	'Spindel',
	'Tempoross',
	'Theatre of Blood',
	'Theatre of Blood: Entry Mode',
	'Theatre of Blood: Hard Mode',
	'Thermonuclear Smoke Devil',
	'Tombs of Amascut',
	'Tombs of Amascut: Entry Mode',
	'Tombs of Amascut: Expert Mode',
	'TzKal-Zuk',
	'TzTok-Jad',
	'Vardorvis',
	'Venenatis',
	"Vet'ion",
	'Vorkath',
	'Whisperer',
	'Wintertodt',
	'Yama',
	'Zalcano',
	'Zulrah'
] as const;

export const QUESTS = quests as string[];
export const COLLECTION_LOG_ITEMS = collectionItems as string[];

export const EVENT_TYPE_OPTIONS = [
	{ value: 'SKILL_LEVEL_UP', label: 'Level up' },
	{ value: 'BOSS_KILL', label: 'Boss kill' },
	{ value: 'COLLECTION_LOG', label: 'Collection log' },
	{ value: 'ACHIEVEMENT_DIARY', label: 'Achievement diary' },
	{ value: 'QUEST_COMPLETED', label: 'Quest completed' }
] as const;

export type ManualEventType = (typeof EVENT_TYPE_OPTIONS)[number]['value'];

export type ManualEventInput =
	| { type: 'SKILL_LEVEL_UP'; timestamp: string; data: { skill: string; level: number } }
	| { type: 'BOSS_KILL'; timestamp: string; data: { bossName: string; totalKc: number } }
	| { type: 'COLLECTION_LOG'; timestamp: string; data: { itemName: string } }
	| {
			type: 'ACHIEVEMENT_DIARY';
			timestamp: string;
			data: { area: string; difficulty: string };
	  }
	| { type: 'QUEST_COMPLETED'; timestamp: string; data: { questName: string } };
