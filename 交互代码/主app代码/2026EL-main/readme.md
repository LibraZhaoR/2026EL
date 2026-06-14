# 2026EL — 灵动金陵 主应用代码

Spring Boot 3.3.5 + Vanilla JS SPA。详见项目根目录 [README.md](../../../README.md)。

## 快速启动

```bash
# Java 17-23
mvn clean spring-boot:run

# Java 24+
mvn clean package -DskipTests
java -jar target/campus-nanjing-travel-0.0.1-SNAPSHOT.jar

# 或使用 Python dev server（绕过 Spring Boot）
python proxy-server.py
```

访问：`http://localhost:8080/app/index.html`
