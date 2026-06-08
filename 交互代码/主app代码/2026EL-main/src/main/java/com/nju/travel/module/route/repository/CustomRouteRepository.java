package com.nju.travel.module.route.repository;

import com.nju.travel.module.route.entity.CustomRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomRouteRepository extends JpaRepository<CustomRoute, Long> {

    List<CustomRoute> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
