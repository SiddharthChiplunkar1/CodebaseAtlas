package com.atlas.api.infrastructure.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;

    public OAuth2LoginSuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            email = oAuth2User.getAttribute("login") + "@users.noreply.github.com";
        }

        // We create a dummy UserDetails just to generate the JWT matching the user's email
        UserDetails userDetails = new User(email, "", Collections.emptyList());
        String jwt = jwtService.generateToken(userDetails);

        Cookie cookie = new Cookie("atlas_jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Make true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 1 day
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);

        // Redirect to the frontend dashboard
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/dashboard");
    }
}
