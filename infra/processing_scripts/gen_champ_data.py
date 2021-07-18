from constants import DEFAULT_PAGES
from data_dragon_endpoints import Resources
import json
import os
import sys

resources = Resources()

def create_champ_data_dict():
    champ_data_dict = {}
    champions = resources.champ.values()
    for champion in champions:
        entry = {
            "champion": champion,
            "wins": 0,
            "total_games": 0,
            "ability_order": {},
            "summoners": {},
            "runes": {},
            "starting_items": {},
            "core_items": {},
            "item_4": {},
            "item_5": {},
            "item_6": {},
        }
        champ_data_dict[champion] = entry
    return champ_data_dict


def get_participant_events(participant_id, frame):
    participant_events = filter(lambda x: x.__contains__('participantId') and (x["participantId"] == participant_id), frame["events"])
    return participant_events

def get_all_participant_events(participant_id, timeline):
    events = []
    for frame in timeline["frames"]:
        frame_events = get_participant_events(participant_id, frame)
        events.extend(frame_events)
    return events

def filter_event_type(events, event_type):
    filtered_events = filter(lambda x: x["type"] == event_type, events)
    return filtered_events

def filter_level_up_events(events):
    level_up_events = filter_event_type(events, "SKILL_LEVEL_UP")
    normal_level_up_events = filter(lambda x: x["levelUpType"] == "NORMAL", level_up_events)
    return normal_level_up_events

def get_starting_items(participant_id, timeline):
    first_frame = timeline["frames"][1]
    participant_events = get_participant_events(participant_id, first_frame)
    purchased_item_events = filter_event_type(participant_events, "ITEM_PURCHASED")
    sold_item_events = filter_event_type(participant_events, "ITEM_SOLD")
    item_ids = [event["itemId"] for event in purchased_item_events]
    for sold_item_event in sold_item_events:
        item_ids.remove(sold_item_event["itemId"])
    total = sum([resources.items[i]["price"] for i in item_ids])
    if total > 1400:
        return None
    return sorted(item_ids)

def get_ability_order_from_timeline(participant_id, timeline):
    participant_events = get_all_participant_events(participant_id, timeline)
    level_up_events = filter_level_up_events(participant_events)
    ability_order = map(lambda x: {1: 'Q', 2: 'W', 3: 'E', 4: 'R'}[x["skillSlot"]], level_up_events)
    return tuple(ability_order)

def get_finished_item_at_index(participant_id, timeline, index):
    participant_events = get_all_participant_events(participant_id, timeline)
    purchased_item_events = filter_event_type(participant_events, "ITEM_PURCHASED")
    if index >= 3:
        finished_item_events = list(filter(lambda x: resources.items[x["itemId"]]["finished"], purchased_item_events))
    else:
        finished_item_events = list(filter(lambda x: resources.items[x["itemId"]]["finished"] or resources.items[x["itemId"]]["is_boots"], purchased_item_events))
    if len(finished_item_events) <= index:
        return 0
    item_id = finished_item_events[index]["itemId"]
    return item_id

def update_entry_with_value(entry, value, win):
    if value == None:
        return
    if value in entry.keys():
        entry[value] = (entry[value][0] + win, entry[value][1] + 1)
    else:
        entry[value] = (int(win), 1)

def get_item_if_not_zero(item_id):
    if item_id == 0:
        return None
    return resources.items[item_id]["name"]

def get_field_if_not_zero(thing_id, dct):
    if thing_id == 0:
        return None
    return dct[thing_id]

def get_field_if_exists(dct, key):
    if dct.__contains__(key):
        return dct[key]
    return 0

def update_champ_data_dict(participant, timeline, champ_data_dict):
    win = participant["stats"]["win"]
    participant_id = participant["participantId"]
    champion_id = participant["championId"]
    summoner_spell_1_id = participant["spell1Id"]
    summoner_spell_2_id = participant["spell2Id"]
    primary_path_id = get_field_if_exists(participant["stats"], "perkPrimaryStyle")
    secondary_path_id = get_field_if_exists(participant["stats"], "perkSubStyle")
    rune_keystone_id = get_field_if_exists(participant["stats"], "perk0")
    rune_primary_0_id = get_field_if_exists(participant["stats"], "perk1")
    rune_primary_1_id = get_field_if_exists(participant["stats"], "perk2")
    rune_primary_2_id = get_field_if_exists(participant["stats"], "perk3")
    rune_secondary_0_id = get_field_if_exists(participant["stats"], "perk4")
    rune_secondary_1_id = get_field_if_exists(participant["stats"], "perk5")
    rune_stat_0_id = get_field_if_exists(participant["stats"], "statPerk0")
    rune_stat_1_id = get_field_if_exists(participant["stats"], "statPerk1")
    rune_stat_2_id = get_field_if_exists(participant["stats"], "statPerk2")     
    starting_item_ids = get_starting_items(participant_id, timeline)
    finished_item_0_id = get_finished_item_at_index(participant_id, timeline, 0)
    finished_item_1_id = get_finished_item_at_index(participant_id, timeline, 1)
    finished_item_2_id = get_finished_item_at_index(participant_id, timeline, 2)
    finished_item_3_id = get_finished_item_at_index(participant_id, timeline, 3)
    finished_item_4_id = get_finished_item_at_index(participant_id, timeline, 4)
    finished_item_5_id = get_finished_item_at_index(participant_id, timeline, 5)


    ability_order = get_ability_order_from_timeline(participant_id, timeline)
    champion = resources.champ[champion_id]
    summoner_spell_1 = resources.summoners[summoner_spell_1_id]
    summoner_spell_2 = resources.summoners[summoner_spell_2_id]
    primary_path = get_field_if_not_zero(primary_path_id, resources.perk_styles)
    secondary_path = get_field_if_not_zero(secondary_path_id, resources.perk_styles)
    rune_keystone = get_field_if_not_zero(rune_keystone_id, resources.perks)
    rune_primary_0 = get_field_if_not_zero(rune_primary_0_id, resources.perks)
    rune_primary_1 = get_field_if_not_zero(rune_primary_1_id, resources.perks)
    rune_primary_2 = get_field_if_not_zero(rune_primary_2_id, resources.perks)
    rune_secondary_0 = get_field_if_not_zero(rune_secondary_0_id, resources.perks)
    rune_secondary_1 = get_field_if_not_zero(rune_secondary_1_id, resources.perks)
    rune_stat_0 = get_field_if_not_zero(rune_stat_0_id, resources.perks)
    rune_stat_1 = get_field_if_not_zero(rune_stat_1_id, resources.perks)
    rune_stat_2 = get_field_if_not_zero(rune_stat_2_id, resources.perks)
    if starting_item_ids != None:
        starting_items = tuple(map(lambda x: resources.items[x]["name"], starting_item_ids))
    else:
        starting_items = None
    finished_item_0 = get_item_if_not_zero(finished_item_0_id)
    finished_item_1 = get_item_if_not_zero(finished_item_1_id)
    finished_item_2 = get_item_if_not_zero(finished_item_2_id)
    finished_item_3 = get_item_if_not_zero(finished_item_3_id)
    finished_item_4 = get_item_if_not_zero(finished_item_4_id)
    finished_item_5 = get_item_if_not_zero(finished_item_5_id)

    champ_entry = champ_data_dict[champion]
    champ_entry["wins"] = champ_entry["wins"] + win
    champ_entry["total_games"] = champ_entry["total_games"] + 1
    if champion == "Azir":
        ability_order_list = list(ability_order)
        ability_order_list.insert(0, 'W')
        ability_order = tuple(ability_order_list)
    if len(ability_order) >= 18:
        update_entry_with_value(champ_entry["ability_order"], ability_order, win)
    summoners = tuple(sorted([summoner_spell_1, summoner_spell_2]))
    update_entry_with_value(champ_entry["summoners"], summoners, win)
    runes = (primary_path, rune_keystone, rune_primary_0, rune_primary_1, rune_primary_2,
            secondary_path, rune_secondary_0, rune_secondary_1, rune_stat_0, rune_stat_1, rune_stat_2)
    if (primary_path, rune_keystone, rune_primary_0, rune_primary_1, rune_primary_2,
            secondary_path, rune_secondary_0, rune_secondary_1) not in DEFAULT_PAGES:
        update_entry_with_value(champ_entry["runes"], runes, win)
    update_entry_with_value(champ_entry["starting_items"], starting_items, win)
    core_items = (finished_item_0, finished_item_1, finished_item_2)
    if None in list(core_items):
        core_items = None
    update_entry_with_value(champ_entry["core_items"], core_items, win)
    update_entry_with_value(champ_entry["item_4"], finished_item_3, win)
    update_entry_with_value(champ_entry["item_5"], finished_item_4, win)
    update_entry_with_value(champ_entry["item_6"], finished_item_5, win)


def remove_low_count_entries(field, percent, champ_data_dict):
    for entry in champ_data_dict.values():
        total_games = 0
        for val in entry[field].values():
            total_games += val[1]

        to_pop = []
        for key, value in entry[field].items():
            if value[1] < total_games * percent:
                to_pop.append(key)

        for key in to_pop:
            entry[field].pop(key)


def remove_all_low_count_entries(champ_data_dict):
    remove_low_count_entries("ability_order", .05, champ_data_dict)
    remove_low_count_entries("summoners", .05, champ_data_dict)
    remove_low_count_entries("runes", .001, champ_data_dict)
    remove_low_count_entries("starting_items", .02, champ_data_dict)
    remove_low_count_entries("core_items", .02, champ_data_dict)
    remove_low_count_entries("item_4", .05, champ_data_dict)
    remove_low_count_entries("item_5", .05, champ_data_dict)
    remove_low_count_entries("item_6", .05, champ_data_dict)

def get_tier(winrate):
    thresholds = [(1.0, .54, "S"), (.54, .52, "A"), (.52, .49, "B"), (.49, .47, "C"), (.47, 0.0, "D")]

    tier = ""
    for upper, lower, tier_name in thresholds:
        if winrate <= upper and winrate >= lower:
            tier = tier_name

    return tier

def get_top_k_entries(entry, k):
    top_entries = []
    for key, value in entry.items():
        top_entries.append((key, value))
    top_entries = sorted(top_entries, key=lambda x: x[1][0]/x[1][1], reverse=True)
    if len(top_entries) > k:
        top_entries = top_entries[:k]
    return top_entries

def get_top_k_entries_with_winrate(entry, k, name):
    top_entries = get_top_k_entries(entry, k)
    output_entries = []
    for key, value in top_entries:
        if isinstance(key, str):
            payload = [key]
        else:
            payload = list(key)
        e = {
            name: payload,
            f'{name}_winrate': value[0]/value[1]
        }
        output_entries.append(e)
    return output_entries

def get_ability_levels(ability_entry):
    top_abilities = get_top_k_entries(ability_entry, 1)
    if len(top_abilities) == 0:
        return {}
    top = get_top_k_entries(ability_entry, 1)[0]
    q, w, e, r = [], [], [], []
    for i, ability in enumerate(list(top[0])):
        if ability == 'Q':
            q.append(i+1)
        elif ability == 'W':
            w.append(i+1)
        elif ability == 'E':
            e.append(i+1)
        else:
            r.append(i+1)
    entry = {
        "Q": q,
        "W": w,
        "E": e,
        "R": r
    }
    return entry

def get_ability_order(ability_entry):
    def last_val_if_not_empty(arr):
        if len(arr) == 0:
            return 100
        return arr[-1]

    def field_if_exists(dct, field):
        if dct.__contains__(field):
            return dct[field]
        return []

    levels = get_ability_levels(ability_entry)
    q, w, e = field_if_exists(levels, 'Q'), field_if_exists(levels, 'W'), field_if_exists(levels, 'E')
    l = [('Q', last_val_if_not_empty(q)), ('W', last_val_if_not_empty(w)), ('E', last_val_if_not_empty(e))]
    l = sorted(l, key=lambda x: x[1])
    l = list(map(lambda x: x[0], l))
    return l

def get_runes_entry(runes_entry):
    unique_keystones = set()
    for key in runes_entry.keys():
        unique_keystones.add(key[1])
    unique_keystone_entries = {}
    for keystone in unique_keystones:
        top_wr_entry, top_wr = None, -1
        for key, value in runes_entry.items():
            if key[1] == keystone and value[0]/value[1] > top_wr:
                top_wr_entry = (key, value)
                top_wr = value[0]/value[1]
        unique_keystone_entries[top_wr_entry[0]] = top_wr_entry[1]

    for key, value in unique_keystone_entries.items():
        keystone, secondary_path = key[1], key[5]
        wins, games = 0, 0
        for key_1, value_1 in runes_entry.items():
            if key_1[1] == keystone and key_1[5] == secondary_path:
                wins += value_1[0]
                games += value_1[1]
        unique_keystone_entries[key] = (wins, games)


    unique_keystone_entries = get_top_k_entries(unique_keystone_entries, 5)
    output, i = [], 0
    for key, value in unique_keystone_entries:
        output_entry = {
            "runes_primary": key[0],
            "runes_primary_list": [key[1], key[2], key[3], key[4]],
            "runes_secondary": key[5],
            "runes_secondary_list": [key[6], key[7]],
            "runes_stats": [key[8], key[9], key[10]],
            "runes_index": i,
            "runes_winrate": value[0]/value[1]
        }
        output.append(output_entry)
        i += 1
    
    return output

def create_output_json(champ_data_dict, total_games):
    output_json = {}
    for champion, entry in champ_data_dict.items():
        output_entry = {}
        output_entry["champion"] = champion
        output_entry["winrate"] = entry["wins"] / max(entry["total_games"], 1)
        output_entry["total_games"] = entry["total_games"]
        output_entry["pickrate"] = entry["total_games"] / total_games
        output_entry["tier"] = get_tier(output_entry["winrate"])
        output_entry["runes"] = get_runes_entry(entry["runes"])
        output_entry["abilities_order"] = get_ability_order(entry["ability_order"])
        output_entry["abilities_levels"] = get_ability_levels(entry["ability_order"])
        output_entry["items_json"] = {
            "Starting Items": get_top_k_entries_with_winrate(entry["starting_items"], 2, "items"),
            "Mythic and Core Items": get_top_k_entries_with_winrate(entry["core_items"], 2, "items"),
            "Fourth Item Options": get_top_k_entries_with_winrate(entry["item_4"], 3, "items"),
            "Fifth Item Options": get_top_k_entries_with_winrate(entry["item_5"], 3, "items"),
            "Sixth Item Options": get_top_k_entries_with_winrate(entry["item_6"], 3, "items"),
        }
        output_entry["summoner_spells"] = get_top_k_entries_with_winrate(entry["summoners"], 3, "spells")

        output_json[champion] = output_entry

    return output_json


def main():
    if len(sys.argv) != 3:
        print("Usage: python gen_champ_data.py [path to games folder] [path to output json]")
        quit()

    champ_data_dict = create_champ_data_dict()

    i = 1
    for file in os.scandir(sys.argv[1]):
        if i  % 1000 == 0:
            print(f'Processing game {i}')
        i += 1
        with open(file.path, encoding='utf-8') as f:
            gamedata = json.load(f)
            match = gamedata['match']
            timeline = gamedata['timeline']

            for participant in match["participants"]:
                update_champ_data_dict(participant, timeline, champ_data_dict)

    remove_all_low_count_entries(champ_data_dict)

    output_json = create_output_json(champ_data_dict, i-1)
    with open(sys.argv[2], 'w', encoding='utf-8') as f:
        json.dump(output_json, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()