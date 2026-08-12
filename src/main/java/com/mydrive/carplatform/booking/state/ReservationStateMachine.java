package com.mydrive.carplatform.booking.state;

import com.mydrive.carplatform.booking.ReservationStatus;
import com.mydrive.carplatform.common.exception.IllegalStateTransitionException;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

import static com.mydrive.carplatform.booking.ReservationStatus.ACTIVE;
import static com.mydrive.carplatform.booking.ReservationStatus.CANCELLED;
import static com.mydrive.carplatform.booking.ReservationStatus.COMPLETED;
import static com.mydrive.carplatform.booking.ReservationStatus.RESERVED;

@Component
public class ReservationStateMachine {

    private static final Map<ReservationStatus, Set<ReservationStatus>> ALLOWED = Map.of(
            RESERVED, Set.of(ACTIVE, CANCELLED),
            ACTIVE, Set.of(COMPLETED, CANCELLED),
            COMPLETED, Set.of(),
            CANCELLED, Set.of());

    public void validateTransition(ReservationStatus from, ReservationStatus to) {
        if (!ALLOWED.getOrDefault(from, Set.of()).contains(to)) {
            throw new IllegalStateTransitionException(
                    "Cannot transition reservation from %s to %s".formatted(from, to));
        }
    }
}
