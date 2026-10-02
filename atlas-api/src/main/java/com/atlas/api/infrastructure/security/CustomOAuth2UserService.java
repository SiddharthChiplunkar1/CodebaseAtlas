package com.atlas.api.infrastructure.security;

import com.atlas.api.domain.user.User;
import com.atlas.api.domain.user.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String email = oAuth2User.getAttribute("email");
        String login = oAuth2User.getAttribute("login");
        String avatarUrl = oAuth2User.getAttribute("avatar_url");
        String githubId = String.valueOf((Object) oAuth2User.getAttribute("id"));
        
        if (email == null) {
            // Some users hide their email on GitHub, use login as fallback
            email = login + "@users.noreply.github.com";
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setGithubId(githubId);
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
        } else {
            user = new User();
            user.setEmail(email);
            user.setUsername(login);
            user.setGithubId(githubId);
            user.setAvatarUrl(avatarUrl);
            user.setPassword(""); // OAuth users don't have a local password
            userRepository.save(user);
        }

        return oAuth2User;
    }
}
