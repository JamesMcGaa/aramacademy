from constants import BOOT_NAMES, URLS
import requests

# returns {item_id: {name: ..., finished: ...}}
def get_item_dict():
    items_json = requests.get(URLS['items']).json()
    item_dict = {}
    for entry in items_json:
        name = entry["name"]
        price = entry["priceTotal"]
        is_boots = name in BOOT_NAMES
        item_dict[entry["id"]] = {
            "name": name,
            "finished": (price > 2000) and ("ornnIcon" not in name),
            "is_boots": is_boots,
            "price": price
        }
    return item_dict

# returns {champ_id: name}
def get_champ_dict():
    champ_json = requests.get(URLS['champions']).json()
    champ_dict = {}
    for entry in champ_json:
        if entry["id"] > 0:
            champ_dict[entry["id"]] = entry["name"]
    return champ_dict

# returns {id: name}
def get_normal_dict_(url):
    jsn = requests.get(url).json()
    data_dict = {}
    for entry in jsn:
        data_dict[entry["id"]] = entry["name"]
    return data_dict
        
# returns {summ_id: name}
def get_summoner_spell_dict():
    return get_normal_dict_(URLS['summoners'])

# returns {style_id: name}
def get_perk_styles_dict():
    jsn = requests.get(URLS['perk_styles']).json()
    perk_styles_dict = {}
    for entry in jsn["styles"]:
        perk_styles_dict[entry["id"]] = entry["name"]
    return perk_styles_dict

# returns {perk_id: name}
def get_perks_dict():
    return get_normal_dict_(URLS['perks'])

class Resources:
    def __init__(self):
        self.champ = get_champ_dict()
        self.items = get_item_dict()
        self.perk_styles = get_perk_styles_dict()
        self.perks = get_perks_dict()
        self.summoners = get_summoner_spell_dict()