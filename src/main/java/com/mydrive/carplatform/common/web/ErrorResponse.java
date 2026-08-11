package com.mydrive.carplatform.common.web;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String code,
        String message,
        String path,
        List<FieldError> validationErrors) {

    public static ErrorResponse of(int status, String error, String code, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, code, message, path, null);
    }

    public static ErrorResponse withValidation(
            int status, String error, String code, String message, String path, List<FieldError> validationErrors) {
        return new ErrorResponse(Instant.now(), status, error, code, message, path, validationErrors);
    }
}
