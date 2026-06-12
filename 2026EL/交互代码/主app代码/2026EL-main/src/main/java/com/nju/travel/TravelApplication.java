package com.nju.travel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class TravelApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelApplication.class, args);
    }
}
