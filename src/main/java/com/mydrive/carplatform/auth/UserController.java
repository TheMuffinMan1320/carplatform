package com.mydrive.carplatform.auth;

import com.mydrive.carplatform.auth.dto.AdminCreateUserRequest;
import com.mydrive.carplatform.auth.dto.UserSummary;
import com.mydrive.carplatform.auth.security.CurrentUser;
import com.mydrive.carplatform.common.exception.ResourceNotFoundException;
import com.mydrive.carplatform.common.web.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserController(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @GetMapping("/users/me")
    public UserSummary me(@AuthenticationPrincipal CurrentUser currentUser) {
        User user = userRepository
                .findById(currentUser.userId())
                .orElseThrow(() -> ResourceNotFoundException.of("User", currentUser.userId()));
        return UserSummary.from(user);
    }

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserSummary> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.adminCreateUser(request));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<UserSummary> listUsers(Pageable pageable) {
        return PageResponse.of(userRepository.findAll(pageable), UserSummary::from);
    }
}
