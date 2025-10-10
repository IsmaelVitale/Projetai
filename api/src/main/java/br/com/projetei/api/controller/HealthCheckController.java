package br.com.projetei.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Esta anotação diz ao Spring que esta classe é um "Controller",
// ou seja, ela é responsável por receber requisições web.
@RestController
public class HealthCheckController {

    // Esta anotação mapeia o endereço (endpoint) "/ping" para este método.
    // Quando alguém acessar http://localhost:8080/ping, este código será executado.
    @GetMapping("/ping")
    public String ping() {
        return "Pong!";
    }
}