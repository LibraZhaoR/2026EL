package com.nju.travel.module.route.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "custom_route_stop")
public class RouteStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private CustomRoute route;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    public RouteStop() {}

    public RouteStop(CustomRoute route, String name, Integer sortOrder, String detail, Double latitude, Double longitude) {
        this.route = route;
        this.name = name;
        this.sortOrder = sortOrder;
        this.detail = detail;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CustomRoute getRoute() { return route; }
    public void setRoute(CustomRoute v) { this.route = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer v) { this.sortOrder = v; }
    public String getDetail() { return detail; }
    public void setDetail(String v) { this.detail = v; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double v) { this.latitude = v; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double v) { this.longitude = v; }
}
