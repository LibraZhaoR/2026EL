package com.nju.travel.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/app/**",
                    "/",
                    "/index.html",
                    "/h2-console/**",
                    "/static/**",
                    "/assets/**",
                    "/favicon.ico"
                ).permitAll()
                .anyRequest().permitAll() // Allow all for now, phase in restrictions
            )
            .headers(headers -> headers.frameOptions(fo -> fo.disable())) // for H2 console
            .formLogin(fl -> fl.disable())
            .httpBasic(hb -> hb.disable())
            .logout(logout -> logout.disable());

        return http.build();
    }
}
