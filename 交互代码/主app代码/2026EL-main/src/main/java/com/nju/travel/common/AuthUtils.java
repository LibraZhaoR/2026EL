package com.nju.travel.common;

import com.nju.travel.common.exception.BusinessException;
import jakarta.servlet.http.HttpSession;

/**
 * Utility to extract authenticated user from HTTP session.
 * All protected controllers should use this instead of accepting userId as a request parameter.
 */
public final class AuthUtils {

    private static final String SESSION_KEY = "userId";

    private AuthUtils() {}

    /**
     * Returns the authenticated user ID from the session, or throws 401.
     */
    public static Long requireUserId(HttpSession session) {
        Long userId = (Long) session.getAttribute(SESSION_KEY);
        if (userId == null) {
            throw new BusinessException(401, "请先登录");
        }
        return userId;
    }

    /**
     * Returns the authenticated user ID or null if not logged in.
     */
    public static Long getUserId(HttpSession session) {
        return (Long) session.getAttribute(SESSION_KEY);
    }

    /**
     * Returns true if the session has an authenticated user.
     */
    public static boolean isAuthenticated(HttpSession session) {
        return session.getAttribute(SESSION_KEY) != null;
    }

    /**
     * Sets the user ID in the session (after login/register).
     */
    public static void login(HttpSession session, Long userId) {
        session.setAttribute(SESSION_KEY, userId);
    }

    /**
     * Invalidates the session (logout).
     */
    public static void logout(HttpSession session) {
        session.invalidate();
    }
}
