package com.nju.travel.integration.ai;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
@ConditionalOnProperty(name = "travel.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockAiClient implements AiClient {

    private final Random random = new Random();

    private static final String[] FOOD_KEYWORDS = {"好吃","美食","吃","饿","餐厅","饭店","小吃","菜","味道"};
    private static final String[] SPOT_KEYWORDS = {"好玩","景点","去哪","推荐","旅游","逛","玩","地方"};
    private static final String[] ROUTE_KEYWORDS = {"路线","规划","时间","小时","行程","安排"};
    private static final String[] NJU_KEYWORDS = {"南大","校园","鼓楼","大学","nju","NJU"};
    private static final String[] NIGHT_KEYWORDS = {"夜游","晚上","秦淮","夜景","夜","傍晚"};
    private static final String[] EXPO_KEYWORDS = {"展览","博物馆","展","艺术","文化","博物","书店"};
    private static final String[] WEATHER_KEYWORDS = {"天气","热","冷","下雨","晒","季节","春天","夏天","秋天","冬天"};

    @Override
    public String chat(String prompt) {
        return generateSmartReply(prompt);
    }

    @Override
    public String chat(String systemPrompt, String userPrompt) {
        return generateSmartReply(userPrompt);
    }

    @Override
    public String chatWithImages(String systemPrompt, String userPrompt, List<String> imageUrls) {
        return "📸 收到你发的图片啦！让我看看…这是南京哪里呢？下次可以多发几张不同角度的～\n\n如果是景点打卡，我可以帮你识别并推荐附近的路线哦！";
    }

    @Override
    public String chatWithImages(String userPrompt, List<String> imageUrls) {
        return chatWithImages("", userPrompt, imageUrls);
    }

    private String generateSmartReply(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "🐋 嗨！我是南小鲸，你的南京漫游向导～ 想找什么路线？或者问我南京哪里好玩！";
        }

        String msg = userMessage.toLowerCase();

        if (matchesAny(msg, FOOD_KEYWORDS)) {
            return "🍜 说到南京美食，我的推荐是：\n\n1. **鸭血粉丝汤** — 回味或鸭得堡，夫子庙附近就有\n2. **牛肉锅贴** — 李记清真馆，皮薄汁多\n3. **桂花糖芋苗** — 老门东的莲湖糕团店最正宗\n4. **盐水鸭** — 韩复兴可以买半只带走\n\n要不要把其中一家加入你的路线？😋";
        }
        if (matchesAny(msg, NJU_KEYWORDS)) {
            return "🎓 南大鼓楼校区是我的最爱！\n\n从**三江师范学堂旧址**开始，经过**北大楼**（爬满爬山虎的那栋），沿着**梧桐大道**走到**校史馆**。\n\n全程约2.5小时，建议下午去，阳光透过梧桐叶洒下来特别美。\n\n对了，南大附近的**上海路**有很多老牌咖啡馆，走完校园可以去坐坐☕";
        }
        if (matchesAny(msg, NIGHT_KEYWORDS)) {
            return "🌙 夜游秦淮是南京的必做清单！\n\n推荐路线：**傍晚出发 → 夫子庙看灯 → 坐秦淮河画舫 → 老门东夜宵**\n\n全程约3小时，夫子庙的灯大概6点亮，画舫最晚到9点。\n\n老门东晚上有很多小酒馆和夜宵摊，推荐试试**桂花酒酿**🍶";
        }
        if (matchesAny(msg, ROUTE_KEYWORDS)) {
            return "📋 根据你的时间，我推荐：\n\n**2小时轻松版**：老门东逛吃 → 夫子庙散步 → 秦淮河边坐坐\n**3小时经典版**：南大鼓楼校区 → 先锋书店 → 上海路咖啡街\n**4小时深度版**：南京博物院(2h) → 明故宫遗址 → 午朝门公园 → 晚饭\n\n选一条，我帮你生成详细路线！✨";
        }
        if (matchesAny(msg, EXPO_KEYWORDS)) {
            return "🏛 南京的博物馆资源真的很棒：\n\n- **南京博物院**：免费，需预约，民国馆和特展是亮点\n- **六朝博物馆**：贝聿铭团队设计，建筑本身就很美\n- **先锋书店**：地下车库改造，全球最美书店之一\n- **大报恩寺遗址**：现代与古迹的完美结合\n\n建议工作日去，周末人太多～";
        }
        if (matchesAny(msg, SPOT_KEYWORDS)) {
            return "🗺 南京值得去的地方可多了！\n\n- **中山陵**：爬392级台阶，俯瞰整座城市\n- **夫子庙+秦淮河**：晚上去最好看，灯影桨声\n- **南京博物院**：免费但要提前预约，特展值得看\n- **老门东**：文创小店+地道小吃，适合下午逛\n- **梧桐大道**：秋天的时候美得像画\n\n你现在在哪个区域？我帮你规划路线～";
        }
        if (matchesAny(msg, WEATHER_KEYWORDS)) {
            return "🌤 南京天气小贴士：\n\n- 春天（3-5月）最美，但早晚温差大，带件薄外套\n- 夏天（6-8月）热，尽量上午或傍晚出门\n- 秋天（9-11月）最佳季节！梧桐叶变黄超美\n- 冬天湿冷，秦淮河边风大\n\n今天出门的话，记得看实时天气哦！";
        }

        String[] defaults = {
            "🐋 这个问题问得好！作为你的南京向导，我建议可以从几个方面来探索：\n\n🏛 **文化线**：南京博物院 → 六朝博物馆\n🍜 **美食线**：老门东小吃 → 夫子庙秦淮八绝\n🌙 **夜游线**：秦淮河 → 夫子庙 → 老门东\n🎓 **校园线**：南大鼓楼校区梧桐漫步\n\n你对哪条线感兴趣？我帮你展开说说～",
            "南京是一座很适合慢慢逛的城市呢～ 不知道你喜欢热闹的还是安静的？\n\n喜欢热闹 → 夫子庙+老门东，吃吃喝喝\n喜欢安静 → 玄武湖边散步，或者去先锋书店看书\n\n告诉我你今天的心情，我帮你挑一条路线 🐋",
            "✨ 推荐一条宝藏路线给你：\n\n从**颐和路**开始 → 走到**上海路**喝咖啡 → 拐进**南秀村**逛小店 → 最后去**先锋书店**看书\n\n这条路游客少，很适合安静地感受南京～",
        };
        return defaults[random.nextInt(defaults.length)];
    }

    private boolean matchesAny(String msg, String[] keywords) {
        for (String kw : keywords) {
            if (msg.contains(kw)) return true;
        }
        return false;
    }
}
