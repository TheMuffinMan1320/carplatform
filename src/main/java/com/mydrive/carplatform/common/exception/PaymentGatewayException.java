package com.mydrive.carplatform.common.exception;

import org.springframework.http.HttpStatus;

public class PaymentGatewayException extends ApiException {

    public PaymentGatewayException(String message) {
        super(HttpStatus.BAD_GATEWAY, "PAYMENT_GATEWAY_ERROR", message);
    }
}
