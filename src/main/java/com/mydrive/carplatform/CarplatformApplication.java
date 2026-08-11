package com.mydrive.carplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CarplatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarplatformApplication.class, args);
	}

}
