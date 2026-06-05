package com.nju.travel.integration.meituan;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.TreeMap;

public final class MeituanSignatureUtil {

    private MeituanSignatureUtil() {
    }

    /**
     * Generate SHA1 sign for Meituan Open API.
     * <p>
     * Algorithm: SHA1(signKey + sortedKey1Value1Key2Value2...)
     */
    public static String sign(Map<String, String> params, String signKey) {
        Map<String, String> sorted = new TreeMap<>(params);

        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : sorted.entrySet()) {
            if (entry.getValue() == null) continue;
            sb.append(entry.getKey()).append(entry.getValue());
        }

        String payload = signKey + sb;
        return sha1Hex(payload);
    }

    private static String sha1Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-1 algorithm not available", e);
        }
    }
}
