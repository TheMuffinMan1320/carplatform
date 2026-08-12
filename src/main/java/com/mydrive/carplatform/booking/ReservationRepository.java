package com.mydrive.carplatform.booking;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, UUID>, JpaSpecificationExecutor<Reservation> {

    @Query(
            """
            select case when count(r) > 0 then true else false end
            from Reservation r
            where r.vehicle.id = :vehicleId
              and r.status in (com.mydrive.carplatform.booking.ReservationStatus.RESERVED,
                                com.mydrive.carplatform.booking.ReservationStatus.ACTIVE)
              and r.startDate <= :endDate
              and r.endDate >= :startDate
            """)
    boolean existsOverlapping(
            @Param("vehicleId") UUID vehicleId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
