/**
 * 《南小鲸·金陵鲸梦》完整剧本
 * 从 Ren'Py .rpy 脚本迁移而来
 *
 * 格式说明：
 *   { show: { background: 'bg_id' } }       — 切背景
 *   { show: { character: 'id', expression: 'expr' } } — 显示大立绘
 *   { show: { character: 'id', expression: 'expr', size: 'small' } } — 显示小立绘
 *   { show: { character: 'id', expression: 'expr', sway: true } } — 显示立绘+浮动
 *   { char_id: { text: '...', expression: 'expr', size: 'small' } } — 对话+小立绘
 *   { hide: { character: 'id' } }            — 隐藏立绘
 *   { narrator: { text: '...' } }            — 旁白
 *   { char_id: { text: '...' } }             — 角色对话
 *   { char_id: { text: '...', expression: 'expr' } } — 对话+表情
 *   { choice: { prompt: '...', options: [...] } } — 选项
 *   { jump: 'label' }                        — 跳转
 *   { music: { file: 'audio/x.ogg', fadein: 2 } } — 播放BGM（自动替换前一首）
 *   { stop_music: { fadeout: 2 } }           — 停止BGM
 *   { end: true }                            — 结束
 */

VNEngine.script({

  // ============================================================
  // 序章 · 北大楼的梧桐
  // ============================================================

  start: [
    { music: { file: 'assets/audio/α·Pav - κ_H.ogg', fadein: 2 } },
    { show: { background: 'bg_eye_open' } },
    { narrator: { text: '你睁开眼睛，抬起头。' } },
    { show: { background: 'bg_beidalou' } },
    { narrator: { text: '阳光很好。' } },
    { narrator: { text: '好到让人想哭的那种好。' } },
    { narrator: { text: '你是在一阵微风中醒来的。风里有青草的味道，有书页翻动的沙沙声，还有远处钟楼传来的、悠长得像是永远不会停下的钟声。' } },
    { narrator: { text: '你靠在一面墙上。墙是老墙，灰砖斑驳，爬满了深绿色的爬山虎，像一幅被时光浸透的油画。头顶是绿琉璃瓦的屋檐，檐角蹲着几只石兽，沉默地俯瞰着这座古老的校园。' } },
    { narrator: { text: '——你记不得自己是怎么来到这里的。' } },
    { narrator: { text: '就像一张白纸被风吹到了这张长椅上。你不记得自己的名字，不记得自己的过去，不知道自己为何在此。但你并不慌张。这座校园有一种奇怪的安宁，仿佛在告诉你：你本就属于这里。' } },
    { narrator: { text: '你低头看着自己的手。手很年轻，骨节分明，掌心空空。' } },

    { show: { character: 'xiaojing' } },
    { xiaojing: { text: '你醒啦？' } },
    { narrator: { text: '声音从头顶传来，像风铃被南风吹动。' } },
    { narrator: { text: '你抬起头——然后愣住了。' } },

    { xiaojing: { text: '', expression: 'side' } },
    { narrator: { text: '一个少女坐在北大楼的屋檐上，双腿悬空，轻轻晃着。她穿着月白色的连衣裙，裙摆上绣着波浪般的暗纹，一头紫色的长发在风中飘散，发梢仿佛融化在阳光里。她歪着头看你，眼睛是深海般的蓝色，里面仿佛藏着整个太平洋。' } },
    { narrator: { text: '她轻轻一跃，从几层楼高的屋檐上跳了下来。' } },
    { narrator: { text: '你没有惊呼，因为她落下时像一片叶子那样缓慢，裙摆被风撑开，如同一朵盛开的白莲。她稳稳落在你面前，离你只有一步远。' } },
    { narrator: { text: '你闻到了海的味道。' } },

    { xiaojing: { text: '吓到了？', expression: 'cute2', size: 'small' } },
    { narrator: { text: '她歪着头，嘴角带着一丝狡黠的笑意。' } },

    { p: { text: '……你是谁？' } },
    { narrator: { text: '你听见自己的声音，有些沙哑，像是很久没有说过话。' } },
    { narrator: { text: '少女眨了眨眼睛，忽然伸出手指点了点你的眉心。她的指尖凉凉的，像一小块冰。' } },

    { xiaojing: { text: '我叫南小鲸。至于我是谁嘛……这个问题可不好回答。', expression: 'point' } },

    { p: { text: '不好回答？' } },

    { xiaojing: { text: '嗯。因为我既是这里的主人，也是这里的客人；我既很老很老了，又很年轻。我从1902年就开始住在这里了，可你看看我这张脸——说是十八岁也没人会反对吧？', expression: 'intro' } },

    { narrator: { text: '她双手背在身后，点着脚尖围着你转了一圈，裙摆扫过青石板地面。' } },
    { narrator: { text: '你沉默了片刻。' } },

    { p: { text: '你是个……妖怪？' } },
    { narrator: { text: '你试探着问。' } },

    { xiaojing: { text: '妖怪？哈哈哈哈！', expression: 'surprise' } },
    { xiaojing: { text: '好吧，你要是非这么说的话……也许算是个好妖怪吧。', expression: 'cute1', size: 'small' } },

    { narrator: { text: '南小鲸愣了一下，然后笑得弯下了腰。' } },
    { narrator: { text: '她忽然收起笑容，认真地盯着你的眼睛。' } },

    { xiaojing: { text: '你看这面墙。', expression: 'intro' } },
    { narrator: { text: '你顺着她的手指看过去。北大楼的灰墙上，爬山虎层层叠叠，有些叶子已经红了，有些还绿着，像是时间的色谱。' } },

    { xiaojing: { text: '这些爬山虎，是我看着它们一寸一寸爬上来的。第一年只爬到窗台，第二年爬到了一楼房顶，第三年已经到了二楼。一百多年了，它们还在爬。' } },
    { narrator: { text: '你忽然觉得喉咙有点紧。' } },

    { xiaojing: { text: '我是在这座校园里出生的，在这里长大，在这里变老——虽然你看不出来——也会在这里……消失。' } },

    { p: { text: '消失？' } },
    { narrator: { text: '你捕捉到了这个词。' } },
    { narrator: { text: '她没有回答，而是转身向北大楼走去。走了几步，她又回头，朝你伸出手。' } },

    { xiaojing: { text: '来吧。带你认识一下我。你不是想知道我是谁吗？看完这些，你就懂了。', expression: 'reach' } },

    { narrator: { text: '你看着那只伸向你的手。手指纤细，指甲圆润，指尖在阳光中几乎是透明的。' } },
    { narrator: { text: '你犹豫了一瞬。' } },
    { narrator: { text: '然后你握住了她的手。' } },
    { narrator: { text: '她的手很凉，像握住一块温润的玉。' } },
    { narrator: { text: '然后——你看见了光。' } },

    { show: { background: 'white' } },
    { jump: 'act_01' }
  ],

  // ============================================================
  // 第一幕 · 钟山龙蟠 —— 1902年·三江师范学堂
  // ============================================================

  act_01: [
    { music: { file: 'assets/audio/α·Pav - η_L.ogg', fadein: 1.5 } },
    { show: { background: 'bg_point_sanjiang' } },
    { narrator: { text: '她伸出手，指向远方的荒野。' } },
    { show: { background: 'bg_1902_wasteland' } },

    { narrator: { text: '时间是错的。' } },
    { narrator: { text: '你分明刚刚还站在北大楼前，阳光灿烂，梧桐叶绿得发亮。可此刻你脚下是泥泞的小路，头顶是灰蒙蒙的天空，远处是低矮的丘陵和零星的农舍。' } },
    { narrator: { text: '没有高楼，没有车流，没有穿校服的学生。只有风穿过枯草的沙沙声，和远处传来的粗犷号子声。' } },

    { show: { character: 'xiaojing', expression: 'shy', position: 'road' } },
    { narrator: { text: '南小鲸站在你身旁。她的裙摆变成了素白色，长发被一根发带束起，整个人沉静了许多。' } },

    { p: { text: '这是哪里？' } },
    { narrator: { text: '你问，声音在空旷的荒野中显得有些孤单。' } },

    { xiaojing: { text: '三江师范学堂——南京大学的源头。' } },
    { narrator: { text: '你看见远处有人影在移动。是穿着长衫的年轻人，扛着木材和砖石，深一脚浅一脚地走在泥地里。有人在喊号子，声音粗犷而有力，像是要把这片荒芜的土地唤醒。' } },
    { narrator: { text: '他们的脸上有汗，有泥，但眼睛里——有光。' } },

    { xiaojing: { text: '1902年，洋务派领袖张之洞上书朝廷，倡办三江师范学堂。他说，\'大学之设，所以为国家储人才，为天下兴大利。\'那时候的中国，你知道是什么样子吗？' } },

    { narrator: { text: '南小鲸的声音很轻，像在念一首古老的诗。' } },
    { narrator: { text: '你没有回答。你当然知道。屈辱、割地、赔款、列强环伺——那是历史书上的铅字，冷冰冰的，不带感情。可此刻你站在这里，看着那些在泥地里跋涉的年轻人，那些铅字忽然变成了滚烫的。' } },

    { xiaojing: { text: '他们很多人是从日本、欧美留学回来的，放弃了高官厚禄，回到这片荒地上，一砖一瓦地建起这座学堂。他们不知道未来会怎样，不知道这片土地会不会有一天变得繁荣富强，但他们相信一件事——' } },

    { narrator: { text: '她转头看着你，眼睛里有星光。' } },

    { xiaojing: { text: '教育，可以改变一个民族的命运。', expression: 'intro', position: 'road' } },
    { narrator: { text: '你沉默地看着那些身影。一个年轻人摔倒了，手里的木材滚进了泥坑。旁边的人立刻跑过去，帮他抬起来。没有人抱怨，没有人退缩。他们只是擦了擦汗，继续往前走。' } },
    { narrator: { text: '你忽然觉得眼眶有些发酸。' } },

    { xiaojing: { text: '那时候我也是刚刚出生。我睁开眼睛的时候，看到的就是这些人。他们满身泥土，眼睛里却亮着光。他们在校园里种下第一棵梧桐树的时候，我就在树根下睡着了。' } },

    { narrator: { text: '她低下头，看着自己的脚尖。' } },
    { xiaojing: { text: '等我醒来的时候——梧桐已经长得很高很高了。' } },
    { narrator: { text: '她抬起头，看着远处的天空。' } },
    { narrator: { text: '你转头看着她。她的侧脸在夕阳中镀上一层金色，睫毛轻轻颤动，像蝴蝶的翅膀。' } },

    { p: { text: '你哭了。' } },
    { xiaojing: { text: '没有。只是风太大了。' } },
    { narrator: { text: '她吸了吸鼻子，声音有点闷。' } },

    // 第一幕选项
    { choice: {
      prompt: '',
      options: [
        { text: '问她："后来呢？"', do: 'jump act_01_choice_a' },
        { text: '沉默地看着她的侧脸，不说话', do: 'jump act_01_choice_b' }
      ]
    }}
  ],

  act_01_choice_a: [
    { xiaojing: { text: '后来啊……这所学校改了很多次名字。两江师范学堂、南京高等师范学校、国立东南大学……每一次改名，都像经历一次重生。但有些东西从未改变。' } },
    { p: { text: '什么东西？' } },
    { xiaojing: { text: '梧桐树。还有这里的人。' } },
    { narrator: { text: '她笑了起来。' } },
    { jump: 'act_01_conclusion' }
  ],

  act_01_choice_b: [
    { narrator: { text: '南小鲸没有转头，但她似乎知道你心里在想什么。' } },
    { xiaojing: { text: '你是不是在想，这些人后来怎么样了？' } },
    { narrator: { text: '你点了点头。' } },
    { xiaojing: { text: '有的成了大师，有的成了将军，有的在战火中死去，有的活到了很老很老。但他们没有一个人后悔过。' } },
    { p: { text: '为什么？' } },
    { xiaojing: { text: '因为他们相信，自己正在做一件——对的事。' } },
    { jump: 'act_01_conclusion' }
  ],

  act_01_conclusion: [
    { narrator: { text: '画面渐渐模糊，像旧胶片在燃烧。那些穿着长衫的身影、那片荒芜的土地、那第一棵被种下的梧桐树——都化作金色的光点，消散在风中。' } },

    { show: { background: 'bg_beidalou' } },
    { narrator: { text: '你又回到了北大楼前的阳光中。' } },

    { xiaojing: { text: '', expression: 'smile' } },
    { narrator: { text: '南小鲸站在你身旁，手中的梧桐叶随风飘远。她的眼睛还红红的，却笑着说：' } },
    { xiaojing: { text: '1902年，那是我的生日。我就是在那一天的钟声中醒来的。' } },

    { jump: 'act_02' }
  ],

  // ============================================================
  // 第二幕 · 星火燎原 —— 1960年代·秘密实验室
  // ============================================================

  act_02: [
    { music: { file: 'assets/audio/Glenn Gould - Aria_H.ogg', fadein: 1.5 } },
    { show: { background: 'bg_1960s_lab' } },

    { narrator: { text: '这次你站在一间逼仄的实验室里。' } },
    { narrator: { text: '空气中弥漫着化学试剂和旧木材的气味。桌上堆满了图纸和计算稿纸，墙上的黑板写满了密密麻麻的公式，字迹潦草得像狂风中的麦田。几盏白炽灯把房间照得惨白，灯管嗡嗡作响，像疲惫的蜜蜂。' } },

    { show: { character: 'xiaojing', expression: 'shy' } },
    { narrator: { text: '南小鲸站在窗边，手里拿着一本泛黄的笔记本。她的头发又变了，扎成一条利落的马尾，穿着素色衬衫，像那个年代的知识女性。' } },

    { xiaojing: { text: '你知道1949年的中国是什么样的吗？' } },
    { narrator: { text: '你没有回答。你知道答案。' } },

    { xiaojing: { text: '一穷二白。没有核武器，就没有国家安全；没有卫星，就没有国际地位。那时候西方人说，中国人一百年也造不出原子弹。' } },
    { narrator: { text: '她的声音很平静。' } },
    { narrator: { text: '你看见一个年轻人坐在桌边，埋头演算。他穿着一件洗得发白的蓝布衫，袖口磨出了毛边，但眼神专注而炽热，像要把每一页稿纸点燃。他的手指修长，骨节分明，握笔的姿势像握着一把剑。' } },

    { xiaojing: { text: '他叫程开甲。1946年赴英国留学，师从诺贝尔奖得主玻恩。1950年放弃国外优厚的待遇，毅然回国。后来，他成为中国核武器事业的开拓者之一。' } },

    { hide: { character: 'xiaojing' } },
    { show: { background: 'bg_chengkaijia' } },

    { narrator: { text: '画面一转。' } },

    { show: { background: 'bg_1960s_lab' } },
    { show: { character: 'xiaojing', expression: 'shy' } },
    { narrator: { text: '你看见一群人围在一张简陋的桌子旁，桌上摊着地图和文件。有人在争论，有人在沉思，有人抽着烟，烟雾在灯光下缭绕成云。空气里弥漫着浓烈的烟草味和压迫感。' } },

    { xiaojing: { text: '那是朱光亚——中国核科学事业的主要开拓者之一，他参与组织领导了中国第一颗原子弹和第一颗氢弹的研制工作。' } },

    { narrator: { text: '南小鲸指着一个戴眼镜的年轻人。' } },
    { narrator: { text: '你看见那些人的脸上，有疲惫，有沧桑，有深深的黑眼圈，但更多的是一种近乎偏执的坚定。他们的手上有厚厚的茧，指甲缝里有洗不掉的油墨。' } },

    { xiaojing: { text: '他们隐姓埋名，在戈壁滩上、在深山老林里，一待就是几十年。他们的家人不知道他们在哪里，不知道他们在做什么，甚至不知道他们是死是活。有些人直到去世，墓碑上都没有名字。' } },

    { narrator: { text: '南小鲸的声音有些哽咽。' } },
    { narrator: { text: '你看着她。她的眼眶红了，却没有哭。' } },

    { p: { text: '值得吗？' } },
    { narrator: { text: '南小鲸转过头看着你。' } },
    { narrator: { text: '那一眼，让你想起了很多东西。想起那些在泥地里扛木材的年轻人，想起那些在梧桐树下读书的学子，想起那些在实验室里熬夜的科学家。' } },

    { xiaojing: { text: '你知道1964年10月16日那天，我在校园里听到了什么吗？' } },
    { narrator: { text: '你摇头。' } },

    { xiaojing: { text: '是欢呼声。整个校园都在欢呼。有人在哭，有人在笑，有人把帽子扔上了天。他们说——' } },
    { narrator: { text: '她顿了顿，声音变得很轻，像在重复一句刻在骨头里的话：' } },
    { xiaojing: { text: '我们中国人，终于挺直了腰杆。' } },
    { xiaojing: { text: '你说，值得吗？' } },

    { narrator: { text: '她看着你的眼睛。' } },
    { narrator: { text: '你没有回答。因为你看见那个叫程开甲的老人，晚年坐在轮椅上，被人推到校园的梧桐树下。他看着那些年轻的面孔，浑浊的眼中闪过一丝光。' } },

    { hide: { character: 'xiaojing' } },
    { show: { background: 'bg_chengkaijia' } },

    { narrator: { text: '他说：\'我这辈子，只做了一件事——让中国人不再被欺负。\'' } },

    { show: { background: 'bg_1960s_lab' } },
    { show: { character: 'xiaojing', expression: 'shy' } },

    { xiaojing: { text: '他去世的时候，骨灰撒在了罗布泊。那是他战斗过的地方。' } },
    { narrator: { text: '南小鲸轻声说。' } },

    // 第二幕选项
    { choice: {
      prompt: '',
      options: [
        { text: '问："他们后悔过吗？"', do: 'jump act_02_choice_a' },
        { text: '沉默地看着那些身影', do: 'jump act_02_choice_b' }
      ]
    }}
  ],

  act_02_choice_a: [
    { xiaojing: { text: '也许后悔过吧。后悔没有多陪陪家人，后悔没能看着孩子长大。但若让他们重新选择一次——' } },
    { narrator: { text: '她看着你的眼睛。' } },
    { xiaojing: { text: '他们还是会走上同样的路。' } },
    { p: { text: '为什么？' } },
    { xiaojing: { text: '因为他们心里，装的不只是自己。' } },
    { narrator: { text: '她笑了。' } },
    { jump: 'act_02_conclusion' }
  ],

  act_02_choice_b: [
    { narrator: { text: '你什么都没有说。你只是看着那些在黑板上奋笔疾书的身影，看着那些在图纸上画下一条条曲线的手。' } },
    { narrator: { text: '你忽然明白了一件事——有些东西，比生命更重要。' } },
    { xiaojing: { text: '是的，比生命更重要。' } },
    { narrator: { text: '南小鲸像是读懂了你的心思，轻轻地说。' } },
    { jump: 'act_02_conclusion' }
  ],

  act_02_conclusion: [
    { narrator: { text: '画面再次消散。' } },

    { show: { background: 'bg_beidalou' } },
    { narrator: { text: '你站在北大楼前，夕阳把你们的影子拉得很长很长。' } },

    { xiaojing: { text: '', expression: 'shy' } },
    { xiaojing: { text: '他们都是南大的校友。他们都曾在这片梧桐树下走过，在食堂里吃过饭，在图书馆里熬过夜。他们也曾和你一样——年轻、迷茫、不知道未来会怎样。' } },
    { xiaojing: { text: '但他们选择了一条路。一条很难走的路。' } },
    { xiaojing: { text: '然后用一辈子走完了。' } },

    { jump: 'act_03' }
  ],

  // ============================================================
  // 第三幕 · 百廿风华 —— 2026年·南京大学
  // ============================================================

  act_03: [
    { music: { file: 'assets/audio/α·Pav - υ_H.ogg', fadein: 1.5 } },
    { show: { background: 'bg_2026_campus' } },

    { narrator: { text: '你又回到了北大楼前。' } },
    { narrator: { text: '但这一次，阳光比之前更明亮，梧桐树的叶子比之前更绿。空气中有桂花的甜香，远处传来广播体操的音乐声，年轻的声音在操场上回荡。' } },

    { show: { character: 'xiaojing', expression: 'intro' } },
    { narrator: { text: '南小鲸站在你身旁，换了一身紫色的连衣裙，裙摆上绣着波浪纹，像要把整个南大校园的海都穿在身上。她的长发披散着，在风中轻轻飘动。' } },

    { xiaojing: { text: '现在是2026年了。你看看这里，还认得吗？' } },
    { narrator: { text: '你环顾四周。' } },
    { narrator: { text: '北大楼还是那座北大楼，爬山虎还是那些爬山虎。但校园比之前大了许多。远处的教学楼鳞次栉比，玻璃幕墙反射着阳光，像一面面巨大的镜子。学生们骑着共享单车在林荫道上穿行，书包里装着笔记本电脑和梦想。' } },

    { show: { background: 'bg_2026_lawn' } },
    { narrator: { text: '有人在草坪上弹吉他，有人在长椅上看书，有人在讨论着看起来很高深的数学题。阳光洒在他们身上，每个人都亮晶晶的。' } },

    { xiaojing: { text: '南京大学现在有四个校区——仙林、鼓楼、浦口、苏州。', expression: 'cute3', size: 'small' } },
    { narrator: { text: '南小鲸掰着手指，像个炫耀玩具的孩子。' } },
    { xiaojing: { text: '仙林校区最大，有\'南京大学植物园\'的美称，春天樱花开了，整个校园都是粉色的。' } },
    { xiaojing: { text: '鼓楼校区最老，就是我们现在站的地方。北大楼、梧桐大道、钟楼——一百多年的历史，都在这里。' } },
    { xiaojing: { text: '浦口校区在江北，以前是很多工科生的家，现在有了新的规划。' } },
    { xiaojing: { text: '苏州校区最新，去年才刚刚启用，就在太湖边上，风景特别好。' } },

    { narrator: { text: '她一边说一边往前走，裙摆在风中轻轻摇曳。你跟在她身后，踩着她被夕阳拉长的影子。' } },

    { p: { text: '梧桐大道还在吗？' } },
    { xiaojing: { text: '当然在——梧桐是南大的魂。每年秋天，梧桐叶落的时候，整个校园就像铺了一层金色的地毯。' } },
    { narrator: { text: '她回过头来，笑了。' } },
    { xiaojing: { text: '', expression: 'cute1', size: 'small' } },
    { narrator: { text: '她伸手接住一片飘落的叶子，举到你的面前。' } },

    { xiaojing: { text: '有人在梧桐树下读书，有人在梧桐树下谈恋爱，有人在梧桐树下发誓要成为改变世界的人。然后他们毕业了，离开了。但梧桐树还在那里——等着下一批人。' } },
    { narrator: { text: '她把叶子放在你的手心。' } },
    { narrator: { text: '你低头看着手心的叶子。叶脉清晰，像这座校园的血管。' } },

    { xiaojing: { text: '南大现在有很多厉害的学科——天文、地质、中文、物理、化学、计算机……每个学科都有很厉害的人。' } },
    { narrator: { text: '她边走边说，声音里带着母亲提到孩子时的骄傲。' } },

    { xiaojing: { text: '有人在研究暗物质，想知道宇宙到底有多大；有人在研究人工智能，想让机器学会思考；有人在研究古汉语，想把那些被遗忘的诗句重新唤醒；有人在研究气候变化，想给子孙后代留一个还能住的地球。' } },
    { xiaojing: { text: '他们和一百多年前的那些人一样——在未知的领域里探索，在无人走过的路上跋涉。' } },

    { narrator: { text: '她顿了顿。' } },

    { p: { text: '他们也会被遗忘吗？' } },
    { narrator: { text: '南小鲸停下脚步。' } },
    { narrator: { text: '她转过身，站在梧桐树下，逆着光。夕阳把她的轮廓镀成金色，她的脸藏在阴影里，但你能看见她的眼睛——亮得像两颗星星。' } },

    { xiaojing: { text: '也许吧。历史太长，人生太短。大多数人的名字，都会被时间淹没。', expression: 'side' } },
    { narrator: { text: '她走近你，站在你面前。' } },

    { xiaojing: { text: '但有些东西不会。', expression: 'intro' } },

    { p: { text: '什么东西？' } },

    { xiaojing: { text: '梧桐树。钟声。还有这座校园。' } },
    { narrator: { text: '她伸手，轻轻拂过你身旁那棵老梧桐的树干。' } },
    { xiaojing: { text: '以及——这里孕育的精神。' } },
    { narrator: { text: '她一字一顿地说：' } },
    { xiaojing: { text: '诚、朴、雄、伟。' } },

    // 第三幕选项
    { choice: {
      prompt: '',
      options: [
        { text: '问："你到底是谁？"', do: 'jump act_03_choice_a' },
        { text: '沉默地握紧手心的梧桐叶', do: 'jump act_03_choice_b' }
      ]
    }}
  ],

  act_03_choice_a: [
    { narrator: { text: '南小鲸没有回答。她转身，背对着你，看着远处的钟楼。' } },
    { narrator: { text: '夕阳正在西沉，把整个校园染成金黄色。' } },
    { narrator: { text: '你忽然有种预感——她快要走了。' } },
    { jump: 'epilogue' }
  ],

  act_03_choice_b: [
    { narrator: { text: '你低下头，看着那片叶子。叶脉间仿佛藏着光。' } },
    { narrator: { text: '你忽然很想记住这一刻。记住这个女孩，记住这棵梧桐树，记住这座校园。' } },
    { narrator: { text: '但你不知道——有些东西，不是靠记忆就能留住的。' } },
    { jump: 'epilogue' }
  ],

  // ============================================================
  // 尾声 · 鲸落
  // ============================================================

  epilogue: [
    { music: { file: 'assets/audio/α·Pav - δ_H.ogg', fadein: 1.5 } },
    { hide: { character: 'xiaojing' } },
    { show: { background: 'bg_wutong_lookback' } },

    { narrator: { text: '夕阳正在西沉。' } },
    { narrator: { text: '天空是渐变的颜色，从橙红到深紫，像是在燃烧。梧桐树的影子拉得很长，像是要把你们一起拥抱。' } },
    { narrator: { text: '她的身影在夕阳中显得有些透明，像随时会融化在光里。' } },

    { xiaojing: { text: '你问我是谁。' } },
    { narrator: { text: '她说，没有回头。' } },
    { narrator: { text: '她的声音很轻，像风穿过梧桐叶。' } },
    { xiaojing: { text: '现在我告诉你。' } },
    { narrator: { text: '她转过身。' } },
    { narrator: { text: '她的眼睛里全是泪水，但她在笑。笑得很好看，好看到让人心疼。' } },

    { xiaojing: { text: '我就是这座校园。' } },
    { xiaojing: { text: '我是北大楼墙上那些爬山虎，是梧桐树下那些落叶，是钟楼里那口古钟，是图书馆里那些泛黄的旧书。' } },
    { xiaojing: { text: '我是1902年那个秋天，第一锹土被铲起时的尘土。' } },
    { xiaojing: { text: '我是1964年那个冬天，第一颗原子弹爆炸时，校园里响起的欢呼声。' } },
    { xiaojing: { text: '我是此时此刻——站在你面前的这个穿蓝裙子的女孩。' } },

    { narrator: { text: '她的眼泪终于流了下来。' } },

    { xiaojing: { text: '我是每一个曾在这片土地上生活过、奋斗过、哭过、笑过的人。' } },
    { xiaojing: { text: '我是程开甲，是朱光亚，是那些在戈壁滩上隐姓埋名的科学家。' } },
    { xiaojing: { text: '我也是你——是那些在梧桐树下读书的学子，是那些在实验室里熬夜的研究生，是那些在讲台上把青春献给教育的老教授。' } },

    { narrator: { text: '她深吸一口气，声音颤抖着，却很坚定。' } },
    { xiaojing: { text: '我就是——南京大学。' } },

    { narrator: { text: '你站在她面前，一句话也说不出来。' } },
    { narrator: { text: '你很想说些什么。想说谢谢你，想说你很美，想说请你不要走。' } },
    { narrator: { text: '但你知道，有些话不必说出口。' } },

    { p: { text: '你要走了，对吗？' } },
    { narrator: { text: '你终于问了出来。' } },
    { narrator: { text: '南小鲸点点头。' } },

    { p: { text: '你要去哪里？' } },
    { xiaojing: { text: '哪里也不去。我一直在这里。我只是……不能再让你看见我了。' } },
    { narrator: { text: '她笑了。' } },

    { p: { text: '为什么？' } },
    { xiaojing: { text: '因为你已经认识我了呀。一个被认识了的人，就没办法再装神秘了。' } },

    { narrator: { text: '她眨眨眼睛，泪水从脸颊滑落，却还在笑。' } },
    { narrator: { text: '你想说什么，喉咙却像被什么堵住了。像有一整片海堵在那里，涌不上来，也咽不下去。' } },

    { xiaojing: { text: '别难过。' } },

    { narrator: { text: '南小鲸走到你面前，点起脚尖，伸手在你的眉心轻轻一点。' } },
    { narrator: { text: '她的指尖凉凉的，像第一次见面时那样。' } },

    { xiaojing: { text: '我只是回到了梧桐树的根系里，回到了钟楼的钟声里，回到了图书馆的书页间。' } },
    { xiaojing: { text: '你下次在梧桐树下读书的时候，我会坐在你旁边。' } },
    { xiaojing: { text: '你下次在钟楼下听钟声的时候，我会站在你身后。' } },
    { xiaojing: { text: '你下次在图书馆翻到一本旧书的时候，我会藏在书页的夹缝里——看着你。' } },

    { narrator: { text: '她的身体开始变得透明，像被夕阳融化。' } },

    { xiaojing: { text: '你以后会成为一个很厉害的人吗？' } },
    { p: { text: '我不知道。' } },
    { xiaojing: { text: '我也不知道。但我会一直看着你。' } },
    { narrator: { text: '她笑了。' } },

    { xiaojing: { text: '看着你在这片梧桐树下长大，看着你毕业、离开、去往远方。' } },
    { xiaojing: { text: '也许有一天，你会回来，带着你的故事，带着你的荣耀，带着你一生的遗憾和骄傲。' } },

    { narrator: { text: '她的身影越来越淡，越来越淡，像一幅正在褪色的水墨画。' } },
    { xiaojing: { text: '那时候，我会在北大楼的墙根下等你——就像今天一样。' } },
    { narrator: { text: '她的声音变得很轻很轻，像是风。' } },

    { xiaojing: { text: '对了……梧桐树的英文是\'phoenix tree\'，凤凰树。' } },
    { xiaojing: { text: '传说中，凤凰只在梧桐树上栖息。' } },
    { xiaojing: { text: '所以——每一个南大人，心里都住着一只凤凰。' } },
    { xiaojing: { text: '总有一天，你会飞起来的。' } },

    { narrator: { text: '然后她消散了。' } },
    { narrator: { text: '像一场梦被风吹散。' } },
    { narrator: { text: '什么都没有留下。' } },
    { narrator: { text: '只有一片梧桐叶，缓缓飘落在你的掌心。' } },

    { narrator: { text: '钟楼敲响了。' } },
    { narrator: { text: '钟声在校园里回荡，一声，两声，三声……像有人在用钟声丈量时光。' } },
    { narrator: { text: '你站在北大楼前，握着那片梧桐叶，久久没有动。' } },
    { narrator: { text: '风穿过梧桐叶，发出沙沙的声音，像在低声说着什么。你听不清，但你觉得那是她留下的最后一句话。' } },
    { narrator: { text: '你抬起头，看着那座古老的建筑，看着那些爬山虎，看着那些在夕阳中飞翔的鸟。' } },
    { narrator: { text: '你忽然想起来了——' } },
    { narrator: { text: '她不叫南小鲸。' } },
    { narrator: { text: '南小鲸只是一个名字，一个代号，一个你可以叫的称呼。' } },
    { narrator: { text: '她真正的名字，是刻在这座校园每一块砖、每一棵树、每一缕风里的。' } },
    { narrator: { text: '你攥紧了手中的梧桐叶。' } },
    { narrator: { text: '你转身，走进那片金色的阳光里。' } },
    { narrator: { text: '你没有回头。因为你知道，她就在你身后。' } },

    { jump: 'cg_ending' }
  ],

  // ============================================================
  // CG尾声 + 后记
  // ============================================================

  cg_ending: [
    { hide: { character: 'xiaojing' } },
    { show: { background: 'bg_wutong_lookback' } },
    { wait: 2500 },

    { narrator: { text: '深秋。阳光透过梧桐叶的缝隙洒下来，在地上画出斑驳的光影。' } },
    { narrator: { text: '一个穿紫色裙子的少女站在树下，背对着镜头，裙摆在风中轻轻飘起。她的长发在阳光中是紫色的，像融化在光里。' } },
    { narrator: { text: '远处，钟楼的剪影在夕阳中若隐若现，爬山虎爬满了灰墙。' } },
    { narrator: { text: '梧桐叶纷纷飘落，像一场金色的雨。' } },

    { show: { background: 'bg_wutong_avenue' } },
    { wait: 1500 },

    { narrator: { text: '「南小鲸·金陵鲸梦」' } },
    { narrator: { text: '——致每一个曾在梧桐树下走过的人。' } },
    { narrator: { text: '谨以此作献给南京大学一百二十余年的风雨兼程，以及每一个在这片土地上仰望星空的人。' } },
    { narrator: { text: '梧桐一叶落，天下尽知秋。' } },
    { narrator: { text: '——愿你在南大的故事，从这第一片叶子开始。' } },

    { narrator: { text: '【全剧终】' } },

    { narrator: { text: '感谢游玩《南小鲸·金陵鲸梦》。' } },

    { show: { background: 'bg_2026_campus' } },
    { wait: 1500 },

    // 结局选项
    { choice: {
      prompt: '',
      options: [
        { text: '重新开始', do: 'jump start' },
        { text: '回到主菜单', do: 'jump end_game' }
      ]
    }}
  ],

  end_game: [
    { stop_music: { fadeout: 2 } },
    { narrator: { text: '期待与你再次相遇在梧桐树下。' } },
    { narrator: { text: '再见。' } },
    { end: true }
  ]

});
