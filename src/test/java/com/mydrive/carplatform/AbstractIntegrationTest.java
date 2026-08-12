package com.mydrive.carplatform;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Base class for tests that need a real Postgres (the domain relies on Postgres-specific
 * features -- the reservation exclusion constraint in particular -- so H2 would silently not
 * exercise them). The container is started once and shared across every subclass in the JVM.
 *
 * Deliberately NOT using @Testcontainers/@Container on this field: that combination stops the
 * container in the *declaring test class's* afterAll callback even for a static field, so the
 * next test class sharing the same field (same JVM fork) finds it already stopped --
 * confirmed by hand: the second IT class to run failed with "Connection refused" to the first
 * class's container port. Starting it manually here (the documented Testcontainers "singleton
 * container" pattern) leaves it running until the JVM exits, when Testcontainers' Ryuk reaper
 * cleans it up regardless.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    static {
        POSTGRES.start();
    }
}
