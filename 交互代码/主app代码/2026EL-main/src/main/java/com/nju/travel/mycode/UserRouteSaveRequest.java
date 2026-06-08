package com.nju.travel.mycode;

public class UserRouteSaveRequest {
    private String routeName;
    private String origin;
    private String destination;
    private String waypoints;
    private String transportMode;
    private Integer totalDistance;
    private Integer totalDuration;

    public String getRouteName() { return routeName; }
    public void setRouteName(String v) { this.routeName = v; }
    public String getOrigin() { return origin; }
    public void setOrigin(String v) { this.origin = v; }
    public String getDestination() { return destination; }
    public void setDestination(String v) { this.destination = v; }
    public String getWaypoints() { return waypoints; }
    public void setWaypoints(String v) { this.waypoints = v; }
    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String v) { this.transportMode = v; }
    public Integer getTotalDistance() { return totalDistance; }
    public void setTotalDistance(Integer v) { this.totalDistance = v; }
    public Integer getTotalDuration() { return totalDuration; }
    public void setTotalDuration(Integer v) { this.totalDuration = v; }
}
