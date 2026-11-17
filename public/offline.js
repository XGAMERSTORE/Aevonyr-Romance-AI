/* Offline story engine: deterministic authored Czech interactive fiction, no API, no network. */
(function(){
const scenes={
  affection:['„Když jsi poblíž, je všechno nějak jednodušší,“ přizná {name} a koutky úst jí zacukají úsměvem.','{name} se na chvíli odmlčí. „Mám ráda, když spolu mluvíme. Nechceš tu ještě zůstat?“','„Tohle si budu pamatovat,“ pronese {name} tiše a pohledem vyhledá ten tvůj.'],
  trust:['{name} se opře o okenní rám. „Víš, neříkám to každému. Ale tobě bych možná mohla věřit.“','„Děkuju, že se ptáš,“ odpoví {name}. „Pro mě je důležité, že nasloucháš.“'],
  tension:['{name} zvedne obočí. „Tak takhle se mnou chceš hrát?“ Ve vzduchu visí nevyřčená výzva.','Na okamžik nastane ticho. {name} se pousměje: „Tohle mezi námi začíná být zajímavé.“'],
  question:['{name} se zamyslí. „To je dobrá otázka. A co bys udělal ty, kdyby se role obrátily?“','„Na to neexistuje jednoduchá odpověď,“ řekne {name}. „Ale ráda ti řeknu, jak to vidím já.“'],
  adventure:['{name} otevře dveře do nočního města. „Dobře. Tak jdeme. Ale tentokrát vybíráš cestu ty.“','Za oknem se ozve vzdálené zahřmění. {name} se usměje: „Možná právě začíná naše dobrodružství.“'],
  neutral:['{name} se pohodlně usadí naproti tobě. „Pokračuj. Zajímá mě, kam tím míříš.“','„To bych od tebe nečekala,“ odpoví {name} s pobaveným výrazem. „Pověz mi víc.“']
};
const clamp=n=>Math.max(0,Math.min(100,n));
const choose=(a,n)=>a[n%a.length];
window.offlineStory=function(character,message){
  const t=message.toLocaleLowerCase('cs-CZ'),h=character.history||[],n=h.filter(x=>x.role==='user').length;
  const test=(re)=>re.test(t);
  let mood='neutral',delta={affection:0,trust:0,respect:0,interest:1,tension:0};
  if(test(/milu|lásk|zamil|políb|pusu|objet|romanti|rande|líbíš|miláčk/)){mood='affection';delta.affection=4;delta.trust=1;delta.tension=2}
  else if(test(/věř|důvě|tajem|upřím|promiň|omlouv|děkuj|pomůž|respekt/)){mood='trust';delta.trust=4;delta.respect=2}
  else if(test(/škádl|provok|žárl|výzv|dráž|napětí/)){mood='tension';delta.tension=4;delta.interest=2}
  else if(test(/kam|pojď|jdeme|výlet|cest|procház|les|hrad|dobrodruž/)){mood='adventure';delta.interest=3;delta.trust=1}
  else if(test(/[?]|proč|jak |co |kdy |kde /)){mood='question';delta.interest=2}
  if(test(/nechci|přestaň|stop|nesouhlas|nepříjem/)){mood='trust';delta.respect=3;delta.tension=-3}
  const last=(character.offlineMemory||{});if(!character.offlineMemory)character.offlineMemory={};
  const memory=character.offlineMemory;
  if(test(/mám rád|mám ráda|zbožňuj/)){memory.favorite=message.slice(0,110)}
  if(test(/jmenuji se|jsem [a-zá-ž]{3,}/i)){memory.introduction=message.slice(0,100)}
  const base=choose(scenes[mood],n+character.name.length).replaceAll('{name}',character.name);
  const callback=n>3&&n%5===0&&memory.favorite?' „Vzpomínám si, cos mi říkal: '+memory.favorite.replace(/[<>]/g,'')+'“':'';
  const bond=character.affection>=65?' Její hlas zní důvěrněji než dřív.':character.trust<20?' Zatím si však drží určitý odstup.':'';
  for(const [k,v] of Object.entries(delta))character[k]=clamp((Number(character[k])||0)+v);
  return base+bond+callback+'\n\nCo uděláš dál?';
};
})();
