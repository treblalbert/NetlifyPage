import tkinter as tk
from tkinter import ttk, simpledialog, messagebox
import random
import math
from enum import Enum
from typing import Dict, List, Optional
import time
import datetime

class TerrainType(Enum):
    WATER = '~'
    GRASS = '.'
    MOUNTAIN = '^'
    GOLD_MINE = 'G'
    PORT = 'P'
    FOREST = 'T'
    FARM = 'F'
    RUINS = 'R'
    GRAVE = '✝'

class BuildingType(Enum):
    HOUSE = 'H'
    TAVERN = 'V'
    WORKSHOP = 'W'
    BARRACKS = 'B'
    TEMPLE = 'L'
    MARKET = 'M'
    SCHOOL = 'S'
    WALL = '#'
    ROAD = '+'

class DwarfState(Enum):
    WANDERING = "🚶 Wandering"
    MINING = "⛏️ Mining"
    FISHING = "🎣 Fishing"
    BUILDING = "🔨 Building"
    FARMING = "🌾 Farming"
    HUNTING = "🏹 Hunting"
    CRAFTING = "🔧 Crafting"
    TRADING = "💼 Trading"
    RESEARCHING = "📚 Researching"
    RESTING = "😴 Resting"
    FIGHTING = "⚔️ Fighting"
    SOCIALIZING = "💬 Socializing"
    EXPLORING = "🗺️ Exploring"
    PRAYING = "🙏 Praying"
    TEACHING = "👨‍🏫 Teaching"
    RETIRING = "🧓 Retiring"
    BURYING = "⚰️ Burying"
    MOURNING = "😢 Mourning"

class Profession(Enum):
    NONE = "Citizen"
    MINER = "Miner"
    FISHER = "Fisher"
    FARMER = "Farmer"
    HUNTER = "Hunter"
    BUILDER = "Builder"
    CRAFTER = "Crafter"
    TRADER = "Trader"
    SCHOLAR = "Scholar"
    SOLDIER = "Soldier"
    PRIEST = "Priest"
    TEACHER = "Teacher"
    LEADER = "Leader"
    EXPLORER = "Explorer"

class Relationship(Enum):
    NEUTRAL = 0
    FRIEND = 1
    ENEMY = -1
    FAMILY = 2
    LOVER = 3

class Season(Enum):
    SPRING = "🌸 Spring"
    SUMMER = "☀️ Summer"
    AUTUMN = "🍂 Autumn"
    WINTER = "❄️ Winter"

class Weather(Enum):
    SUNNY = "☀️ Sunny"
    RAINY = "🌧️ Rainy"
    STORMY = "⛈️ Stormy"
    SNOWY = "❄️ Snowy"
    FOGGY = "🌫️ Foggy"

class Animal:
    def __init__(self, x, y, animal_type):
        self.x = x
        self.y = y
        self.type = animal_type  # 'deer', 'wolf', 'fish'
        self.health = 100
        self.age = 0
        self.alive = True

class HistoryEvent:
    def __init__(self, day, season, year, event_type, description, participants=None):
        self.day = day
        self.season = season
        self.year = year
        self.event_type = event_type  # 'birth', 'death', 'combat', 'construction', 'discovery', etc.
        self.description = description
        self.participants = participants or []
        self.game_time = 0

class EventType(Enum):
    BIRTH = "👶 Birth"
    DEATH = "💀 Death"
    COMBAT = "⚔️ Combat"
    CONSTRUCTION = "🏗️ Construction"
    DISCOVERY = "🔍 Discovery"
    RELATIONSHIP = "💕 Relationship"
    ACHIEVEMENT = "🏆 Achievement"
    ECONOMY = "💰 Economy"
    EXPLORATION = "🗺️ Exploration"
    DISASTER = "🌪️ Disaster"
    CEREMONY = "🎉 Ceremony"
    MILESTONE = "📊 Milestone"

class Corpse:
    def __init__(self, dwarf, x, y):
        self.dwarf_name = dwarf.name
        self.x = x
        self.y = y
        self.age_at_death = dwarf.age
        self.cause_of_death = "Unknown"
        self.time_since_death = 0
        self.buried = False
        self.buried_by = None
        self.grave_message = f"Here lies {dwarf.name}, aged {dwarf.age}"

class Technology:
    def __init__(self, name, description, requirements, cost):
        self.name = name
        self.description = description
        self.requirements = requirements
        self.cost = cost
        self.researched = False

class Settlement:
    def __init__(self, name, x, y):
        self.name = name
        self.x = x
        self.y = y
        self.population = 0
        self.buildings = []
        self.leader = None
        self.faction = None

class Dwarf:
    def __init__(self, x, y, name):
        self.x = x
        self.y = y
        self.name = name
        self.age = random.randint(18, 30)
        self.gender = random.choice(['M', 'F'])
        self.gold = 0
        self.health = 100
        self.hunger = 100
        self.happiness = 100
        self.profession = Profession.NONE
        self.state = DwarfState.WANDERING
        self.state_timer = 0
        self.mining_cooldown = 0
        self.fishing_cooldown = 0
        self.skills = self.generate_initial_skills()
        self.relationships: Dict[str, Relationship] = {}
        self.target_x = x
        self.target_y = y
        self.alive = True
        self.next_x = x
        self.next_y = y
        self.home = None
        self.settlement = None
        self.faction = None
        self.inventory = {'food': 15, 'tools': 0, 'weapons': 0, 'materials': 0}  # FIXED: Increased from 5 to 15
        self.spouse = None
        self.children = []
        self.parents = []
        self.life_story = []  # Track major life events
        self.kills = 0
        self.times_mined = 0
        self.times_fished = 0
        self.buildings_built = 0
        self.total_gold_earned = 0
        self.burials_performed = 0
        self.grief_level = 0  # How sad the dwarf is from losing friends/family
        self.cause_of_death = ""
        
        # Add birth story
        self.add_life_event(f"Born at age {self.age} as a {self.get_gender_name()}")
        
    def generate_initial_skills(self):
        """Generate skills with gender influence"""
        base_skills = {
            'mining': random.randint(1, 10),
            'fishing': random.randint(1, 10),
            'building': random.randint(1, 10),
            'farming': random.randint(1, 10),
            'hunting': random.randint(1, 10),
            'crafting': random.randint(1, 10),
            'trading': random.randint(1, 10),
            'combat': random.randint(1, 10),
            'research': random.randint(1, 10)
        }
        
        # Gender influences (slight bonuses, not restrictions)
        if self.gender == 'M':
            base_skills['mining'] += random.randint(0, 3)
            base_skills['combat'] += random.randint(0, 3)
            base_skills['building'] += random.randint(0, 2)
        else:  # Female
            base_skills['crafting'] += random.randint(0, 3)
            base_skills['trading'] += random.randint(0, 3)
            base_skills['research'] += random.randint(0, 2)
            base_skills['farming'] += random.randint(0, 2)
        
        return base_skills
    
    def get_gender_name(self):
        return "Male" if self.gender == 'M' else "Female"
    
    def add_life_event(self, event):
        """Add an event to the dwarf's life story"""
        self.life_story.append(f"Age {self.age}: {event}")
        if len(self.life_story) > 50:  # Keep only last 50 events
            self.life_story = self.life_story[-50:]
        
    def get_power(self):
        base_power = self.health + (self.gold * 5) + (self.skills['combat'] * 3)
        # Males get slight combat bonus, females get diplomatic bonus
        if self.gender == 'M':
            base_power += 5
        else:
            base_power += self.happiness // 10  # Happiness affects female combat effectiveness
        return base_power
    
    def age_dwarf(self):
        self.age += 1
        # FIXED: More realistic aging - only affects very old dwarfs
        if self.age > 70:  # Changed from 60 to 70
            self.health -= random.randint(0, 1)  # Reduced aging damage, can be 0
        if self.age > 90 and random.random() < 0.02:  # Changed from 80 and 0.05 to 90 and 0.02
            self.health = 0  # Ensure death by setting health to 0
        
        # Check for death due to health
        if self.health <= 0:
            self.alive = False
            self.health = 0  # Ensure it's exactly 0
    
    def gain_skill(self, skill, amount=1):
        if skill in self.skills:
            old_level = self.skills[skill]
            self.skills[skill] = min(100, self.skills[skill] + amount)
            new_level = self.skills[skill]
            
            # Add life events for skill milestones
            for milestone in [25, 50, 75, 100]:
                if old_level < milestone <= new_level:
                    self.add_life_event(f"Reached {skill} skill level {milestone}")
                    if milestone == 100:
                        self.add_life_event(f"Mastered the art of {skill}!")
    
    def move_towards_target(self):
        new_x, new_y = self.x, self.y
        
        if self.x < self.target_x:
            new_x = self.x + 1
        elif self.x > self.target_x:
            new_x = self.x - 1
            
        if self.y < self.target_y:
            new_y = self.y + 1
        elif self.y > self.target_y:
            new_y = self.y - 1
        
        self.next_x = new_x
        self.next_y = new_y
    
    def set_random_target(self, map_width, map_height):
        attempts = 0
        while attempts < 20:
            self.target_x = random.randint(max(0, self.x - 20), min(map_width - 1, self.x + 20))
            self.target_y = random.randint(max(0, self.y - 20), min(map_height - 1, self.y + 20))
            attempts += 1

class Map:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.terrain = [[TerrainType.WATER for _ in range(width)] for _ in range(height)]
        self.buildings = [[None for _ in range(width)] for _ in range(height)]
        self.gold_mines = set()
        self.ports = set()
        self.forests = set()
        self.farms = set()
        self.ruins = set()
        self.roads = set()
        self.graves = {}  # Dictionary mapping (x, y) to grave info
        self.generate_map()
    
    def simple_noise(self, x, y, scale=0.1):
        value = 0
        amplitude = 1
        frequency = scale
        
        for _ in range(4):
            n = int(x * frequency) * 374761393 + int(y * frequency) * 668265263
            n = (n << 13) ^ n
            noise_val = (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0)
            value += noise_val * amplitude
            amplitude *= 0.5
            frequency *= 2
        
        return value / 2.0
    
    def generate_map(self):
        # Generate more land-focused islands with less water
        num_island_centers = random.randint(3, 6)  # More island centers
        island_centers = []
        
        for _ in range(num_island_centers):
            center_x = random.randint(self.width // 6, 5 * self.width // 6)  # Spread across more area
            center_y = random.randint(self.height // 6, 5 * self.height // 6)
            radius = random.randint(min(self.width, self.height) // 4, min(self.width, self.height) // 2)  # Bigger islands
            island_centers.append((center_x, center_y, radius))
        
        # Generate terrain with more land bias
        for y in range(self.height):
            for x in range(self.width):
                noise_value = self.simple_noise(x, y, 0.05)
                secondary_noise = self.simple_noise(x, y, 0.15) * 0.3
                
                min_distance_factor = float('inf')
                for center_x, center_y, radius in island_centers:
                    distance = math.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)
                    distance_factor = distance / radius
                    min_distance_factor = min(min_distance_factor, distance_factor)
                
                terrain_value = min_distance_factor + noise_value * 0.3 + secondary_noise  # Reduced noise impact
                
                # Reduced edge factor for more land near edges
                edge_distance = min(x, y, self.width - x - 1, self.height - y - 1)
                edge_factor = edge_distance / 15.0  # Increased divisor for less harsh edges
                terrain_value += max(0, 0.2 - edge_factor)  # Reduced edge penalty
                
                # More generous land threshold
                if terrain_value < 0.8:  # Increased from 0.6 to 0.8 for more land
                    if terrain_value < 0.25 and noise_value > 0.2:  # Adjusted mountain generation
                        self.terrain[y][x] = TerrainType.MOUNTAIN
                    else:
                        self.terrain[y][x] = TerrainType.GRASS
                else:
                    self.terrain[y][x] = TerrainType.WATER
        
        self.smooth_terrain()
        self.add_forests()
        self.add_ports()
        self.add_mines()
        self.add_ruins()
        
    def smooth_terrain(self):
        new_terrain = [row[:] for row in self.terrain]
        
        for y in range(1, self.height - 1):
            for x in range(1, self.width - 1):
                current = self.terrain[y][x]
                same_neighbors = 0
                
                for dy in [-1, 0, 1]:
                    for dx in [-1, 0, 1]:
                        if dx == 0 and dy == 0:
                            continue
                        neighbor = self.terrain[y + dy][x + dx]
                        if neighbor == current:
                            same_neighbors += 1
                
                if same_neighbors < 2:
                    neighbor_count = {}
                    for dy in [-1, 0, 1]:
                        for dx in [-1, 0, 1]:
                            if dx == 0 and dy == 0:
                                continue
                            neighbor = self.terrain[y + dy][x + dx]
                            neighbor_count[neighbor] = neighbor_count.get(neighbor, 0) + 1
                    
                    if neighbor_count:
                        most_common = max(neighbor_count, key=neighbor_count.get)
                        if most_common in [TerrainType.WATER, TerrainType.GRASS]:
                            new_terrain[y][x] = most_common
        
        self.terrain = new_terrain
    
    def add_forests(self):
        grass_tiles = [(x, y) for y in range(self.height) for x in range(self.width) 
                      if self.terrain[y][x] == TerrainType.GRASS]
        
        if grass_tiles:
            num_forests = len(grass_tiles) // 100
            for _ in range(num_forests):
                if grass_tiles:
                    x, y = random.choice(grass_tiles)
                    self.terrain[y][x] = TerrainType.FOREST
                    self.forests.add((x, y))
                    grass_tiles.remove((x, y))
    
    def add_ports(self):
        potential_ports = []
        
        for y in range(1, self.height - 1):
            for x in range(1, self.width - 1):
                if self.terrain[y][x] == TerrainType.GRASS:
                    water_adjacent = False
                    for dy in [-1, 0, 1]:
                        for dx in [-1, 0, 1]:
                            if dx == 0 and dy == 0:
                                continue
                            if self.terrain[y + dy][x + dx] == TerrainType.WATER:
                                water_adjacent = True
                                break
                        if water_adjacent:
                            break
                    
                    if water_adjacent:
                        potential_ports.append((x, y))
        
        if potential_ports:
            total_land = sum(1 for y in range(self.height) for x in range(self.width) 
                           if self.terrain[y][x] in [TerrainType.GRASS, TerrainType.MOUNTAIN])
            num_ports = max(2, min(len(potential_ports) // 8, total_land // 300))
            
            selected_ports = []
            for _ in range(num_ports):
                if potential_ports:
                    port_location = random.choice(potential_ports)
                    selected_ports.append(port_location)
                    x, y = port_location
                    
                    potential_ports = [(px, py) for px, py in potential_ports 
                                     if abs(px - x) > 8 or abs(py - y) > 4]
            
            for x, y in selected_ports:
                self.terrain[y][x] = TerrainType.PORT
                self.ports.add((x, y))
    
    def add_mines(self):
        grass_tiles = [(x, y) for y in range(self.height) for x in range(self.width) 
                      if self.terrain[y][x] == TerrainType.GRASS]
        
        if grass_tiles:
            num_mines = random.randint(len(grass_tiles) // 50, len(grass_tiles) // 25)
            num_mines = max(8, min(num_mines, 25))
            
            for _ in range(num_mines):
                if grass_tiles:
                    x, y = random.choice(grass_tiles)
                    self.terrain[y][x] = TerrainType.GOLD_MINE
                    self.gold_mines.add((x, y))
                    grass_tiles.remove((x, y))
    
    def add_ruins(self):
        grass_tiles = [(x, y) for y in range(self.height) for x in range(self.width) 
                      if self.terrain[y][x] == TerrainType.GRASS]
        
        if grass_tiles:
            num_ruins = random.randint(2, 6)
            for _ in range(num_ruins):
                if grass_tiles:
                    x, y = random.choice(grass_tiles)
                    self.terrain[y][x] = TerrainType.RUINS
                    self.ruins.add((x, y))
                    grass_tiles.remove((x, y))
    
    def get_terrain(self, x, y):
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.terrain[y][x]
        return TerrainType.WATER
    
    def get_building(self, x, y):
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.buildings[y][x]
        return None
    
    def place_building(self, x, y, building_type):
        if 0 <= x < self.width and 0 <= y < self.height and self.is_buildable(x, y):
            self.buildings[y][x] = building_type
            if building_type == BuildingType.ROAD:
                self.roads.add((x, y))
            return True
        return False
    
    def create_grave(self, x, y, corpse):
        """Create a grave at the specified location"""
        if 0 <= x < self.width and 0 <= y < self.height and self.is_buildable(x, y):
            self.terrain[y][x] = TerrainType.GRAVE
            self.graves[(x, y)] = {
                'name': corpse.dwarf_name,
                'age_at_death': corpse.age_at_death,
                'buried_by': corpse.buried_by,
                'message': corpse.grave_message,
                'death_day': corpse.time_since_death
            }
            return True
        return False
    
    def is_walkable(self, x, y):
        terrain = self.get_terrain(x, y)
        return terrain in [TerrainType.GRASS, TerrainType.GOLD_MINE, TerrainType.PORT, 
                          TerrainType.FOREST, TerrainType.FARM, TerrainType.RUINS, TerrainType.GRAVE]
    
    def is_buildable(self, x, y):
        terrain = self.get_terrain(x, y)
        return terrain in [TerrainType.GRASS, TerrainType.FOREST] and self.get_building(x, y) is None

class DwarfSimulation:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🧔 Albert's ASCII Dwarfs Simulation ⛏️")
        self.root.state('zoomed')
        self.root.configure(bg='#f5f2e8')  # Warm cream background
        
        # Configure style
        self.setup_styles()
        
        # Initialize zoom level
        self.zoom_level = 1.0
        self.min_zoom = 0.3
        self.max_zoom = 3.0
        
        # Initialize variables
        self.map_width_var = tk.StringVar(value="300")
        self.map_height_var = tk.StringVar(value="100")
        self.dwarf_count_var = tk.StringVar(value="20")
        
        self.dwarfs: List[Dwarf] = []
        self.animals: List[Animal] = []
        self.corpses: List[Corpse] = []  # Track unburied corpses
        self.settlements: List[Settlement] = []
        self.technologies: List[Technology] = []
        self.running = False
        self.notifications = []
        self.max_notifications = 15
        
        # Time and environment
        self.game_time = 0
        self.day = 1
        self.year = 1
        self.season = Season.SPRING
        self.weather = Weather.SUNNY
        self.temperature = 20
        
        # Research and global stats
        self.global_research_points = 0
        self.total_population = 0
        self.total_gold = 0
        
        # Historical tracking system
        self.history: List[HistoryEvent] = []
        self.civilization_name = "New Dwarven Realm"
        self.last_recorded_population = 0
        
        # Expanded dwarf names - 150 total!
        self.dwarf_names = [
            # Original LOTR dwarfs
            "Thorin", "Balin", "Dwalin", "Fili", "Kili", "Dori", "Nori", "Ori",
            "Oin", "Gloin", "Bifur", "Bofur", "Bombur", "Gimli", "Legolas",
            "Groin", "Fundin", "Thrain", "Durin", "Borin", "Floi", "Frerin",
            "Gror", "Telchar", "Azog", "Bolg", "Dain", "Thror", "Nar", "Nali",
            
            # Traditional dwarf names
            "Alviss", "Andvari", "Berling", "Brokkr", "Dolgthrasir", "Eikinskjaldi",
            "Fafnir", "Gandalf", "Harbard", "Jari", "Kvasir", "Lit", "Motul",
            "Nyr", "Onar", "Radsvid", "Skirfir", "Thekk", "Ulf", "Vigg",
            
            # Nordic-inspired names
            "Bjorn", "Erik", "Gunnar", "Harald", "Ivar", "Jorgen", "Klaus", "Lars",
            "Magnus", "Nils", "Olaf", "Per", "Ragnar", "Sven", "Torbjorn", "Ulf",
            "Viggo", "Willem", "Xerxes", "Yngvar", "Zephyr", "Arne", "Baldur", "Cnut",
            
            # Scottish/Celtic-inspired
            "Hamish", "Duncan", "Fergus", "Gregor", "Hamish", "Ian", "Jock", "Kenneth",
            "Lachlan", "Malcolm", "Niall", "Oran", "Paddy", "Quinn", "Rory", "Stuart",
            "Tavish", "Uisdean", "Wallace", "Ximenes", "Yann", "Zander", "Ailean", "Brodie",
            
            # German/Austrian-inspired
            "Albrecht", "Bruno", "Conrad", "Dieter", "Ernst", "Franz", "Gustav", "Heinrich",
            "Johann", "Karl", "Ludwig", "Maximilian", "Norbert", "Otto", "Paul", "Rainer",
            "Stefan", "Theodor", "Ulrich", "Viktor", "Wolfgang", "Xaver", "Yannick", "Zacharias",
            
            # Fantasy dwarf names
            "Ironbeard", "Stoneaxe", "Goldbeard", "Steelhammer", "Rockbreaker", "Coalburner",
            "Ironforge", "Stoneheart", "Goldstrike", "Steelwall", "Rockface", "Coalbeard",
            "Ironback", "Stonefoot", "Goldtooth", "Steelbeard", "Rockhammer", "Coalfist",
            
            # More unique fantasy names
            "Draven", "Korgan", "Thorgrim", "Kazador", "Belegar", "Gotrek", "Felix", "Bardin",
            "Okri", "Ungrim", "Alrik", "Thane", "Runesmith", "Longbeard", "Slayer", "Engineer",
            "Ranger", "Warrior", "Priest", "King", "Lord", "Master", "Elder", "Ancient",
            
            # Female dwarf names
            "Disa", "Vera", "Mira", "Tova", "Inga", "Helga", "Astrid", "Sigrid",
            "Brunhilde", "Gudrun", "Freydis", "Solveig", "Ragnhild", "Thora", "Valdis", "Ylva",

            # Creators name!
            "Albert"
        ]
        
        self.setup_ui()
        self.setup_map_colors()
        self.setup_technologies()
        
        # Create initial map
        self.map = Map(300, 100)
        self.generate_initial_animals()
        self.update_display()
        self.add_notification("🌍 Welcome to Albert's ASCII Dwarfs Simulation!")
        self.add_notification("🔍 Use zoom controls or Ctrl+Mouse Wheel to zoom in/out!")
        self.add_notification("📏 Resize the window - everything adapts automatically!")
        self.add_notification("⌨️ Shortcuts: Ctrl +/- (zoom), Ctrl+0 (fit), F11 (fullscreen)")
        self.add_notification("🎮 Experience the ultimate ASCII dwarf civilization!")
        
        # Record civilization founding
        self.record_history(EventType.MILESTONE, f"The {self.civilization_name} was founded!", [])
    
    def setup_styles(self):
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # Natural earth-toned color scheme
        self.style.configure('TLabel', background='#f5f2e8', foreground='#3d2f1f')
        self.style.configure('TFrame', background='#f5f2e8')
        self.style.configure('TLabelFrame', background='#f5f2e8', foreground='#3d2f1f')
        self.style.configure('TButton', font=('Arial', 9, 'bold'), background='#d4b896', foreground='#3d2f1f')
    
    def setup_technologies(self):
        self.technologies = [
            Technology("Iron Tools", "Better mining and building tools", [], 50),
            Technology("Advanced Fishing", "Improved fishing techniques", [], 30),
            Technology("Agriculture", "Enables farming", [], 40),
            Technology("Writing", "Enables research and education", [], 60),
            Technology("Mathematics", "Advanced calculations", ["Writing"], 80),
            Technology("Engineering", "Build advanced structures", ["Mathematics"], 100),
            Technology("Metallurgy", "Advanced metalworking", ["Iron Tools"], 120),
            Technology("Navigation", "Better sea travel", ["Mathematics"], 90),
            Technology("Medicine", "Improved health", ["Writing"], 70),
            Technology("Architecture", "Grand buildings", ["Engineering"], 150)
        ]
    
    def generate_initial_animals(self):
        land_tiles = [(x, y) for y in range(self.map.height) for x in range(self.map.width)
                     if self.map.get_terrain(x, y) in [TerrainType.GRASS, TerrainType.FOREST]]
        
        # Add deer
        for _ in range(len(land_tiles) // 200):
            if land_tiles:
                x, y = random.choice(land_tiles)
                self.animals.append(Animal(x, y, 'deer'))
                land_tiles.remove((x, y))
        
        # Add wolves (fewer)
        for _ in range(len(land_tiles) // 500):
            if land_tiles:
                x, y = random.choice(land_tiles)
                self.animals.append(Animal(x, y, 'wolf'))
                land_tiles.remove((x, y))
    
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left panel for map
        left_frame = ttk.Frame(main_frame)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Map header with controls
        map_header = ttk.Frame(left_frame)
        map_header.pack(fill=tk.X, pady=(0, 5))
        
        map_title = ttk.Label(map_header, text="🗺️ Albert's ASCII Dwarf World", 
                             font=('Arial', 12, 'bold'))
        map_title.pack(side=tk.LEFT)
        
        # Environment info
        self.env_label = ttk.Label(map_header, text="🌸 Spring | ☀️ Sunny | Day 1", 
                                  font=('Arial', 11, 'bold'))
        self.env_label.pack(side=tk.LEFT, padx=20)
        
        # Zoom controls
        zoom_frame = ttk.Frame(map_header)
        zoom_frame.pack(side=tk.RIGHT)
        
        ttk.Button(zoom_frame, text="🔍-", command=self.zoom_out, width=4).pack(side=tk.LEFT, padx=2)
        self.zoom_label = ttk.Label(zoom_frame, text="100%", width=6, font=('Arial', 10, 'bold'))
        self.zoom_label.pack(side=tk.LEFT, padx=5)
        ttk.Button(zoom_frame, text="🔍+", command=self.zoom_in, width=4).pack(side=tk.LEFT, padx=2)
        ttk.Button(zoom_frame, text="🎯", command=self.zoom_fit, width=4).pack(side=tk.LEFT, padx=2)
        
        help_label = ttk.Label(zoom_frame, text="Ctrl+Wheel | F11 fullscreen", 
                              font=('Arial', 10), foreground='#8b7355')
        help_label.pack(side=tk.RIGHT, padx=10)
        
        # Map display with scrollbars
        map_container = ttk.Frame(left_frame)
        map_container.pack(fill=tk.BOTH, expand=True)
        
        self.map_text = tk.Text(map_container, font=('Courier', int(4 * self.zoom_level)), 
                               bg='#1a252f', fg='#ecf0f1', insertbackground='#ecf0f1',
                               wrap=tk.NONE)
        
        v_scrollbar = ttk.Scrollbar(map_container, orient=tk.VERTICAL, command=self.map_text.yview)
        h_scrollbar = ttk.Scrollbar(map_container, orient=tk.HORIZONTAL, command=self.map_text.xview)
        self.map_text.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        self.map_text.grid(row=0, column=0, sticky='nsew')
        v_scrollbar.grid(row=0, column=1, sticky='ns')
        h_scrollbar.grid(row=1, column=0, sticky='ew')
        
        map_container.grid_rowconfigure(0, weight=1)
        map_container.grid_columnconfigure(0, weight=1)
        
        # Bind events
        self.map_text.bind("<Control-MouseWheel>", self.on_mousewheel_zoom)
        self.root.bind("<Control-plus>", lambda e: self.zoom_in())
        self.root.bind("<Control-equal>", lambda e: self.zoom_in())
        self.root.bind("<Control-minus>", lambda e: self.zoom_out())
        self.root.bind("<Control-0>", lambda e: self.zoom_fit())
        self.root.bind("<F11>", self.toggle_fullscreen)
        self.map_text.focus_set()
        
        # Notification area
        notification_frame = ttk.LabelFrame(left_frame, text="📢 World News & Events")
        notification_frame.pack(fill=tk.X, pady=(5, 0))
        
        notif_container = ttk.Frame(notification_frame)
        notif_container.pack(fill=tk.X, padx=5, pady=5)
        
        self.notification_text = tk.Text(notif_container, font=('Arial', 10), height=6,
                                       bg='#f0ead6', fg='#3d2f1f', insertbackground='#3d2f1f',
                                       wrap=tk.WORD, state=tk.DISABLED)
        notif_scrollbar = ttk.Scrollbar(notif_container, orient=tk.VERTICAL, command=self.notification_text.yview)
        self.notification_text.configure(yscrollcommand=notif_scrollbar.set)
        
        self.notification_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        notif_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Right panel
        right_frame = ttk.Frame(main_frame, width=400)
        right_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=(10, 0))
        right_frame.pack_propagate(False)
        
        # Controls section
        self.setup_controls(right_frame)
        
        # Statistics section  
        self.setup_statistics(right_frame)
        
        # Dwarf list section
        self.setup_dwarf_list(right_frame)
        
        # Legend section
        self.setup_legend(right_frame)
        
        self.root.rowconfigure(0, weight=1)
        self.root.columnconfigure(0, weight=1)
    
    def setup_controls(self, parent):
        controls_frame = ttk.LabelFrame(parent, text="🎮 Simulation Controls")
        controls_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Map settings
        map_frame = ttk.LabelFrame(controls_frame, text="🗺️ World Settings")
        map_frame.pack(fill=tk.X, padx=10, pady=(10, 5))
        
        # Size controls
        size_frame = ttk.Frame(map_frame)
        size_frame.pack(fill=tk.X, padx=5, pady=2)
        
        ttk.Label(size_frame, text="Size:", font=('Arial', 10)).pack(side=tk.LEFT)
        ttk.Spinbox(size_frame, from_=100, to=500, width=6, font=('Arial', 10),
                   textvariable=self.map_width_var).pack(side=tk.LEFT, padx=2)
        ttk.Label(size_frame, text="x", font=('Arial', 10)).pack(side=tk.LEFT)
        ttk.Spinbox(size_frame, from_=50, to=200, width=6, font=('Arial', 10),
                   textvariable=self.map_height_var).pack(side=tk.LEFT, padx=2)
        
        # Generate button
        self.generate_map_button = ttk.Button(map_frame, text="🎲 Generate New World", 
                                            command=self.generate_new_map)
        self.generate_map_button.pack(fill=tk.X, padx=5, pady=(5, 10))
        
        # Population settings
        pop_frame = ttk.Frame(controls_frame)
        pop_frame.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(pop_frame, text="🧔 Starting Dwarfs:", font=('Arial', 10)).pack(side=tk.LEFT)
        ttk.Spinbox(pop_frame, from_=5, to=100, width=8, font=('Arial', 10),
                   textvariable=self.dwarf_count_var).pack(side=tk.RIGHT)
        
        # Control buttons
        button_frame = ttk.Frame(controls_frame)
        button_frame.pack(fill=tk.X, padx=10, pady=(0, 10))
        
        self.start_button = ttk.Button(button_frame, text="▶️ Start Civilization", 
                                     command=self.start_simulation)
        self.start_button.pack(side=tk.LEFT, padx=(0, 5))
        
        self.stop_button = ttk.Button(button_frame, text="⏸️ Pause", 
                                    command=self.stop_simulation)
        self.stop_button.pack(side=tk.LEFT, padx=(0, 5))
        
        self.reset_button = ttk.Button(button_frame, text="🔄 Reset World", 
                                     command=self.reset_simulation)
        self.reset_button.pack(side=tk.LEFT, padx=(0, 5))
        
        # History button
        self.history_button = ttk.Button(button_frame, text="📚 Chronicles", 
                                       command=self.show_history_window)
        self.history_button.pack(side=tk.LEFT)
    
    def setup_statistics(self, parent):
        stats_frame = ttk.LabelFrame(parent, text="📊 Civilization Statistics")
        stats_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.stats_label = ttk.Label(stats_frame, text="", font=('Arial', 10))
        self.stats_label.pack(padx=10, pady=10)
    
    def setup_dwarf_list(self, parent):
        dwarf_frame = ttk.LabelFrame(parent, text="🧔 Population Registry")
        dwarf_frame.pack(fill=tk.BOTH, expand=True)
        
        dwarf_container = ttk.Frame(dwarf_frame)
        dwarf_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        columns = ('Name', 'Age', 'Gender', 'Profession', 'State', 'Gold', 'Health')
        self.dwarf_tree = ttk.Treeview(dwarf_container, columns=columns, show='headings')
        
        for col in columns:
            self.dwarf_tree.heading(col, text=col)
            if col in ['Age', 'Gold', 'Health']:
                self.dwarf_tree.column(col, width=40)
            elif col == 'Gender':
                self.dwarf_tree.column(col, width=50)
            else:
                self.dwarf_tree.column(col, width=70)
        
        # Add double-click event to show dwarf biography
        self.dwarf_tree.bind("<Double-1>", self.show_dwarf_biography)
        
        dwarf_scrollbar = ttk.Scrollbar(dwarf_container, orient=tk.VERTICAL, command=self.dwarf_tree.yview)
        self.dwarf_tree.configure(yscrollcommand=dwarf_scrollbar.set)
        
        self.dwarf_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        dwarf_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Add instruction label
        instruction_label = ttk.Label(dwarf_frame, text="💡 Double-click a dwarf to see their life story!", 
                                    font=('Arial', 10, 'bold'), foreground='#8b7355')
        instruction_label.pack(pady=8)
    
    def show_dwarf_biography(self, event):
        """Show detailed biography window for selected dwarf"""
        selection = self.dwarf_tree.selection()
        if not selection:
            return
        
        item = self.dwarf_tree.item(selection[0])
        dwarf_name = item['values'][0]
        
        # Find the dwarf object
        selected_dwarf = None
        for dwarf in self.dwarfs:
            if dwarf.name == dwarf_name and dwarf.alive:
                selected_dwarf = dwarf
                break
        
        if not selected_dwarf:
            return
        
        # Create biography window
        bio_window = tk.Toplevel(self.root)
        bio_window.title(f"📖 Biography of {dwarf_name}")
        bio_window.geometry("900x700")
        bio_window.configure(bg='#f5f2e8')
        
        # Create main scrollable frame
        main_canvas = tk.Canvas(bio_window, bg='#f5f2e8')
        main_scrollbar = ttk.Scrollbar(bio_window, orient="vertical", command=main_canvas.yview)
        scrollable_frame = ttk.Frame(main_canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: main_canvas.configure(scrollregion=main_canvas.bbox("all"))
        )
        
        main_canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        main_canvas.configure(yscrollcommand=main_scrollbar.set)
        
        # Pack canvas and scrollbar
        main_canvas.pack(side="left", fill="both", expand=True, padx=20, pady=20)
        main_scrollbar.pack(side="right", fill="y", pady=20)
        
        # Header with dwarf info
        header_frame = ttk.LabelFrame(scrollable_frame, text="📋 Basic Information")
        header_frame.pack(fill=tk.X, pady=(0, 15), padx=20)
        
        info_text = f"""
Name: {selected_dwarf.name} ({selected_dwarf.get_gender_name()})
Age: {selected_dwarf.age} years old
Profession: {selected_dwarf.profession.value}
Health: {selected_dwarf.health}/100  |  Happiness: {selected_dwarf.happiness:.1f}/100
Gold: {selected_dwarf.gold}  |  Total Earned: {selected_dwarf.total_gold_earned}

Combat Victories: {selected_dwarf.kills}  |  Times Mined: {selected_dwarf.times_mined}
Times Fished: {selected_dwarf.times_fished}  |  Buildings Built: {selected_dwarf.buildings_built}
Children: {len(selected_dwarf.children)}  |  Position: ({selected_dwarf.x}, {selected_dwarf.y})
        """
        
        info_label = ttk.Label(header_frame, text=info_text.strip(), font=('Arial', 11))
        info_label.pack(anchor=tk.W, padx=15, pady=15)
        
        # Skills section
        skills_frame = ttk.LabelFrame(scrollable_frame, text="🎯 Skills & Abilities")
        skills_frame.pack(fill=tk.X, pady=(0, 15), padx=20)
        
        skills_text = "  |  ".join([f"{skill.title()}: {level}/100" 
                                   for skill, level in selected_dwarf.skills.items()])
        skills_label = ttk.Label(skills_frame, text=skills_text, font=('Arial', 10))
        skills_label.pack(anchor=tk.W, padx=15, pady=15)
        
        # Relationships section
        relationships_frame = ttk.LabelFrame(scrollable_frame, text="💕 Relationships")
        relationships_frame.pack(fill=tk.X, pady=(0, 15), padx=20)
        
        rel_text = ""
        if selected_dwarf.spouse:
            rel_text += f"💑 Spouse: {selected_dwarf.spouse}\n"
        if selected_dwarf.children:
            rel_text += f"👶 Children: {', '.join(selected_dwarf.children)}\n"
        if selected_dwarf.parents:
            rel_text += f"👨‍👩‍👧‍👦 Parents: {', '.join(selected_dwarf.parents)}\n"
        
        friends = [name for name, rel in selected_dwarf.relationships.items() if rel == Relationship.FRIEND]
        enemies = [name for name, rel in selected_dwarf.relationships.items() if rel == Relationship.ENEMY]
        
        if friends:
            rel_text += f"🤝 Friends: {', '.join(friends)}\n"
        if enemies:
            rel_text += f"⚔️ Enemies: {', '.join(enemies)}\n"
        
        if not rel_text:
            rel_text = "No significant relationships yet."
        
        rel_label = ttk.Label(relationships_frame, text=rel_text.strip(), font=('Arial', 10))
        rel_label.pack(anchor=tk.W, padx=15, pady=15)
        
        # Life story section
        story_frame = ttk.LabelFrame(scrollable_frame, text="📚 Life Story")
        story_frame.pack(fill=tk.X, pady=(0, 15), padx=20)
        
        # Create text widget with scrollbar for life story
        story_container = ttk.Frame(story_frame)
        story_container.pack(fill=tk.X, padx=15, pady=15)
        
        story_text = tk.Text(story_container, font=('Arial', 10), wrap=tk.WORD, height=15,
                           bg='#f8f5f0', fg='#3d2f1f', state=tk.DISABLED)
        story_scrollbar = ttk.Scrollbar(story_container, orient=tk.VERTICAL, command=story_text.yview)
        story_text.configure(yscrollcommand=story_scrollbar.set)
        
        # Insert life story
        story_text.config(state=tk.NORMAL)
        if selected_dwarf.life_story:
            story_text.insert(tk.END, "\n".join(selected_dwarf.life_story))
        else:
            story_text.insert(tk.END, "This dwarf's story is just beginning...")
        story_text.config(state=tk.DISABLED)
        
        story_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        story_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Enable mouse wheel scrolling for the main canvas
        def _on_mousewheel(event):
            main_canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        def _bind_to_mousewheel(event):
            main_canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
        def _unbind_from_mousewheel(event):
            main_canvas.unbind_all("<MouseWheel>")
        
        bio_window.bind('<Enter>', _bind_to_mousewheel)
        bio_window.bind('<Leave>', _unbind_from_mousewheel)
    
    def setup_legend(self, parent):
        legend_frame = ttk.LabelFrame(parent, text="🗂️ World Legend")
        legend_frame.pack(fill=tk.X, pady=(10, 0))
        
        legend_text = """🌊 ~ Water    🌱 . Grass    🏔️ ^ Mountain
💰 G Mine     🚢 P Port     🌲 T Forest  
🏛️ R Ruins    🌾 F Farm     ✝ ✝ Grave
🏠 H House    🍺 V Tavern   🔨 W Workshop
⚔️ B Barracks  🧔 D Dwarf    ☠ ☠ Corpse
🦌 Deer      🐺 Wolf"""
        
        legend_label = ttk.Label(legend_frame, text=legend_text, font=('Courier', 10),
                               background='#f5f2e8', foreground='#3d2f1f')
        legend_label.pack(anchor=tk.W, padx=10, pady=10)
    
    def setup_map_colors(self):
        # Natural, earth-toned color scheme for the map
        self.map_text.tag_configure('water', foreground='#4a90a4')        # Soft blue-green water
        self.map_text.tag_configure('grass', foreground='#7ba428')        # Natural grass green
        self.map_text.tag_configure('mountain', foreground='#8b7355')     # Warm brown mountains
        self.map_text.tag_configure('gold', foreground='#cc9900')         # Rich gold
        self.map_text.tag_configure('port', foreground='#8e6a5b')         # Warm brown port
        self.map_text.tag_configure('forest', foreground='#5d7c47')       # Deep forest green
        self.map_text.tag_configure('farm', foreground='#b8860b')         # Golden brown farms
        self.map_text.tag_configure('ruins', foreground='#a0826d')        # Ancient stone brown
        self.map_text.tag_configure('grave', foreground='#666666')        # Gray graves
        self.map_text.tag_configure('corpse', foreground='#ff4444')       # Red corpses
        self.map_text.tag_configure('dwarf', foreground='#e67e22', background='#34495e')  # Orange dwarf on dark
        self.map_text.tag_configure('deer', foreground='#daa520')         # Brighter deer for dark background
        self.map_text.tag_configure('wolf', foreground='#cd5c5c')         # Brighter wolf for dark background
        self.map_text.tag_configure('building', foreground='#9b59b6', background='#2c3e50')  # Purple buildings on dark
    
    # Zoom and display methods
    def zoom_in(self):
        if self.zoom_level < self.max_zoom:
            self.zoom_level = min(self.max_zoom, self.zoom_level + 0.2)
            self.update_zoom()
    
    def zoom_out(self):
        if self.zoom_level > self.min_zoom:
            self.zoom_level = max(self.min_zoom, self.zoom_level - 0.2)
            self.update_zoom()
    
    def zoom_fit(self):
        self.zoom_level = 1.0
        self.update_zoom()
    
    def on_mousewheel_zoom(self, event):
        if event.state & 0x4:
            if event.delta > 0 or event.num == 4:
                self.zoom_in()
            elif event.delta < 0 or event.num == 5:
                self.zoom_out()
            return "break"
    
    def update_zoom(self):
        base_font_size = 4
        new_font_size = max(1, int(base_font_size * self.zoom_level))
        self.map_text.configure(font=('Courier', new_font_size))
        zoom_percent = int(self.zoom_level * 100)
        self.zoom_label.configure(text=f"{zoom_percent}%")
        self.map_text.update_idletasks()
    
    def record_history(self, event_type, description, participants):
        """Record a significant historical event"""
        event = HistoryEvent(
            day=self.day,
            season=self.season,
            year=self.year,
            event_type=event_type,
            description=description,
            participants=participants
        )
        event.game_time = self.game_time
        self.history.append(event)
        
        # Keep history manageable (last 1000 events)
        if len(self.history) > 1000:
            self.history = self.history[-1000:]
    
    def show_history_window(self):
        """Show the comprehensive history/chronicles window"""
        history_window = tk.Toplevel(self.root)
        history_window.title(f"📚 Chronicles of {self.civilization_name}")
        history_window.geometry("1000x700")
        history_window.configure(bg='#f5f2e8')
        
        # Main frame with scrolling
        main_canvas = tk.Canvas(history_window, bg='#f5f2e8')
        main_scrollbar = ttk.Scrollbar(history_window, orient="vertical", command=main_canvas.yview)
        scrollable_frame = ttk.Frame(main_canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: main_canvas.configure(scrollregion=main_canvas.bbox("all"))
        )
        
        main_canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        main_canvas.configure(yscrollcommand=main_scrollbar.set)
        
        # Pack canvas and scrollbar
        main_canvas.pack(side="left", fill="both", expand=True, padx=20, pady=20)
        main_scrollbar.pack(side="right", fill="y", pady=20)
        
        # Header
        header_frame = ttk.LabelFrame(scrollable_frame, text=f"📜 The Great Chronicles of {self.civilization_name}")
        header_frame.pack(fill=tk.X, pady=(0, 15), padx=20)
        
        summary_text = f"""
Total Events Recorded: {len(self.history)}
Current Year: {self.year} | Current Day: {self.day} | Season: {self.season.value}
Civilization Age: {self.game_time} days
        """
        
        summary_label = ttk.Label(header_frame, text=summary_text.strip(), font=('Arial', 11))
        summary_label.pack(anchor=tk.W, padx=15, pady=15)
        
        # Filter controls
        filter_frame = ttk.LabelFrame(scrollable_frame, text="🔍 Event Filters")
        filter_frame.pack(fill=tk.X, pady=(0, 15), padx=20)
        
        filter_control_frame = ttk.Frame(filter_frame)
        filter_control_frame.pack(fill=tk.X, padx=15, pady=10)
        
        ttk.Label(filter_control_frame, text="Show Events:", font=('Arial', 10)).pack(side=tk.LEFT)
        
        self.filter_var = tk.StringVar(value="All")
        filter_options = ["All"] + [event_type.value for event_type in EventType]
        filter_combo = ttk.Combobox(filter_control_frame, textvariable=self.filter_var, 
                                   values=filter_options, state="readonly", width=15)
        filter_combo.pack(side=tk.LEFT, padx=10)
        
        ttk.Button(filter_control_frame, text="🔄 Refresh", 
                  command=lambda: self.update_history_display(history_text, filter_combo.get())).pack(side=tk.LEFT, padx=10)
        
        # History display
        history_frame = ttk.LabelFrame(scrollable_frame, text="📖 Historical Events")
        history_frame.pack(fill=tk.BOTH, expand=True, padx=20)
        
        # Create text widget for history
        history_container = ttk.Frame(history_frame)
        history_container.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        history_text = tk.Text(history_container, font=('Arial', 10), wrap=tk.WORD, 
                              bg='#f8f5f0', fg='#3d2f1f', state=tk.DISABLED, height=25)
        history_scrollbar = ttk.Scrollbar(history_container, orient=tk.VERTICAL, command=history_text.yview)
        history_text.configure(yscrollcommand=history_scrollbar.set)
        
        history_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        history_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Statistics by event type
        stats_frame = ttk.LabelFrame(scrollable_frame, text="📊 Historical Statistics")
        stats_frame.pack(fill=tk.X, pady=(15, 0), padx=20)
        
        # Calculate event statistics
        event_counts = {}
        for event in self.history:
            event_type_name = event.event_type.value
            event_counts[event_type_name] = event_counts.get(event_type_name, 0) + 1
        
        stats_text = "Event Distribution:\n"
        for event_type, count in sorted(event_counts.items(), key=lambda x: x[1], reverse=True):
            stats_text += f"{event_type}: {count} events\n"
        
        if not event_counts:
            stats_text = "No historical events recorded yet."
        
        stats_label = ttk.Label(stats_frame, text=stats_text, font=('Arial', 10))
        stats_label.pack(anchor=tk.W, padx=15, pady=15)
        
        # Initial population
        self.update_history_display(history_text, "All")
        
        # Enable mouse wheel scrolling
        def _on_mousewheel(event):
            main_canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
        def _bind_to_mousewheel(event):
            main_canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
        def _unbind_from_mousewheel(event):
            main_canvas.unbind_all("<MouseWheel>")
        
        history_window.bind('<Enter>', _bind_to_mousewheel)
        history_window.bind('<Leave>', _unbind_from_mousewheel)
    
    def update_history_display(self, text_widget, filter_type):
        """Update the history display with filtering"""
        text_widget.config(state=tk.NORMAL)
        text_widget.delete(1.0, tk.END)
        
        # Filter events
        if filter_type == "All":
            filtered_events = self.history
        else:
            filtered_events = [event for event in self.history if event.event_type.value == filter_type]
        
        # Display events in reverse chronological order (newest first)
        if filtered_events:
            for event in reversed(filtered_events[-100:]):  # Show last 100 filtered events
                timestamp = f"Year {event.year}, Day {event.day} ({event.season.value})"
                event_line = f"[{timestamp}] {event.event_type.value}: {event.description}"
                
                if event.participants:
                    event_line += f" (Involved: {', '.join(event.participants)})"
                
                text_widget.insert(tk.END, event_line + "\n\n")
        else:
            text_widget.insert(tk.END, "No events found for the selected filter.")
        
        text_widget.config(state=tk.DISABLED)
        text_widget.see(tk.END)
    
    def toggle_fullscreen(self, event=None):
        self.root.attributes('-fullscreen', not self.root.attributes('-fullscreen'))
        return "break"
    
    # Simulation control methods
    def start_simulation(self):
        if not self.running:
            if not self.dwarfs:
                self.generate_dwarfs()
            self.running = True
            self.start_button.config(state='disabled')
            self.generate_map_button.config(state='disabled')
            self.add_notification("🎬 Albert's ASCII dwarf civilization begins its epic journey!")
            self.simulation_loop()
    
    def stop_simulation(self):
        self.running = False
        self.start_button.config(state='normal')
        self.generate_map_button.config(state='normal')
        self.add_notification("⏸️ Civilization paused - time stands still.")
    
    def reset_simulation(self):
        self.stop_simulation()
        self.dwarfs.clear()
        self.animals.clear()
        self.corpses.clear()  # Clear corpses too
        self.settlements.clear()
        self.notifications.clear()
        self.history.clear()  # Clear history
        self.game_time = 0
        self.day = 1
        self.year = 1
        self.season = Season.SPRING
        self.weather = Weather.SUNNY
        self.last_recorded_population = 0
        
        width = int(self.map_width_var.get())
        height = int(self.map_height_var.get())
        self.map = Map(width, height)
        self.generate_initial_animals()
        
        self.update_display()
        self.update_dwarf_list()
        self.update_statistics()
        self.update_notifications()
        
        # Record new beginning
        self.record_history(EventType.MILESTONE, f"The {self.civilization_name} was reborn in a new world!", [])
        self.add_notification("🔄 Albert's new ASCII world created! Ready for dwarf civilization!")
    
    def generate_new_map(self):
        if not self.running:
            self.dwarfs.clear()
            self.animals.clear()
            self.corpses.clear()  # Clear corpses too
            self.settlements.clear()
            self.notifications.clear()
            self.history.clear()  # Clear history
            self.last_recorded_population = 0
            
            width = int(self.map_width_var.get())
            height = int(self.map_height_var.get())
            self.map = Map(width, height)
            self.generate_initial_animals()
            
            self.update_display()
            self.update_dwarf_list()
            self.update_statistics()
            self.update_notifications()
            
            # Record new world generation
            self.record_history(EventType.MILESTONE, f"A new {width}x{height} world was discovered and claimed!", [])
            self.add_notification(f"🗺️ New {width}x{height} ASCII world generated! Explore Albert's realm!")
    
    def generate_dwarfs(self):
        num_dwarfs = int(self.dwarf_count_var.get())
        
        available_grass = [(x, y) for y in range(self.map.height) for x in range(self.map.width) 
                          if self.map.get_terrain(x, y) == TerrainType.GRASS]
        
        if not available_grass:
            self.add_notification("❌ No suitable land for dwarf settlement!")
            return
        
        actual_dwarfs = min(num_dwarfs, len(available_grass))
        if actual_dwarfs < num_dwarfs:
            self.add_notification(f"⚠️ Only {actual_dwarfs} dwarfs could settle due to limited space!")
        
        for i in range(actual_dwarfs):
            x, y = random.choice(available_grass)
            available_grass.remove((x, y))
            
            name = random.choice(self.dwarf_names)
            counter = 1
            original_name = name
            while any(d.name == name for d in self.dwarfs):
                name = f"{original_name}{counter}"
                counter += 1
            
            dwarf = Dwarf(x, y, name)
            # Assign random starting profession
            if random.random() < 0.3:  # 30% get a profession
                dwarf.profession = random.choice([Profession.MINER, Profession.FISHER, 
                                                Profession.FARMER, Profession.HUNTER, 
                                                Profession.BUILDER])
            self.dwarfs.append(dwarf)
        
        self.add_notification(f"🧔 {actual_dwarfs} brave dwarfs have founded a new civilization!")
        
        # Record in history
        if actual_dwarfs > 0:
            dwarf_names = [d.name for d in self.dwarfs]
            self.record_history(EventType.BIRTH, f"The first {actual_dwarfs} dwarfs arrived to establish the realm", dwarf_names)
            self.record_history(EventType.MILESTONE, f"Population milestone: {actual_dwarfs} founding settlers", dwarf_names)
    
    def simulation_loop(self):
        if self.running:
            self.game_time += 1
            
            # Update environment every 100 ticks
            if self.game_time % 100 == 0:
                self.update_environment()
            
            # Age dwarfs every 1000 ticks (roughly once per year)
            if self.game_time % 1000 == 0:
                self.age_population()
            
            self.update_dwarfs()
            self.update_animals()
            self.update_corpses_and_burials()  # Handle burial system
            self.update_display()
            self.update_dwarf_list()
            self.update_statistics()
            self.root.after(500, self.simulation_loop)
    
    def update_environment(self):
        self.day += 1
        
        # Change seasons every 30 days
        if self.day % 30 == 0:
            seasons = list(Season)
            current_index = seasons.index(self.season)
            old_season = self.season
            self.season = seasons[(current_index + 1) % len(seasons)]
            
            # New year every 4 seasons
            if self.season == Season.SPRING:
                self.year += 1
                self.record_history(EventType.MILESTONE, f"Year {self.year} has begun!", [])
            
            self.record_history(EventType.MILESTONE, f"{old_season.value} ended, {self.season.value} begins", [])
            self.add_notification(f"🌍 {self.season.value} has arrived!")
        
        # Random weather changes
        if random.random() < 0.3:
            old_weather = self.weather
            self.weather = random.choice(list(Weather))
            if self.weather != old_weather:
                self.add_notification(f"🌤️ Weather changed to {self.weather.value}")
        
        # Update environment display
        self.env_label.config(text=f"{self.season.value} | {self.weather.value} | Year {self.year}, Day {self.day}")
    
    def age_population(self):
        deaths = 0
        birthdays = 0
        for dwarf in self.dwarfs:
            if dwarf.alive:
                old_age = dwarf.age
                dwarf.age_dwarf()
                birthdays += 1
                
                # Add birthday to life story every 10 years
                if dwarf.age % 10 == 0 and dwarf.age != old_age:
                    dwarf.add_life_event(f"Celebrated {dwarf.age}th birthday")
                
                # Major life milestones
                if dwarf.age == 30:
                    dwarf.add_life_event("Reached adulthood at 30")
                elif dwarf.age == 50:
                    dwarf.add_life_event("Entered middle age")
                elif dwarf.age == 70:
                    dwarf.add_life_event("Became an elder")
                
                if not dwarf.alive:
                    deaths += 1
                    dwarf.cause_of_death = "old age"
                    dwarf.add_life_event(f"Died peacefully of old age at {dwarf.age}")
                    self.handle_dwarf_death(dwarf, "old age")
        
        if deaths > 0:
            self.add_notification(f"📊 {deaths} dwarfs died of old age this year")
        if birthdays > 0:
            self.add_notification(f"🎂 {birthdays} dwarfs had birthdays this year")
    
    def handle_dwarf_death(self, dwarf, cause):
        """Handle a dwarf's death - create corpse and trigger mourning"""
        # Create corpse
        corpse = Corpse(dwarf, dwarf.x, dwarf.y)
        corpse.cause_of_death = cause
        self.corpses.append(corpse)
        
        # Trigger mourning in family and friends
        for other_dwarf in self.dwarfs:
            if other_dwarf.alive and other_dwarf != dwarf:
                relationship = other_dwarf.relationships.get(dwarf.name, Relationship.NEUTRAL)
                
                if relationship in [Relationship.FAMILY, Relationship.LOVER]:
                    # Family/spouse gets very sad
                    other_dwarf.grief_level += 30
                    other_dwarf.happiness = max(0, other_dwarf.happiness - 40)
                    other_dwarf.add_life_event(f"Lost beloved {dwarf.name} to {cause}")
                    if random.random() < 0.8:  # 80% chance to start mourning
                        other_dwarf.state = DwarfState.MOURNING
                        other_dwarf.state_timer = random.randint(20, 40)
                        
                elif relationship == Relationship.FRIEND:
                    # Friends get moderately sad
                    other_dwarf.grief_level += 15
                    other_dwarf.happiness = max(0, other_dwarf.happiness - 20)
                    other_dwarf.add_life_event(f"Mourned the loss of friend {dwarf.name}")
                    if random.random() < 0.4:  # 40% chance to start mourning
                        other_dwarf.state = DwarfState.MOURNING
                        other_dwarf.state_timer = random.randint(10, 20)
        
        self.add_notification(f"💀 {dwarf.name} has died of {cause} at age {dwarf.age}")
        
        # Record death in history
        self.record_history(EventType.DEATH, f"{dwarf.name} died of {cause} at age {dwarf.age}", [dwarf.name])
    
    def update_corpses_and_burials(self):
        """Update corpse aging and try to bury them"""
        for corpse in self.corpses[:]:
            corpse.time_since_death += 0.5
            
            # Try to find a dwarf to bury this corpse
            if not corpse.buried:
                nearby_dwarfs = [d for d in self.dwarfs if d.alive and 
                               abs(d.x - corpse.x) <= 5 and abs(d.y - corpse.y) <= 5 and
                               d.state in [DwarfState.WANDERING, DwarfState.RESTING]]
                
                if nearby_dwarfs:
                    # Prioritize family/friends for burial
                    prioritized_dwarfs = []
                    for dwarf in nearby_dwarfs:
                        relationship = dwarf.relationships.get(corpse.dwarf_name, Relationship.NEUTRAL)
                        if relationship in [Relationship.FAMILY, Relationship.LOVER, Relationship.FRIEND]:
                            prioritized_dwarfs.append(dwarf)
                    
                    burial_dwarf = random.choice(prioritized_dwarfs if prioritized_dwarfs else nearby_dwarfs)
                    
                    # Start burial process
                    burial_dwarf.state = DwarfState.BURYING
                    burial_dwarf.state_timer = 8  # Takes 8 seconds to bury
                    burial_dwarf.target_x = corpse.x
                    burial_dwarf.target_y = corpse.y
                    burial_dwarf.burial_target = corpse
                    
            # Auto-bury if corpse has been around too long (48 hours = 96 ticks)
            elif corpse.time_since_death > 96 and not corpse.buried:
                self.bury_corpse(corpse, None)
    
    def bury_corpse(self, corpse, burying_dwarf):
        """Bury a corpse and create a grave"""
        # Find suitable burial spot near the corpse
        burial_spots = []
        for dx in range(-3, 4):
            for dy in range(-3, 4):
                x, y = corpse.x + dx, corpse.y + dy
                if self.map.is_buildable(x, y):
                    burial_spots.append((x, y))
        
        if burial_spots:
            grave_x, grave_y = random.choice(burial_spots)
            
            if burying_dwarf:
                corpse.buried_by = burying_dwarf.name
                burying_dwarf.burials_performed += 1
                burying_dwarf.add_life_event(f"Buried {corpse.dwarf_name} with honor")
                burying_dwarf.happiness = min(100, burying_dwarf.happiness + 10)  # Feel good about helping
                
            # Create the grave
            if self.map.create_grave(grave_x, grave_y, corpse):
                corpse.buried = True
                self.corpses.remove(corpse)
                
                burial_message = f"⚰️ {corpse.dwarf_name} was laid to rest"
                if burying_dwarf:
                    burial_message += f" by {burying_dwarf.name}"
                    # Record burial in history
                    self.record_history(EventType.CEREMONY, f"{corpse.dwarf_name} was buried with honor by {burying_dwarf.name}", [burying_dwarf.name, corpse.dwarf_name])
                else:
                    # Auto-burial
                    self.record_history(EventType.CEREMONY, f"{corpse.dwarf_name} was laid to rest in an unmarked grave", [corpse.dwarf_name])
                    
                self.add_notification(burial_message)
            else:
                # Couldn't create grave, corpse remains
                if burying_dwarf:
                    burying_dwarf.add_life_event(f"Could not find burial spot for {corpse.dwarf_name}")
        else:
            # No burial spots available
            if burying_dwarf:
                burying_dwarf.add_life_event(f"Could not bury {corpse.dwarf_name} - no suitable ground")
    
    def update_dwarfs(self):
        for dwarf in self.dwarfs[:]:
            if not dwarf.alive:
                continue
            
            # Update timers
            dwarf.state_timer = max(0, dwarf.state_timer - 0.5)
            dwarf.mining_cooldown = max(0, dwarf.mining_cooldown - 0.5)
            dwarf.fishing_cooldown = max(0, dwarf.fishing_cooldown - 0.5)
            
            # FIXED: Much slower hunger and happiness decay
            dwarf.hunger = max(0, dwarf.hunger - 0.02)  # Reduced from 0.1 to 0.02
            dwarf.happiness = max(0, dwarf.happiness - 0.01)  # Reduced from 0.05 to 0.01
            
            # FIXED: Only lose health when VERY hungry, and much slower
            if dwarf.hunger < 5:  # Changed from 20 to 5
                dwarf.health = max(0, dwarf.health - 0.1)  # Reduced from 0.5 to 0.1
            
            # FIXED: Auto-eat food when hungry (not just when resting)
            if dwarf.hunger < 50 and dwarf.inventory['food'] > 0:
                food_consumed = min(1, dwarf.inventory['food'])
                dwarf.inventory['food'] -= food_consumed
                dwarf.hunger = min(100, dwarf.hunger + food_consumed * 15)  # Increased from 10 to 15
                dwarf.health = min(100, dwarf.health + food_consumed * 3)   # Increased from 2 to 3
            
            self.update_dwarf_state(dwarf)
            self.move_dwarf(dwarf)
            self.check_interactions(dwarf)
    
    def update_dwarf_state(self, dwarf):
        if dwarf.state == DwarfState.MINING:
            if dwarf.state_timer <= 0:
                gold_mined = random.randint(1, 5) + dwarf.skills['mining'] // 10
                dwarf.gold += gold_mined
                dwarf.total_gold_earned += gold_mined  # Track total earnings
                dwarf.times_mined += 1
                dwarf.gain_skill('mining', 1)
                dwarf.state = DwarfState.RESTING
                rest_time = random.randint(30, 60)
                dwarf.state_timer = rest_time
                dwarf.mining_cooldown = rest_time
                dwarf.set_random_target(self.map.width, self.map.height)
                self.add_notification(f"⛏️ {dwarf.name} mined {gold_mined} gold! (Skill: {dwarf.skills['mining']})")
                
        elif dwarf.state == DwarfState.FISHING:
            if dwarf.state_timer <= 0:
                gold_earned = random.randint(1, 3) + dwarf.skills['fishing'] // 15
                food_caught = random.randint(3, 8)  # FIXED: Increased from 1-3 to 3-8
                dwarf.gold += gold_earned
                dwarf.total_gold_earned += gold_earned
                dwarf.inventory['food'] += food_caught
                dwarf.times_fished += 1
                dwarf.gain_skill('fishing', 1)
                dwarf.state = DwarfState.RESTING
                rest_time = random.randint(15, 30)
                dwarf.state_timer = rest_time
                dwarf.fishing_cooldown = rest_time
                dwarf.set_random_target(self.map.width, self.map.height)
                self.add_notification(f"🎣 {dwarf.name} caught fish worth {gold_earned} gold and {food_caught} food!")
                
        elif dwarf.state == DwarfState.HUNTING:
            if dwarf.state_timer <= 0:
                # Look for animals nearby
                nearby_animals = [a for a in self.animals if a.alive and a.type in ['deer', 'wolf']
                                and abs(a.x - dwarf.x) <= 2 and abs(a.y - dwarf.y) <= 2]
                if nearby_animals:
                    animal = random.choice(nearby_animals)
                    if animal.type == 'deer':
                        food_gained = random.randint(8, 15)  # FIXED: Increased from 3-8 to 8-15
                        dwarf.inventory['food'] += food_gained
                        animal.alive = False
                        dwarf.gain_skill('hunting', 2)
                        self.add_notification(f"🏹 {dwarf.name} successfully hunted a deer for {food_gained} food!")
                    elif animal.type == 'wolf':
                        if dwarf.skills['combat'] > random.randint(10, 30):
                            food_gained = random.randint(5, 10)  # FIXED: Increased from 2-5 to 5-10
                            dwarf.inventory['food'] += food_gained
                            animal.alive = False
                            dwarf.gain_skill('hunting', 3)
                            dwarf.gain_skill('combat', 2)
                            self.add_notification(f"⚔️ {dwarf.name} defeated a wolf and gained {food_gained} food!")
                        else:
                            damage = random.randint(5, 15)  # FIXED: Reduced from 10-25 to 5-15
                            dwarf.health -= damage
                            self.add_notification(f"🐺 {dwarf.name} was injured by a wolf!")
                
                dwarf.state = DwarfState.RESTING
                dwarf.state_timer = random.randint(20, 40)
                dwarf.set_random_target(self.map.width, self.map.height)
                
        elif dwarf.state == DwarfState.FARMING:
            if dwarf.state_timer <= 0:
                food_grown = random.randint(5, 12) + dwarf.skills['farming'] // 10  # FIXED: Increased from 2-6 to 5-12
                dwarf.inventory['food'] += food_grown
                dwarf.gain_skill('farming', 1)
                dwarf.state = DwarfState.RESTING
                dwarf.state_timer = random.randint(40, 70)
                dwarf.set_random_target(self.map.width, self.map.height)
                self.add_notification(f"🌾 {dwarf.name} harvested {food_grown} food from farming!")
                
        elif dwarf.state == DwarfState.BUILDING:
            if dwarf.state_timer <= 0:
                # Try to build something
                if self.try_build_structure(dwarf):
                    dwarf.gain_skill('building', 2)
                    dwarf.buildings_built += 1
                dwarf.state = DwarfState.RESTING
                dwarf.state_timer = random.randint(30, 50)
                dwarf.set_random_target(self.map.width, self.map.height)
                
        elif dwarf.state == DwarfState.RESTING:
            if dwarf.state_timer <= 0:
                # FIXED: Better rest recovery
                dwarf.health = min(100, dwarf.health + 5)  # Heal during rest
                dwarf.happiness = min(100, dwarf.happiness + 3)  # Feel better during rest
                
                dwarf.state = DwarfState.WANDERING
                dwarf.set_random_target(self.map.width, self.map.height)
                
        elif dwarf.state == DwarfState.FIGHTING:
            if dwarf.state_timer <= 0:
                dwarf.state = DwarfState.WANDERING
                dwarf.set_random_target(self.map.width, self.map.height)
                
        elif dwarf.state == DwarfState.SOCIALIZING:
            if dwarf.state_timer <= 0:
                dwarf.happiness = min(100, dwarf.happiness + 10)
                dwarf.state = DwarfState.WANDERING
                dwarf.set_random_target(self.map.width, self.map.height)
                
        elif dwarf.state == DwarfState.BURYING:
            if dwarf.state_timer <= 0:
                # Complete the burial
                if hasattr(dwarf, 'burial_target'):
                    self.bury_corpse(dwarf.burial_target, dwarf)
                    delattr(dwarf, 'burial_target')
                dwarf.state = DwarfState.WANDERING
                dwarf.set_random_target(self.map.width, self.map.height)
            else:
                # Move towards burial location
                if hasattr(dwarf, 'burial_target'):
                    dwarf.move_towards_target()
                    
        elif dwarf.state == DwarfState.MOURNING:
            if dwarf.state_timer <= 0:
                # Mourning period over, feel slightly better
                dwarf.grief_level = max(0, dwarf.grief_level - 5)
                dwarf.happiness = min(100, dwarf.happiness + 5)
                dwarf.state = DwarfState.WANDERING
                dwarf.set_random_target(self.map.width, self.map.height)
                
                # Chance to visit a grave if one exists nearby
                if random.random() < 0.3 and self.map.graves:
                    grave_locations = list(self.map.graves.keys())
                    if grave_locations:
                        grave_x, grave_y = random.choice(grave_locations)
                        dwarf.target_x = grave_x
                        dwarf.target_y = grave_y
    
    def try_build_structure(self, dwarf):
        # Try to build near current position
        for dx in range(-2, 3):
            for dy in range(-2, 3):
                x, y = dwarf.x + dx, dwarf.y + dy
                if self.map.is_buildable(x, y):
                    building_type = random.choice([BuildingType.HOUSE, BuildingType.ROAD, 
                                                 BuildingType.WORKSHOP, BuildingType.MARKET])
                    if self.map.place_building(x, y, building_type):
                        self.add_notification(f"🏗️ {dwarf.name} built a {building_type.name.lower()}!")
                        
                        # Record construction in history
                        self.record_history(EventType.CONSTRUCTION, f"{dwarf.name} constructed a {building_type.name.lower()}", [dwarf.name])
                        
                        return True
        return False
    
    def move_dwarf(self, dwarf):
        if dwarf.state == DwarfState.WANDERING:
            dwarf.move_towards_target()
            
            if hasattr(dwarf, 'next_x') and hasattr(dwarf, 'next_y'):
                if self.map.is_walkable(dwarf.next_x, dwarf.next_y):
                    occupied = any(d.x == dwarf.next_x and d.y == dwarf.next_y 
                                 for d in self.dwarfs if d != dwarf and d.alive)
                    if not occupied:
                        dwarf.x = dwarf.next_x
                        dwarf.y = dwarf.next_y
            
            if dwarf.x == dwarf.target_x and dwarf.y == dwarf.target_y:
                dwarf.set_random_target(self.map.width, self.map.height)
            elif not self.map.is_walkable(dwarf.target_x, dwarf.target_y):
                dwarf.set_random_target(self.map.width, self.map.height)
    
    def check_interactions(self, dwarf):
        if dwarf.state != DwarfState.WANDERING:
            return
            
        current_terrain = self.map.get_terrain(dwarf.x, dwarf.y)
        
        # Check for activities based on terrain and profession
        if current_terrain == TerrainType.GOLD_MINE and dwarf.mining_cooldown <= 0:
            dwarf.state = DwarfState.MINING
            dwarf.state_timer = 5
            return
            
        if current_terrain == TerrainType.PORT and dwarf.fishing_cooldown <= 0:
            dwarf.state = DwarfState.FISHING
            dwarf.state_timer = 3
            return
            
        if current_terrain == TerrainType.FOREST:
            if random.random() < 0.3:  # 30% chance to start hunting
                dwarf.state = DwarfState.HUNTING
                dwarf.state_timer = 4
                return
                
        if current_terrain == TerrainType.GRASS and random.random() < 0.2:
            if dwarf.profession == Profession.FARMER or random.random() < 0.1:
                # Start farming
                self.map.terrain[dwarf.y][dwarf.x] = TerrainType.FARM
                self.map.farms.add((dwarf.x, dwarf.y))
                dwarf.state = DwarfState.FARMING
                dwarf.state_timer = 6
                return
        
        # Check for building opportunities
        if dwarf.profession == Profession.BUILDER and random.random() < 0.3:
            dwarf.state = DwarfState.BUILDING
            dwarf.state_timer = 8
            return
        
        # Check for other dwarfs
        nearby_dwarfs = [d for d in self.dwarfs if d != dwarf and d.alive and 
                        abs(d.x - dwarf.x) <= 1 and abs(d.y - dwarf.y) <= 1]
        
        if nearby_dwarfs:
            other_dwarf = random.choice(nearby_dwarfs)
            self.handle_dwarf_interaction(dwarf, other_dwarf)
    
    def handle_dwarf_interaction(self, dwarf1, dwarf2):
        relationship = dwarf1.relationships.get(dwarf2.name, Relationship.NEUTRAL)
        
        if relationship == Relationship.ENEMY:
            self.dwarf_fight(dwarf1, dwarf2)
        elif relationship == Relationship.FRIEND:
            if random.random() < 0.3:
                self.dwarf_reproduce(dwarf1, dwarf2)
            else:
                self.dwarf_socialize(dwarf1, dwarf2)
        else:
            action = random.choice(['fight', 'befriend', 'trade', 'ignore'])
            if action == 'fight':
                self.dwarf_fight(dwarf1, dwarf2)
            elif action == 'befriend':
                self.dwarf_befriend(dwarf1, dwarf2)
            elif action == 'trade':
                self.dwarf_trade(dwarf1, dwarf2)
    
    def dwarf_fight(self, dwarf1, dwarf2):
        dwarf1.state = DwarfState.FIGHTING
        dwarf2.state = DwarfState.FIGHTING
        dwarf1.state_timer = 3
        dwarf2.state_timer = 3
        
        power1 = dwarf1.get_power()
        power2 = dwarf2.get_power()
        
        if power1 > power2:
            winner, loser = dwarf1, dwarf2
        else:
            winner, loser = dwarf2, dwarf1
        
        stolen_gold = min(loser.gold, random.randint(1, 3))  # Reduced gold theft
        winner.gold += stolen_gold
        winner.total_gold_earned += stolen_gold
        loser.gold -= stolen_gold
        
        # Reduced combat damage for more sustainable fights
        damage_to_loser = random.randint(8, 20)  # Reduced from 15-35
        damage_to_winner = random.randint(2, 8)   # Reduced from 5-15
        
        # Apply damage
        loser.health -= damage_to_loser
        winner.health -= damage_to_winner
        
        winner.gain_skill('combat', 2)
        loser.gain_skill('combat', 1)
        
        dwarf1.relationships[dwarf2.name] = Relationship.ENEMY
        dwarf2.relationships[dwarf1.name] = Relationship.ENEMY
        
        # Add to life stories
        winner.add_life_event(f"Defeated {loser.name} in combat, stole {stolen_gold} gold")
        loser.add_life_event(f"Lost fight to {winner.name}, lost {stolen_gold} gold")
        
        # Check for death (ensure proper death handling)
        if loser.health <= 0:
            loser.alive = False
            loser.health = 0
            winner.kills += 1
            loser.cause_of_death = f"combat with {winner.name}"
            winner.add_life_event(f"Killed {loser.name} in deadly combat")
            loser.add_life_event(f"Died in battle against {winner.name}")
            
            # Record epic battle in history
            self.record_history(EventType.COMBAT, f"{winner.name} killed {loser.name} in deadly combat", [winner.name, loser.name])
            
            self.handle_dwarf_death(loser, f"combat with {winner.name}")
        else:
            # Record non-lethal combat
            self.record_history(EventType.COMBAT, f"{winner.name} defeated {loser.name} in battle", [winner.name, loser.name])
            self.add_notification(f"⚔️ {winner.name} defeated {loser.name} and stole {stolen_gold} gold!")
        
        # Winner might also die from their injuries
        if winner.health <= 0:
            winner.alive = False
            winner.health = 0
            winner.cause_of_death = f"wounds from combat with {loser.name}"
            winner.add_life_event(f"Died from wounds sustained in battle with {loser.name}")
            self.handle_dwarf_death(winner, f"wounds from combat with {loser.name}")
    
    def dwarf_befriend(self, dwarf1, dwarf2):
        dwarf1.state = DwarfState.SOCIALIZING
        dwarf2.state = DwarfState.SOCIALIZING
        dwarf1.state_timer = 2
        dwarf2.state_timer = 2
        
        dwarf1.relationships[dwarf2.name] = Relationship.FRIEND
        dwarf2.relationships[dwarf1.name] = Relationship.FRIEND
        
        # Add to life stories
        dwarf1.add_life_event(f"Became friends with {dwarf2.name}")
        dwarf2.add_life_event(f"Became friends with {dwarf1.name}")
        
        # Record friendship in history
        self.record_history(EventType.RELATIONSHIP, f"{dwarf1.name} and {dwarf2.name} became friends", [dwarf1.name, dwarf2.name])
        
        self.add_notification(f"🤝 {dwarf1.name} and {dwarf2.name} became lifelong friends!")
    
    def dwarf_trade(self, dwarf1, dwarf2):
        dwarf1.state = DwarfState.TRADING
        dwarf2.state = DwarfState.TRADING
        dwarf1.state_timer = 2
        dwarf2.state_timer = 2
        
        # Gender affects trading preferences
        if dwarf1.inventory['food'] > dwarf2.inventory['food'] and dwarf2.gold > dwarf1.gold:
            food_traded = random.randint(1, min(3, dwarf1.inventory['food']))
            gold_traded = random.randint(1, min(5, dwarf2.gold))
            
            # Female dwarfs are better traders
            if dwarf1.gender == 'F':
                gold_traded += random.randint(0, 2)
            if dwarf2.gender == 'F':
                food_traded += random.randint(0, 1)
            
            dwarf1.inventory['food'] -= food_traded
            dwarf1.gold += gold_traded
            dwarf1.total_gold_earned += gold_traded
            dwarf2.inventory['food'] += food_traded
            dwarf2.gold -= gold_traded
            
            dwarf1.gain_skill('trading', 1)
            dwarf2.gain_skill('trading', 1)
            
            # Add to life stories
            dwarf1.add_life_event(f"Traded {food_traded} food for {gold_traded} gold with {dwarf2.name}")
            dwarf2.add_life_event(f"Traded {gold_traded} gold for {food_traded} food with {dwarf1.name}")
            
            self.add_notification(f"💼 {dwarf1.name} traded {food_traded} food for {gold_traded} gold with {dwarf2.name}!")
    
    def dwarf_socialize(self, dwarf1, dwarf2):
        dwarf1.state = DwarfState.SOCIALIZING
        dwarf2.state = DwarfState.SOCIALIZING
        dwarf1.state_timer = 2
        dwarf2.state_timer = 2
        
        dwarf1.happiness = min(100, dwarf1.happiness + 5)
        dwarf2.happiness = min(100, dwarf2.happiness + 5)
        
        # Chance for deeper relationship based on gender and current relationship
        if dwarf1.gender != dwarf2.gender and random.random() < 0.1:
            if dwarf2.name not in dwarf1.relationships:
                # Chance for romance
                dwarf1.relationships[dwarf2.name] = Relationship.LOVER
                dwarf2.relationships[dwarf1.name] = Relationship.LOVER
                dwarf1.add_life_event(f"Fell in love with {dwarf2.name}")
                dwarf2.add_life_event(f"Fell in love with {dwarf1.name}")
                
                # Record romance in history
                self.record_history(EventType.RELATIONSHIP, f"{dwarf1.name} and {dwarf2.name} fell in love", [dwarf1.name, dwarf2.name])
                
                self.add_notification(f"💖 {dwarf1.name} and {dwarf2.name} fell in love!")
                return
        
        self.add_notification(f"💬 {dwarf1.name} and {dwarf2.name} shared stories and laughter!")
    
    def dwarf_reproduce(self, dwarf1, dwarf2):
        if dwarf1.gender == dwarf2.gender:
            return  # Same gender can't reproduce
            
        for dx in range(-2, 3):
            for dy in range(-2, 3):
                x, y = dwarf1.x + dx, dwarf1.y + dy
                if (self.map.is_walkable(x, y) and 
                    not any(d.x == x and d.y == y for d in self.dwarfs if d.alive)):
                    
                    # Create child name based on parents
                    if dwarf1.gender == 'F':
                        mother, father = dwarf1, dwarf2
                    else:
                        mother, father = dwarf2, dwarf1
                    
                    parent_name = random.choice([mother.name, father.name])
                    child_name = f"{parent_name}Jr"
                    counter = 1
                    while any(d.name == child_name for d in self.dwarfs):
                        child_name = f"{parent_name}Jr{counter}"
                        counter += 1
                    
                    new_dwarf = Dwarf(x, y, child_name)
                    new_dwarf.age = 0  # Start as baby
                    
                    # Inherit some skills from parents with gender influence
                    for skill in new_dwarf.skills:
                        parent_avg = (mother.skills[skill] + father.skills[skill]) // 2
                        inheritance = max(1, parent_avg + random.randint(-3, 3))
                        new_dwarf.skills[skill] = inheritance
                    
                    new_dwarf.parents = [mother.name, father.name]
                    mother.children.append(child_name)
                    father.children.append(child_name)
                    
                    # Set family relationships
                    new_dwarf.relationships[mother.name] = Relationship.FAMILY
                    new_dwarf.relationships[father.name] = Relationship.FAMILY
                    mother.relationships[child_name] = Relationship.FAMILY
                    father.relationships[child_name] = Relationship.FAMILY
                    
                    # Update spouse relationship if not already set
                    if not mother.spouse:
                        mother.spouse = father.name
                        mother.relationships[father.name] = Relationship.LOVER
                    if not father.spouse:
                        father.spouse = mother.name
                        father.relationships[mother.name] = Relationship.LOVER
                    
                    self.dwarfs.append(new_dwarf)
                    
                    dwarf1.state = DwarfState.SOCIALIZING
                    dwarf2.state = DwarfState.SOCIALIZING
                    dwarf1.state_timer = 5
                    dwarf2.state_timer = 5
                    
                    # Add to life stories
                    mother.add_life_event(f"Gave birth to {child_name} with {father.name}")
                    father.add_life_event(f"Became father to {child_name} with {mother.name}")
                    
                    # Record birth in history
                    self.record_history(EventType.BIRTH, f"{child_name} was born to {mother.name} and {father.name}", [mother.name, father.name, child_name])
                    
                    self.add_notification(f"👶 {child_name} was born! Parents: {mother.name} & {father.name}")
                    return
    
    def update_animals(self):
        for animal in self.animals[:]:
            if not animal.alive:
                continue
            
            animal.age += 1
            
            # Animals move randomly
            if random.random() < 0.3:
                new_x = animal.x + random.randint(-1, 1)
                new_y = animal.y + random.randint(-1, 1)
                
                if self.map.is_walkable(new_x, new_y):
                    animal.x = new_x
                    animal.y = new_y
            
            # Animals reproduce occasionally
            if animal.age > 100 and random.random() < 0.01:
                nearby_animals = [a for a in self.animals 
                                if a.type == animal.type and a != animal and a.alive
                                and abs(a.x - animal.x) <= 3 and abs(a.y - animal.y) <= 3]
                
                if nearby_animals and len([a for a in self.animals if a.type == animal.type and a.alive]) < 50:
                    # Find empty spot for baby
                    for dx in range(-2, 3):
                        for dy in range(-2, 3):
                            x, y = animal.x + dx, animal.y + dy
                            if (self.map.is_walkable(x, y) and 
                                not any(a.x == x and a.y == y for a in self.animals if a.alive)):
                                baby = Animal(x, y, animal.type)
                                self.animals.append(baby)
                                break
            
            # Animals die of old age
            if animal.age > 500 and random.random() < 0.05:
                animal.alive = False
    
    def update_display(self):
        display = []
        char_positions = []
        
        for y in range(self.map.height):
            row = []
            for x in range(self.map.width):
                terrain = self.map.get_terrain(x, y)
                building = self.map.get_building(x, y)
                
                if building:
                    char = building.value
                    char_positions.append((y, x, 'building'))
                else:
                    char = terrain.value
                    if terrain == TerrainType.WATER:
                        char_positions.append((y, x, 'water'))
                    elif terrain == TerrainType.GRASS:
                        char_positions.append((y, x, 'grass'))
                    elif terrain == TerrainType.MOUNTAIN:
                        char_positions.append((y, x, 'mountain'))
                    elif terrain == TerrainType.GOLD_MINE:
                        char_positions.append((y, x, 'gold'))
                    elif terrain == TerrainType.PORT:
                        char_positions.append((y, x, 'port'))
                    elif terrain == TerrainType.FOREST:
                        char_positions.append((y, x, 'forest'))
                    elif terrain == TerrainType.FARM:
                        char_positions.append((y, x, 'farm'))
                    elif terrain == TerrainType.RUINS:
                        char_positions.append((y, x, 'ruins'))
                    elif terrain == TerrainType.GRAVE:
                        char_positions.append((y, x, 'grave'))
                
                row.append(char)
            display.append(row)
        
        # Add animals
        animal_positions = []
        for animal in self.animals:
            if animal.alive and 0 <= animal.x < self.map.width and 0 <= animal.y < self.map.height:
                if animal.type == 'deer':
                    display[animal.y][animal.x] = 'D'
                    animal_positions.append((animal.y, animal.x, 'deer'))
                elif animal.type == 'wolf':
                    display[animal.y][animal.x] = 'W'
                    animal_positions.append((animal.y, animal.x, 'wolf'))
        
        # Add corpses (show as ☠ symbol)
        corpse_positions = []
        for corpse in self.corpses:
            if not corpse.buried and 0 <= corpse.x < self.map.width and 0 <= corpse.y < self.map.height:
                display[corpse.y][corpse.x] = '☠'
                corpse_positions.append((corpse.y, corpse.x))
        
        # Add dwarfs (they override animals and corpses)
        dwarf_positions = []
        for dwarf in self.dwarfs:
            if dwarf.alive and 0 <= dwarf.x < self.map.width and 0 <= dwarf.y < self.map.height:
                display[dwarf.y][dwarf.x] = 'D'
                dwarf_positions.append((dwarf.y, dwarf.x))
        
        map_str = '\n'.join(''.join(row) for row in display)
        
        self.map_text.config(state=tk.NORMAL)
        self.map_text.delete(1.0, tk.END)
        self.map_text.insert(1.0, map_str)
        
        # Apply colors
        for y, x, tag in char_positions:
            start_pos = f"{y+1}.{x}"
            end_pos = f"{y+1}.{x+1}"
            self.map_text.tag_add(tag, start_pos, end_pos)
        
        for y, x, tag in animal_positions:
            start_pos = f"{y+1}.{x}"
            end_pos = f"{y+1}.{x+1}"
            self.map_text.tag_add(tag, start_pos, end_pos)
        
        # Apply corpse colors
        for y, x in corpse_positions:
            start_pos = f"{y+1}.{x}"
            end_pos = f"{y+1}.{x+1}"
            self.map_text.tag_add('corpse', start_pos, end_pos)
        
        # Apply dwarf colors
        for y, x in dwarf_positions:
            start_pos = f"{y+1}.{x}"
            end_pos = f"{y+1}.{x+1}"
            self.map_text.tag_add('dwarf', start_pos, end_pos)
        
        self.map_text.config(state=tk.DISABLED)
    
    def update_dwarf_list(self):
        for item in self.dwarf_tree.get_children():
            self.dwarf_tree.delete(item)
        
        for dwarf in self.dwarfs:
            if dwarf.alive:
                health_indicator = "💚" if dwarf.health > 70 else "💛" if dwarf.health > 30 else "❤️"
                profession_text = dwarf.profession.value if dwarf.profession != Profession.NONE else "Citizen"
                gender_icon = "♂️" if dwarf.gender == 'M' else "♀️"
                
                self.dwarf_tree.insert('', tk.END, values=(
                    dwarf.name,
                    dwarf.age,
                    gender_icon,
                    profession_text,
                    dwarf.state.value,
                    f"💰{dwarf.gold}",
                    f"{health_indicator}{dwarf.health}"
                ))
    
    def update_statistics(self):
        alive_dwarfs = [d for d in self.dwarfs if d.alive]
        total_gold = sum(d.gold for d in alive_dwarfs)
        avg_health = sum(d.health for d in alive_dwarfs) / len(alive_dwarfs) if alive_dwarfs else 0
        avg_happiness = sum(d.happiness for d in alive_dwarfs) / len(alive_dwarfs) if alive_dwarfs else 0
        avg_age = sum(d.age for d in alive_dwarfs) / len(alive_dwarfs) if alive_dwarfs else 0
        
        # Gender breakdown
        males = sum(1 for d in alive_dwarfs if d.gender == 'M')
        females = sum(1 for d in alive_dwarfs if d.gender == 'F')
        
        # Count relationships
        friends = sum(1 for d in alive_dwarfs for rel in d.relationships.values() if rel == Relationship.FRIEND) // 2
        enemies = sum(1 for d in alive_dwarfs for rel in d.relationships.values() if rel == Relationship.ENEMY) // 2
        lovers = sum(1 for d in alive_dwarfs for rel in d.relationships.values() if rel == Relationship.LOVER) // 2
        families = sum(1 for d in alive_dwarfs for rel in d.relationships.values() if rel == Relationship.FAMILY) // 2
        
        # Count professions
        professions = {}
        for dwarf in alive_dwarfs:
            prof = dwarf.profession.value
            professions[prof] = professions.get(prof, 0) + 1
        
        # Infrastructure stats
        num_buildings = sum(1 for y in range(self.map.height) for x in range(self.map.width) 
                          if self.map.get_building(x, y) is not None)
        
        # Wildlife stats
        alive_animals = [a for a in self.animals if a.alive]
        deer_count = sum(1 for a in alive_animals if a.type == 'deer')
        wolf_count = sum(1 for a in alive_animals if a.type == 'wolf')
        
        # Life achievements
        total_kills = sum(d.kills for d in alive_dwarfs)
        total_buildings = sum(d.buildings_built for d in alive_dwarfs)
        total_earnings = sum(d.total_gold_earned for d in alive_dwarfs)
        total_burials = sum(d.burials_performed for d in alive_dwarfs)
        
        # Death and burial stats
        unburied_corpses = len(self.corpses)
        total_graves = len(self.map.graves)
        
        stats_text = f"""👥 Population: {len(alive_dwarfs)} (♂️{males} | ♀️{females})
📊 Avg Age: {avg_age:.1f} years
💰 Total Wealth: {total_gold} (Earned: {total_earnings})
💖 Avg Health: {avg_health:.1f}/100
😊 Avg Happiness: {avg_happiness:.1f}/100

💕 Relationships:
🤝 Friendships: {friends} | ⚔️ Rivalries: {enemies}
💘 Couples: {lovers} | 👨‍👩‍👧‍👦 Families: {families}

🏗️ Infrastructure:
Buildings: {num_buildings} | Mines: {len(self.map.gold_mines)}
Ports: {len(self.map.ports)} | Farms: {len(self.map.farms)}

⚰️ Death & Honor:
✝ Graves: {total_graves} | ☠ Unburied: {unburied_corpses}
Burials Performed: {total_burials}

🌍 Wildlife:
🦌 Deer: {deer_count} | 🐺 Wolves: {wolf_count}

⚔️ Achievements:
Combat Kills: {total_kills} | Buildings Built: {total_buildings}

👷 Professions:"""
        
        for prof, count in professions.items():
            if count > 0:
                stats_text += f"\n{prof}: {count}"
        
        self.stats_label.config(text=stats_text)
    
    def add_notification(self, message):
        import datetime
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        notification = f"[{timestamp}] {message}"
        self.notifications.append(notification)
        
        if len(self.notifications) > self.max_notifications:
            self.notifications = self.notifications[-self.max_notifications:]
        
        self.update_notifications()
    
    def update_notifications(self):
        self.notification_text.config(state=tk.NORMAL)
        self.notification_text.delete(1.0, tk.END)
        
        for notification in reversed(self.notifications):
            self.notification_text.insert(tk.END, notification + "\n")
        
        self.notification_text.see(tk.END)
        self.notification_text.config(state=tk.DISABLED)
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    simulation = DwarfSimulation()
    simulation.run()