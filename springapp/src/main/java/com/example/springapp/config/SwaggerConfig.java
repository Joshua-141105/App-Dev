package com.example.springapp.config;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Spring Boot API",
        version = "1.0",
        description = "API for Spring Boot application"
    )
)
public class SwaggerConfig{

}