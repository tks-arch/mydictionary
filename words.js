// 単語辞書データ
// ========================================
// 動詞の活用形（すべての活用形で共通参照）
// ========================================

// be動詞
const be = "be です/いる\n過去形 was, were\n過去分詞形 been";

// begin
const begin = "begin 始まる\n過去形 began\n過去分詞形 begun";

// get
const get = "get 得る/なる\n過去形 got\n過去分詞形 got/gotten";

// tire
const tire = "tire 疲れる\n過去形 tired\n過去分詞形 tired";

// sit
const sit = "sit 座る\n過去形 sat\n過去分詞形 sat";

// have
const have = "have 持つ\n過去形 had\n過去分詞形 had";

// do
const doVerb = "do する\n過去形 did\n過去分詞形 done";

// peep
const peep = "peep 覗く\n過去形 peeped\n過去分詞形 peeped";

// read
const read = "read 読む\n過去形 read\n過去分詞形 read";

// think
const think = "think 思う\n過去形 thought\n過去分詞形 thought";

// consider
const consider = "consider 考える\n過去形 considered\n過去分詞形 considered";

// make
const make = "make 作る\n過去形 made\n過去分詞形 made";

// feel
const feel = "feel 感じる\n過去形 felt\n過去分詞形 felt";

// can
const can = "can できる\n過去形 could";

// run
const run = "run 走る\n過去形 ran\n過去分詞形 run";

// hear
const hear = "hear 聞く\n過去形 heard\n過去分詞形 heard";

// say
const say = "say 言う\n過去形 said\n過去分詞形 said";

// shall/should
const shall = "shall ~だろう\n過去形 should";

// ought
const ought = "ought ~すべきだ";

// will/would
const will = "will ~だろう/~するだろう\n過去形 would";

// wonder
const wonder = "wonder 不思議に思う\n過去形 wondered\n過去分詞形 wondered";

// seem
const seem = "seem ~のように見える\n過去形 seemed\n過去分詞形 seemed";

// take
const take = "take 取る\n過去形 took\n過去分詞形 taken";

// look
const look = "look 見る\n過去形 looked\n過去分詞形 looked";

// hurry
const hurry = "hurry 急ぐ\n過去形 hurried\n過去分詞形 hurried";

// start
const start = "start 始まる/始める\n過去形 started\n過去分詞形 started";

// flash
const flash = "flash ひらめく\n過去形 flashed\n過去分詞形 flashed";

// see
const see = "see 見る\n過去形 saw\n過去分詞形 seen";

// burn
const burn = "burn 燃える\n過去形 burned/burnt\n過去分詞形 burned/burnt";

// go
const go = "go 行く\n過去形 went\n過去分詞形 gone";

// dip
const dip = "dip 下がる/浸す\n過去形 dipped\n過去分詞形 dipped";

// find
const find = "find 見つける\n過去形 found\n過去分詞形 found";

// fall
const fall = "fall 落ちる\n過去形 fell\n過去分詞形 fallen";

// stop
const stop = "stop 止まる\n過去形 stopped\n過去分詞形 stopped";

// happen
const happen = "happen 起こる\n過去形 happened\n過去分詞形 happened";

// try
const tryVerb = "try 試す\n過去形 tried\n過去分詞形 tried";

// come
const come = "come 来る\n過去形 came\n過去分詞形 come";

// notice
const notice = "notice 気づく\n過去形 noticed\n過去分詞形 noticed";

// fill
const fill = "fill 満たす\n過去形 filled\n過去分詞形 filled";

// hang
const hang = "hang 掛ける\n過去形 hung\n過去分詞形 hung";

// pass
const pass = "pass 通り過ぎる\n過去形 passed\n過去分詞形 passed";

// label
const label = "label ラベルを貼る\n過去形 labelled\n過去分詞形 labelled";

// like
const like = "like 好む\n過去形 liked\n過去分詞形 liked";

// drop
const drop = "drop 落とす\n過去形 dropped\n過去分詞形 dropped";

// kill
const kill = "kill 殺す\n過去形 killed\n過去分詞形 killed";

// manage
const manage = "manage なんとかする\n過去形 managed\n過去分詞形 managed";

// put
const put = "put 置く\n過去形 put\n過去分詞形 put";

// tumble
const tumble = "tumble 転げ落ちる\n過去形 tumbled\n過去分詞形 tumbled";

// pick
const pick = "pick 摘む/選ぶ\n過去形 picked\n過去分詞形 picked";

// pop
const pop = "pop ぴょんと飛ぶ\n過去形 popped\n過去分詞形 popped";

// occur
const occur = "occur 起こる/思い浮かぶ\n過去形 occurred\n過去分詞形 occurred";

// ========================================
// 単語辞書（オブジェクト）
// ========================================
const wordsData = {
  // ========================================
  // 助動詞・動詞
  // ========================================
  
  // can/could
  "can": can,
  "could": can,
  
  // shall/should
  "shall": shall,
  "should": shall,
  
  // ought
  "ought": ought,
  
  // will/would
  "will": will,
  "would": will,
  "wouldn t": will,
  
  // be動詞
  "be": be,
  "is": be,
  "was": be,
  "were": be,
  
  // begin（始まる）
  "begin": begin,
  "beginning": begin,
  "began": begin,
  
  // get（得る/なる）
  "get": get,
  "getting": get,
  "got": get,
  
  // tire（疲れる）
  "tire": tire,
  "tired": tire,
  "tiring": tire,
  
  // sit（座る）
  "sit": sit,
  "sitting": sit,
  "sat": sit,
  
  // have（持つ）
  "have": have,
  "has": have,
  "had": have,
  "having": have,
  
  // do（する）
  "do": doVerb,
  "does": doVerb,
  "did": doVerb,
  "doing": doVerb,
  
  // peep（覗く）
  "peep": peep,
  "peeped": peep,
  "peeping": peep,
  
  // read（読む）
  "read": read,
  "reading": read,
  
  // think（思う）
  "think": think,
  "thought": think,
  "thinking": think,
  
  // consider（考える）
  "consider": consider,
  "considering": consider,
  "considered": consider,
  
  // make（作る）
  "make": make,
  "made": make,
  "making": make,
  
  // feel（感じる）
  "feel": feel,
  "felt": feel,
  "feeling": feel,
  
  // run（走る）
  "run": run,
  "ran": run,
  "running": run,
  
  // hear（聞く）
  "hear": hear,
  "heard": hear,
  "hearing": hear,
  
  // say（言う）
  "say": say,
  "said": say,
  "saying": say,
  
  // wonder（不思議に思う）
  "wonder": wonder,
  "wondered": wonder,
  "wondering": wonder,
  
  // seem（~のように見える）
  "seem": seem,
  "seemed": seem,
  "seeming": seem,
  
  // take（取る）
  "take": take,
  "took": take,
  "taken": take,
  "taking": take,
  
  // look（見る）
  "look": look,
  "looked": look,
  "looking": look,
  
  // hurry（急ぐ）
  "hurry": hurry,
  "hurried": hurry,
  "hurrying": hurry,
  
  // start（始まる/始める）
  "start": start,
  "started": start,
  "starting": start,
  
  // flash（ひらめく）
  "flash": flash,
  "flashed": flash,
  "flashing": flash,
  
  // see（見る）
  "see": see,
  "saw": see,
  "seen": see,
  "seeing": see,
  
  // burn（燃える）
  "burn": burn,
  "burned": burn,
  "burnt": burn,
  "burning": burn,
  
  // go（行く）
  "go": go,
  "went": go,
  "gone": go,
  "going": go,
  
  // dip（下がる/浸す）
  "dip": dip,
  "dipped": dip,
  "dipping": dip,
  
  // find（見つける）
  "find": find,
  "found": find,
  "finding": find,
  
  // fall（落ちる）
  "fall": fall,
  "fell": fall,
  "fallen": fall,
  "falling": fall,
  
  // stop（止まる）
  "stop": stop,
  "stopped": stop,
  "stopping": stop,
  
  // happen（起こる）
  "happen": happen,
  "happened": happen,
  "happening": happen,
  
  // try（試す）
  "try": tryVerb,
  "tried": tryVerb,
  "trying": tryVerb,
  
  // come（来る）
  "come": come,
  "came": come,
  "coming": come,
  
  // notice（気づく）
  "notice": notice,
  "noticed": notice,
  "noticing": notice,
  
  // fill（満たす）
  "fill": fill,
  "filled": fill,
  "filling": fill,
  
  // hang（掛ける）
  "hang": hang,
  "hung": hang,
  "hanging": hang,
  
  // pass（通り過ぎる）
  "pass": pass,
  "passed": pass,
  "passing": pass,
  
  // label（ラベルを貼る）
  "label": label,
  "labelled": label,
  "labelling": label,
  
  // like（好む）
  "like": like,
  "liked": like,
  "liking": like,
  
  // drop（落とす）
  "drop": drop,
  "dropped": drop,
  "dropping": drop,
  
  // kill（殺す）
  "kill": kill,
  "killed": kill,
  "killing": kill,
  
  // manage（なんとかする）
  "manage": manage,
  "managed": manage,
  "managing": manage,
  
  // put（置く）
  "put": put,
  "putting": put,
  
  // tumble（転げ落ちる）
  "tumble": tumble,
  "tumbled": tumble,
  "tumbling": tumble,
  
  // pick（摘む/選ぶ）
  "pick": pick,
  "picked": pick,
  "picking": pick,
  
  // pop（ぴょんと飛ぶ）
  "pop": pop,
  "popped": pop,
  "popping": pop,
  
  // occur（起こる/思い浮かぶ）
  "occur": occur,
  "occurred": occur,
  "occurring": occur,
  
  // ========================================
  // 名詞
  // ========================================
  "chapter": "章",
  "rabbit": "ウサギ",
  "hole": "穴",
  "Alice": "アリス",
  "sister": "お姉さん/妹",
  "bank": "土手/岸",
  "nothing": "何もない",
  "book": "本",
  "pictures": "絵",
  "picture": "絵",
  "conversations": "会話",
  "conversation": "会話",
  "use": "使い道/役立ち",
  "mind": "心/頭",
  "day": "日",
  "pleasure": "楽しみ/喜び",
  "daisy": "ヒナギク",
  "daisy-chain": "ヒナギクの花輪",
  "daisies": "ヒナギク（複数）",
  "trouble": "面倒/苦労",
  "eyes": "目（複数）",
  "eye": "目",
  "way": "道/方法",
  "time": "時間",
  "watch": "時計",
  "waistcoat": "チョッキ",
  "waistcoat-pocket": "チョッキのポケット",
  "pocket": "ポケット",
  "feet": "足（複数）",
  "foot": "足",
  "curiosity": "好奇心",
  "field": "野原/畑",
  "hedge": "生け垣",
  "moment": "瞬間",
  "world": "世界",
  "tunnel": "トンネル",
  "well": "井戸",
  "sides": "側面（複数）",
  "side": "側面",
  "cupboards": "食器棚（複数）",
  "cupboard": "食器棚",
  "shelves": "棚（複数）",
  "shelf": "棚",
  "maps": "地図（複数）",
  "map": "地図",
  "pegs": "掛けくぎ（複数）",
  "peg": "掛けくぎ",
  "jar": "瓶",
  "orange": "オレンジ",
  "marmalade": "マーマレード",
  "disappointment": "失望/がっかり",
  "fear": "恐れ",
  "somebody": "誰か",
  "stairs": "階段",
  "home": "家/故郷",
  "top": "頂上/てっぺん",
  "house": "家",
  "end": "終わり",
  
  // ========================================
  // 形容詞
  // ========================================
  "very": "非常に/とても",
  "hot": "暑い",
  "sleepy": "眠い",
  "stupid": "愚かな/頭がぼんやりした",
  "white": "白い",
  "White": "白い",
  "pink": "ピンク色の",
  "remarkable": "注目すべき/驚くべき",
  "much": "たくさんの/多くの",
  "dear": "親愛なる/大変だ",
  "late": "遅い/遅刻した",
  "natural": "自然な",
  "large": "大きい",
  "another": "もう一つの/別の",
  "once": "一度",
  "straight": "まっすぐな",
  "deep": "深い",
  "slow": "遅い",
  "slowly": "ゆっくりと",
  "next": "次の",
  "dark": "暗い",
  "great": "大きな/偉大な",
  "empty": "空の",
  "such": "そのような",
  "brave": "勇敢な",
  "likely": "ありそうな/可能性がある",
  "true": "本当の/真実の",
  
  // ========================================
  // 代名詞
  // ========================================
  "she": "彼女は/彼女が",
  "her": "彼女の/彼女を",
  "it": "それは/それが",
  "its": "それの",
  "itself": "それ自身",
  "that": "それ/あれ",
  "this": "これ",
  "one": "1つ/人",
  "what": "何",
  "which": "どれ/どちら",
  "anything": "何か",
  "something": "何か",
  "everything": "すべて",
  "all": "すべて/みんな",
  "either": "どちらか",
  "herself": "彼女自身",
  "me": "私を/私に",
  "I": "私は/私が",
  "they": "彼らは/彼らが",
  
  // ========================================
  // 前置詞
  // ========================================
  "down": "下へ/下に",
  "Down": "下へ/下に",
  "by": "そばに/によって",
  "on": "上に/に",
  "of": "の",
  "into": "の中へ",
  "in": "の中に",
  "with": "と一緒に/を持って",
  "without": "なしで",
  "for": "のために/～間",
  "at": "に/で",
  "to": "に/へ",
  "out": "外に/外へ",
  "across": "横切って",
  "under": "下に",
  "after": "後に/～の後を追って",
  "before": "前に",
  "about": "について/およそ",
  "from": "から",
  "upon": "上に",
  "as": "～として/～のように",
  "off": "離れて",
  "past": "過ぎて/通り過ぎて",
  
  // ========================================
  // 接続詞
  // ========================================
  "and": "そして/と",
  "or": "または/か",
  "but": "しかし/でも",
  "so": "だから/それで",
  "nor": "～もまた～ない",
  "whether": "～かどうか",
  "when": "～とき",
  "then": "それから/その時",
  "if": "もし～なら",
  "either": "どちらか（either A or B）",
  
  // ========================================
  // 副詞
  // ========================================
  "the": "その/あの",
  "a": "一つの/ある",
  "an": "一つの/ある",
  "no": "ない/何も～ない",
  "not": "～ない",
  "never": "決して～ない",
  "once": "一度/かつて",
  "twice": "二度",
  "just": "ちょうど/まさに",
  "quite": "全く/かなり",
  "so": "そのように/とても",
  "too": "～すぎる/も",
  "well": "よく/上手に",
  "even": "～でさえ",
  "there": "そこに/そこで",
  "here": "ここに/ここで",
  "how": "どのように/なんと",
  "why": "なぜ",
  "suddenly": "突然",
  "close": "近くに",
  "actually": "実際に",
  "fortunately": "幸運にも",
  "afterwards": "後で",
  "again": "再び/また",
  "straight": "まっすぐに",
  "some": "いくらか/ある程度",
  "plenty": "たくさん",
  "first": "最初に",
  "underneath": "下に",
  
  // ========================================
  // その他
  // ========================================
  "own": "自分自身の",
  "worth": "～の価値がある",
  "oh": "ああ/おお",
  "Oh": "ああ/おお"
};
