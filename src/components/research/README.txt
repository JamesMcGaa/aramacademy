# Introducing ARAM Academy Research 
---
As a statistics aggregator, ARAM Academy intrinsically processes a lot of data. ARAM Academy uses part of that per-summoner data to form our user statistics pages. 
In the future, we plan on expanding to encompass per-champion builds. However, there is some analysis that does not fit into either a per-summoner or a per-champion view. 
We will present these findings here in blog format. If you have any interesting hypotheses you would like tested, please make a request in our [Discord Server](https://discord.gg/MydvqhqWmM)

&nbsp;
## This Article: Roles
---
Often times discussion about winrates centers around per-champion winrates.
However winrates are often dependent on the team as a whole. 
Individually, picking 5 of the highest winrate champions does not necessarily yield the highest winrate `team composition`. 
The goal of this project was to examine how winrates varied depending on `role`. 

&nbsp;
## Data
---
![image](/static/winrates_by_role.png)

All our data was sourced from a large set of exclusively high MMR games. Instances without enough data have been excluded from our results. 

&nbsp;
## Conclusions
---
This test was inspired in part by our hypothesis that the worst team composition in ARAM is one with too many ADCs and not enough support or frontline to enable them. 
This was very much confirmed by the data, which presents interesting finding such as:
- The optimal number of ADCs in a composition is 1 or 2. Winrates drop dramatically for no-ADC comps and ADC-saturated comps

- Supports and waveclear are always great to have on a team, their winrates are monotonically increasing. Perhaps this is drive by high-MMR players capitalizing on early leads and early tower damage. 

- AD assassins and burst mages fared poorly in high MMR. 

- In general, team compositions with higher role-diversity perform better than compositions with lower diversity.



&nbsp;
## Future Work
---
We plan on generalizing this work with a machine learning model that predicts the strength of any given ARAM composition. 