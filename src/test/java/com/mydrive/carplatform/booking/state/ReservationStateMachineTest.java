package com.mydrive.carplatform.booking.state;

import static com.mydrive.carplatform.booking.ReservationStatus.ACTIVE;
import static com.mydrive.carplatform.booking.ReservationStatus.CANCELLED;
import static com.mydrive.carplatform.booking.ReservationStatus.COMPLETED;
import static com.mydrive.carplatform.booking.ReservationStatus.RESERVED;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.mydrive.carplatform.booking.ReservationStatus;
import com.mydrive.carplatform.common.exception.IllegalStateTransitionException;
import java.util.EnumSet;
import java.util.Set;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class ReservationStateMachineTest {

    private final ReservationStateMachine stateMachine = new ReservationStateMachine();

    private static final Set<TransitionPair> LEGAL = Set.of(
            new TransitionPair(RESERVED, ACTIVE),
            new TransitionPair(RESERVED, CANCELLED),
            new TransitionPair(ACTIVE, COMPLETED),
            new TransitionPair(ACTIVE, CANCELLED));

    @ParameterizedTest
    @EnumSource(ReservationStatus.class)
    void allTransitionsFromEachStatus(ReservationStatus from) {
        for (ReservationStatus to : ReservationStatus.values()) {
            boolean legal = LEGAL.contains(new TransitionPair(from, to));
            if (legal) {
                assertThatCode(() -> stateMachine.validateTransition(from, to))
                        .as("%s -> %s should be legal", from, to)
                        .doesNotThrowAnyException();
            } else {
                assertThatThrownBy(() -> stateMachine.validateTransition(from, to))
                        .as("%s -> %s should be illegal", from, to)
                        .isInstanceOf(IllegalStateTransitionException.class);
            }
        }
    }

    @ParameterizedTest
    @EnumSource(
            value = ReservationStatus.class,
            names = {"COMPLETED", "CANCELLED"})
    void terminalStatesHaveNoLegalTransitions(ReservationStatus terminal) {
        for (ReservationStatus to : EnumSet.allOf(ReservationStatus.class)) {
            assertThatThrownBy(() -> stateMachine.validateTransition(terminal, to))
                    .isInstanceOf(IllegalStateTransitionException.class);
        }
    }

    private record TransitionPair(ReservationStatus from, ReservationStatus to) {
    }
}
