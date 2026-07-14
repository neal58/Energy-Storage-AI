export const SURNAME_PROFILES = {
  陈:{pinyin:'chén',tone:2,initial:'ch',final:'en'},林:{pinyin:'lín',tone:2,initial:'l',final:'in'},
  王:{pinyin:'wáng',tone:2,initial:'w',final:'ang'},李:{pinyin:'lǐ',tone:3,initial:'l',final:'i'},
  张:{pinyin:'zhāng',tone:1,initial:'zh',final:'ang'},刘:{pinyin:'liú',tone:2,initial:'l',final:'iu'},
  杨:{pinyin:'yáng',tone:2,initial:'y',final:'ang'},黄:{pinyin:'huáng',tone:2,initial:'h',final:'uang'},
  赵:{pinyin:'zhào',tone:4,initial:'zh',final:'ao'},周:{pinyin:'zhōu',tone:1,initial:'zh',final:'ou'},
  吴:{pinyin:'wú',tone:2,initial:'w',final:'u'},徐:{pinyin:'xú',tone:2,initial:'x',final:'u'},
  孙:{pinyin:'sūn',tone:1,initial:'s',final:'un'},胡:{pinyin:'hú',tone:2,initial:'h',final:'u'},
  朱:{pinyin:'zhū',tone:1,initial:'zh',final:'u'},高:{pinyin:'gāo',tone:1,initial:'g',final:'ao'},
  何:{pinyin:'hé',tone:2,initial:'h',final:'e'},郭:{pinyin:'guō',tone:1,initial:'g',final:'uo'},
  罗:{pinyin:'luó',tone:2,initial:'l',final:'uo'},梁:{pinyin:'liáng',tone:2,initial:'l',final:'iang'},
  宋:{pinyin:'sòng',tone:4,initial:'s',final:'ong'},郑:{pinyin:'zhèng',tone:4,initial:'zh',final:'eng'},
  谢:{pinyin:'xiè',tone:4,initial:'x',final:'ie'},韩:{pinyin:'hán',tone:2,initial:'h',final:'an'},
  唐:{pinyin:'táng',tone:2,initial:'t',final:'ang'},沈:{pinyin:'shěn',tone:3,initial:'sh',final:'en'},
  苏:{pinyin:'sū',tone:1,initial:'s',final:'u'},江:{pinyin:'jiāng',tone:1,initial:'j',final:'iang'}
};

export const MATERNAL_SYMBOLS = {
  林:['生长','清润','自然'],江:['开阔','流动','清朗'],周:['周全','秩序','稳重'],
  明:['光明','清晰'],安:['平安','从容'],杨:['生长','向上'],李:['成长','丰实'],
  王:['担当','稳重'],陈:['沉静','积淀'],苏:['舒展','清雅'],沈:['沉静','深远']
};

const C = (char,pinyin,tone,initial,final,gender,roles,meanings,styles,birthTags,commonness=4,writing=4,popularity=3)=>({char,pinyin,tone,initial,final,gender,roles,meanings,styles,birthTags,commonness,writing,popularity});

export const CHARACTERS = [
  C('知','zhī',1,'zh','i','neutral',['mind','first','single'],['智慧','明理'],['书卷','现代'],['明晰','进取'],5,5,4),
  C('思','sī',1,'s','i','neutral',['mind','first','single'],['智慧','思考'],['书卷','温润'],['沉静','明晰'],5,5,4),
  C('怀','huái',2,'h','uai','boy',['state','first'],['胸怀','品格'],['温润','稳重'],['温和','安定'],4,4,2),
  C('修','xiū',1,'x','iu','boy',['action','first','single'],['修养','成长'],['古典','稳重'],['进取','坚定'],5,4,3),
  C('守','shǒu',3,'sh','ou','boy',['action','first'],['坚守','责任'],['稳重','简洁'],['坚定','安定'],5,5,2),
  C('嘉','jiā',1,'j','ia','neutral',['quality','first','single'],['美好','品格'],['温润','古典'],['和煦','丰实'],5,5,4),
  C('清','qīng',1,'q','ing','neutral',['quality','scene','first','single'],['清正','清澈'],['清雅','清朗'],['清润','澄澈'],5,5,4),
  C('明','míng',2,'m','ing','neutral',['quality','scene','first','single'],['光明','智慧'],['清朗','简洁'],['明朗','晨光','明晰'],5,5,5),
  C('安','ān',1,'','an','neutral',['state','first','single'],['平安','从容'],['温润','简洁'],['安宁','安定','沉静'],5,5,5),
  C('景','jǐng',3,'j','ing','neutral',['scene','first'],['光景','开阔'],['清朗','古典'],['明朗','开阔','晨光'],5,5,4),
  C('书','shū',1,'sh','u','neutral',['mind','first','single'],['学识','智慧'],['书卷','现代'],['沉静','明晰'],5,5,4),
  C('承','chéng',2,'ch','eng','boy',['action','first'],['担当','传承'],['稳重','温润'],['坚定','成长'],5,4,4),
  C('允','yǔn',3,'y','un','neutral',['quality','first'],['诚信','公允'],['温润','古典'],['和煦','秩序'],4,4,2),
  C('若','ruò',4,'r','uo','girl',['quality','first'],['温和','从容'],['温润','现代'],['和煦','舒展'],5,5,4),
  C('静','jìng',4,'j','ing','girl',['state','first','single'],['沉静','品格'],['端庄','温润'],['沉静','安宁'],5,5,4),
  C('舒','shū',1,'sh','u','girl',['state','first','single'],['舒展','从容'],['温润','简洁'],['舒展','温和'],5,5,4),
  C('昭','zhāo',1,'zh','ao','neutral',['scene','quality','first'],['光明','明朗'],['古典','清朗'],['晨光','明朗'],4,4,2),
  C('谨','jǐn',3,'j','in','neutral',['quality','first'],['谨慎','品格'],['稳重','书卷'],['秩序','沉静'],5,4,2),
  C('弘','hóng',2,'h','ong','boy',['quality','first'],['宏大','志向'],['稳重','古典'],['开阔','进取'],4,4,2),
  C('敬','jìng',4,'j','ing','neutral',['quality','first'],['敬重','品格'],['稳重','古典'],['秩序','坚定'],5,4,3),
  C('云','yún',2,'y','un','neutral',['scene','first','single'],['自在','开阔'],['自然','温润'],['舒展','流动'],5,5,4),
  C('禾','hé',2,'h','e','neutral',['nature','first','second','single'],['成长','丰收'],['自然','简洁'],['生长','收获'],5,5,3),
  C('松','sōng',1,'s','ong','boy',['nature','first','single'],['坚韧','品格'],['自然','古典'],['坚韧','坚定'],5,4,3),
  C('竹','zhú',2,'zh','u','neutral',['nature','first','single'],['正直','成长'],['自然','古典'],['生长','清润'],5,5,2),
  C('言','yán',2,'y','an','neutral',['mind','first','second','single'],['表达','诚信'],['书卷','现代'],['明晰','秩序'],5,5,4),
  C('予','yǔ',3,'y','u','girl',['action','first'],['给予','温和'],['现代','温润'],['温和','舒展'],5,5,3),
  C('和','hé',2,'h','e','neutral',['quality','first','second','single'],['温和','和谐'],['温润','简洁'],['和煦','安宁'],5,5,4),
  C('宁','níng',2,'n','ing','neutral',['state','first','second','single'],['安宁','从容'],['温润','简洁'],['安宁','沉静'],5,5,5),
  C('初','chū',1,'ch','u','girl',['time','first','second'],['初心','开始'],['现代','清朗'],['初始','晨光'],5,5,4),
  C('朝','zhāo',1,'zh','ao','neutral',['time','first'],['朝气','希望'],['清朗','自然'],['晨光','初始'],4,4,2),
  C('晏','yàn',4,'y','an','neutral',['time','second','state'],['安宁','平和'],['古典','温润'],['安宁','收束'],4,4,2),
  C('澄','chéng',2,'ch','eng','neutral',['scene','second','single'],['澄澈','清明'],['清朗','自然'],['澄澈','清润'],4,3,2),
  C('远','yuǎn',3,'y','uan','boy',['direction','second','single'],['志向','远见'],['稳重','书卷'],['深远','进取'],5,5,4),
  C('齐','qí',2,'q','i','neutral',['direction','second'],['向善','进取'],['书卷','古典'],['进取','秩序'],5,5,3),
  C('谦','qiān',1,'q','ian','boy',['virtue','second','single'],['谦逊','品格'],['温润','稳重'],['温和','秩序'],5,4,3),
  C('正','zhèng',4,'zh','eng','boy',['principle','second','single'],['正直','原则'],['稳重','简洁'],['坚定','秩序'],5,5,3),
  C('哲','zhé',2,'zh','e','neutral',['wisdom','second','single'],['智慧','明理'],['稳重','书卷'],['明晰','沉静'],5,4,4),
  C('毅','yì',4,'y','i','boy',['virtue','second','single'],['坚毅','志向'],['稳重','简洁'],['坚韧','坚定'],5,4,3),
  C('礼','lǐ',3,'l','i','neutral',['principle','second','single'],['礼度','品格'],['稳重','古典'],['秩序','温和'],5,5,3),
  C('仪','yí',2,'y','i','girl',['virtue','second','single'],['仪度','品格'],['端庄','书卷'],['秩序','温和'],5,5,3),
  C('衡','héng',2,'h','eng','boy',['wisdom','second','single'],['权衡','判断'],['现代','稳重'],['明晰','秩序'],4,3,2),
  C('成','chéng',2,'ch','eng','neutral',['direction','second','single'],['成就','成长'],['简洁','稳重'],['成长','收获'],5,5,4),
  C('然','rán',2,'r','an','neutral',['state','second','single'],['自然','从容'],['现代','简洁'],['舒展','安定'],5,5,4),
  C('宜','yí',2,'y','i','girl',['virtue','second','single'],['得体','安适'],['端庄','稳妥'],['安宁','秩序'],5,5,4),
  C('朗','lǎng',3,'l','ang','boy',['quality','second','single'],['明朗','开阔'],['清朗','简洁'],['明朗','开阔'],5,5,4),
  C('乔','qiáo',2,'q','iao','girl',['nature','second','single'],['高远','成长'],['自然','诗意'],['生长','开阔'],5,5,3),
  C('川','chuān',1,'ch','uan','neutral',['nature','second','single'],['开阔','流动'],['自然','现代'],['流动','开阔'],5,5,3),
  C('恺','kǎi',3,'k','ai','boy',['virtue','second','single'],['和乐','宽厚'],['温润','现代'],['和煦','温和'],4,4,2),
  C('珩','héng',2,'h','eng','neutral',['virtue','second'],['端正','珍重'],['书卷','古典'],['秩序'],3,2,1),
  C('朴','pǔ',3,'p','u','boy',['virtue','second','single'],['质朴','真诚'],['简洁','稳重'],['坚定','安定'],4,4,1),
  C('真','zhēn',1,'zh','en','neutral',['virtue','second','single'],['真诚','品格'],['简洁','现代'],['明晰','坚定'],5,5,3),
  C('善','shàn',4,'sh','an','neutral',['virtue','second','single'],['善良','向善'],['温润','古典'],['温和','和煦'],5,4,3),
  C('卓','zhuó',2,'zh','uo','boy',['direction','second','single'],['卓越','进取'],['现代','稳重'],['进取','开阔'],5,4,3),
  C('达','dá',2,'d','a','boy',['direction','second','single'],['通达','成就'],['稳重','简洁'],['进取','明晰'],5,5,3),
  C('新','xīn',1,'x','in','neutral',['time','second','single'],['新生','成长'],['现代','简洁'],['初始','生长'],5,5,4),
  C('华','huá',2,'h','ua','neutral',['quality','second','single'],['美好','丰盛'],['古典','稳重'],['丰实','明朗'],5,5,4),
  C('舟','zhōu',1,'zh','ou','neutral',['nature','second','single'],['行进','方向'],['自然','现代'],['流动','进取'],5,5,3),
  C('山','shān',1,'sh','an','boy',['nature','second','single'],['坚定','稳重'],['自然','简洁'],['坚韧','开阔'],5,5,3),
  C('一','yī',1,'y','i','neutral',['quality','first','single'],['专一','纯粹'],['现代','简洁'],['明晰'],5,5,5)
];

export const CHARACTER_MAP = new Map(CHARACTERS.map(item => [item.char, item]));

export const PAIRS = {
  知:['远','齐','谦','衡','哲','礼','成','朗'],思:['远','齐','哲','成','宁','然','善','新'],
  怀:['谦','远','安','宁','礼','善','真','毅'],修:['远','齐','正','毅','成','礼','善','然'],
  守:['正','礼','信','安','成','朴','真','远'],嘉:['言','禾','宁','礼','仪','善','成','宜'],
  清:['和','宁','远','朗','澄','宜','言','正'],明:['远','哲','谦','朗','礼','成','澄','正'],
  安:['和','宁','然','礼','宜','远','澄','成'],景:['明','澄','远','朗','川','和','宁','成'],
  书:['远','衡','宁','仪','言','礼','成','然'],承:['安','礼','远','毅','成','正','和','宁'],
  允:['和','宁','礼','善','成','宜','真','哲'],若:['宁','安','宜','和','然','清','仪','乔'],
  静:['姝','宜','宁','安','仪','和','然','清'],舒:['宁','然','和','宜','朗','远','清','仪'],
  昭:['宁','明','远','和','澄','朗','宜','成'],谨:['言','礼','行','正','安','和','真','善'],
  弘:['毅','远','正','达','成','礼','哲','朗'],敬:['言','礼','安','和','正','善','成','宁'],
  云:['舒','宁','朗','远','川','舟','澄','和'],禾:['宁','安','宜','川','新','成','和','朗'],
  松:['毅','远','正','安','成','朗','山','川'],竹:['清','宁','安','和','远','宜','成','朗'],
  言:['真','善','远','成','宁','和','礼','哲'],予:['安','宁','和','然','宜','清','善','新'],
  和:['宁','安','宜','远','成','朗','真','善'],宁:['安','和','远','成','宜','朗','澄','然'],
  初:['宁','安','和','朗','新','远','宜','澄'],朝:['远','朗','明','新','成','宁','舟','川'],
  一:['诺','宁','安','清','然','禾','远','真']
};

const EXTRA = {
  姝:C('姝','shū',1,'sh','u','girl',['virtue','second'],['美好','端庄'],['古典','温润'],['温和'],4,4,2),
  行:C('行','xíng',2,'x','ing','boy',['direction','second'],['行动','志向'],['古典','稳重'],['进取'],4,5,2),
  信:C('信','xìn',4,'x','in','neutral',['principle','second'],['诚信','品格'],['稳重','简洁'],['秩序'],5,5,3),
  诺:C('诺','nuò',4,'n','uo','neutral',['virtue','second'],['承诺','诚信'],['现代','温润'],['秩序'],5,5,5)
};
for (const [char, fact] of Object.entries(EXTRA)) CHARACTER_MAP.set(char, fact);

export const RELATION_LABELS = {
  mind:'认知与思考',state:'内在状态',action:'行动与修养',quality:'品格与气质',scene:'意象与境界',
  time:'时间意象',nature:'自然意象',direction:'方向与成长',virtue:'品格核心',principle:'原则与尺度',wisdom:'智慧与判断'
};
