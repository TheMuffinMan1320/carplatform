package com.mydrive.carplatform.common.exception;

import org.springframework.http.HttpStatus;

public class IllegalStateTransitionException extends ApiException {

    public IllegalStateTransitionException(String message) {
        super(HttpStatus.CONFLICT, "ILLEGAL_STATE_TRANSITION", message);
    }
}
