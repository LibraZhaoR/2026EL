package com.nju.travel.module.exhibition.vo;

import java.time.LocalDateTime;

public record ReserveRemindVO(
        Long remindId,
        Long userId,
        Long exhibitionId,
        LocalDateTime remindTime,
        String status
) {
}
