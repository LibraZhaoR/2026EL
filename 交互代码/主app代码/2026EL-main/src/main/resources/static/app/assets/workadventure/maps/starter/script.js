/// <reference path="../node_modules/@workadventure/iframe-api-typings/iframe_api.d.ts" />

let currentPopup = undefined;

const spots = {
    citygoIntro: {
        popup: "citygoIntroPopup",
        title: "南大实习生日常起点",
        message: "欢迎来到我们南大实习生的一天。这里保留 WorkAdventure 的走动、靠近、弹窗和会议区，只把内容换成上班、开会、吃饭和下班后的真实日常。",
        note: "今日安排：鼓楼校区集合，上午项目同步，中午去吃饭，下午补资料，晚上一起散步放松。"
    },
    njuRoute: {
        popup: "njuRoutePopup",
        title: "鼓楼校区上班日常",
        message: "从鼓楼校门进来，先到工位打卡，再去会议桌开晨会。这里可以放实习任务、项目同步和导师提醒。",
        note: "已记录：打卡、晨会、今日任务。"
    },
    qinhuaiRoute: {
        popup: "qinhuaiRoutePopup",
        title: "午饭和下班散步",
        message: "这里不是打卡景点，是实习生下班后的放松区。大家讨论去哪吃饭、要不要绕去秦淮边走一圈，顺便复盘今天的进度。",
        note: "已记录：午饭选择、下班散步、今日复盘。"
    },
    museumRoute: {
        popup: "museumRoutePopup",
        title: "资料整理和灵感补给",
        message: "这里代表下午的资料整理区。有人查文档，有人整理调研，也有人去南博附近找灵感，回来继续改方案。",
        note: "已记录：资料整理、调研补充、方案修改。"
    }
};

Object.entries(spots).forEach(([zoneName, spot]) => {
    WA.room.onEnterZone(zoneName, () => openSpot(spot));
    WA.room.onLeaveZone(zoneName, closePopUp);
});

function openSpot(spot) {
    closePopUp();
    WA.chat.sendChatMessage(spot.title, "南大实习生小景");
    currentPopup = WA.ui.openPopup(spot.popup, spot.message, [
        {
            label: "记入手账",
            className: "citygoPopupButton",
            callback: popup => {
                WA.chat.sendChatMessage(spot.note, "实习生日志");
                popup.close();
                currentPopup = undefined;
            }
        }
    ]);
}

function closePopUp() {
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}
