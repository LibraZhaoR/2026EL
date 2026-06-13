package com.nju.travel.module.route.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_route")
public class CustomRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "source_route_id")
    private Long sourceRouteId;

    @Column(nullable = false, length = 128)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<RouteStop> stops = new ArrayList<>();

    public CustomRoute() {}

    public CustomRoute(Long userId, Long sourceRouteId, String title, String description, Boolean isPublic) {
        this.userId = userId;
        this.sourceRouteId = sourceRouteId;
        this.title = title;
        this.description = description;
        this.isPublic = isPublic;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long v) { this.userId = v; }
    public Long getSourceRouteId() { return sourceRouteId; }
    public void setSourceRouteId(Long v) { this.sourceRouteId = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean v) { this.isPublic = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public List<RouteStop> getStops() { return stops; }
    public void setStops(List<RouteStop> v) { this.stops = v; }
}
