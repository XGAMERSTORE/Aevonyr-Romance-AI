/* Shared visual state for dialogue, scenery and portrait continuity. */
(function(){
const moods=[
 {id:'romantic',re:/lásk|miluj|políb|pusu|objet|romanti|rande|něžn|pohlad/i,emotion:'něha',action:'usmívá se a přibližuje',place:'balkon při západu slunce'},
 {id:'tense',re:/boj|strach|napět|hád|zlob|žárl|útěk|nebezpeč/i,emotion:'napětí',action:'ostražitě se rozhlíží',place:'deštivá noční ulice'},
 {id:'sad',re:/smut|pláč|slz|bolí|ztrát|stýská/i,emotion:'smutek',action:'sklopí pohled',place:'tiché okno za deště'},
 {id:'joy',re:/směj|radost|šťast|vesel|tanč|oslav/i,emotion:'radost',action:'zářivě se usmívá',place:'rozzářená slavnostní zahrada'},
 {id:'adventure',re:/les|výlet|cest|jdeme|hrad|dobrodruž|moře/i,emotion:'zvědavost',action:'vyráží vpřed',place:'tajemná stezka v lese'}
];
window.sceneFromStory=function(c,msg,reply){
 const t=(msg+' '+(reply||'')).slice(-3000);
 const found=moods.find(m=>m.re.test(t))||{id:'calm',emotion:'klid',action:'pozorně naslouchá',place:'útulná knihovna při svíčkách'};
 const old=c.scene||{};
 const scene={mood:found.id,emotion:found.emotion,action:found.action,place:found.place,appearance:c.appearance||'',character:c.name,updatedAt:Date.now(),revision:(old.revision||0)+1};
 c.scene=scene;return scene;
};
window.sceneGradient=function(mood){
 return ({romantic:'linear-gradient(135deg,#61365c,#c27478 52%,#f5a778)',tense:'linear-gradient(135deg,#10152a,#34455d 55%,#75465c)',sad:'linear-gradient(135deg,#18263b,#47647a 60%,#8d7e9c)',joy:'linear-gradient(135deg,#533763,#a86d78 55%,#efbf78)',adventure:'linear-gradient(135deg,#132f31,#376450 60%,#bd9a67)',calm:'linear-gradient(135deg,#261e3a,#5c3a50 55%,#a77867)'})[mood]||'linear-gradient(135deg,#261e3a,#5c3a50)';
};
})();