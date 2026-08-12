package com.mydrive.carplatform.common.config;

import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.auth.User;
import com.mydrive.carplatform.auth.UserRepository;
import com.mydrive.carplatform.fleet.PricingTier;
import com.mydrive.carplatform.fleet.Vehicle;
import com.mydrive.carplatform.fleet.VehicleRepository;
import com.mydrive.carplatform.location.Location;
import com.mydrive.carplatform.location.LocationRepository;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Convenience data for local development/demo only -- deliberately not a Flyway migration,
 * since migrations should represent real schema/reference-data history, not throwaway
 * fixtures. Idempotent: skips seeding if the admin account already exists, so restarts
 * don't create duplicates or fail on the unique email constraint.
 */
@Component
@Profile("dev")
public class DevDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);
    private static final String SEED_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    public DevDataSeeder(
            UserRepository userRepository,
            LocationRepository locationRepository,
            VehicleRepository vehicleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.vehicleRepository = vehicleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmailIgnoreCase("admin@carplatform.dev")) {
            return;
        }

        userRepository.save(new User(
                "admin@carplatform.dev", passwordEncoder.encode(SEED_PASSWORD), "Ada", "Admin", null, Role.ADMIN));

        Location downtown = locationRepository.save(new Location(
                "Downtown Austin", "123 Congress Ave", null, "Austin", "TX", "78701", "USA", "512-555-0100"));
        Location airport = locationRepository.save(
                new Location("Austin Airport", "1 Presidential Blvd", null, "Austin", "TX", "78719", "USA", "512-555-0101"));

        User downtownAgent = new User(
                "agent.downtown@carplatform.dev",
                passwordEncoder.encode(SEED_PASSWORD),
                "Frank",
                "FleetAgent",
                null,
                Role.FLEET_AGENT);
        downtownAgent.setLocation(downtown);
        userRepository.save(downtownAgent);

        User airportAgent = new User(
                "agent.airport@carplatform.dev",
                passwordEncoder.encode(SEED_PASSWORD),
                "Gina",
                "FleetAgent",
                null,
                Role.FLEET_AGENT);
        airportAgent.setLocation(airport);
        userRepository.save(airportAgent);

        userRepository.save(new User(
                "customer@carplatform.dev", passwordEncoder.encode(SEED_PASSWORD), "Cara", "Customer", null, Role.CUSTOMER));

        vehicleRepository.save(new Vehicle(
                downtown, "Toyota", "Camry", 2023, "1HGCM82633A000001", "TX-ABC101", 8000,
                PricingTier.STANDARD, new BigDecimal("55.00")));
        vehicleRepository.save(new Vehicle(
                downtown, "Honda", "Civic", 2022, "2HGFC2F59NH000002", "TX-ABC102", 15000,
                PricingTier.ECONOMY, new BigDecimal("40.00")));
        vehicleRepository.save(new Vehicle(
                airport, "BMW", "5 Series", 2024, "WBA5A5C50ED000003", "TX-ABC103", 2000,
                PricingTier.LUXURY, new BigDecimal("120.00")));

        log.info(
                "Seeded dev data: admin@carplatform.dev / agent.downtown@carplatform.dev / "
                        + "agent.airport@carplatform.dev / customer@carplatform.dev (password: {})",
                SEED_PASSWORD);
    }
}
