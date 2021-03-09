# Introducing ARAM Academy Research 
---
![image](/static/banner_1.png)

As a statistics aggregator, ARAM Academy intrinsically processes a lot of data. ARAM Academy uses part of that per-summoner data to form our user statistics pages. 
In the future, we plan on expanding to encompass per-champion builds. However, there is some analysis that does not fit into either a per-summoner or a per-champion view. 
We will present these findings here in blog format. If you have any interesting hypotheses you would like tested, please make a request in our [Discord Server](https://discord.gg/MydvqhqWmM)

&nbsp;
## This Article: Roles
---
Oftentimes discussion about winrates centers around per-champion winrates.
However winrates are often dependent on the team as a whole. 
Individually, picking 5 of the highest winrate champions does not necessarily yield the highest winrate `team composition`. 
The goal of this project was to examine how winrates varied depending on `role`. 

&nbsp;
## Data
---
![image](/static/winrates_by_role.png)

All our data was sourced from a large set of exclusively high MMR games. Instances without enough data have been excluded from our results. 

The champion role divisions are not mutually exclusive, and many champions fall into multiple classes.
- AD Assassin - physical damage assassins who exceed at last hitting enemy backliners, e.g. Zed, Khazix, Master Yi
- ADC - ranged champions whose power revolves around sustained damage from basic attacks, e.g. Jinx, Twitch, Lucian
- Burst Mage - AP assassins who excel at short trades but have low sustained damage, e.g. Fizz, Evelynn, Syndra
- Bruiser - Melee champions that can be a serious damage threat, though may lack CC to be an effective solo frontline, e.g. Olaf, Aatrox, Jax
- Control Mage - Champions with some sort of zone control, restricting enemy access to some section of the lane, e.g. Heimerdinger, Veigar, Cassiopeia
- Poke - Champions that have great poke at high range, e.g. Jayce, Xerath, Kaisa, KogMaw
- Engage - picks that can solo engage to start a teamfight, e.g. Nautilus, Amumu, Lissandra
- Support - champions that are designed to heal, shield, buff, or peel a strong carry, e.g. Seraphine, Taric, Ivern
- Tank - champions that can act as a frontline to soak up damage and skillshots, e.g. Dr. Mundo, Sett, Chogath
- Waveclear - champions that can safely clear waves of minions at the turret, e.g. Sivir, Ziggs, Ekko

It goes without saying that there is a high degree of subjectivity when choosing which champions go into which role, and into which roles we choose to examine in the first place. We only hope to examine aggregate trends in how well different roles perform in bulk. 

&nbsp;
## Conclusions
---
This test was inspired in part by our hypothesis that the worst team composition in ARAM is one with too many ADCs and not enough support or frontline to enable them. 
This was very much confirmed by the data, which presents interesting finding such as:
- The optimal number of ADCs in a composition is 1 or 2. Winrates drop dramatically for no-ADC comps and ADC-saturated comps. The same pattern, to a lesser degree, was seen for tanks, control mages, poke, and engage. Perhaps these champs provide utility with higher diminishing marginal returns. 

- Supports and waveclear are always great to have on a team, their winrates are monotonically increasing. Perhaps this is driven by high-MMR players capitalizing on early leads and early tower damage. This may also be driven by the dominance of staff of flowing water.

- AD assassins, burst mages, and bruisers fared poorly in high MMR. In general these champions are the easiest to itemize against in larger numbers. 

- In general, team compositions with higher role-diversity perform better than compositions with lower diversity. For most roles, having more than 2 members of the same role dramatically reduced the team compositions winrate.


&nbsp;
## Future Work
---
The key limitation of this study was that we examined roles one at a time. In practice, roles on a team interact with each other. ADCs are better with supports, assassins are enabled by poke and engage. We plan on generalizing this work with a machine learning model that predicts the numeric strength of any given ARAM composition. 
